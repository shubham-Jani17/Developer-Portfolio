-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- 1. Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Portfolio Settings (Hero, Site Info, Toggles)
-- We use a single row table to store global settings
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_title VARCHAR(100) DEFAULT 'Portfolio',
    hero_title VARCHAR(100),
    hero_subtitle TEXT,
    contact_email VARCHAR(100),
    resume_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    show_blogs BOOLEAN DEFAULT TRUE,
    show_experience BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    live_link VARCHAR(255),
    github_link VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- e.g., 'Frontend', 'Backend', 'Tools'
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100), -- Class name or URL for the icon
    sort_order INT DEFAULT 0
);

-- 5. Experience / Timeline Table
CREATE TABLE IF NOT EXISTS experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    duration VARCHAR(100), -- e.g., 'Jan 2022 - Present'
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(255),
    published_date DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Messages Table (Contact Form Inbox)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (Password needs to be hashed by your FastAPI app later, this is just a placeholder)
-- DO NOT use plaintext passwords in production.
INSERT IGNORE INTO admin (username, password_hash) VALUES ('admin', 'placeholder_hash_to_be_replaced');

-- Insert default site settings
INSERT IGNORE INTO site_settings (id, site_title, hero_title, hero_subtitle) 
VALUES (1, 'My Portfolio', 'Hi, I am Shubham', 'A passionate developer building amazing things.');
