from fastapi import APIRouter, Depends, UploadFile, Form, File, HTTPException, BackgroundTasks
from typing import Optional
from sqlmodel import Session, Session, select, or_, cast, String
from app.db.session import get_session
from app.services.forecast_header_service import (
    get_data_actual_service,
    parse_transaction_file,
    create_forecast_with_transactions,
)
from app.services.forecasting_service import run_all_forecasts
from app.models.forecast_header import ForecastHeader
from app.services.forecast_header_service import get_forecast_list_service, get_forecast_service, get_forecast_matrix_service


router = APIRouter(prefix="/api/v1", tags=["forecast"])

# 3. Endpoint ambil semua data forecast
@router.get("/forecast")
def get_forecast_list(
    page: int = 1,
    limit: int = 5,
    search: str = "",
    session: Session = Depends(get_session),
):
    results = get_forecast_list_service(session, page, limit, search)
    return {
        "message": "Success get data",
        "data": results,
    }

# 4. Endpoint Forecast - XGBoost
@router.get("/forecast/xgboost/{forecast_id}")
def get_xgboost_forecast(forecast_id: str, session: Session = Depends(get_session),):
    forecast_record = get_forecast_service(session, forecast_id, 'XGBOOST')
    forecast_matrix = get_forecast_matrix_service(session, forecast_id, 'XGBOOST')
    return {
        "message": "Success get data",
        "data": {
            "model":"XGBoost",
            "matrix":forecast_matrix,
            "record":forecast_record
        }
    }

# 5. Endpoint Forecast - SARIMA
@router.get("/forecast/sarima/{forecast_id}")
def get_sarima_forecast(forecast_id: str, session: Session = Depends(get_session),):
    forecast_record = get_forecast_service(session, forecast_id, 'SARIMA')
    forecast_matrix = get_forecast_matrix_service(session, forecast_id, 'SARIMA')
    return {
        "message": "Success get data",
        "data": {
            "model":"SARIMA",
            "matrix":forecast_matrix,
            "record":forecast_record
        }
    }

@router.get("/forecast/actual/{forecast_id}")
def get_sarima_forecast(forecast_id: str, session: Session = Depends(get_session)):
    actual_data = get_data_actual_service(session, forecast_id)

    if not actual_data:
        return {
            "message": "Success get data",
            "data": [],
            "stats": {"count": 0, "avg": None, "min": None, "max": None}
        }

    # Ganti .XXX dengan nama kolom yang benar, misal .Quantity / .Value
    values = [item.qty for item in actual_data]

    stats = {
        "count": len(values),
        "avg": round(sum(values) / len(values), 2),
        "min": round(min(values), 2),
        "max": round(max(values), 2),
    }

    return {
        "message": "Success get data",
        "stats": stats,
        "data": actual_data,
    }


# create forecast
@router.post("/forecast", status_code=201)
def create_sarima_forecast(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    try:
        file_bytes = file.file.read()
        df = parse_transaction_file(file_bytes, file.filename)

        if df.empty:
            raise ValueError("File tidak memiliki data")

        header = create_forecast_with_transactions(session, title, description, df)

        header.still_process = True
        session.add(header)
        session.commit()

        background_tasks.add_task(run_all_forecasts, header.id, df)

        return {
            "message": "Success insert data, forecasting sedang diproses di background",
            "data": {
                "id": header.id,
                "title": header.title,
                "description": header.description,
                "still_process": header.still_process,
                "total_rows": len(df),
            },
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal memproses file: {str(e)}")