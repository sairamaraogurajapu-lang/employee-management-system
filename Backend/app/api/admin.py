from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.project_scheme import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.schemas.assignment_schema import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.services.project_service import create_project, get_all_projects, update_project, delete_project
from app.services.auth_service import register_user, get_all_users, get_user_by_id, update_user, delete_user
from app.services.assignment_service import create_assignment, get_all_assignments, update_assignment, delete_assignment
from app.services.task_service import create_task, get_all_tasks, update_task_status, delete_task
from app.schemas.task_schema import TaskCreate, TaskStatusUpdate, TaskResponse
from app.models.task import Task


router = APIRouter(prefix="/admin")

@router.get("/dashboard")
def admin_dashboard():
    return {"message": "Admin Dashboard"}

# ===== PROJECT CRUD =====
@router.post("/projects", response_model=ProjectResponse)
def add_project(project: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(db, project)

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return get_all_projects(db)

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def edit_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    updated = update_project(db, project_id, project)
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated

@router.delete("/projects/{project_id}")
def remove_project(project_id: int, db: Session = Depends(get_db)):
    result = delete_project(db, project_id)
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return result

# ===== USER CRUD =====
@router.post("/users", response_model=UserResponse)
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user)

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return get_all_users(db)

@router.put("/users/{user_id}", response_model=UserResponse)
def edit_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    updated = update_user(db, user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.delete("/users/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db)):
    result = delete_user(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

# ===== ASSIGNMENT CRUD =====
@router.post("/assignments", response_model=AssignmentResponse)
def assign_manager(data: AssignmentCreate, db: Session = Depends(get_db)):
    return create_assignment(db, data)

@router.get("/assignments", response_model=List[AssignmentResponse])
def list_assignments(db: Session = Depends(get_db)):
    return get_all_assignments(db)

@router.put("/assignments/{assignment_id}", response_model=AssignmentResponse)
def change_manager(assignment_id: int, data: AssignmentUpdate, db: Session = Depends(get_db)):
    return update_assignment(db, assignment_id, data)

@router.delete("/assignments/{assignment_id}")
def remove_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return delete_assignment(db, assignment_id)

# ===== ADMIN TASK CRUD (Admin can assign tasks to ANY employee) =====
@router.post("/tasks", response_model=TaskResponse)
def admin_create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # Admin has full access, so no manager->employee restriction here.
    # Task service will set manager_id based on the provided employee.
    # (Current service uses manager_id param, so we resolve it below.)

    employee = db.query(User).filter(User.id == task.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Resolve manager_id using the assignment that links this employee to a manager
    assignment = db.query(Assignment).filter(Assignment.employee_id == employee.id).first()
    manager_id = assignment.manager_id if assignment else None

    # If employee is not assigned to any manager, create task with manager_id=None
    # but Task model requires manager_id nullable.
    return create_task(db, task, manager_id)


@router.get("/tasks", response_model=List[TaskResponse])
def admin_list_tasks(db: Session = Depends(get_db)):
    return get_all_tasks(db)


@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
def admin_update_task_status(task_id: int, data: TaskStatusUpdate, db: Session = Depends(get_db)):
    # We need employee_id for service. Fetch it from task.
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return update_task_status(db, task_id, task.employee_id, data.status)


@router.delete("/tasks/{task_id}")
def admin_delete_task(task_id: int, db: Session = Depends(get_db)):
    return delete_task(db, task_id)


# ===== DATE-BASED ACTIVITY REPORT =====
@router.get("/reports/activity")
def get_activity_report(db: Session = Depends(get_db)):

    from app.models.task import Task
    from app.models.user import User
    tasks = db.query(Task).all()
    employees = db.query(User).filter(User.role == "employee").all()

    # group tasks by assigned_date
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

    # employee daily activity
    employee_activity = []
    for e in employees:
        et = [t for t in tasks if t.employee_id == e.id]
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
            "employee_id": e.id,
            "employee_name": e.name,
            "total_tasks": len(et),
            "completed": ec,
            "pending": len([t for t in et if t.status == "pending"]),
            "in_progress": len([t for t in et if t.status == "in_progress"]),
            "completion_pct": pct,
            "daily_activity": daily
        })

    return {
        "date_activity": date_activity,
        "employee_activity": employee_activity
    }

# ===== REPORTS & ANALYTICS =====
@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    from app.models.user import User
    from app.models.project import Project
    from app.models.assignment import Assignment
    from app.models.task import Task

    users = db.query(User).all()
    projects = db.query(Project).all()
    assignments = db.query(Assignment).all()
    tasks = db.query(Task).all()

    managers = [u for u in users if u.role == "manager"]
    employees = [u for u in users if u.role == "employee"]

    # project wise report
    project_reports = []
    for p in projects:
        pt = [t for t in tasks if t.project_id == p.id]
        pc = len([t for t in pt if t.status == "completed"])
        pip = len([t for t in pt if t.status == "in_progress"])
        ppend = len([t for t in pt if t.status == "pending"])
        pblocked = len([t for t in pt if t.status == "blocked"])
        pct = round((pc / len(pt)) * 100) if pt else 0
        project_reports.append({
            "id": p.id, "name": p.name, "manager": p.manager,
            "deadline": p.deadline, "status": p.status or "in_progress",
            "total_tasks": len(pt), "completed": pc, "in_progress": pip,
            "pending": ppend, "blocked": pblocked, "completion_pct": pct
        })

    # team wise report (per manager)
    team_reports = []
    for m in managers:
        m_assignments = [a for a in assignments if a.manager_id == m.id]
        m_employees = [a.employee_id for a in m_assignments]
        m_tasks = [t for t in tasks if t.manager_id == m.id]
        mc = len([t for t in m_tasks if t.status == "completed"])
        mpct = round((mc / len(m_tasks)) * 100) if m_tasks else 0
        m_projects = list(set([t.project_name for t in m_tasks if t.project_name]))
        team_reports.append({
            "manager_id": m.id, "manager_name": m.name,
            "total_employees": len(m_employees),
            "total_tasks": len(m_tasks), "completed": mc,
            "pending": len([t for t in m_tasks if t.status == "pending"]),
            "completion_pct": mpct, "projects": m_projects
        })

    # individual employee report
    employee_reports = []
    for e in employees:
        et = [t for t in tasks if t.employee_id == e.id]
        ec = len([t for t in et if t.status == "completed"])
        ei = len([t for t in et if t.status == "in_progress"])
        ep = len([t for t in et if t.status == "pending"])
        eb = len([t for t in et if t.status == "blocked"])
        epct = round((ec / len(et)) * 100) if et else 0
        perf = "Excellent" if epct >= 80 else "Good" if epct >= 60 else "Average" if epct >= 40 else "Needs Improvement" if epct > 0 else "No Data"
        manager_name = next((a.manager_name for a in assignments if a.employee_id == e.id), "Unassigned")
        e_projects = list(set([t.project_name for t in et if t.project_name]))
        high_tasks = len([t for t in et if t.priority == "high"])
        employee_reports.append({
            "employee_id": e.id, "employee_name": e.name,
            "manager": manager_name, "department": e.department or "N/A",
            "total_tasks": len(et), "completed": ec, "in_progress": ei,
            "pending": ep, "blocked": eb, "high_priority": high_tasks,
            "completion_pct": epct, "performance": perf,
            "projects": e_projects
        })

    total_tasks = len(tasks)
    total_completed = len([t for t in tasks if t.status == "completed"])

    return {
        "total_users": len(users),
        "total_admins": len([u for u in users if u.role == "admin"]),
        "total_managers": len(managers),
        "total_employees": len(employees),
        "total_projects": len(projects),
        "total_assignments": len(assignments),
        "total_tasks": total_tasks,
        "total_completed_tasks": total_completed,
        "overall_completion_pct": round((total_completed / total_tasks) * 100) if total_tasks else 0,
        "unassigned_employees": len(employees) - len(assignments),
        "project_reports": project_reports,
        "team_reports": team_reports,
        "employee_reports": employee_reports
    }
