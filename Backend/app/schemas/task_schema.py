from pydantic import BaseModel
from typing import Optional

# 🔹 Create Task
class TaskCreate(BaseModel):
    title: str
    status: Optional[str] = "pending"   # default status
    project_id: int

# 🔹 Update Task
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None

# 🔹 Response Task
class TaskResponse(BaseModel):
    id: int
    title: str
    status: str
    project_id: int

    class Config:
        from_attributes = True   # for ORM (Pydantic v2)