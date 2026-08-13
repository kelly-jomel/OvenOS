"""Add ERP Parties and Purchases

Revision ID: f923b7158a1f
Revises: f524c4038a0f
Create Date: 2026-08-13 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f923b7158a1f'
down_revision = 'f524c4038a0f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename customers table to parties
    op.rename_table('customers', 'parties')
    # Add party_type column to parties table
    op.add_column('parties', sa.Column('party_type', sa.String(), server_default='customer', nullable=True))
    
    # Rename customer fields in invoices to party fields
    op.alter_column('invoices', 'customer_id', new_column_name='party_id')
    op.alter_column('invoices', 'customer_name', new_column_name='party_name')
    op.alter_column('invoices', 'customer_phone', new_column_name='party_phone')

    # Create purchases table
    op.create_table('purchases',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('bill_number', sa.String(), nullable=True),
    sa.Column('party_id', sa.Integer(), nullable=True),
    sa.Column('party_name', sa.String(), nullable=False),
    sa.Column('subtotal', sa.Float(), nullable=False, server_default='0.0'),
    sa.Column('tax_amount', sa.Float(), nullable=False, server_default='0.0'),
    sa.Column('total_amount', sa.Float(), nullable=False, server_default='0.0'),
    sa.Column('status', sa.String(), nullable=True, server_default='paid'),
    sa.Column('payment_mode', sa.String(), nullable=True),
    sa.Column('bakery_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchases_id'), 'purchases', ['id'], unique=False)
    op.create_index(op.f('ix_purchases_bakery_id'), 'purchases', ['bakery_id'], unique=False)

    # Create purchase_items table
    op.create_table('purchase_items',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('purchase_id', sa.Integer(), nullable=False),
    sa.Column('inventory_item_id', sa.Integer(), nullable=False),
    sa.Column('item_name', sa.String(), nullable=False),
    sa.Column('quantity', sa.Float(), nullable=False),
    sa.Column('unit_price', sa.Float(), nullable=False),
    sa.Column('tax_rate', sa.Float(), nullable=False, server_default='0.0'),
    sa.Column('total_price', sa.Float(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchase_items_id'), 'purchase_items', ['id'], unique=False)
    op.create_index(op.f('ix_purchase_items_purchase_id'), 'purchase_items', ['purchase_id'], unique=False)


def downgrade() -> None:
    # Reverse purchase_items and purchases tables
    op.drop_index(op.f('ix_purchase_items_purchase_id'), table_name='purchase_items')
    op.drop_index(op.f('ix_purchase_items_id'), table_name='purchase_items')
    op.drop_table('purchase_items')

    op.drop_index(op.f('ix_purchases_bakery_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_id'), table_name='purchases')
    op.drop_table('purchases')

    # Reverse invoices renames
    op.alter_column('invoices', 'party_phone', new_column_name='customer_phone')
    op.alter_column('invoices', 'party_name', new_column_name='customer_name')
    op.alter_column('invoices', 'party_id', new_column_name='customer_id')

    # Reverse parties back to customers
    op.drop_column('parties', 'party_type')
    op.rename_table('parties', 'customers')
