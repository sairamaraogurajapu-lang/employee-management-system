from fastapi import APIRouter

router = APIRouter(prefix="/admin")

@router.get("/dashboard")
def admin_dashboard():
    return {"message": "Admin Dashboard"}