from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..services.tax import GSTStrategy, TaxContext
from ..services.payments import PaymentGatewayPlaceholder

router = APIRouter(
    prefix="/billing",
    tags=["billing"]
)

# Customers

@router.post("/customers", response_model=schemas.CustomerResponse)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_customer = models.Customer(**customer.model_dump(), bakery_id=current_user.bakery_id)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/customers", response_model=List[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Customer).filter(models.Customer.bakery_id == current_user.bakery_id).all()

# Invoices

@router.post("/invoices/", response_model=schemas.InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Calculate tax if applicable (legacy hook for global tax logic if needed, but we'll use schema taxes)
    tax_amount = invoice.tax_amount
    if invoice.tax_amount == 0 and invoice.subtotal > 0:
        try:
            tax_strategy = GSTStrategy(is_inter_state=False)
            context = TaxContext(tax_strategy)
            tax_result = context.calculate(invoice.subtotal)
            tax_amount = tax_result["total_tax"]
        except Exception:
            pass

    # Create the main invoice record
    db_invoice = models.Invoice(
        invoice_number=invoice.invoice_number,
        customer_id=invoice.customer_id,
        customer_name=invoice.customer_name,
        customer_phone=invoice.customer_phone,
        subtotal=invoice.subtotal,
        tax_amount=tax_amount,
        discount_amount=invoice.discount_amount,
        total_amount=invoice.total_amount,
        status=invoice.status,
        payment_mode=invoice.payment_mode,
        bakery_id=current_user.bakery_id
    )
    db.add(db_invoice)
    db.flush() # Flush to get the invoice ID for items

    # Create invoice items and deduct stock
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

        # Deduct from inventory if it's an inventory item
        if item.inventory_item_id:
            inv_item = db.query(models.InventoryItem).filter(
                models.InventoryItem.id == item.inventory_item_id,
                models.InventoryItem.bakery_id == current_user.bakery_id
            ).first()
            if inv_item:
                if inv_item.quantity < item.quantity:
                    raise HTTPException(status_code=400, detail=f"Not enough stock for {item.item_name}")
                inv_item.quantity -= item.quantity

    db.commit()
    db.refresh(db_invoice)
    
    # Reload items for response
    db_invoice.items = db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == db_invoice.id).all()
    
    return db_invoice

@router.get("/invoices/", response_model=List[schemas.InvoiceResponse])
def get_invoices(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    invoices = db.query(models.Invoice).filter(models.Invoice.bakery_id == current_user.bakery_id).order_by(models.Invoice.created_at.desc()).all()
    for inv in invoices:
        inv.items = db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == inv.id).all()
    return invoices

@router.get("/invoices/{invoice_id}/payment-link")
def get_payment_link(invoice_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.bakery_id == current_user.bakery_id
    ).first()
    
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        total_payable = db_invoice.total_amount
        link = PaymentGatewayPlaceholder.generate_upi_payment_link(
            amount=total_payable,
            order_id=f"INV-{invoice_id}",
            customer_phone=db_invoice.customer_phone or ""
        )
        return {"payment_link": link}
    except Exception:
        return {"payment_link": f"upi://pay?pa=merchant@upi&pn=Bakery&am={db_invoice.total_amount}"}

@router.post("/quotations/", response_model=schemas.QuotationResponse, status_code=status.HTTP_201_CREATED)
def create_quotation(quotation: schemas.QuotationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_quote = models.Quotation(**quotation.model_dump(), bakery_id=current_user.bakery_id)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote
