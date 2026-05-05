from sqlalchemy.orm import Session
from app.models.project import Project

# 🔹 Create Project
def create_project(db: Session, project):
    new_project = Project(
        name=project.name,
        description=project.description
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


# 🔹 Get All Projects
def get_all_projects(db: Session):
    return db.query(Project).all()


# 🔹 Get Single Project
def get_project_by_id(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


# 🔹 Update Project
def update_project(db: Session, project_id: int, updated_data):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        return None

    if updated_data.name is not None:
        project.name = updated_data.name

    if updated_data.description is not None:
        project.description = updated_data.description

    db.commit()
    db.refresh(project)
    return project


# 🔹 Delete Project
def delete_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        return None

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}