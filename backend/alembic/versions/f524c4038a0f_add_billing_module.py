"""add_billing_module

Revision ID: f524c4038a0f
Revises: e413b3929f9f
Create Date: 2026-08-13 19:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f524c4038a0f'
down_revision: Union[str, Sequence[str], None] = 'e413b3929f9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create customers table
    op.create_table('customers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('address', sa.String(), nullable=True),
    sa.Column('gstin_or_tax_id', sa.String(), nullable=True),
    sa.Column('is_b2b', sa.Boolean(), nullable=True, default=False),
    sa.Column('bakery_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_customers_id'), 'customers', ['id'], unique=False)
    op.create_index(op.f('ix_customers_name'), 'customers', ['name'], unique=False)
    op.create_index(op.f('ix_customers_bakery_id'), 'customers', ['bakery_id'], unique=False)

    # Recreate invoices table
    op.drop_table('invoices')
    op.create_table('invoices',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('invoice_number', sa.String(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=True),
    sa.Column('customer_name', sa.String(), nullable=False),
    sa.Column('customer_phone', sa.String(), nullable=True),
    sa.Column('subtotal', sa.Float(), nullable=False),
    sa.Column('tax_amount', sa.Float(), nullable=False),
    sa.Column('discount_amount', sa.Float(), nullable=False),
    sa.Column('total_amount', sa.Float(), nullable=False),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('payment_mode', sa.String(), nullable=True),
    sa.Column('bakery_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoices_id'), 'invoices', ['id'], unique=False)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=False)
    op.create_index(op.f('ix_invoices_bakery_id'), 'invoices', ['bakery_id'], unique=False)

    # Create invoice_items table
    op.create_table('invoice_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('invoice_id', sa.Integer(), nullable=False),
    sa.Column('inventory_item_id', sa.Integer(), nullable=True),
    sa.Column('item_name', sa.String(), nullable=False),
    sa.Column('quantity', sa.Float(), nullable=False),
    sa.Column('unit_price', sa.Float(), nullable=False),
    sa.Column('tax_rate', sa.Float(), nullable=False),
    sa.Column('total_price', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoice_items_id'), 'invoice_items', ['id'], unique=False)
    op.create_index(op.f('ix_invoice_items_invoice_id'), 'invoice_items', ['invoice_id'], unique=False)

    # Add bakery_id to quotations
    op.add_column('quotations', sa.Column('bakery_id', sa.Integer(), nullable=False, server_default='1'))
    op.create_index(op.f('ix_quotations_bakery_id'), 'quotations', ['bakery_id'], unique=False)


def downgrade() -> None:
    pass
