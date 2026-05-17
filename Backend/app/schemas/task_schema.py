from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    employee_id: int
    priority: Optional[str] = "medium"
    deadline: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[str] = None
    employee_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    status: str

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: Optional[str]
    deadline: Optional[str]
    assigned_date: Optional[str]
    completed_date: Optional[str]
    project_id: int
    project_name: Optional[str]
    employee_id: Optional[int]
    employee_name: Optional[str]
    manager_id: Optional[int]
    manager_name: Optional[str]

    class Config:
        from_attributes = True
