from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password

def register_user(db: Session, user):
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        department=user.department
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(db: Session, email, password):
    user = db.query(User).filter(User.email.ilike(email)).first()
    if not user or not verify_password(password, user.password):
        return None
    return user

def get_all_users(db: Session):
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def update_user(db: Session, user_id: int, updated_data):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if updated_data.name is not None:
        user.name = updated_data.name
    if updated_data.email is not None:
        user.email = updated_data.email
    if updated_data.role is not None:
        user.role = updated_data.role
    if updated_data.department is not None:
        user.department = updated_data.department
    if updated_data.password is not None and updated_data.password != "":
        user.password = updated_data.password
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
