"""add_recipes_and_inventory_bakery_id

Revision ID: fa6eac2b2b90
Revises: c10de82b4f41
Create Date: 2026-08-13 17:57:00.228628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa6eac2b2b90'
down_revision: Union[str, Sequence[str], None] = 'c10de82b4f41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Inventory items - table didn't exist before, create it now
    op.create_table(
        'inventory_items',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), index=True, nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(), nullable=False),
        sa.Column('purchase_price', sa.Float(), nullable=False),
        sa.Column('contains_allergens', sa.String(), nullable=True),
        sa.Column('bakery_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
    )
    op.create_table(
        'recipes',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), index=True, nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('yield_amount', sa.String(), nullable=True),
        sa.Column('bakery_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
    )
    
    # Recipe Ingredients
    op.create_table(
        'recipe_ingredients',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('inventory_item_id', sa.Integer(), nullable=False),
        sa.Column('quantity_required', sa.Float(), nullable=False),
    )
    
    # Missing models from initial schema
    op.create_table(
        'waste_logs',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('item_name', sa.String(), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('cost_value', sa.Float(), nullable=False),
        sa.Column('reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('customer_phone', sa.String(), nullable=True),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('tax_amount', sa.Float(), nullable=False, default=0.0),
        sa.Column('status', sa.String(), default="pending"),
        sa.Column('is_b2b', sa.Boolean(), default=False),
        sa.Column('gstin', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_table(
        'quotations',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('estimated_amount', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), default="draft"),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('quotations')
    op.drop_table('invoices')
    op.drop_table('waste_logs')
    op.drop_table('recipe_ingredients')
    op.drop_table('recipes')
    op.drop_table('inventory_items')
