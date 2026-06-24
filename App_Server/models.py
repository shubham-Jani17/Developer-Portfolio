from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, func
from database import Base

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    password = Column(String(255), nullable=False)  # Plaintext password
    created_at = Column(DateTime, default=func.now())

class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100))
    location = Column(String(100))
    resume_url = Column(String(255))
    hero_image = Column(String(255))
    mission_body = Column(Text)
    mission_tags = Column(JSON)  # Stores list of tags
    social = Column(JSON)        # Stores list of social profiles
    stats = Column(JSON)         # Stores list of stats
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(100), nullable=False)
    name = Column(String(100), nullable=False)


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(100), primary_key=True, index=True)  # proj-xxxxx format
    title = Column(String(150), nullable=False)
    category = Column(String(100))
    description = Column(Text)
    image = Column(String(255))
    tags = Column(JSON)         # Stores array of tags
    live_url = Column(String(255))
    repo_url = Column(String(255))
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Experience(Base):
    __tablename__ = "experience"
    id = Column(String(100), primary_key=True, index=True)  # exp-xxxxx format
    period = Column(String(100))
    title = Column(String(150), nullable=False)
    subtitle = Column(String(150))
    description = Column(Text)
    tech = Column(JSON)         # Stores array of technologies used
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Blog(Base):
    __tablename__ = "blogs"
    id = Column(String(100), primary_key=True, index=True)  # blog-xxxxx format
    title = Column(String(200), nullable=False)
    excerpt = Column(Text)
    url = Column(String(255))
    date = Column(String(50))
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(100), primary_key=True, index=True)  # msg-xxxxx format
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="unread")  # "unread" or "read"
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    total_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    visitor_ids = Column(JSON)  # Stores list of visitor UUIDs
    last_view_at = Column(DateTime, default=func.now(), onupdate=func.now())
