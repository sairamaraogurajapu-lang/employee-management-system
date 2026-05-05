from pydantic import BaseModel
from typing import Optional

# 🔹 Create Project
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

# 🔹 Response Project
class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True   # (Pydantic v2) replaces orm_mode