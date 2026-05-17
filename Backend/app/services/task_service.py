from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from fastapi import HTTPException
from datetime import datetime

def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M")

def today():
    return datetime.now().strftime("%Y-%m-%d")

def create_task(db: Session, task, manager_id: int):
    project = db.query(Project).filter(Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    employee = db.query(User).filter(User.id == task.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    manager = db.query(User).filter(User.id == manager_id).first()
    new_task = Task(
        title=task.title,
        description=task.description,
        status="pending",
        priority=task.priority or "medium",
        deadline=task.deadline,
        assigned_date=today(),
        completed_date=None,
        project_id=task.project_id,
        project_name=project.name,
        employee_id=employee.id,
        employee_name=employee.name,
        manager_id=manager_id,
        manager_name=manager.name if manager else None
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

def get_tasks_by_manager(db: Session, manager_id: int):
    return db.query(Task).filter(Task.manager_id == manager_id).all()

def get_tasks_by_employee(db: Session, employee_id: int):
    return db.query(Task).filter(Task.employee_id == employee_id).all()

def get_all_tasks(db: Session):
    return db.query(Task).all()

def update_task(db: Session, task_id: int, updated_data):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if updated_data.title is not None:
        task.title = updated_data.title
    if updated_data.description is not None:
        task.description = updated_data.description
    if updated_data.status is not None:
        task.status = updated_data.status
        if updated_data.status == "completed" and not task.completed_date:
            task.completed_date = today()
    if updated_data.priority is not None:
        task.priority = updated_data.priority
    if updated_data.deadline is not None:
        task.deadline = updated_data.deadline
    if updated_data.employee_id is not None:
        employee = db.query(User).filter(User.id == updated_data.employee_id).first()
        if employee:
            task.employee_id = employee.id
            task.employee_name = employee.name
    db.commit()
    db.refresh(task)
    return task

def update_task_status(db: Session, task_id: int, employee_id: int, status: str):
    task = db.query(Task).filter(Task.id == task_id, Task.employee_id == employee_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    if status == "completed" and not task.completed_date:
        task.completed_date = today()
    elif status != "completed":
        task.completed_date = None
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
