from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import verify_token

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    existing_user = db.query(models.User).filter(models.User.firebase_uid == user.firebase_uid).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")

    # 2. Create Bakery
    new_bakery = models.Bakery(name=user.bakery_name)
    db.add(new_bakery)
    db.commit()
    db.refresh(new_bakery)

    # 3. Create User attached to Bakery
    new_user = models.User(
        firebase_uid=user.firebase_uid,
        email=user.email,
        bakery_id=new_bakery.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
