from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    manager: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = "in_progress"
    progress: Optional[int] = 0

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    manager: Optional[str]
    deadline: Optional[str]
    status: Optional[str]
    progress: Optional[int]

    class Config:
        from_attributes = True
