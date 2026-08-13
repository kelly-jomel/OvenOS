from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import verify_token
from ..services.tax import GSTStrategy, TaxContext
from ..services.payments import PaymentGatewayPlaceholder

router = APIRouter(
    prefix="/billing",
    tags=["billing"],
    dependencies=[Depends(verify_token)]
)

@router.post("/invoices/", response_model=schemas.InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    # Calculate tax if applicable
    tax_amount = 0.0
    if invoice.is_b2b or invoice.total_amount > 0:
        # Assuming intra-state for simplicity in this example
        tax_strategy = GSTStrategy(is_inter_state=False)
        context = TaxContext(tax_strategy)
        tax_result = context.calculate(invoice.total_amount)
        tax_amount = tax_result["total_tax"]
        
    db_invoice = models.Invoice(
        **invoice.model_dump(),
        tax_amount=tax_amount
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/invoices/{invoice_id}/payment-link")
def get_payment_link(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    total_payable = db_invoice.total_amount + db_invoice.tax_amount
    link = PaymentGatewayPlaceholder.generate_upi_payment_link(
        amount=total_payable,
        order_id=f"INV-{invoice_id}",
        customer_phone=db_invoice.customer_phone or ""
    )
    
    return {"payment_link": link}

@router.post("/quotations/", response_model=schemas.QuotationResponse, status_code=status.HTTP_201_CREATED)
def create_quotation(quotation: schemas.QuotationCreate, db: Session = Depends(get_db)):
    db_quote = models.Quotation(**quotation.model_dump())
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote
