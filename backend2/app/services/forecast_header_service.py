import numpy as np
import pandas as pd
from io import BytesIO
from typing import Optional
from sqlmodel import Session, select, or_, cast, String, delete, text
from fastapi import UploadFile
from app.models.forecast_header import ForecastHeader
from app.models.forecast_detail import ForecastDetail
from app.models.forecast_matrix import ForecastMatrix
from app.models.transaction import TransactionData
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


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


def interpolate_transaction_df(df: pd.DataFrame) -> pd.DataFrame:
    """Interpolasi qty=0/kosong, identik dengan _prepare_series di forecasting_service.py.
    Dipakai sebelum insert ke TransactionData supaya data actual yang tersimpan
    sudah dalam bentuk yang sama dengan yang dipakai SARIMA/XGBoost."""
    data = df.copy()
    data = data.set_index("date").sort_index()

    data["qty"] = data["qty"].replace(0, np.nan)
    data["qty"] = data["qty"].interpolate(method="time")
    data["qty"] = data["qty"].bfill()

    data = data.reset_index()
    return data


def create_forecast_with_transactions(
    session: Session,
    title: str,
    description: Optional[str],
    df: pd.DataFrame,
    user_id: str,
) -> ForecastHeader:
    df_interpolated = interpolate_transaction_df(df)

    header = ForecastHeader(title=title, description=description, userId=user_id)
    session.add(header)
    session.flush()

    transactions = [
        TransactionData(
            date=row["date"].date(),
            qty=int(round(row["qty"])),
            userId=user_id,
            HeaderId=header.id,
        )
        for _, row in df_interpolated.iterrows()
    ]
    session.add_all(transactions)
    session.commit()
    session.refresh(header)
    return header


def get_forecast_list_service(session: Session, page: int, limit: int, search: str, user_id: str):
    query = select(ForecastHeader).where(ForecastHeader.userId == user_id)

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


def get_one_forecast_service(session: Session, forecast_id: str, user_id: str):
    query = select(ForecastHeader).where(
        ForecastHeader.id == forecast_id, ForecastHeader.userId == user_id
    )
    return session.exec(query).first()


def get_forecast_service(
    session: Session,
    forecast_id: str,
    forecast_name: str,
    user_id: str,
    forecast_type: Optional[str] = None,
):
    query = (
        select(ForecastDetail)
        .join(ForecastHeader, ForecastHeader.id == ForecastDetail.headerId)
        .where(
            ForecastDetail.headerId == forecast_id,
            ForecastDetail.method_name == forecast_name,
            ForecastHeader.userId == user_id,
        )
    )
    if forecast_type:
        query = query.where(ForecastDetail.forecast_type == forecast_type)
    return session.exec(query).all()


def get_forecast_matrix_service(session: Session, forecast_id: str, forecast_name: str, user_id: str):
    query = (
        select(ForecastMatrix)
        .join(ForecastHeader, ForecastHeader.id == ForecastMatrix.headerId)
        .where(
            ForecastMatrix.headerId == forecast_id,
            ForecastMatrix.method_name == forecast_name,
            ForecastHeader.userId == user_id,
        )
    )
    return session.exec(query).all()


def get_data_actual_service(session: Session, forecast_id: str, user_id: str):
    query = (
        select(TransactionData)
        .join(ForecastHeader, ForecastHeader.id == TransactionData.HeaderId)
        .where(
            TransactionData.HeaderId == forecast_id,
            ForecastHeader.userId == user_id,
        )
    )
    return session.exec(query).all()

def delete_forecast_service(
    session: Session,
    forecast_id: str,
    user_id: str,
):
    """Delete forecast dan semua data terkait (transactions, detail, matrix)"""
    try:
        # Validasi kepemilikan forecast
        header = session.exec(
            select(ForecastHeader).where(
                ForecastHeader.id == forecast_id,
                ForecastHeader.userId == user_id,
            )
        ).first()

        if not header:
            return {
                "status": "error",
                "message": "Forecast not found or unauthorized",
                "code": 404,
            }

        title = header.title

        # Hapus semua child records dulu (FK constraint)
        session.exec(
            delete(TransactionData).where(TransactionData.HeaderId == forecast_id)
        )
        session.exec(
            delete(ForecastDetail).where(ForecastDetail.headerId == forecast_id)
        )
        session.exec(
            delete(ForecastMatrix).where(ForecastMatrix.headerId == forecast_id)
        )
        session.exec(
            delete(ForecastHeader).where(ForecastHeader.id == forecast_id)
        )

        session.commit()
        logger.info(f"Successfully deleted forecast {forecast_id}")

        return {
            "status": "success",
            "message": "Success delete data",
            "code": 200,
            "data": {
                "id": forecast_id,
                "title": title,
                "deleted_at": datetime.now().isoformat(),
            },
        }

    except Exception as e:
        logger.error(f"Failed to delete forecast: {str(e)}", exc_info=True)
        session.rollback()
        return {
            "status": "error",
            "message": f"Gagal menghapus forecast: {str(e)}",
            "code": 400,
        }