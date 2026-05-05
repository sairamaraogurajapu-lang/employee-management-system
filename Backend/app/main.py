from fastapi import FastAPI
from app.db.database import Base, engine
from app.api import auth, admin, manager, employee

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(manager.router)
app.include_router(employee.router)

@app.get("/")
def root():
    return {"message": "Employee Management System Running"}