from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    employee_name = Column(String)
    manager_id = Column(Integer, ForeignKey("users.id"))
    manager_name = Column(String)
