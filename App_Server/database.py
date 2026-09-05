import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# 1. AUTOMATIC DATABASE CREATION HELPER (Local Development Safe)
def ensure_database_exists(mysql_url: str):
    try:
        url = make_url(mysql_url)
        db_name = url.database
        host = url.host or 'localhost'
        # Only attempt automatic creation on local development environments
        if db_name and (host in ('localhost', '127.0.0.1') or 'localhost' in host):
            password_str = url.password or ''
            if '%' not in password_str:
                password_str = urllib.parse.quote_plus(password_str)
            
            temp_url = f"{url.drivername}://{url.username or 'root'}:{password_str}@{host}:{url.port or 3306}/"
            temp_engine = create_engine(temp_url, pool_pre_ping=True)
            with temp_engine.connect() as conn:
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
                conn.commit()
                print(f">>> Database '{db_name}' verified/created.")
            temp_engine.dispose()
    except Exception as e:
        print(f"Notice: Automatic DB creation skipped or handled: {e}")

# Run the database verification/creation before creating the main engine
ensure_database_exists(settings.MYSQL_URL)


# 2. MAIN DATABASE ENGINE
engine = create_engine(settings.MYSQL_URL, pool_pre_ping=True)

# 3. SESSION MAKER
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. DECLARATIVE BASE
Base = declarative_base()

# 5. DEPENDENCY YIELD FOR DB SESSIONS
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
