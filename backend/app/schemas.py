from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    quantity: float
    unit: str
    purchase_price: float
    contains_allergens: Optional[str] = None
    barcode: Optional[str] = None
    low_stock_threshold: float = 0.0

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(InventoryItemBase):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    purchase_price: Optional[float] = None
    barcode: Optional[str] = None
    low_stock_threshold: Optional[float] = None

class InventoryItemResponse(InventoryItemBase):
    id: int
    bakery_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InventoryBatchBase(BaseModel):
    inventory_item_id: int
    batch_number: str
    quantity: float
    expiry_date: datetime

class InventoryBatchCreate(InventoryBatchBase):
    pass

class InventoryBatchResponse(InventoryBatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Party Schemas
class PartyBase(BaseModel):
    name: str
    party_type: str = "customer" # "customer" or "supplier"
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gstin_or_tax_id: Optional[str] = None
    is_b2b: bool = False

class PartyCreate(PartyBase):
    pass

class PartyResponse(PartyBase):
    id: int
    bakery_id: int
    created_at: datetime
    total_orders: int = 0
    balance: float = 0.0

    class Config:
        from_attributes = True

# Invoice Item Schemas
class InvoiceItemBase(BaseModel):
    inventory_item_id: Optional[int] = None
    item_name: str
    quantity: float
    unit_price: float
    tax_rate: float = 0.0
    total_price: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceBase(BaseModel):
    invoice_number: str
    party_id: Optional[int] = None
    party_name: str
    party_phone: Optional[str] = None
    subtotal: float
    tax_amount: float = 0.0
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    status: str = "paid"
    payment_mode: Optional[str] = None
    payment_link_url: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate]

class InvoiceResponse(InvoiceBase):
    id: int
    bakery_id: int
    created_at: datetime
    items: list[InvoiceItemResponse] = []

    class Config:
        from_attributes = True

# Purchase Item Schemas
class PurchaseItemBase(BaseModel):
    inventory_item_id: int
    item_name: str
    quantity: float
    unit_price: float
    tax_rate: float = 0.0
    total_price: float

class PurchaseItemCreate(PurchaseItemBase):
    pass

class PurchaseItemResponse(PurchaseItemBase):
    id: int
    purchase_id: int

    class Config:
        from_attributes = True

# Purchase Schemas
class PurchaseBase(BaseModel):
    bill_number: Optional[str] = None
    party_id: Optional[int] = None
    party_name: str
    subtotal: float
    tax_amount: float = 0.0
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    total_amount: float
    status: str = "paid"
    payment_mode: Optional[str] = None

class PurchaseCreate(PurchaseBase):
    items: list[PurchaseItemCreate]

class PurchaseResponse(PurchaseBase):
    id: int
    bakery_id: int
    created_at: datetime
    items: list[PurchaseItemResponse] = []

    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    customer_name: str
    estimated_amount: float

class QuotationResponse(QuotationCreate):
    id: int
    status: str
    bakery_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# User & Bakery Schemas
class UserCreate(BaseModel):
    email: str
    bakery_name: str
    firebase_uid: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    bakery_id: int
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    items: str
    source: str = "website"
    delivery_date: Optional[datetime] = None

class OrderUpdate(BaseModel):
    status: str
    delivery_date: Optional[datetime] = None

class OrderResponse(BaseModel):
    id: int
    display_id: str
    customer_name: str
    customer_phone: Optional[str]
    items: str
    status: str
    source: str
    delivery_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Recipe Schemas
class RecipeIngredientBase(BaseModel):
    inventory_item_id: int
    quantity_required: float

class BakeryBase(BaseModel):
    name: str
    country: Optional[str] = "IN"
    trading_name: Optional[str] = None
    gstin: Optional[str] = None
    fssai_license_number: Optional[str] = None
    msme_udyam_number: Optional[str] = None
    pan_number: Optional[str] = None
    ein_number: Optional[str] = None
    state_tax_id: Optional[str] = None
    food_handler_license: Optional[str] = None
    company_registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    utr_number: Optional[str] = None
    local_authority_registration: Optional[str] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None
    godown_locations: Optional[str] = None
    primary_upi_id: Optional[str] = None
    payment_links: Optional[str] = None
    bank_account_details: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    fiscal_year_start: Optional[str] = "04-01"
    primary_tax_scheme: Optional[str] = "composition"
    inventory_valuation_method: Optional[str] = "FIFO"
    default_kitchen_unit: Optional[str] = "g"
    kitchen_capacity_orders_per_day: Optional[int] = None
    standard_lead_time_hours: Optional[int] = 24
    low_stock_alert_toggle: Optional[bool] = True
    fefo_expiry_window_hours: Optional[int] = 48
    business_logo_url: Optional[str] = None
    digital_signature_url: Optional[str] = None
    invoice_footer_text: Optional[str] = None
    brand_color_palette: Optional[str] = None
    
    base_hourly_labor_rate: Optional[float] = 0.0
    energy_cost_per_hour: Optional[float] = 0.0
    misc_overhead_percentage: Optional[float] = 5.0

class BakeryCreate(BakeryBase):
    pass

class BakeryUpdate(BaseModel):
    trading_name: Optional[str] = None
    country: Optional[str] = None
    gstin: Optional[str] = None
    fssai_license_number: Optional[str] = None
    msme_udyam_number: Optional[str] = None
    pan_number: Optional[str] = None
    ein_number: Optional[str] = None
    state_tax_id: Optional[str] = None
    food_handler_license: Optional[str] = None
    company_registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    utr_number: Optional[str] = None
    local_authority_registration: Optional[str] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None
    godown_locations: Optional[str] = None
    primary_upi_id: Optional[str] = None
    payment_links: Optional[str] = None
    bank_account_details: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    fiscal_year_start: Optional[str] = None
    primary_tax_scheme: Optional[str] = None
    inventory_valuation_method: Optional[str] = None
    default_kitchen_unit: Optional[str] = None
    kitchen_capacity_orders_per_day: Optional[int] = None
    standard_lead_time_hours: Optional[int] = None
    low_stock_alert_toggle: Optional[bool] = None
    fefo_expiry_window_hours: Optional[int] = None
    business_logo_url: Optional[str] = None
    digital_signature_url: Optional[str] = None
    invoice_footer_text: Optional[str] = None
    brand_color_palette: Optional[str] = None

    base_hourly_labor_rate: Optional[float] = None
    energy_cost_per_hour: Optional[float] = None
    misc_overhead_percentage: Optional[float] = None

class BakeryResponse(BakeryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredientResponse(RecipeIngredientBase):
    id: int
    recipe_id: int

    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    name: str
    description: Optional[str] = None
    yield_amount: Optional[str] = None
    image_data: Optional[str] = None
    
    prep_time_minutes: Optional[float] = 0.0
    bake_time_minutes: Optional[float] = 0.0
    use_custom_overheads: Optional[bool] = False
    custom_labor_cost: Optional[float] = 0.0
    custom_overhead_cost: Optional[float] = 0.0
    selling_price: Optional[float] = 0.0

class RecipeCreate(RecipeBase):
    ingredients: list[RecipeIngredientCreate] = []

class RecipeResponse(RecipeBase):
    id: int
    bakery_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: list[RecipeIngredientResponse] = []

    class Config:
        from_attributes = True
