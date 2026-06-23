import uuid
from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class ForecastDetail(SQLModel, table=True):
    __tablename__ = "forecast_detail"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    method_name: str
    date: date
    qty: int
    headerId: str = Field(foreign_key="forecast_header.id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    header: Optional["ForecastHeader"] = Relationship(back_populates="details")