from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.schemas.task_schema import TaskResponse, TaskStatusUpdate
from app.services.task_service import get_tasks_by_employee, update_task_status
from app.models.comment import Comment
from app.models.user import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/employee")

class CommentCreate(BaseModel):
    comment: str

class CommentResponse(BaseModel):
    id: int
    task_id: int
    employee_id: int
    employee_name: str
    comment: str
    created_at: Optional[str]
    class Config:
        from_attributes = True

@router.get("/dashboard")
def employee_dashboard():
    return {"message": "Employee Dashboard"}

@router.get("/{employee_id}/tasks", response_model=List[TaskResponse])
def get_my_tasks(employee_id: int, db: Session = Depends(get_db)):
    return get_tasks_by_employee(db, employee_id)

@router.put("/{employee_id}/tasks/{task_id}/status", response_model=TaskResponse)
def update_my_task_status(employee_id: int, task_id: int, data: TaskStatusUpdate, db: Session = Depends(get_db)):
    return update_task_status(db, task_id, employee_id, data.status)

@router.post("/{employee_id}/tasks/{task_id}/comments", response_model=CommentResponse)
def add_comment(employee_id: int, task_id: int, data: CommentCreate, db: Session = Depends(get_db)):
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    comment = Comment(
        task_id=task_id,
        employee_id=employee_id,
        employee_name=employee.name,
        comment=data.comment,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{employee_id}/tasks/{task_id}/comments", response_model=List[CommentResponse])
def get_comments(employee_id: int, task_id: int, db: Session = Depends(get_db)):
    return db.query(Comment).filter(Comment.task_id == task_id).all()

@router.delete("/{employee_id}/comments/{comment_id}")
def delete_comment(employee_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.employee_id == employee_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}
