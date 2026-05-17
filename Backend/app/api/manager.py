from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
from app.schemas.project_scheme import ProjectResponse, ProjectUpdate
from app.services.task_service import create_task, get_tasks_by_manager, update_task, delete_task
from app.models.project import Project
from app.models.user import User
from app.models.assignment import Assignment

router = APIRouter(prefix="/manager")

@router.get("/dashboard")
def manager_dashboard():
    return {"message": "Manager Dashboard"}

@router.get("/{manager_id}/projects", response_model=List[ProjectResponse])
def get_my_projects(manager_id: int, db: Session = Depends(get_db)):
    manager = db.query(User).filter(User.id == manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    return db.query(Project).filter(Project.manager == manager.name).all()

@router.put("/{manager_id}/projects/{project_id}", response_model=ProjectResponse)
def update_my_project(manager_id: int, project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    manager = db.query(User).filter(User.id == manager_id).first()
    project = db.query(Project).filter(Project.id == project_id, Project.manager == manager.name).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if data.status is not None:
        project.status = data.status
    if data.progress is not None:
        project.progress = data.progress
    if data.deadline is not None:
        project.deadline = data.deadline
    if data.description is not None:
        project.description = data.description
    db.commit()
    db.refresh(project)
    return project

@router.get("/{manager_id}/employees")
def get_my_employees(manager_id: int, db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.manager_id == manager_id).all()
    return [{"id": a.employee_id, "name": a.employee_name} for a in assignments]

@router.post("/{manager_id}/tasks", response_model=TaskResponse)
def assign_task(manager_id: int, task: TaskCreate, db: Session = Depends(get_db)):
    return create_task(db, task, manager_id)

@router.get("/{manager_id}/tasks", response_model=List[TaskResponse])
def get_manager_tasks(manager_id: int, db: Session = Depends(get_db)):
    return get_tasks_by_manager(db, manager_id)

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def edit_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    return update_task(db, task_id, task)

@router.delete("/tasks/{task_id}")
def remove_task(task_id: int, db: Session = Depends(get_db)):
    return delete_task(db, task_id)

@router.get("/{manager_id}/reports/activity")
def get_manager_activity(manager_id: int, db: Session = Depends(get_db)):
    from app.models.task import Task
    tasks = db.query(Task).filter(Task.manager_id == manager_id).all()
    assignments = db.query(Assignment).filter(Assignment.manager_id == manager_id).all()
    employees = [{"id": a.employee_id, "name": a.employee_name} for a in assignments]

    date_activity = {}
    for t in tasks:
        date = t.assigned_date or "Unknown"
        if date not in date_activity:
            date_activity[date] = []
        date_activity[date].append({
            "task_id": t.id, "title": t.title,
            "employee_name": t.employee_name,
            "project_name": t.project_name,
            "status": t.status, "priority": t.priority,
            "deadline": t.deadline,
            "assigned_date": t.assigned_date,
            "completed_date": t.completed_date
        })

    employee_activity = []
    for e in employees:
        et = [t for t in tasks if t.employee_id == e["id"]]
        daily = {}
        for t in et:
            date = t.assigned_date or "Unknown"
            if date not in daily:
                daily[date] = []
            daily[date].append({
                "task_id": t.id, "title": t.title,
                "project_name": t.project_name,
                "status": t.status, "priority": t.priority,
                "deadline": t.deadline,
                "completed_date": t.completed_date
            })
        ec = len([t for t in et if t.status == "completed"])
        pct = round((ec / len(et)) * 100) if et else 0
        employee_activity.append({
            "employee_id": e["id"],
            "employee_name": e["name"],
            "total_tasks": len(et),
            "completed": ec,
            "pending": len([t for t in et if t.status == "pending"]),
            "in_progress": len([t for t in et if t.status == "in_progress"]),
            "completion_pct": pct,
            "daily_activity": daily
        })

    return {"date_activity": date_activity, "employee_activity": employee_activity}
