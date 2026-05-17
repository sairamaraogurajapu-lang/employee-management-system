from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.models.user import User
from fastapi import HTTPException

def create_assignment(db: Session, data):
    employee = db.query(User).filter(User.id == data.employee_id).first()
    manager = db.query(User).filter(User.id == data.manager_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    existing = db.query(Assignment).filter(Assignment.employee_id == data.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee already assigned. Use update to change manager.")

    assignment = Assignment(
        employee_id=employee.id,
        employee_name=employee.name,
        manager_id=manager.id,
        manager_name=manager.name
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def get_all_assignments(db: Session):
    return db.query(Assignment).all()

def update_assignment(db: Session, assignment_id: int, data):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    manager = db.query(User).filter(User.id == data.manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    assignment.manager_id = manager.id
    assignment.manager_name = manager.name
    db.commit()
    db.refresh(assignment)
    return assignment

def delete_assignment(db: Session, assignment_id: int):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment removed successfully"}
