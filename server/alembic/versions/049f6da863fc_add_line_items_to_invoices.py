"""add line items to invoices

Revision ID: 049f6da863fc
Revises: d375be3e9a1b
Create Date: 2026-09-27 11:50:11.713220

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '049f6da863fc'
down_revision: Union[str, Sequence[str], None] = 'd375be3e9a1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "invoices",
        sa.Column(
            "line_items",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("invoices", "line_items")
