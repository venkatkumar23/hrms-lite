"""
Pydantic schemas for request validation and response serialization.
"""
import datetime as dt
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


# ─────────────────────────── Employee Schemas ───────────────────────────── #

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, max_length=150, description="Full name of the employee")
    email: EmailStr = Field(..., description="Valid email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee."""
    pass


class EmployeeResponse(EmployeeBase):
    """Schema for employee API responses."""
    id: int
    created_at: dt.datetime
    total_present_days: Optional[int] = 0

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    """Schema for paginated employee list."""
    total: int
    employees: list[EmployeeResponse]


# ─────────────────────────── Attendance Schemas ──────────────────────────── #

class AttendanceBase(BaseModel):
    employee_id: str = Field(..., description="The unique employee_id string (e.g. 'EMP001')")
    attendance_date: dt.date = Field(..., alias="date", description="Attendance date (YYYY-MM-DD)")
    status: Literal["Present", "Absent"] = Field(..., description="Attendance status")

    model_config = {"populate_by_name": True}


class AttendanceCreate(AttendanceBase):
    """Schema for marking attendance."""
    pass


class AttendanceResponse(BaseModel):
    """Schema for attendance API responses."""
    id: int
    employee_id: int              # Internal FK (integer)
    employee_string_id: str       # The human-readable employee_id (e.g. 'EMP001')
    employee_name: str
    date: dt.date
    status: Literal["Present", "Absent"]

    class Config:
        from_attributes = True


class AttendanceListResponse(BaseModel):
    total: int
    records: list[AttendanceResponse]


# ─────────────────────────── Dashboard Schemas ──────────────────────────── #

class DashboardEmployeeSummary(BaseModel):
    employee_id: str
    full_name: str
    department: str
    total_present: int
    total_absent: int


class DashboardResponse(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    employees_summary: list[DashboardEmployeeSummary]


# ─────────────────────────── Error Schema ───────────────────────────────── #

class ErrorResponse(BaseModel):
    detail: str
