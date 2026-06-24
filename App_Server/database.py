import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# 1. AUTOMATIC DATABASE CREATION HELPER
def ensure_database_exists(mysql_url: str):
    try:
        url = make_url(mysql_url)
        db_name = url.database
        if db_name:
            # Reconstruct the connection URL without specifying the database
            password_str = url.password or ''
            # URL-encode the password if it's not already encoded to prevent parser issues
            if '%' not in password_str:
                password_str = urllib.parse.quote_plus(password_str)
            
            temp_url = f"{url.drivername}://{url.username or 'root'}:{password_str}@{url.host or 'localhost'}:{url.port or 3306}/"
            
            # Connect temporarily to the MySQL server
            temp_engine = create_engine(temp_url, pool_pre_ping=True)
            with temp_engine.connect() as conn:
                # Execute database creation query
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
                conn.commit()
                print(f">>> Database '{db_name}' verified/created.")
            temp_engine.dispose()
    except Exception as e:
        print(f"Warning: Could not verify or create database automatically: {e}")

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
