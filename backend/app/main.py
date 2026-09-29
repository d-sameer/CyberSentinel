from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.routes.alerts import router as alerts_router
from app.routes.events import router as events_router
from app.routes.endpoints import router as endpoints_router
from app.routes.endpoint_telemetry import router as endpoint_telemetry_router
from app.routes.endpoint_activity import router as endpoint_activity_router

from app.routes.response_actions import router as response_actions_router

from app.routes.incidents import router as incidents_router
from app.routes.incident_actions import router as incident_actions_router

from app.routes.investigation import router as investigation_router
from app.routes.alert_actions import router as alert_actions_router
from app.routes.detection_rules import router as detection_rules_router
from app.routes.threat_intelligence import router as threat_intelligence_router
from app.routes.identity import router as identity_router
from app.routes.identity_actions import router as identity_actions_router
from app.routes.vulnerabilities import router as vulnerabilities_router


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
app.include_router(endpoint_activity_router)

app.include_router(response_actions_router)

app.include_router(incidents_router)
app.include_router(incident_actions_router)

app.include_router(investigation_router)
app.include_router(alert_actions_router)
app.include_router(detection_rules_router)
app.include_router(threat_intelligence_router)
app.include_router(identity_router)
app.include_router(identity_actions_router)
app.include_router(vulnerabilities_router)


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
