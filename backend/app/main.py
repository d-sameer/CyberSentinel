from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.alerts import router as alerts_router
from app.routes.events import router as events_router
from app.routes.endpoints import router as endpoints_router
from app.routes.endpoint_telemetry import (
    router as endpoint_telemetry_router,
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CyberSentinel API",
    description="Security Operations Center backend for CyberSentinel",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(endpoints_router)
app.include_router(endpoint_telemetry_router)


@app.get("/")
def root():
    return {
        "service": "CyberSentinel API",
        "version": "1.0.0",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "CyberSentinel API",
        "version": "1.0.0",
    }