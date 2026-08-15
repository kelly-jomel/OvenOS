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
    bakery_id = current_user.bakery_id
    db_party = models.Party(**party.model_dump(), bakery_id=bakery_id)
    db.add(db_party)
    db.commit()
    db.refresh(db_party)
    
    party_dict = db_party.__dict__.copy()
    party_dict["total_orders"] = 0
    party_dict["balance"] = 0.0
    return party_dict

@router.get("/", response_model=List[schemas.PartyResponse])
def get_parties(party_type: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bakery_id = current_user.bakery_id
    query = db.query(models.Party).filter(models.Party.bakery_id == bakery_id)
    if party_type:
        query = query.filter(models.Party.party_type == party_type)
    
    parties = query.all()
    results = []
    
    for party in parties:
        # Calculate stats based on party_type
        if party.party_type == "customer":
            invoices = db.query(models.Invoice).filter(models.Invoice.party_id == party.id).all()
            total_orders = len(invoices)
            # Example balance calculation (total unpaid, assuming we just show 0 or total_amount for demo)
            # For now, let's just show sum of total_amount as "Lifetime Value" or balance=0
            balance = sum(inv.total_amount for inv in invoices if inv.status == "unpaid")
        else:
            purchases = db.query(models.Purchase).filter(models.Purchase.party_id == party.id).all()
            total_orders = len(purchases)
            balance = sum(pur.total_amount for pur in purchases if pur.status == "unpaid")
            
        party_dict = party.__dict__.copy()
        party_dict["total_orders"] = total_orders
        party_dict["balance"] = balance
        results.append(party_dict)
        
    return results
