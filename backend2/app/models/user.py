import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class User(SQLModel, table=True):
    __tablename__ = "user"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    name: str
    email: str = Field(unique=True)
    password: str
    role: RoleEnum
    isDisabled: bool = Field(default=False)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    headers: List["ForecastHeader"] = Relationship(back_populates="user")
    transactions: List["TransactionData"] = Relationship(back_populates="user")