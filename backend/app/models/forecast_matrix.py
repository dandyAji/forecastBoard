import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class ForecastMatrix(SQLModel, table=True):
    __tablename__ = "forecast_matrix"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    method_name: str
    mape: float
    mae: float
    mse: float
    rmse: float
    r_square: float
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    headerId: str = Field(foreign_key="forecast_header.id")

    header: Optional["ForecastHeader"] = Relationship(back_populates="matrices")