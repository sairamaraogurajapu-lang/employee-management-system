from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    manager = Column(String)
    deadline = Column(String)
    status = Column(String, default="in_progress")
    progress = Column(Integer, default=0)
