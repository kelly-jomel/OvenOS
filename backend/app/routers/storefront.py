from fastapi import APIRouter, Depends
from ..auth import verify_token

router = APIRouter(prefix="/storefront", tags=["Storefront"])

@router.post("/request")
def request_custom_storefront(user: dict = Depends(verify_token)):
    bakery_id = user.get("bakery_id")
    email = user.get("email")
    
    # In production, this would trigger an SMTP email via SendGrid/SES.
    print(f"STOREFRONT REQUEST EMAIL TRIGGERED")
    print(f"To: kelly@jomel.in")
    print(f"Subject: New Custom Storefront Request - Rs 8000")
    print(f"Body: User {email} (Bakery ID: {bakery_id}) has requested a custom website.")
    
    return {"message": "Request sent successfully. Our team will contact you shortly!"}
