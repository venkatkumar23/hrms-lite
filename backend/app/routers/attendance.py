"""
Attendance router: handles all /attendance endpoints.
"""
from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _build_attendance_response(record, db: Session) -> schemas.AttendanceResponse:
    """Helper: convert an Attendance ORM object into an AttendanceResponse schema."""
    return schemas.AttendanceResponse(
        id=record.id,
        employee_id=record.employee_id,
        employee_string_id=record.employee.employee_id,
        employee_name=record.employee.full_name,
        date=record.date,
        status=record.status,
    )


@router.post(
    "/",
    response_model=schemas.AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark attendance for an employee",
)
def mark_attendance(payload: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    """
    Mark attendance for an employee on a specific date.
    - **employee_id**: The string employee ID (e.g. 'EMP001')
    - **date**: Date in YYYY-MM-DD format
    - **status**: 'Present' or 'Absent'
    - Returns 409 if attendance already marked for this employee on this date
    """
    record = crud.mark_attendance(db, payload)
    # Refresh to load the relationship
    db.refresh(record)
    return _build_attendance_response(record, db)


@router.get(
    "/",
    response_model=schemas.AttendanceListResponse,
    summary="Get all attendance records, optionally filtered by date",
)
def get_all_attendance(
    date: Optional[date_type] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve all attendance records.
    - Optionally filter by **date** query parameter (YYYY-MM-DD)
    """
    if date:
        records = crud.get_attendance_by_date(db, date)
    else:
        records = crud.get_all_attendance(db)

    response_list = [_build_attendance_response(r, db) for r in records]
    return schemas.AttendanceListResponse(total=len(response_list), records=response_list)


@router.get(
    "/{employee_id}",
    response_model=schemas.AttendanceListResponse,
    summary="Get attendance records for a specific employee",
)
def get_employee_attendance(
    employee_id: str,
    date: Optional[date_type] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve attendance records for a specific employee.
    - **employee_id**: The string employee ID (e.g. 'EMP001')
    - Optionally filter by **date** query parameter
    """
    employee = crud.get_employee_by_employee_id(db, employee_id)
    if not employee:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )

    records = crud.get_attendance_by_employee(db, employee.id, date_filter=date)
    response_list = [_build_attendance_response(r, db) for r in records]
    return schemas.AttendanceListResponse(total=len(response_list), records=response_list)
