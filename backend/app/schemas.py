from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    quantity: float
    unit: str
    purchase_price: float

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(InventoryItemBase):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    purchase_price: Optional[float] = None

class InventoryItemResponse(InventoryItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    total_amount: float
    is_b2b: bool = False
    gstin: Optional[str] = None

class InvoiceResponse(InvoiceCreate):
    id: int
    tax_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    customer_name: str
    estimated_amount: float

class QuotationResponse(QuotationCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
