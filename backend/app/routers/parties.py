from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/parties",
    tags=["parties"]
)

@router.post("/", response_model=schemas.PartyResponse)
def create_party(party: schemas.PartyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_party = models.Party(**party.model_dump(), bakery_id=current_user.bakery_id)
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    return db_party

@router.get("/", response_model=List[schemas.PartyResponse])
def get_parties(party_type: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Party).filter(models.Party.bakery_id == current_user.bakery_id)
    if party_type:
        query = query.filter(models.Party.party_type == party_type)
    return query.all()
