import uuid
from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class TransactionData(SQLModel, table=True):
    __tablename__ = "Transaction_data"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    date: date
    qty: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    userId: str = Field(foreign_key="user.id")
    HeaderId: Optional[str] = Field(default=None, foreign_key="forecast_header.id")

    user: Optional["User"] = Relationship(back_populates="transactions")
    header: Optional["ForecastHeader"] = Relationship(back_populates="transactions")