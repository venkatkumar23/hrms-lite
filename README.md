# HRMS Lite — Human Resource Management System

<p align="center">
  <strong>A production-ready, lightweight HR Management System</strong><br/>
  Built with React + FastAPI + MySQL
</p>

---

## 📋 Project Overview

**HRMS Lite** is a professional, single-admin Human Resource Management System focused on:
- **Employee Management** — Add, view, and delete employee records
- **Attendance Tracking** — Mark and view daily attendance per employee
- **Dashboard Analytics** — Real-time HR stats and per-employee summaries

---

## 🛠️ Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Frontend    | React 18 + Vite 4, Tailwind CSS, React Router v6, Axios |
| Backend     | Python FastAPI, SQLAlchemy ORM, Pydantic v2 |
| Database    | MySQL 8 with proper relational schema        |
| Migrations  | Alembic                                     |
| Deployment  | Render (backend) / Vercel (frontend)         |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8+

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

---

### 2. Database Setup

```sql
-- Connect to MySQL and create the database
CREATE DATABASE hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your DATABASE_URL with your MySQL credentials

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

Backend is now available at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

---

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend is now available at: **http://localhost:5173**

---

## 🌐 API Endpoints

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/employees/`                 | Get all employees                    |
| POST   | `/employees/`                 | Create a new employee                |
| DELETE | `/employees/{employee_id}`    | Delete employee & their attendance   |
| GET    | `/attendance/`                | Get all attendance records           |
| GET    | `/attendance/?date=YYYY-MM-DD`| Filter attendance by date            |
| POST   | `/attendance/`                | Mark attendance                      |
| GET    | `/attendance/{employee_id}`   | Get attendance for specific employee |
| GET    | `/dashboard`                  | Get dashboard analytics              |
| GET    | `/health`                     | Service health check                 |
| GET    | `/docs`                       | Swagger UI documentation             |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=mysql+pymysql://user:password@host:port/hrms
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
APP_NAME=HRMS Lite
APP_VERSION=1.0.0
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `DATABASE_URL` — your MySQL connection string (use a hosted DB like PlanetScale or Railway)
   - `CORS_ORIGINS` — your Vercel frontend URL

### Frontend → Vercel

1. Push code to GitHub
2. Import the `frontend/` folder on [vercel.com](https://vercel.com)
3. Set **Framework**: Vite
4. Set **Root Directory**: `frontend`
5. Add environment variable:
   - `VITE_API_BASE_URL` — your Render backend URL

---

## 📁 Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS + routes
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── models.py         # ORM models (Employee, Attendance)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── crud.py           # Database operations
│   │   ├── core/
│   │   │   └── config.py     # Settings from env vars
│   │   └── routers/
│   │       ├── employees.py  # Employee endpoints
│   │       └── attendance.py # Attendance endpoints
│   ├── alembic/              # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Router setup
    │   ├── main.jsx           # React entry + Toaster
    │   ├── index.css          # Global styles + Tailwind
    │   ├── services/api.js    # Axios instance + API methods
    │   ├── hooks/useFetch.js  # Data fetching hooks
    │   ├── utils/helpers.js   # Utility functions
    │   ├── layouts/           # MainLayout
    │   ├── components/ui/     # Button, Input, Modal, Table…
    │   ├── components/layout/ # Sidebar, Header
    │   └── pages/             # Dashboard, Employees, Attendance
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ⚠️ Assumptions & Limitations

- **Single admin** — no authentication or role system implemented (out of scope)
- **No leave or payroll management** — focused on core HR operations as specified
- **Date validation** — attendance dates are capped to today (future dates blocked)
- **Department list** — predefined list of 10 departments; can be extended in `Employees.jsx`
- **Cascade delete** — deleting an employee removes all their attendance records (by design)

---

## 📄 License

MIT License — free to use and modify.
