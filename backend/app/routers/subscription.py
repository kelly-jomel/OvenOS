from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import razorpay
import os
from typing import Dict, Any

from .. import models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/subscription",
    tags=["subscription"]
)

# Initialize Razorpay Client (Credentials must be set in environment)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        print("WARNING: Razorpay API keys are not set!")
        return None
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@router.post("/create-checkout", response_model=Dict[str, Any])
def create_checkout_session(plan_name: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    client = get_razorpay_client()
    if not client:
        raise HTTPException(status_code=500, detail="Razorpay is not configured on the server.")
        
    bakery = db.query(models.Bakery).filter(models.Bakery.id == current_user.bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery not found")
        
    amount_in_paise = 490000 if plan_name == "pro" else 0
    
    if amount_in_paise == 0:
        raise HTTPException(status_code=400, detail="Invalid plan selected")

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_{bakery.id}",
            "notes": {
                "bakery_id": bakery.id,
                "plan_name": plan_name
            }
        }
        order = client.order.create(data=order_data)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        print(f"Razorpay Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get("/status")
def get_subscription_status(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bakery = db.query(models.Bakery).filter(models.Bakery.id == current_user.bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery not found")
        
    return {
        "plan": bakery.subscription_plan,
        "status": bakery.subscription_status
    }
