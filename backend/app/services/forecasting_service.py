import re
import itertools
import warnings
import numpy as np
import pandas as pd
import xgboost as xgb
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, mean_absolute_percentage_error
from sqlmodel import Session
from app.db.session import engine
from app.models.forecast_header import ForecastHeader
from app.models.forecast_detail import ForecastDetail
from app.models.forecast_matrix import ForecastMatrix

warnings.filterwarnings("ignore")


def _prepare_series(df: pd.DataFrame) -> pd.DataFrame:
    """df input: kolom ['date', 'qty'] dari TransactionData. Replikasi preprocessing notebook."""
    data = df.rename(columns={"date": "Date", "qty": "Pemakaian"}).copy()
    data["Date"] = pd.to_datetime(data["Date"])
    data = data.set_index("Date").sort_index()

    data["Pemakaian"] = data["Pemakaian"].replace(0, np.nan)
    data["Pemakaian"] = data["Pemakaian"].interpolate(method="time")
    data["Pemakaian"] = data["Pemakaian"].bfill()
    return data


def run_sarima_forecast(header_id: str, df: pd.DataFrame):
    """Persis logic notebook SARIMA_SELESAI.ipynb, tanpa plotting."""
    df_proc = _prepare_series(df)
    y = df_proc["Pemakaian"]

    split_index = int(len(df_proc) * 0.9)
    train_data = df_proc.iloc[:split_index]
    test_data = df_proc.iloc[split_index:]

    p_values = [0]
    d_values = [0]
    q_values = [0, 1, 2, 3]
    P_values = [0, 1]
    D_values = [0, 1]
    Q_values = [0, 1]
    s = 30

    pdq = list(itertools.product(p_values, d_values, q_values))
    seasonal_pdq = [(x[0], x[1], x[2], s) for x in list(itertools.product(P_values, D_values, Q_values))]

    hasil_grid_search = []
    for param in pdq:
        for param_seasonal in seasonal_pdq:
            try:
                model = SARIMAX(
                    train_data["Pemakaian"],
                    order=param,
                    seasonal_order=param_seasonal,
                    enforce_stationarity=False,
                    enforce_invertibility=False,
                )
                results = model.fit(disp=False, method="lbfgs", maxiter=50)
                if not np.isnan(results.aic) and not np.isinf(results.aic):
                    hasil_grid_search.append({"Model": f"SARIMA{param}{param_seasonal}", "AIC": results.aic})
            except Exception:
                continue

    df_hasil = pd.DataFrame(hasil_grid_search).sort_values("AIC").reset_index(drop=True)
    model_terbaik_nama = df_hasil.iloc[0]["Model"]

    matches = re.findall(r"\((.*?)\)", model_terbaik_nama)
    param_pdq = eval(f"({matches[0]})")
    param_seasonal = eval(f"({matches[1]})")

    model_final = SARIMAX(
        train_data["Pemakaian"],
        order=param_pdq,
        seasonal_order=param_seasonal,
        enforce_stationarity=False,
        enforce_invertibility=False,
    )
    model_final_fitted = model_final.fit(disp=False, method="lbfgs", maxiter=50)

    forecast_steps = len(test_data)
    prediksi_objek = model_final_fitted.get_forecast(steps=forecast_steps)
    pred_mean = prediksi_objek.predicted_mean
    pred_mean.index = test_data.index

    rmse = np.sqrt(mean_squared_error(test_data["Pemakaian"], pred_mean))
    mae = mean_absolute_error(test_data["Pemakaian"], pred_mean)
    mape = mean_absolute_percentage_error(test_data["Pemakaian"], pred_mean) * 100
    mse = rmse ** 2
    ss_res = np.sum((test_data["Pemakaian"].values - pred_mean.values) ** 2)
    ss_tot = np.sum((test_data["Pemakaian"].values - test_data["Pemakaian"].values.mean()) ** 2)
    r_square = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0

    # Retrain pakai seluruh data, forecast 365 hari ke depan (sesuai notebook)
    model_future = SARIMAX(
        y, order=param_pdq, seasonal_order=param_seasonal,
        enforce_stationarity=False, enforce_invertibility=False,
    )
    model_future_fitted = model_future.fit(disp=False, method="lbfgs", maxiter=50)

    forecast_days = 365
    forecast_future = model_future_fitted.get_forecast(steps=forecast_days)
    pred_future_mean = forecast_future.predicted_mean

    start_date = y.index.max() + pd.Timedelta(days=1)
    future_dates = pd.date_range(start=start_date, periods=forecast_days, freq="D")
    pred_future_mean.index = future_dates

    _save_results(
        header_id=header_id,
        method_name="SARIMA",
        forecast_series=pred_future_mean,
        mape=mape, mae=mae, mse=mse, rmse=rmse, r_square=r_square,
    )


