from sqlalchemy import Column, Integer, String, ForeignKey
from datetime import datetime
from app.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")
    priority = Column(String, default="medium")
    deadline = Column(String, nullable=True)
    assigned_date = Column(String, nullable=True)
    completed_date = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    project_name = Column(String, nullable=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    employee_name = Column(String, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    manager_name = Column(String, nullable=True)
