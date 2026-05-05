from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    status = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))