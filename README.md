# 🌟 Shubham's Developer Portfolio & Admin Dashboard 🚀

💼 Dynamic Portfolio &amp; Admin Dashboard built with React.js, FastAPI, and MySQL. Showcases projects, skills, experience, blogs, and achievements while providing secure content management, resume updates, social link management, and contact handling. 🚀

A modern, high-performance, full-stack developer portfolio featuring a public-facing website, a secure glassmorphic Admin Dashboard, and a robust FastAPI backend API server connected to a MySQL database.

---

## 🛠️ Tech Stack & Technologies

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F27?style=flat&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white) |
| **Unified Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-F024B6?style=flat&logo=framer) ![Vanilla CSS](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=flat&logo=css3) |

---

## ✨ Key Features

### 🎨 1. Unified Frontend (`Portfolio/`)
* **Combined Design Architecture:** The public portfolio and the secure Admin Dashboard run seamlessly under a single port/domain using client-side routing.
* **Interactive UI/UX:** Styled using glassmorphic cards, harmonized HSL gradients, and responsive layouts.
* **Modern Contact Form:** Submit messages with a centered, blur-backdrop modal notification that vanishes after 2 seconds.
* **Analytics Tracker:** Built-in visitor and view log counter displayed on the dashboard.

### 🔒 2. Integrated Admin Panel (`Portfolio/src/Admin/`)
* **Secure Cookie-Based Auth:** Uses secure HttpOnly session cookies to guard dashboard routes against client-side script access.
* **Contextual Bulk Actions:** Manage contact forms with checkmarks, "Select All" options, and bulk archive, delete, or restore actions using sleek icon controls.
* **Live CRUD Operations:** Add/edit projects, skills, blogs, experience items, and website metadata dynamically.

### 🐍 3. Backend API Server (`App_Server/`)
* **High-Performance FastAPI:** Rapid responses and built-in rate-limiting locks to block brute-force login attempts.
* **Database Autopilot:** Connects to MySQL via SQLAlchemy and automatically creates the schema, tables, and inserts seed records on startup.

---

## 📂 Repository Directory Structure

```text
Shubham's Portfolio/
├── App_Server/            # 🐍 Python FastAPI API Server
│   ├── App.py             # FastAPI routing, middleware, login lockout, API handlers
│   ├── config.py          # App configuration loader (Pydantic / .env)
│   ├── database.py        # SQLAlchemy connections & database creation checks
│   ├── models.py          # Database ORM schemas (Admin, Skills, Projects, Blogs, etc.)
│   └── requirements.txt   # Backend package requirements
│
├── Portfolio/             # 🎨 Unified Frontend Project (Vite + React)
│   ├── src/               # Application React components
│   │   ├── Admin/         # 💼 Migrated Admin Dashboard pages, hooks, and views
│   │   ├── api/           # API fetch client
│   │   └── Components/    # Shared public site components
│   ├── public/            # Static files (Resume PDF, default profile images)
│   ├── package.json       # Frontend scripts and node modules
│   ├── vite.config.js     # Dev server port configurations and proxies
│   └── vercel.json        # Rewrite mappings to proxy API requests and host React SPA
│
├── .gitignore             # Roots Git rules (Keeps sensitive .env secrets safe)
└── deployment.md          # 📝 Step-by-step checklist to deploy database/servers
```

---

## 🚀 Setup & Installation

To run the application locally, follow these steps:

### 1. Backend API Server (`App_Server/`)
1. Open your terminal in the backend directory:
   ```bash
   cd App_Server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv myenv
   # On Windows:
   myenv\Scripts\activate
   # On macOS/Linux:
   source myenv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `App_Server` directory (never commit this to Git):
   ```env
   MYSQL_URL=mysql+pymysql://your_db_username:your_db_password@localhost:3306/portfolio_db
   ADMIN_PASSWORD=your_secure_password_for_login
   ADMIN_EMAIL=your_admin_email@example.com
   SESSION_SECRET=a_long_random_cookie_secret_string
   PORT=8000
   ```
5. Run the server:
   ```bash
   python App.py
   ```

---

### 2. Frontend Development (`Portfolio/`)
1. Open a new terminal in the frontend directory:
   ```bash
   cd Portfolio
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   * The website will open at `http://localhost:3001`.
   * The dev server automatically redirects all `/api/*` network requests to your local Python backend at `http://127.0.0.1:8000`.

---

## 🔐 Security & Deployment Notes
* **CORS Safety:** The FastAPI backend is configured to accept requests only from specific frontend URLs. You can change allowed domains in `App.py` or set environment variables in production.
* **Reverse Proxy:** Using the provided [Vercel rewrite configuration](file:///d:/My%20Project/Shubham's%20Portfolio/Portfolio/vercel.json) allows you to route all API calls dynamically, avoiding cross-domain CORS errors and allowing secure cookies.
* **Detailed Guide:** For production database, backend, and frontend hosting instructions, check out **[deployment.md](file:///d:/My%20Project/Shubham's%20Portfolio/deployment.md)**!
