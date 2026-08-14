from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    purchase_price = Column(Float, nullable=False)
    contains_allergens = Column(String, nullable=True) # e.g. "Nuts, Dairy"
    barcode = Column(String, nullable=True, index=True)
    low_stock_threshold = Column(Float, default=0.0)
    bakery_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True, index=True)
    inventory_item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    batch_number = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    yield_amount = Column(String, nullable=True) # e.g. "12 cupcakes"
    image_data = Column(String, nullable=True) # Base64 string for image < 1MB
    
    # Operational Costs
    prep_time_minutes = Column(Float, default=0.0)
    bake_time_minutes = Column(Float, default=0.0)
    use_custom_overheads = Column(Boolean, default=False)
    custom_labor_cost = Column(Float, default=0.0)
    custom_overhead_cost = Column(Float, default=0.0)

    bakery_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, nullable=False)
    inventory_item_id = Column(Integer, nullable=False)
    quantity_required = Column(Float, nullable=False)

class WasteLog(Base):
    __tablename__ = "waste_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    cost_value = Column(Float, nullable=False)
    reason = Column(String, nullable=True) # e.g. "Expired batter", "Dropped"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Party(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    party_type = Column(String, default="customer") # "customer" or "supplier"
    name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    gstin_or_tax_id = Column(String, nullable=True)
    is_b2b = Column(Boolean, default=False)
    bakery_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=False, index=True)
    party_id = Column(Integer, nullable=True) # Nullable for walk-in
    party_name = Column(String, nullable=False) # Snapshot for walk-in
    party_phone = Column(String, nullable=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    cgst_amount = Column(Float, nullable=False, default=0.0)
    sgst_amount = Column(Float, nullable=False, default=0.0)
    igst_amount = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="paid") # paid, unpaid, partial
    payment_mode = Column(String, nullable=True) # cash, upi, card, razorpay
    payment_link_url = Column(String, nullable=True) # Razorpay link
    bakery_id = Column(Integer, ForeignKey("bakeries.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, nullable=False, index=True)
    inventory_item_id = Column(Integer, nullable=True) # Nullable if custom item
    item_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    tax_rate = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False)

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String, nullable=True)
    party_id = Column(Integer, nullable=True)
    party_name = Column(String, nullable=False)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    cgst_amount = Column(Float, nullable=False, default=0.0)
    sgst_amount = Column(Float, nullable=False, default=0.0)
    igst_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="paid") # unpaid, paid
    payment_mode = Column(String, nullable=True)
    bakery_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, nullable=False, index=True)
    inventory_item_id = Column(Integer, nullable=False)
    item_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    tax_rate = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False)

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    estimated_amount = Column(Float, nullable=False)
    status = Column(String, default="draft") # draft, sent, accepted, rejected
    bakery_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bakery(Base):
    __tablename__ = "bakeries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    
    # 1. Core Business Identity & Regulatory Compliance
    country = Column(String, default='IN') # 'IN', 'US', 'GB'
    trading_name = Column(String, nullable=True)
    
    # India Specific
    gstin = Column(String, nullable=True)
    fssai_license_number = Column(String, nullable=True)
    msme_udyam_number = Column(String, nullable=True)
    pan_number = Column(String, nullable=True)
    
    # US Specific
    ein_number = Column(String, nullable=True)
    state_tax_id = Column(String, nullable=True)
    food_handler_license = Column(String, nullable=True)
    
    # UK Specific
    company_registration_number = Column(String, nullable=True)
    vat_number = Column(String, nullable=True)
    utr_number = Column(String, nullable=True)
    local_authority_registration = Column(String, nullable=True)
    
    # Common Address
    address = Column(String, nullable=True)
    pin_code = Column(String, nullable=True)
    godown_locations = Column(String, nullable=True) # Stored as JSON string or comma-separated

    # 2. Financial & Fintech Settings
    primary_upi_id = Column(String, nullable=True)
    payment_links = Column(String, nullable=True) # Stored as JSON string
    bank_account_details = Column(String, nullable=True) # Stored as JSON string
    razorpay_key_id = Column(String, nullable=True)
    razorpay_key_secret = Column(String, nullable=True)
    fiscal_year_start = Column(String, default='04-01')
    primary_tax_scheme = Column(String, default='composition')
    inventory_valuation_method = Column(String, default='FIFO')

    # 3. Kitchen Operations & Metric Intelligence
    default_kitchen_unit = Column(String, default='g')
    kitchen_capacity_orders_per_day = Column(Integer, nullable=True)
    standard_lead_time_hours = Column(Integer, default=24)
    low_stock_alert_toggle = Column(Boolean, default=True)
    fefo_expiry_window_hours = Column(Integer, default=48)

    # 4. Branding & UX Customization
    business_logo_url = Column(String, nullable=True)
    digital_signature_url = Column(String, nullable=True)
    invoice_footer_text = Column(String, nullable=True)
    brand_color_palette = Column(String, nullable=True)
    
    # 5. Operational Baselines
    base_hourly_labor_rate = Column(Float, default=0.0)
    energy_cost_per_hour = Column(Float, default=0.0)
    misc_overhead_percentage = Column(Float, default=5.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="admin") # admin, staff, delivery
    bakery_id = Column(Integer, nullable=False) # Foreign key simplified for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    display_id = Column(String, nullable=False) # e.g. ORD-001
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=True)
    items = Column(String, nullable=False)
    status = Column(String, default="new") # new, preparing, baking, ready, delivered
    source = Column(String, default="website") # website, whatsapp, instagram
    delivery_date = Column(DateTime, nullable=True)
    bakery_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
