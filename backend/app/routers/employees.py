"""
Employee router: handles all /employees endpoints.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post(
    "/",
    response_model=schemas.EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new employee",
)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee record.
    - **employee_id**: Must be unique across all employees
    - **email**: Must be a valid email and unique
    - **full_name** and **department** are required
    """
    employee = crud.create_employee(db, payload)
    present_days = crud.get_present_days_count(db, employee.id)
    result = schemas.EmployeeResponse.from_orm(employee)
    result.total_present_days = present_days
    return result


@router.get(
    "/",
    response_model=schemas.EmployeeListResponse,
    summary="Get all employees",
)
def list_employees(db: Session = Depends(get_db)):
    """Retrieve a list of all employees with their total present day counts."""
    employees = crud.get_all_employees(db)
    response_list = []
    for emp in employees:
        present_days = crud.get_present_days_count(db, emp.id)
        emp_resp = schemas.EmployeeResponse.from_orm(emp)
        emp_resp.total_present_days = present_days
        response_list.append(emp_resp)

    return schemas.EmployeeListResponse(total=len(response_list), employees=response_list)


@router.delete(
    "/{employee_id}",
    response_model=schemas.EmployeeResponse,
    summary="Delete an employee",
)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """
    Delete an employee by their string employee_id.
    This also cascades and removes all related attendance records.
    """
    employee = crud.delete_employee(db, employee_id)
    result = schemas.EmployeeResponse.from_orm(employee)
    result.total_present_days = 0
    return result
