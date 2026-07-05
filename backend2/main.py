from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from app.db.session import engine
from app import models  # penting: load semua model sebelum create_all
from app.routes import forecast_route
from app.routes import auth_route

# 1. Inisialisasi aplikasi FastAPI — HANYA SEKALI
app = FastAPI(
    title="Format Forecast API",
    description="API untuk autentikasi dan prediksi menggunakan XGBoost & SARIMA",
    version="1.0.0"
)

# 2. Pasang CORS middleware SEKALI, setelah app dibuat
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.20.10.3:3000",
    "http://103.176.78.208",        # kalau akses lewat Nginx port 80 (tanpa port)
    "http://103.176.78.208:3000",   # kalau masih akses langsung ke port 3000 Next.js
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# Endpoint Root
@app.get("/")
def read_root():
    return {"message": "Halo! Ini adalah API menggunakan FastAPI"}

# Endpoint Auth
app.include_router(auth_route.router)

# Endpoint Forecast
app.include_router(forecast_route.router)

# Endpoint User Profile
@app.get("/api/v1/user/me")
def get_current_user():
    return {"message": "Success get data", "data": {"username": "user_id_kamu"}}