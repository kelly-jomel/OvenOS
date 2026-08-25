from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .. import models, database
import firebase_admin
from firebase_admin import firestore
import datetime
import smtplib
from email.mime.text import MIMEText
import os

router = APIRouter(
    prefix="/cron",
    tags=["Cron Jobs"]
)

# A simple password or token to prevent unauthorized execution
CRON_SECRET = os.getenv("CRON_SECRET", "my-secure-cron-secret")

def send_email_notification(to_email: str, subject: str, body: str):
    # In a real app, use Resend, SendGrid, or SMTP here.
    # We will log it and optionally send if SMTP is configured.
    print(f"--- EMAIL NOTIFICATION ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print(f"--------------------------")
    
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if smtp_server and smtp_user and smtp_pass:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to_email
        
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            print("Email sent successfully.")
        except Exception as e:
            print(f"Failed to send email: {e}")

@router.post("/special-dates")
def check_special_dates(
    authorization: str = Header(None),
    db: Session = Depends(database.get_db)
):
    if authorization != f"Bearer {CRON_SECRET}":
        raise HTTPException(status_code=401, detail="Unauthorized cron request")

    db_client = firestore.client()
    
    # We want to find dates exactly 7 days from now
    target_date = datetime.date.today() + datetime.timedelta(days=7)
    
    # Firestore doesn't easily let us query by "month and day" across all years,
    # so we'll fetch all clients (or filter locally) 
    # For a large app, you'd index this differently, but here we can iterate.
    clients_ref = db_client.collection("clients")
    docs = clients_ref.stream()
    
    notifications_sent = 0
    
    for doc in docs:
        client = doc.to_dict()
        special_dates = client.get("specialDates", [])
        bakery_id = client.get("bakery_id")
        
        if not special_dates or not bakery_id:
            continue
            
        for sd in special_dates:
            date_str = sd.get("date")
            if not date_str:
                continue
                
            # Date can be "DD/MM" or "YYYY-MM-DD" or similar.
            # We'll try to parse it.
            matches_target = False
            
            # Simple DD/MM format
            if "/" in date_str:
                parts = date_str.split("/")
                if len(parts) >= 2:
                    try:
                        day = int(parts[0])
                        month = int(parts[1])
                        if day == target_date.day and month == target_date.month:
                            matches_target = True
                    except:
                        pass
            # Standard YYYY-MM-DD
            elif "-" in date_str:
                parts = date_str.split("-")
                if len(parts) == 3:
                    try:
                        month = int(parts[1])
                        day = int(parts[2])
                        if day == target_date.day and month == target_date.month:
                            matches_target = True
                    except:
                        pass
                        
            if matches_target:
                # Find the bakery email/phone to notify
                bakery = db.query(models.Bakery).filter(models.Bakery.id == int(bakery_id)).first()
                if not bakery:
                    continue
                    
                # Find user for email
                user = db.query(models.User).filter(models.User.bakery_id == bakery.id).first()
                if not user:
                    continue
                
                bakery_email = user.email
                customer_name = client.get("displayName") or f"{client.get('firstName', '')} {client.get('lastName', '')}"
                
                subject = f"Upcoming {sd.get('occasion')} for {customer_name}"
                body = f"Hello {bakery.name},\n\nJust a reminder that your customer {customer_name} has a special event ({sd.get('occasion')} - {sd.get('name', '')}) coming up in exactly one week on {target_date.strftime('%B %d')}!\n\nThis is a great time to reach out and offer them a special cake or pastry.\n\nPhone: {client.get('mobilePhone', 'N/A')}\nEmail: {client.get('email', 'N/A')}\n\n- OvenOS Automated Reminder"
                
                send_email_notification(bakery_email, subject, body)
                notifications_sent += 1

    return {"status": "success", "notifications_sent": notifications_sent}
