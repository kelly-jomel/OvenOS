from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import verify_token

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)

def get_user_bakery(user_dict: dict, db: Session):
    firebase_uid = user_dict.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in DB")
    return user.bakery_id

@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db), auth_user: dict = Depends(verify_token)):
    bakery_id = get_user_bakery(auth_user, db)
    return db.query(models.Order).filter(models.Order.bakery_id == bakery_id).all()

@router.post("/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), auth_user: dict = Depends(verify_token)):
    bakery_id = get_user_bakery(auth_user, db)
    
    # Generate a simple display ID like ORD-123
    count = db.query(models.Order).filter(models.Order.bakery_id == bakery_id).count()
    display_id = f"ORD-{count + 1:03d}"
    
    new_order = models.Order(
        display_id=display_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        items=order.items,
        source=order.source,
        delivery_date=order.delivery_date,
        bakery_id=bakery_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.post("/public/{bakery_id}", response_model=schemas.OrderResponse)
def create_public_order(bakery_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Verify bakery exists
    bakery = db.query(models.Bakery).filter(models.Bakery.id == bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery not found")
        
    count = db.query(models.Order).filter(models.Order.bakery_id == bakery_id).count()
    display_id = f"ORD-{count + 1:03d}"
    
    new_order = models.Order(
        display_id=display_id,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        items=order.items,
        source=order.source,
        delivery_date=order.delivery_date,
        bakery_id=bakery_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db), auth_user: dict = Depends(verify_token)):
    bakery_id = get_user_bakery(auth_user, db)
    
    db_order = db.query(models.Order).filter(models.Order.id == order_id, models.Order.bakery_id == bakery_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.status = order_update.status
    if order_update.delivery_date is not None:
        db_order.delivery_date = order_update.delivery_date
        
    db.commit()
    db.refresh(db_order)
    return db_order
