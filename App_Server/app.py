import os
import re
import uuid
import time
import base64
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Request, status, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import text
from sqlalchemy.orm import Session

from config import settings
from database import engine, Base, get_db
import models

MAX_VISITOR_IDS = 50000

APP_SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(APP_SERVER_DIR)  
PUBLIC_DIR = os.path.join(BASE_DIR, "Portfolio", "public")
SERVER_PUBLIC_DIR = os.path.join(APP_SERVER_DIR, "public")

import hashlib
from cryptography.fernet import Fernet

# Derive a 32-byte URL-safe base64 key from SESSION_SECRET
key_bytes = hashlib.sha256(settings.SESSION_SECRET.encode()).digest()
fernet_key = base64.urlsafe_b64encode(key_bytes)
cipher_suite = Fernet(fernet_key)

def encrypt_password(password: str) -> str:
    if not password:
        return ""
    return cipher_suite.encrypt(password.encode('utf-8')).decode('utf-8')

def decrypt_password(encrypted_password: str) -> str:
    if not encrypted_password:
        return ""
    try:
        return cipher_suite.decrypt(encrypted_password.encode('utf-8')).decode('utf-8')
    except Exception:
        # If decryption fails (e.g. legacy plain text), return as is for migration
        return encrypted_password


class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str

class EmailUpdate(BaseModel):
    currentPassword: str
    newEmail: EmailStr

class MessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class MessageUpdate(BaseModel):
    status: Optional[str] = None
    archived: Optional[bool] = None

# 4. APP SETUP
app = FastAPI(title="Portfolio API")

# Parse origins from environment config
cors_origins_list = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]
for default_origin in ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000"]:
    if default_origin not in cors_origins_list:
        cors_origins_list.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Automatically allow any Vercel domain
    allow_credentials=True,   # Required for cookies to be sent cross-origin
    allow_methods=["*"],
    allow_headers=["*"],
)



security = None  # HTTPBearer removed — now using HttpOnly cookies

login_attempts = {}

def get_client_ip(request: Request) -> str:
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def is_secure_context(request: Request) -> bool:
    proto = request.headers.get("x-forwarded-proto", "")
    is_https = request.url.scheme == "https" or proto.lower() == "https"
    return is_https or settings.ENVIRONMENT.lower() == "production"

def check_admin(request: Request):
    """Validate the HttpOnly session cookie or Bearer token on every protected route."""
    session = request.cookies.get("admin_session")
    auth_header = request.headers.get("authorization", "")
    bearer_token = auth_header.replace("Bearer ", "").strip() if auth_header.startswith("Bearer ") else ""
    
    if (not session or session != settings.SESSION_SECRET) and (not bearer_token or bearer_token != settings.SESSION_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
        )
    return "admin"


def generate_id(prefix: str) -> str:
    return f"{prefix}-{str(uuid.uuid4())[:8]}"

