from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.db.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    employee_name = Column(String)
    comment = Column(String)
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M"))
