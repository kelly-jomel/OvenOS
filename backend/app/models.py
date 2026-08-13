from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WasteLog(Base):
    __tablename__ = "waste_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    cost_value = Column(Float, nullable=False)
    reason = Column(String, nullable=True) # e.g. "Expired batter", "Dropped"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=True)
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="pending") # pending, paid, cancelled
    is_b2b = Column(Boolean, default=False)
    gstin = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    estimated_amount = Column(Float, nullable=False)
    status = Column(String, default="draft") # draft, sent, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bakery(Base):
    __tablename__ = "bakeries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    bakery_id = Column(Integer, nullable=False) # Foreign key simplified for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    display_id = Column(String, nullable=False) # e.g. ORD-001
    customer_name = Column(String, nullable=False)
    items = Column(String, nullable=False)
    status = Column(String, default="new") # new, preparing, baking, ready, delivered
    source = Column(String, default="website") # website, whatsapp, instagram
    bakery_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