def decode_base64_file(data_url: str, max_size_mb: int, allowed_types_regex: str):
    match = re.match(allowed_types_regex, data_url, re.IGNORECASE | re.DOTALL)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid file format or base64 data")
    file_type = match.group(1).lower()
    base64_data = match.group(2)
    
    try:
        file_bytes = base64.b64decode(base64_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to decode base64 data")
        
    if len(file_bytes) > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum size of {max_size_mb}MB")
    return file_bytes, file_type

# 6. DATABASE INIT & DEFAULT SYNC
@app.on_event("startup")
def startup_event():
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if inspector.has_table("admin"):
            columns = [c['name'] for c in inspector.get_columns('admin')]
            if 'email' not in columns:
                with engine.connect() as conn:
                    conn.execute(text("ALTER TABLE admin ADD COLUMN email VARCHAR(100) UNIQUE DEFAULT NULL"))
                    conn.commit()

        if inspector.has_table("skills"):
            columns = [c['name'] for c in inspector.get_columns('skills')]
            with engine.connect() as conn:
                if 'level' in columns:
                    conn.execute(text("ALTER TABLE skills DROP COLUMN level"))
                if 'is_automation' in columns:
                    conn.execute(text("ALTER TABLE skills DROP COLUMN is_automation"))
                conn.commit()

        if inspector.has_table("certifications"):
            columns = [c['name'] for c in inspector.get_columns('certifications')]
            certification_columns = {
                "credential_id": "VARCHAR(150) DEFAULT NULL",
                "issued_date": "VARCHAR(20) DEFAULT NULL",
                "expiration_date": "VARCHAR(20) DEFAULT NULL",
                "credential_url": "VARCHAR(500) DEFAULT NULL",
                "image_url": "VARCHAR(500) DEFAULT NULL",
                "description": "TEXT DEFAULT NULL",
                "skills": "JSON DEFAULT NULL",
                "display_order": "INT NOT NULL DEFAULT 0",
                "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            }
            with engine.connect() as conn:
                # Retain legacy fields during migration so installations with existing
                # records continue to work; their values are copied into new columns.
                for name, definition in certification_columns.items():
                    if name not in columns:
                        conn.execute(text(f"ALTER TABLE certifications ADD COLUMN {name} {definition}"))
                if "url" in columns and "credential_url" not in columns:
                    conn.execute(text("UPDATE certifications SET credential_url = url WHERE credential_url IS NULL"))
                if "image" in columns and "image_url" not in columns:
                    conn.execute(text("UPDATE certifications SET image_url = image WHERE image_url IS NULL"))
                if "date" in columns and "issued_date" not in columns:
                    conn.execute(text("UPDATE certifications SET issued_date = date WHERE issued_date IS NULL"))
                conn.commit()
    except Exception as inspect_err:
        print(f"Schema inspection notice: {inspect_err}")

    try:
        Base.metadata.create_all(bind=engine)
        print(">>> Database tables verified/created successfully.")
    except Exception as e:
        print(f"Error creating database tables on startup: {e}")

    # Sync/Seed Default Admin User
    db = None
    try:
        from database import SessionLocal
        db = SessionLocal()
        if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
            admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
            if not admin:
                db_admin = models.Admin(username="admin", email=settings.ADMIN_EMAIL.strip(), password=encrypt_password(settings.ADMIN_PASSWORD))
                db.add(db_admin)
                db.commit()
                print(">>> Default admin account setup successfully with encrypted password.")
            else:
                if not admin.password.startswith("gAAAA") or decrypt_password(admin.password) != settings.ADMIN_PASSWORD:
                    admin.password = encrypt_password(settings.ADMIN_PASSWORD)
                admin.email = settings.ADMIN_EMAIL.strip()
                db.commit()
                print(">>> Admin credentials synchronized from environment.")

        skills_count = db.query(models.Skill).count()
        if skills_count == 0:
            from sqlalchemy import inspect, text
            import json
            inspector = inspect(engine)
            if inspector.has_table("site_settings"):
                columns = [c['name'] for c in inspector.get_columns('site_settings')]
                if 'skills' in columns:
                    row = db.execute(text("SELECT skills FROM site_settings LIMIT 1")).fetchone()
                    if row and row[0]:
                        try:
                            legacy_skills = row[0]
                            if isinstance(legacy_skills, str):
                                legacy_skills = json.loads(legacy_skills)
                            
                            if isinstance(legacy_skills, list) and len(legacy_skills) > 0:
                                for item in legacy_skills:
                                    if not isinstance(item, dict):
                                        continue
                                    if 'items' in item and isinstance(item['items'], list):
                                        cat_name = item.get('name', 'General')
                                        for subitem in item['items']:
                                            if isinstance(subitem, dict):
                                                db.add(models.Skill(
                                                    category=cat_name,
                                                    name=subitem.get('name', '')
                                                ))
                                    else:
                                        db.add(models.Skill(
                                            category=item.get('category', 'General'),
                                            name=item.get('name', '')
                                        ))
                                db.commit()
                        except Exception as parse_err:
                            print(f"Error migrating legacy skills: {parse_err}")
    except Exception as e:
        print(f"Error during startup seeding/migration: {e}")
    finally:
        if db:
            db.close()

# 7. ROUTE HANDLERS
@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/")
def home():
    return {"message": "Portfolio API is running! v2"}

# --- AUTH ---
@app.post("/api/auth/login")
def login(request: Request, admin_login: AdminLogin, db: Session = Depends(get_db)):
    device_id = request.headers.get("x-device-id") or get_client_ip(request)
    now = datetime.utcnow()

    # Check if this device is currently locked out
    if device_id in login_attempts:
        record = login_attempts[device_id]
        if record["blocked_until"] and now < record["blocked_until"]:
            remaining_time = record["blocked_until"] - now
            remaining_minutes = int(remaining_time.total_seconds() / 60)
            remaining_seconds = int(remaining_time.total_seconds() % 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Locked out. Try again in {remaining_minutes}m {remaining_seconds}s."
            )

    input_email = admin_login.email.strip().lower()
    admin = db.query(models.Admin).filter(models.Admin.email == input_email).first()
    
    # Direct environment variable verification fallback
    is_env_match = (
        bool(settings.ADMIN_EMAIL) and bool(settings.ADMIN_PASSWORD) and
        input_email == settings.ADMIN_EMAIL.strip().lower() and
        admin_login.password == settings.ADMIN_PASSWORD
    )

    if is_env_match:
        if not admin:
            admin = models.Admin(username="admin", email=settings.ADMIN_EMAIL.strip(), password=encrypt_password(settings.ADMIN_PASSWORD))
            db.add(admin)
            db.commit()
        elif decrypt_password(admin.password) != settings.ADMIN_PASSWORD:
            admin.password = encrypt_password(settings.ADMIN_PASSWORD)
            db.commit()
    elif not admin or admin_login.password != decrypt_password(admin.password):
        if device_id not in login_attempts:
            login_attempts[device_id] = {"attempts": 0, "blocked_until": None}
            
        login_attempts[device_id]["attempts"] += 1
        attempts_left = 5 - login_attempts[device_id]["attempts"]
        
        if login_attempts[device_id]["attempts"] >= 5:
            login_attempts[device_id]["blocked_until"] = now + timedelta(hours=2)
            login_attempts[device_id]["attempts"] = 0
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Locked out for 2 hours."
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid email or password. {attempts_left} attempts remaining."
            )

            
    # Reset tracking upon successful login
    if device_id in login_attempts:
        login_attempts[device_id] = {"attempts": 0, "blocked_until": None}

    # Set HttpOnly session cookie (JS cannot read this) and return token for header auth
    secure_cookie = is_secure_context(request)
    response = JSONResponse({"ok": True, "token": settings.SESSION_SECRET})

    response.set_cookie(
        key="admin_session",
        value=settings.SESSION_SECRET,
        httponly=True,        # Invisible to JavaScript — XSS safe
        samesite="none" if secure_cookie else "lax",  # "none" + secure=True for cross-origin (Vercel -> Render)
        secure=secure_cookie, # True on HTTPS / Production
        max_age=60 * 60 * 8,  # 8 hours
        path="/",
    )
    return response

@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    """Clear the session cookie — effectively logs the admin out."""
    secure_cookie = is_secure_context(request)
    response.delete_cookie(
        key="admin_session",
        path="/",
        samesite="none" if secure_cookie else "lax",
        secure=secure_cookie,
    )
    return {"ok": True}


@app.get("/api/auth/me")
def me(request: Request, db: Session = Depends(get_db)):
    """Returns 200 if the session cookie is valid, 401 otherwise."""
    check_admin(request)
    admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    email = admin.email if admin else ""
    return {"ok": True, "email": email}

@app.put("/api/auth/password")
def update_password(
    request: Request,
    pwd_update: PasswordUpdate,
    db: Session = Depends(get_db)
):
    check_admin(request)
    admin_record = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not admin_record:
        raise HTTPException(status_code=400, detail="Admin account not found")

    if pwd_update.currentPassword != decrypt_password(admin_record.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    # Validation checks for strength
    new_pwd = pwd_update.newPassword
    if (len(new_pwd) < 8 or not re.search("[A-Z]", new_pwd) or 
        not re.search("[a-z]", new_pwd) or not re.search("[0-9]", new_pwd) or 
        not re.search("[^A-Za-z0-9]", new_pwd)):
        raise HTTPException(
            status_code=400,
            detail="Password must be 8+ chars and contain uppercase, lowercase, number, and special character."
        )
        
    admin_record.password = encrypt_password(new_pwd)
    db.commit()
    return {"ok": True}

@app.put("/api/auth/email")
def update_email(
    request: Request,
    email_update: EmailUpdate,
    db: Session = Depends(get_db)
):
    check_admin(request)
    admin_record = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not admin_record:
        raise HTTPException(status_code=400, detail="Admin account not found")

    if email_update.currentPassword != decrypt_password(admin_record.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    admin_record.email = email_update.newEmail.strip()
    db.commit()
    return {"ok": True}

# --- PORTFOLIO ---
@app.get("/api/portfolio")
def get_portfolio(response: Response, includeArchived: str = "false", db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    settings_record = db.query(models.SiteSettings).filter(models.SiteSettings.id == 1).first()
    if not settings_record:
        settings_record = models.SiteSettings(
            id=1,
            email="",
            location="",
            resume_url="",
            hero_image="",
            mission_body="",
            mission_tags=[],
            social=[],
            stats=[]
        )
        db.add(settings_record)
        db.commit()
        db.refresh(settings_record)

    proj_q = db.query(models.Project)
    exp_q = db.query(models.Experience)
    blog_q = db.query(models.Blog)
    cert_q = db.query(models.Certification)

    if includeArchived != "true":
        proj_q = proj_q.filter(models.Project.archived == False)
        exp_q = exp_q.filter(models.Experience.archived == False)
        blog_q = blog_q.filter(models.Blog.archived == False)
        cert_q = cert_q.filter(models.Certification.archived == False)

    projects = proj_q.order_by(models.Project.created_at.desc()).all()
    experiences = exp_q.order_by(models.Experience.created_at.desc()).all()
    blogs = blog_q.order_by(models.Blog.created_at.desc()).all()
    certifications = cert_q.order_by(
        models.Certification.display_order.asc(),
        models.Certification.created_at.desc(),
    ).all()

    # Query skills from skills table, preserving insertion order (id.asc())
    skills_query = db.query(models.Skill).order_by(models.Skill.id.asc()).all()
    categories_map = {}
    for s in skills_query:
        if s.category not in categories_map:
            categories_map[s.category] = []
        categories_map[s.category].append({
            "name": s.name
        })
    skills_list = [
        {
            "name": cat_name,
            "items": items
        }
        for cat_name, items in categories_map.items()
    ]

    return {
        "site": {
            "email": settings_record.email or "",
            "location": settings_record.location or "",
            "resumeUrl": settings_record.resume_url or ""
        },
        "hero": {
            "image": settings_record.hero_image or ""
        },
        "social": settings_record.social or [],
        "mission": {
            "body": settings_record.mission_body or "",
            "tags": settings_record.mission_tags or []
        },
        "stats": settings_record.stats or [],
        "skills": skills_list,
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category or "",
                "description": p.description or "",
                "image": p.image or "",
                "tags": p.tags or [],
                "liveUrl": p.live_url or "",
                "repoUrl": p.repo_url or "",
                "archived": p.archived
            } for p in projects
        ],
        "experience": [
            {
                "id": e.id,
                "period": e.period or "",
                "title": e.title,
                "subtitle": e.subtitle or "",
                "description": e.description or "",
                "tech": e.tech or [],
                "archived": e.archived
            } for e in experiences
        ],
        "blogs": [
            {
                "id": b.id,
                "title": b.title,
                "excerpt": b.excerpt or "",
                "url": b.url or "",
                "date": b.date or "",
                "archived": b.archived
            } for b in blogs
        ],
        "certifications": [
            {
                "id": c.id,
                "title": c.title,
                "issuer": c.issuer or "",
                "credentialId": c.credential_id or "",
                "issuedDate": c.issued_date or "",
                "expirationDate": c.expiration_date or "",
                "credentialUrl": c.credential_url or "",
                "imageUrl": c.image_url or "",
                "description": c.description or "",
                "skills": c.skills or [],
                "displayOrder": c.display_order,
                "archived": c.archived,
                # Legacy aliases keep older clients working while they upgrade.
                "date": c.issued_date or "",
                "url": c.credential_url or "",
                "image": c.image_url or "",
            } for c in certifications
        ]
    }

@app.put("/api/portfolio")
async def save_portfolio(request: Request, db: Session = Depends(get_db)):
    check_admin(request)
    body = await request.json()
    if not body or not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="Invalid payload")

    settings_record = db.query(models.SiteSettings).filter(models.SiteSettings.id == 1).first()
    if not settings_record:
        settings_record = models.SiteSettings(id=1)
        db.add(settings_record)

    site = body.get("site", {})
    hero = body.get("hero", {})
    mission = body.get("mission", {})

    settings_record.email = site.get("email", "")
    settings_record.location = site.get("location", "")
    settings_record.resume_url = site.get("resumeUrl", "")
    settings_record.hero_image = hero.get("image", "")
    settings_record.mission_body = mission.get("body", "")
    settings_record.mission_tags = mission.get("tags", [])
    settings_record.social = body.get("social", [])
    settings_record.stats = body.get("stats", [])

    # Synchronize database tables
    db.query(models.Skill).delete()
    db.execute(text("ALTER TABLE skills AUTO_INCREMENT = 1;"))
    for cat in body.get("skills", []):
        category_name = cat.get("name", "")
        for item in cat.get("items", []):
            name_val = item.get("name", "").strip()
            db.add(models.Skill(
                category=category_name,
                name=name_val
            ))

    base_time = datetime.utcnow()

    db.query(models.Project).delete()
    for idx, p in enumerate(body.get("projects", [])):
        db.add(models.Project(
            id=p.get("id") or generate_id("proj"),
            title=p.get("title", "Untitled Project"),
            category=p.get("category", ""),
            description=p.get("description", ""),
            image=p.get("image", ""),
            tags=p.get("tags", []),
            live_url=p.get("liveUrl", ""),
            repo_url=p.get("repoUrl", ""),
            archived=bool(p.get("archived", False)),
            created_at=base_time - timedelta(seconds=idx)
        ))

    db.query(models.Experience).delete()
    for idx, e in enumerate(body.get("experience", [])):
        db.add(models.Experience(
            id=e.get("id") or generate_id("exp"),
            period=e.get("period", ""),
            title=e.get("title", ""),
            subtitle=e.get("subtitle", ""),
            description=e.get("description", ""),
            tech=e.get("tech", []),
            archived=bool(e.get("archived", False)),
            created_at=base_time - timedelta(seconds=idx)
        ))

    db.query(models.Blog).delete()
    for idx, b in enumerate(body.get("blogs", [])):
        db.add(models.Blog(
            id=b.get("id") or generate_id("blog"),
            title=b.get("title", ""),
            excerpt=b.get("excerpt", ""),
            url=b.get("url", ""),
            date=b.get("date", ""),
            archived=bool(b.get("archived", False)),
            created_at=base_time - timedelta(seconds=idx)
        ))

    db.query(models.Certification).delete()
    for idx, c in enumerate(body.get("certifications", [])):
        db.add(models.Certification(
            id=c.get("id") or generate_id("cert"),
            title=c.get("title", "Untitled certification").strip() or "Untitled certification",
            issuer=c.get("issuer", ""),
            credential_id=c.get("credentialId", ""),
            issued_date=c.get("issuedDate", c.get("date", "")),
            expiration_date=c.get("expirationDate", ""),
            credential_url=c.get("credentialUrl", c.get("url", "")),
            image_url=c.get("imageUrl", c.get("image", "")),
            description=c.get("description", ""),
            skills=c.get("skills", []),
            display_order=int(c.get("displayOrder", idx) or 0),
            archived=bool(c.get("archived", False)),
            created_at=base_time - timedelta(seconds=idx)
        ))

    db.commit()
    return {"ok": True}

# --- UPLOADS ---
def save_file_safely(filename: str, file_bytes: bytes):
    os.makedirs(SERVER_PUBLIC_DIR, exist_ok=True)
    with open(os.path.join(SERVER_PUBLIC_DIR, filename), "wb") as f:
        f.write(file_bytes)
    try:
        os.makedirs(PUBLIC_DIR, exist_ok=True)
        with open(os.path.join(PUBLIC_DIR, filename), "wb") as f:
            f.write(file_bytes)
    except Exception:
        pass

@app.post("/api/upload/hero-portrait")
def upload_hero_portrait(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    check_admin(request)
    data_url = payload.get("dataUrl")
    if not data_url:
        raise HTTPException(status_code=400, detail="dataUrl is required")
    file_bytes, ext = decode_base64_file(data_url, 5, r"^data:image/(jpeg|jpg|png|webp);base64,(.+)$")
    
    if ext == "jpeg":
        ext = "jpg"
    filename = f"hero-portrait.{ext}"
    save_file_safely(filename, file_bytes)
        
    for other in ["jpg", "png", "webp"]:
        if other == ext:
            continue
        for p_dir in [SERVER_PUBLIC_DIR, PUBLIC_DIR]:
            try:
                os.remove(os.path.join(p_dir, f"hero-portrait.{other}"))
            except Exception:
                pass
            
    settings_record = db.query(models.SiteSettings).filter(models.SiteSettings.id == 1).first()
    image_url = f"/{filename}"
    if settings_record:
        settings_record.hero_image = image_url
        db.commit()
    
    return {"ok": True, "image": image_url}

@app.post("/api/upload/project-image")
def upload_project_image(
    request: Request,
    payload: dict = Body(...)
):
    check_admin(request)
    data_url = payload.get("dataUrl")
    project_id = payload.get("projectId", "project")
    if not data_url:
        raise HTTPException(status_code=400, detail="dataUrl is required")
        
    file_bytes, ext = decode_base64_file(data_url, 5, r"^data:image/(jpeg|jpg|png|webp);base64,(.+)$")
    if ext == "jpeg":
        ext = "jpg"
    safe_project_id = re.sub(r"[^a-zA-Z0-9_-]", "", project_id)
    filename = f"{safe_project_id}-{int(time.time())}.{ext}"
    
    save_file_safely(filename, file_bytes)
        
    return {"ok": True, "imageUrl": f"/{filename}"}

@app.post("/api/upload/certification-image")
def upload_certification_image(
    request: Request,
    payload: dict = Body(...)
):
    check_admin(request)
    data_url = payload.get("dataUrl")
    cert_id = payload.get("certId", "cert")
    if not data_url:
        raise HTTPException(status_code=400, detail="dataUrl is required")

    file_bytes, ext = decode_base64_file(data_url, 5, r"^data:image/(jpeg|jpg|png|webp);base64,(.+)$")
    if ext == "jpeg":
        ext = "jpg"
    safe_cert_id = re.sub(r"[^a-zA-Z0-9_-]", "", cert_id)
    filename = f"cert-{safe_cert_id}-{int(time.time())}.{ext}"

    save_file_safely(filename, file_bytes)

    return {"ok": True, "imageUrl": f"/{filename}"}

@app.post("/api/upload/resume")
def upload_resume(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    check_admin(request)
    data_url = payload.get("dataUrl")
    filename = payload.get("filename", "Shubham Jani Resume.pdf")
    if not data_url:
        raise HTTPException(status_code=400, detail="dataUrl is required")
        
    file_bytes, ext = decode_base64_file(data_url, 10, r"^data:application/(pdf);base64,(.+)$")
    if not filename.endswith(".pdf"):
        filename = f"{filename}.pdf"
        
    save_file_safely(filename, file_bytes)
        
    settings_record = db.query(models.SiteSettings).filter(models.SiteSettings.id == 1).first()
    resume_url = f"/{filename}"
    if settings_record:
        settings_record.resume_url = resume_url
        db.commit()
    
    return {"ok": True, "resumeUrl": resume_url}


# --- CONTACT & MESSAGES ---
@app.post("/api/contact", status_code=201)
def submit_contact(msg_create: MessageCreate, db: Session = Depends(get_db)):
    new_msg = models.Message(
        id=generate_id("msg"),
        name=msg_create.name.strip(),
        email=msg_create.email.strip(),
        message=msg_create.message.strip(),
        status="unread",
        archived=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return {"ok": True, "id": new_msg.id}

@app.get("/api/messages")
def get_messages(request: Request, archived: str = "false", db: Session = Depends(get_db)):
    check_admin(request)
    show_archived = archived == "true"
    messages = db.query(models.Message).filter(models.Message.archived == show_archived).order_by(models.Message.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "message": m.message,
            "status": m.status,
            "archived": m.archived,
            "createdAt": m.created_at.isoformat() if m.created_at else None
        } for m in messages
    ]

@app.patch("/api/messages/{msg_id}")
def update_message(
    request: Request,
    msg_id: str,
    msg_update: MessageUpdate,
    db: Session = Depends(get_db)
):
    check_admin(request)
    msg = db.query(models.Message).filter(models.Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg_update.status is not None:
        msg.status = msg_update.status
    if msg_update.archived is not None:
        msg.archived = msg_update.archived
    db.commit()
    return {
        "id": msg.id,
        "name": msg.name,
        "email": msg.email,
        "message": msg.message,
        "status": msg.status,
        "archived": msg.archived,
        "createdAt": msg.created_at.isoformat() if msg.created_at else None
    }

@app.delete("/api/messages/{msg_id}")
def delete_message(request: Request, msg_id: str, db: Session = Depends(get_db)):
    check_admin(request)
    msg = db.query(models.Message).filter(models.Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"ok": True}

# --- ANALYTICS ---
@app.post("/api/analytics/view")
def record_view(payload: dict = Body(...), db: Session = Depends(get_db)):
    visitor_id = payload.get("visitorId")
    if not visitor_id or not isinstance(visitor_id, str):
        raise HTTPException(status_code=400, detail="visitorId is required")
        
    visitor_id = visitor_id.strip()[:64]
    
    analytics = db.query(models.Analytics).filter(models.Analytics.id == 1).first()
    if not analytics:
        analytics = models.Analytics(id=1, total_views=0, unique_visitors=0, visitor_ids=[])
        db.add(analytics)
        db.commit()
        db.refresh(analytics)
        
    analytics.total_views += 1
    analytics.last_view_at = datetime.utcnow()
    
    visitor_list = list(analytics.visitor_ids or [])
    if visitor_id not in visitor_list:
        analytics.unique_visitors += 1
        if len(visitor_list) < MAX_VISITOR_IDS:
            visitor_list.append(visitor_id)
            analytics.visitor_ids = visitor_list
            
    db.commit()
    return {
        "ok": True,
        "totalViews": analytics.total_views,
        "uniqueVisitors": analytics.unique_visitors
    }

@app.get("/api/analytics")
def get_analytics(request: Request, db: Session = Depends(get_db)):
    check_admin(request)
    analytics = db.query(models.Analytics).filter(models.Analytics.id == 1).first()
    if not analytics:
        return {"totalViews": 0, "uniqueVisitors": 0, "lastViewAt": None}
    return {
        "totalViews": analytics.total_views,
        "uniqueVisitors": analytics.unique_visitors,
        "lastViewAt": analytics.last_view_at.isoformat() if analytics.last_view_at else None
    }
# Serve static assets (images, PDFs) from Portfolio/public WITHOUT shadowing API routes.
# A root-level StaticFiles mount intercepts every request (including /api/*) and throws
# 500 errors when no matching file is found. Using an explicit route avoids that.
from fastapi.responses import FileResponse

@app.get("/{filename:path}")
def serve_static_file(filename: str):
    """Serve uploaded public assets (hero images, project images, resume PDF).
    Only serves files that actually exist in SERVER_PUBLIC_DIR or PUBLIC_DIR; everything else 404s cleanly."""
    allowed_extensions = (".jpg", ".jpeg", ".png", ".webp", ".pdf", ".gif", ".svg")
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=404, detail="Not found")
    
    base_name = os.path.basename(filename)
    filepath = os.path.join(SERVER_PUBLIC_DIR, base_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(PUBLIC_DIR, base_name)
        
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)


# 8. LOCAL SERVER RUNNER
if __name__ == "__main__":
    import uvicorn
    # Start server on config-specified port
    print(f"Starting server on port {settings.PORT}...")
    uvicorn.run("app:app", host="127.0.0.1", port=settings.PORT, reload=True)
