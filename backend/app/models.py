"""
SQLAlchemy ORM models representing the database tables.
"""
from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Enum,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Employee(Base):
    """Represents an employee record."""

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship: cascade delete attendance records when employee is deleted
    attendance_records = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    def __repr__(self) -> str:
        return f"<Employee id={self.id} employee_id={self.employee_id} name={self.full_name}>"


class Attendance(Base):
    """Represents a single attendance record for an employee on a specific date."""

    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False)
    status = Column(Enum("Present", "Absent", name="attendance_status"), nullable=False)

    # Enforce: one record per employee per date
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )

    # Relationship back to employee
    employee = relationship("Employee", back_populates="attendance_records")

    def __repr__(self) -> str:
        return f"<Attendance employee_id={self.employee_id} date={self.date} status={self.status}>"
