from fastapi import APIRouter

router = APIRouter(prefix="/manager")

@router.get("/dashboard")
def manager_dashboard():
    return {"message": "Manager Dashboard"}