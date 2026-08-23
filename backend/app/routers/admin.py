from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from .. import models
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

SUPER_ADMIN_EMAIL = "sidrockss@gmail.com"

def verify_super_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.email != SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Not authorized to access the super admin dashboard")
    return current_user

@router.get("/subscribers", response_model=List[Dict[str, Any]])
def get_all_subscribers(db: Session = Depends(get_db), _: models.User = Depends(verify_super_admin)):
    bakeries = db.query(models.Bakery).all()
    
    result = []
    for b in bakeries:
        # Find the primary user (admin) for the bakery to get contact info
        primary_user = db.query(models.User).filter(
            models.User.bakery_id == b.id,
            models.User.role == "admin"
        ).first()
        
        result.append({
            "bakery_id": b.id,
            "trading_name": b.trading_name or "Unnamed Bakery",
            "country": b.country,
            "owner_email": primary_user.email if primary_user else "N/A",
            "owner_name": primary_user.email.split('@')[0] if primary_user else "N/A",
            "subscription_plan": b.subscription_plan,
            "subscription_status": b.subscription_status,
            "subscription_start_date": b.subscription_start_date,
            "subscription_end_date": b.subscription_end_date,
        })
        
    return result
