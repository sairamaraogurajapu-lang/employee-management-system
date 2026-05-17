from pydantic import BaseModel
from typing import Optional

class AssignmentCreate(BaseModel):
    employee_id: int
    manager_id: int

class AssignmentUpdate(BaseModel):
    manager_id: int

class AssignmentResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    manager_id: int
    manager_name: str

    class Config:
        from_attributes = True
