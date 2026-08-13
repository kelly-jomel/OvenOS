from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
)

@router.get("/", response_model=schemas.BakeryResponse)
def get_bakery_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bakery = db.query(models.Bakery).filter(models.Bakery.id == current_user.bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery profile not found")
    return bakery

@router.put("/", response_model=schemas.BakeryResponse)
def update_bakery_profile(profile_update: schemas.BakeryUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bakery = db.query(models.Bakery).filter(models.Bakery.id == current_user.bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery profile not found")
    
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bakery, key, value)
        
    db.commit()
    db.refresh(bakery)
    return bakery
