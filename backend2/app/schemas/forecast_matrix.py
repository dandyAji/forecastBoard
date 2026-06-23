from datetime import datetime
from sqlmodel import SQLModel

class MatrixCreate(SQLModel):
    method_name: str
    mape: float
    mae: float
    mse: float
    rmse: float
    r_square: float
    headerId: str

class MatrixRead(SQLModel):
    id: str
    method_name: str
    mape: float
    mae: float
    mse: float
    rmse: float
    r_square: float
    headerId: str
    createdAt: datetime