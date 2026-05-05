from sqlalchemy.orm import Session
from app.models.task import Task

# 🔹 Create Task
def create_task(db: Session, task):
    new_task = Task(
        title=task.title,
        status=task.status,
        project_id=task.project_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# 🔹 Get All Tasks
def get_all_tasks(db: Session):
    return db.query(Task).all()


# 🔹 Get Tasks by Project
def get_tasks_by_project(db: Session, project_id: int):
    return db.query(Task).filter(Task.project_id == project_id).all()


# 🔹 Get Single Task
def get_task_by_id(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()


# 🔹 Update Task
def update_task(db: Session, task_id: int, updated_data):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        return None

    if updated_data.title is not None:
        task.title = updated_data.title

    if updated_data.status is not None:
        task.status = updated_data.status

    db.commit()
    db.refresh(task)
    return task


# 🔹 Delete Task
def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        return None

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}