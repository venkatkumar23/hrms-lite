"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import engine, Base
from app.routers import employees, attendance
from app import crud
from app.database import SessionLocal


# ──────────────────── Create tables on startup ───────────────────── #
# In production prefer Alembic migrations; this is a safety fallback.
Base.metadata.create_all(bind=engine)


# ──────────────────────── App initialization ─────────────────────── #
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "HRMS Lite — A lightweight Human Resource Management System API. "
        "Manage employees and track daily attendance with a clean RESTful interface."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)


# ─────────────────────────── CORS Middleware ─────────────────────── #
# allow_origin_regex matches any localhost port so Vite's fallback ports
# (5174, 5175, …) never trigger CORS errors during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────── Routers ────────────────────────────── #
app.include_router(employees.router)
app.include_router(attendance.router)


# ──────────────────────── Dashboard Endpoint ─────────────────────── #
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas


@app.get(
    "/dashboard",
    response_model=schemas.DashboardResponse,
    tags=["Dashboard"],
    summary="Get dashboard summary statistics",
)
def get_dashboard(db: Session = Depends(get_db)):
    """
    Returns high-level HR statistics:
    - Total employees
    - Total present / absent today
    - Per-employee attendance summary (total present & absent days)
    """
    return crud.get_dashboard_data(db)


# ────────────────────────── Health Check ─────────────────────────── #
@app.get("/health", tags=["System"], summary="Health check endpoint")
def health_check():
    """Returns service health status. Used by deployment platforms."""
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/", tags=["System"], summary="Root redirect info")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
