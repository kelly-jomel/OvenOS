"""add_country_localization

Revision ID: e413b3929f9f
Revises: d302a2818f9e
Create Date: 2026-08-13 18:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e413b3929f9f'
down_revision: Union[str, Sequence[str], None] = 'd302a2818f9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Base
    op.add_column('bakeries', sa.Column('country', sa.String(), server_default='IN', nullable=True))
    
    # US
    op.add_column('bakeries', sa.Column('ein_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('state_tax_id', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('food_handler_license', sa.String(), nullable=True))
    
    # UK
    op.add_column('bakeries', sa.Column('company_registration_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('vat_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('utr_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('local_authority_registration', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('bakeries', 'local_authority_registration')
    op.drop_column('bakeries', 'utr_number')
    op.drop_column('bakeries', 'vat_number')
    op.drop_column('bakeries', 'company_registration_number')
    op.drop_column('bakeries', 'food_handler_license')
    op.drop_column('bakeries', 'state_tax_id')
    op.drop_column('bakeries', 'ein_number')
    op.drop_column('bakeries', 'country')
