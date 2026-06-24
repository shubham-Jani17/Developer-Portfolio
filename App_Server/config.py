import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Resolve the absolute path of the App_Server/.env file to ensure it loads correctly
# regardless of from where the python process is run.
APP_SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
env_file_path = os.path.join(APP_SERVER_DIR, ".env")

load_dotenv(env_file_path)

class Settings(BaseSettings):
    # MySQL Database connection URL
    MYSQL_URL: str = os.getenv(
        "MYSQL_URL",
        "mysql+pymysql://root:password@localhost:3306/portfolio_db"
    )
    
    # Secret value stored in the HttpOnly session cookie (keep this private!)
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "portfolio-admin-session-secret-2024")

    # Admin password (loaded from environment)
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")

    # Admin email (loaded from environment)
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")

    # Uvicorn Port (Default to 8000 for proxy alignment with frontend)
    PORT: int = int(os.getenv("PORT", 8000))

    # Gemini API Key (loaded from environment)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = env_file_path
        extra = "ignore"

settings = Settings()
