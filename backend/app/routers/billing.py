from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/billing",
    tags=["billing"]
)

@router.post("/invoices/", response_model=schemas.InvoiceResponse)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Create Invoice record
    db_invoice = models.Invoice(
        invoice_number=invoice.invoice_number,
        party_id=invoice.party_id,
        party_name=invoice.party_name,
        party_phone=invoice.party_phone,
        subtotal=invoice.subtotal,
        tax_amount=invoice.tax_amount,
        discount_amount=invoice.discount_amount,
        total_amount=invoice.total_amount,
        status=invoice.status,
        payment_mode=invoice.payment_mode,
        bakery_id=current_user.bakery_id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # 1.5 Generate Razorpay Payment Link if configured
    if db_invoice.payment_mode == 'razorpay':
        bakery = db.query(models.BakeryProfile).filter(models.BakeryProfile.id == current_user.bakery_id).first()
        if bakery and bakery.razorpay_key_id and bakery.razorpay_key_secret:
            try:
                import razorpay
                client = razorpay.Client(auth=(bakery.razorpay_key_id, bakery.razorpay_key_secret))
                
                # Convert INR to paisa (multiply by 100)
                amount_in_paisa = int(db_invoice.total_amount * 100)
                
                payment_link_data = {
                    "amount": amount_in_paisa,
                    "currency": "INR",
                    "accept_partial": False,
                    "description": f"Invoice {db_invoice.invoice_number}",
                    "customer": {
                        "name": db_invoice.party_name,
                        "contact": db_invoice.party_phone or ""
                    },
                    "notify": {
                        "sms": True,
                        "email": False
                    },
                    "reminder_enable": True,
                    "notes": {
                        "invoice_id": str(db_invoice.id)
                    }
                }
                
                payment_link = client.payment_link.create(payment_link_data)
                db_invoice.payment_link_url = payment_link.get('short_url')
                db.commit()
                db.refresh(db_invoice)
            except Exception as e:
                print(f"Failed to generate Razorpay link: {e}")

    # 2. Add Items & Deduct Inventory
    for item in invoice.items:
        db_item = models.InvoiceItem(
            invoice_id=db_invoice.id,
            inventory_item_id=item.inventory_item_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_rate=item.tax_rate,
            total_price=item.total_price
        )
        db.add(db_item)
        
        # DEDUCT inventory if it's a tracked item
        if item.inventory_item_id:
            inventory_item = db.query(models.InventoryItem).filter(
                models.InventoryItem.id == item.inventory_item_id,
                models.InventoryItem.bakery_id == current_user.bakery_id
            ).first()
            if inventory_item:
                inventory_item.quantity -= item.quantity

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/invoices/", response_model=List[schemas.InvoiceResponse])
def get_invoices(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Invoice).filter(models.Invoice.bakery_id == current_user.bakery_id).all()
