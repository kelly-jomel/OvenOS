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
    # Inventory items - wipe to add non-nullable bakery_id safely
    op.execute("DELETE FROM inventory_items")
    op.add_column('inventory_items', sa.Column('bakery_id', sa.Integer(), nullable=False))
    
    # Recipes
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


def downgrade() -> None:
    op.drop_table('recipe_ingredients')
    op.drop_table('recipes')
    op.drop_column('inventory_items', 'bakery_id')
