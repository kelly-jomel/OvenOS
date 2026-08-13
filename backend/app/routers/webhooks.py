from fastapi import APIRouter, Request, Response, status, HTTPException
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
