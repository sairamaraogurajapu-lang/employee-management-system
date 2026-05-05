from fastapi import APIRouter

router = APIRouter(prefix="/employee")

@router.get("/dashboard")
def employee_dashboard():
    return {"message": "Employee Dashboard"}