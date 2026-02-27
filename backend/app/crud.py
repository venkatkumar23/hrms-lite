"""
CRUD operations: reusable database interaction functions.
All functions receive a SQLAlchemy Session and return ORM objects or raise HTTPExceptions.
"""
import datetime as dt
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from fastapi import HTTPException, status

from app import models, schemas


# ═══════════════════════════ Employee CRUD ═══════════════════════════════ #

def get_employee_by_employee_id(db: Session, employee_id: str) -> Optional[models.Employee]:
    """Fetch employee by their string employee_id."""
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()


def get_employee_by_id(db: Session, employee_pk: int) -> Optional[models.Employee]:
    """Fetch employee by their primary key integer id."""
    return db.query(models.Employee).filter(models.Employee.id == employee_pk).first()


def get_employee_by_email(db: Session, email: str) -> Optional[models.Employee]:
    """Fetch employee by email."""
    return db.query(models.Employee).filter(models.Employee.email == email).first()


def get_all_employees(db: Session) -> list[models.Employee]:
    """Return all employees ordered by creation date descending."""
    return db.query(models.Employee).order_by(models.Employee.created_at.desc()).all()


def create_employee(db: Session, payload: schemas.EmployeeCreate) -> models.Employee:
    """
    Create a new employee record.
    Raises 409 if employee_id or email already exists.
    """
    # Check for duplicate employee_id
    if get_employee_by_employee_id(db, payload.employee_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{payload.employee_id}' already exists.",
        )

    # Check for duplicate email
    if get_employee_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{payload.email}' already exists.",
        )

    employee = models.Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: str) -> models.Employee:
    """
    Delete an employee by their string employee_id.
    Raises 404 if not found.
    Cascade delete will remove related attendance records automatically.
    """
    employee = get_employee_by_employee_id(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    db.delete(employee)
    db.commit()
    return employee


# ═══════════════════════════ Attendance CRUD ═════════════════════════════ #

def get_attendance_by_employee(
    db: Session, employee_pk: int, date_filter: Optional[dt.date] = None
) -> list[models.Attendance]:
    """Fetch all attendance records for an employee, optionally filtered by date."""
    query = db.query(models.Attendance).filter(models.Attendance.employee_id == employee_pk)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    return query.order_by(models.Attendance.date.desc()).all()


def get_attendance_by_date(db: Session, filter_date: dt.date) -> list[models.Attendance]:
    """Fetch all attendance records for a given date."""
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.date == filter_date)
        .order_by(models.Attendance.date.desc())
        .all()
    )


def get_all_attendance(db: Session) -> list[models.Attendance]:
    """Fetch all attendance records."""
    return db.query(models.Attendance).order_by(models.Attendance.date.desc()).all()


def mark_attendance(db: Session, payload: schemas.AttendanceCreate) -> models.Attendance:
    """
    Mark attendance for an employee.
    Raises 404 if employee not found.
    Raises 409 if attendance already marked for that date.
    """
    # Resolve employee by string employee_id
    employee = get_employee_by_employee_id(db, payload.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{payload.employee_id}' not found.",
        )

    # Check for duplicate attendance
    existing = (
        db.query(models.Attendance)
        .filter(
            and_(
                models.Attendance.employee_id == employee.id,
                models.Attendance.date == payload.attendance_date,
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{payload.employee_id}' on {payload.attendance_date} already marked as '{existing.status}'.",
        )

    record = models.Attendance(
        employee_id=employee.id,
        date=payload.attendance_date,
        status=payload.status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_present_days_count(db: Session, employee_pk: int) -> int:
    """Count total 'Present' days for an employee."""
    return (
        db.query(func.count(models.Attendance.id))
        .filter(
            and_(
                models.Attendance.employee_id == employee_pk,
                models.Attendance.status == "Present",
            )
        )
        .scalar()
        or 0
    )


# ═══════════════════════════ Dashboard CRUD ═════════════════════════════ #

def get_dashboard_data(db: Session) -> schemas.DashboardResponse:
    """Aggregate dashboard statistics."""
    today = dt.date.today()

    total_employees = db.query(func.count(models.Employee.id)).scalar() or 0

    today_present = (
        db.query(func.count(models.Attendance.id))
        .filter(
            and_(
                models.Attendance.date == today,
                models.Attendance.status == "Present",
            )
        )
        .scalar()
        or 0
    )

    today_absent = (
        db.query(func.count(models.Attendance.id))
        .filter(
            and_(
                models.Attendance.date == today,
                models.Attendance.status == "Absent",
            )
        )
        .scalar()
        or 0
    )

    employees = get_all_employees(db)
    summary = []
    for emp in employees:
        present_count = get_present_days_count(db, emp.id)
        absent_count = (
            db.query(func.count(models.Attendance.id))
            .filter(
                and_(
                    models.Attendance.employee_id == emp.id,
                    models.Attendance.status == "Absent",
                )
            )
            .scalar()
            or 0
        )
        summary.append(
            schemas.DashboardEmployeeSummary(
                employee_id=emp.employee_id,
                full_name=emp.full_name,
                department=emp.department,
                total_present=present_count,
                total_absent=absent_count,
            )
        )

    return schemas.DashboardResponse(
        total_employees=total_employees,
        total_present_today=today_present,
        total_absent_today=today_absent,
        employees_summary=summary,
    )
