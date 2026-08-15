from fastapi import APIRouter, Request, Response, status, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
import os

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"]
)

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "super-secret-verify-token")

@router.get("/whatsapp")
def verify_whatsapp_webhook(request: Request):
    """
    Webhook verification endpoint required by Meta/WhatsApp.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
            # Meta expects the challenge to be returned as plain text
            return Response(content=challenge, media_type="text/plain", status_code=200)
        else:
            raise HTTPException(status_code=403, detail="Verification failed")
    
    raise HTTPException(status_code=400, detail="Bad Request")

@router.post("/whatsapp")
async def handle_whatsapp_messages(request: Request):
    """
    Receives incoming WhatsApp messages and status updates from Meta.
    """
    # Meta webhook payload structure
    data = await request.json()
    
    # Check if this is an event from a WhatsApp Business Account
    if data.get("object") == "whatsapp_business_account":
        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # Check for incoming messages
                if "messages" in value:
                    for message in value["messages"]:
                        sender_phone = message.get("from")
                        message_body = message.get("text", {}).get("body", "")
                        
                        # In a real app, we would route this message to our Unified Dashboard via Redis Pub/Sub or WebSocket,
                        # and process it using NLP or simple intent matching.
                        print(f"Received message from {sender_phone}: {message_body}")
                        
                # Check for message status updates (sent, delivered, read)
                elif "statuses" in value:
                    for status_update in value["statuses"]:
                        print(f"Message status update: {status_update.get('status')}")
                        
        return Response(status_code=200)
    
    raise HTTPException(status_code=404, detail="Not Found")

import razorpay
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

@router.post("/razorpay")
async def handle_razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    if not signature or not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Missing signature or webhook secret")

    client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID", ""), RAZORPAY_KEY_SECRET))
    
    try:
        client.utility.verify_webhook_signature(payload.decode('utf-8'), signature, RAZORPAY_WEBHOOK_SECRET)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    data = await request.json()
    event = data.get("event")
    
    if event == "order.paid":
        order = data["payload"]["order"]["entity"]
        bakery_id = order.get("notes", {}).get("bakery_id")
        plan_name = order.get("notes", {}).get("plan_name")
        
        if bakery_id and plan_name:
            from .. import models
            from datetime import datetime
            from dateutil.relativedelta import relativedelta
            
            bakery = db.query(models.Bakery).filter(models.Bakery.id == bakery_id).first()
            if bakery:
                bakery.subscription_plan = plan_name
                bakery.subscription_status = "active"
                bakery.subscription_start_date = datetime.now()
                # If plan has 'annual' in the name (though currently we just use 'pro' for both, 
                # we should probably pass billing cycle in notes, but for now let's just add 1 month 
                # unless we see 'annual' in plan name).
                is_annual = 'annual' in plan_name.lower() or str(order.get('amount', 0)) == '480000' # 4800 INR in paise
                months_to_add = 12 if is_annual else 1
                bakery.subscription_end_date = datetime.now() + relativedelta(months=months_to_add)
                
                db.commit()
                print(f"Upgraded bakery {bakery_id} to {plan_name}. Expires: {bakery.subscription_end_date}")
                
    return {"status": "success"}
