import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class ForecastHeader(SQLModel, table=True):
    __tablename__ = "forecast_header"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    title: str
    description: Optional[str] = None
    still_process: bool = Field(default=False)
    userId: str = Field(foreign_key="user.id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="headers")
    transactions: List["TransactionData"] = Relationship(back_populates="header")
    details: List["ForecastDetail"] = Relationship(back_populates="header")
    matrices: List["ForecastMatrix"] = Relationship(back_populates="header")