def run_xgboost_forecast(header_id: str, df: pd.DataFrame):
    """Persis logic notebook XGBOOST_YAKIN_1.ipynb, tanpa plotting."""
    df_proc = _prepare_series(df)

    def create_features(df_input):
        df_out = df_input.copy()
        df_out["dayofweek"] = df_out.index.dayofweek
        df_out["quarter"] = df_out.index.quarter
        df_out["month"] = df_out.index.month
        df_out["year"] = df_out.index.year
        df_out["dayofyear"] = df_out.index.dayofyear
        df_out["dayofmonth"] = df_out.index.day
        df_out["weekofyear"] = df_out.index.isocalendar().week.astype(int)
        return df_out

    full_fe = create_features(df_proc)
    full_fe["lag_1"] = full_fe["Pemakaian"].shift(1)
    full_fe["lag_2"] = full_fe["Pemakaian"].shift(2)
    full_fe["lag_3"] = full_fe["Pemakaian"].shift(3)
    full_fe = full_fe.dropna()

    split_index_supervised = int(len(full_fe) * 0.7)
    train_supervised = full_fe.iloc[:split_index_supervised]
    test_supervised = full_fe.iloc[split_index_supervised:].copy()

    FEATURES = ["lag_1", "lag_2", "lag_3", "dayofweek", "quarter", "month", "year", "dayofyear", "dayofmonth", "weekofyear"]
    TARGET = "Pemakaian"

    X_train = train_supervised[FEATURES]
    y_train = train_supervised[TARGET]
    X_test = test_supervised[FEATURES]
    y_test = test_supervised[TARGET]

    xgb_base = xgb.XGBRegressor(objective="reg:squarederror", random_state=42)
    param_grid = {
        "n_estimators": [500, 1000],
        "learning_rate": [0.01, 0.05, 0.1],
        "max_depth": [3, 5, 7],
    }
    tscv = TimeSeriesSplit(n_splits=3)
    tuning = RandomizedSearchCV(
        estimator=xgb_base, param_distributions=param_grid, n_iter=5,
        scoring="neg_mean_squared_error", cv=tscv, random_state=42, n_jobs=-1,
    )
    tuning.fit(X_train, y_train)
    model_terbaik = tuning.best_estimator_
    model_terbaik.fit(X_train, y_train)

    test_supervised["Prediksi_XGBoost"] = model_terbaik.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, test_supervised["Prediksi_XGBoost"]))
    mae = mean_absolute_error(y_test, test_supervised["Prediksi_XGBoost"])
    mape = mean_absolute_percentage_error(y_test, test_supervised["Prediksi_XGBoost"]) * 100
    mse = rmse ** 2
    ss_res = np.sum((y_test.values - test_supervised["Prediksi_XGBoost"].values) ** 2)
    ss_tot = np.sum((y_test.values - y_test.values.mean()) ** 2)
    r_square = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0

    # Forecast 365 hari ke depan (sesuai notebook)
    future_days = 365
    forecast_df = full_fe.copy()
    future_predictions = []

    for _ in range(future_days):
        next_date = forecast_df.index.max() + pd.Timedelta(days=1)
        row = pd.DataFrame(index=[next_date])
        row["dayofweek"] = next_date.dayofweek
        row["quarter"] = next_date.quarter
        row["month"] = next_date.month
        row["year"] = next_date.year
        row["dayofyear"] = next_date.dayofyear
        row["dayofmonth"] = next_date.day
        row["weekofyear"] = next_date.isocalendar().week
        row["lag_1"] = forecast_df["Pemakaian"].iloc[-1]
        row["lag_2"] = forecast_df["Pemakaian"].iloc[-2]
        row["lag_3"] = forecast_df["Pemakaian"].iloc[-3]

        X_future = row[FEATURES]
        pred = model_terbaik.predict(X_future)[0]
        row["Pemakaian"] = pred
        future_predictions.append([next_date, pred])
        forecast_df = pd.concat([forecast_df, row])

    forecast_harian = pd.DataFrame(future_predictions, columns=["Tanggal", "Forecast"]).set_index("Tanggal")
    forecast_series = forecast_harian["Forecast"]

    _save_results(
        header_id=header_id,
        method_name="XGBOOST",
        forecast_series=forecast_series,
        mape=mape, mae=mae, mse=mse, rmse=rmse, r_square=r_square,
    )


def _save_results(header_id: str, method_name: str, forecast_series: pd.Series,
                   mape: float, mae: float, mse: float, rmse: float, r_square: float):
    with Session(engine) as session:
        details = [
            ForecastDetail(
                method_name=method_name,
                date=idx.date(),
                qty=int(round(val)),
                headerId=header_id,
            )
            for idx, val in forecast_series.items()
        ]
        session.add_all(details)

        matrix = ForecastMatrix(
            method_name=method_name,
            mape=float(mape), mae=float(mae), mse=float(mse),
            rmse=float(rmse), r_square=float(r_square),
            headerId=header_id,
        )
        session.add(matrix)

        header = session.get(ForecastHeader, header_id)
        if header:
            header.still_process = False
            session.add(header)

        session.commit()


def run_all_forecasts(header_id: str, df: pd.DataFrame):
    """Dipanggil oleh BackgroundTasks. Jalankan SARIMA lalu XGBoost, simpan masing-masing hasilnya."""
    try:
        run_sarima_forecast(header_id, df.copy())
    except Exception as e:
        print(f"[SARIMA] gagal untuk header {header_id}: {e}")

    try:
        run_xgboost_forecast(header_id, df.copy())
    except Exception as e:
        print(f"[XGBOOST] gagal untuk header {header_id}: {e}")

