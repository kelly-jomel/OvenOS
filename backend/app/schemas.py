from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str
    quantity: float
    unit: str
    purchase_price: float
    contains_allergens: Optional[str] = None

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

# User & Bakery Schemas
class UserCreate(BaseModel):
    email: str
    bakery_name: str
    firebase_uid: str

class UserResponse(BaseModel):
    id: int
    email: str
    bakery_id: int
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    customer_name: str
    items: str
    source: str = "website"

class OrderUpdate(BaseModel):
    status: str

class OrderResponse(BaseModel):
    id: int
    display_id: str
    customer_name: str
    items: str
    status: str
    source: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Recipe Schemas
class RecipeIngredientBase(BaseModel):
    inventory_item_id: int
    quantity_required: float

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
