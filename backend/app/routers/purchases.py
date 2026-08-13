from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/purchases",
    tags=["purchases"]
)

@router.post("/", response_model=schemas.PurchaseResponse)
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Create Purchase record
    db_purchase = models.Purchase(
        bill_number=purchase.bill_number,
        party_id=purchase.party_id,
        party_name=purchase.party_name,
        subtotal=purchase.subtotal,
        tax_amount=purchase.tax_amount,
        total_amount=purchase.total_amount,
        status=purchase.status,
        payment_mode=purchase.payment_mode,
        bakery_id=current_user.bakery_id
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)

    # 2. Add Items & Add Stock to Inventory
    for item in purchase.items:
        db_item = models.PurchaseItem(
            purchase_id=db_purchase.id,
            inventory_item_id=item.inventory_item_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_rate=item.tax_rate,
            total_price=item.total_price
        )
        db.add(db_item)
        
        # INCREASE inventory
        inventory_item = db.query(models.InventoryItem).filter(
            models.InventoryItem.id == item.inventory_item_id,
            models.InventoryItem.bakery_id == current_user.bakery_id
        ).first()
        if inventory_item:
            inventory_item.quantity += item.quantity

    db.commit()
    db.refresh(db_purchase)
    return db_purchase

@router.get("/", response_model=List[schemas.PurchaseResponse])
def get_purchases(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Purchase).filter(models.Purchase.bakery_id == current_user.bakery_id).all()
