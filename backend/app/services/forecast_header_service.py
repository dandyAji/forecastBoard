import pandas as pd
from io import BytesIO
from typing import Optional
from sqlmodel import Session, select, or_, cast, String
from fastapi import UploadFile
from app.models.forecast_header import ForecastHeader
from app.models.forecast_detail import ForecastDetail
from app.models.forecast_matrix import ForecastMatrix
from app.models.transaction import TransactionData

DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001"

def parse_transaction_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    if filename.lower().endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
    else:
        df = pd.read_excel(BytesIO(file_bytes))

    df.columns = [c.strip().lower() for c in df.columns]
    if "date" not in df.columns or "pemakaian" not in df.columns:
        raise ValueError("File harus punya kolom 'Date' dan 'Pemakaian'")

    df["date"] = pd.to_datetime(df["date"], format="%d-%m-%Y", errors="coerce")
    if df["date"].isna().any():
        raise ValueError("Ada baris dengan format tanggal tidak valid")

    df["qty"] = pd.to_numeric(df["pemakaian"], errors="coerce")
    if df["qty"].isna().any():
        raise ValueError("Ada baris dengan qty tidak valid")

    return df[["date", "qty"]]

def create_forecast_with_transactions(
    session: Session, title: str, description: Optional[str], df: pd.DataFrame
) -> ForecastHeader:
    header = ForecastHeader(title=title, description=description, userId=DUMMY_USER_ID)
    session.add(header)
    session.flush()

    transactions = [
        TransactionData(
            date=row["date"].date(),
            qty=int(row["qty"]),
            userId=DUMMY_USER_ID,
            HeaderId=header.id,
        )
        for _, row in df.iterrows()
    ]
    session.add_all(transactions)
    session.commit()
    session.refresh(header)
    return header

# function to get all data forecast list
def get_forecast_list_service(session: Session, page: int, limit: int, search: str):
    query = select(ForecastHeader)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                ForecastHeader.title.ilike(search_term),
                ForecastHeader.description.ilike(search_term),
                cast(ForecastHeader.still_process, String).ilike(search_term),
                cast(ForecastHeader.createdAt, String).ilike(search_term),
            )
        )

    query = query.order_by(ForecastHeader.createdAt.desc())
    query = query.offset((page - 1) * limit).limit(limit)

    return session.exec(query).all()

def get_forecast_service(session: Session, forecast_id: str, forecast_name: str):
    query = select(ForecastDetail)
    query = query.where(ForecastDetail.headerId == forecast_id, ForecastDetail.method_name == forecast_name)
    return session.exec(query).all()

def get_forecast_matrix_service(session, forecast_id: str,  forecast_name: str):
    query = select(ForecastMatrix)
    query = query.where(ForecastMatrix.headerId == forecast_id, ForecastMatrix.method_name == forecast_name)

    return session.exec(query).all()

def get_data_actual_service(session: Session, forecast_id: str):
    query = select(TransactionData)
    query = query.where(TransactionData.HeaderId == forecast_id)
    return session.exec(query).all()