import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal


# ============================================================
# MODELS
# ============================================================

from app.models.compliance import ComplianceControl
from app.models.risk import Risk
from app.models.risk_action import RiskAction
from app.models.policy import Policy
from app.models.policy_action import PolicyAction
from app.models.exception import SecurityException
from app.models.exception_action import SecurityExceptionAction
from app.models.integration import SecurityIntegration
from app.models.playbook import SecurityPlaybook
from app.models.playbook_execution import SecurityPlaybookExecution
from app.models.playbook_execution_step import SecurityPlaybookExecutionStep
from app.models.architecture import SecurityArchitecture
from app.models.asset import SecurityAsset
from app.models.security_configuration import SecurityConfiguration
from app.models.security_configuration_action import SecurityConfigurationAction
from app.models.security_change import SecurityChange
from app.models.security_change_action import SecurityChangeAction
from app.models.access_governance import AccessGovernance
from app.models.network_connection import NetworkConnection
from app.models.network_connection_action import NetworkConnectionAction
from app.models.network_traffic_snapshot import NetworkTrafficSnapshot
from app.models.process import Process
from app.models.file_integrity import FileIntegrity


# ============================================================
# ROUTERS
# ============================================================

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
from app.routes.detection_rule_actions import router as detection_rule_actions_router
from app.routes.threat_intelligence import router as threat_intelligence_router
from app.routes.identity import router as identity_router
from app.routes.identity_actions import router as identity_actions_router
from app.routes.vulnerabilities import router as vulnerabilities_router
from app.routes.file_integrity_actions import router as file_integrity_actions_router
from app.routes.forensics import router as forensics_router
from app.routes.audit_logs import router as audit_logs_router
from app.routes.security_posture import router as security_posture_router
from app.routes.security_metrics import router as security_metrics_router
from app.routes.compliance import router as compliance_router
from app.routes.reports import router as reports_router
from app.routes.risks import router as risks_router
from app.routes.risk_actions import router as risk_actions_router
from app.routes.policies import router as policies_router
from app.routes.policy_actions import router as policy_actions_router
from app.routes.exceptions import router as exceptions_router
from app.routes.exception_actions import router as exception_actions_router
from app.routes.integrations import router as integrations_router
from app.routes.integration_actions import router as integration_actions_router
from app.routes.playbooks import router as playbooks_router
from app.routes.playbook_executions import router as playbook_executions_router
from app.routes.architecture import router as architecture_router
from app.routes.assets import router as assets_router
from app.routes.security_configurations import router as security_configurations_router
from app.routes.security_configuration_actions import router as security_configuration_actions_router
from app.routes.security_changes import router as security_changes_router
from app.routes.security_change_actions import router as security_change_actions_router
from app.routes.access_governance import router as access_governance_router

from app.routes.network import router as network_router, seed_connections
from app.routes.network_actions import router as network_actions_router
from app.routes.network_traffic import (
    router as network_traffic_router,
    capture_snapshot_safely,
)

from app.routes.processes import router as processes_router
from app.routes.file_integrity import router as file_integrity_router


# ============================================================
# LOGGING
# ============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cybersentinel")


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

# All models must be imported before creating database tables.
Base.metadata.create_all(bind=engine)


# ============================================================
# NETWORK DATABASE SEEDING
# ============================================================

with SessionLocal() as db:
    seed_connections(db)


# ============================================================
# AUTOMATIC NETWORK TRAFFIC SNAPSHOTS
# ============================================================

SNAPSHOT_INTERVAL_SECONDS = 60


async def network_traffic_snapshot_loop():
    """
    Capture aggregate network traffic snapshots at startup
    and then every 60 seconds.
    """
    logger.info("Network traffic snapshot task started.")

    while True:
        try:
            # Run synchronous database operations outside the event loop.
            await asyncio.to_thread(capture_snapshot_safely)

        except asyncio.CancelledError:
            raise

        except Exception:
            logger.exception("Unexpected error in traffic snapshot task.")

        await asyncio.sleep(SNAPSHOT_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage the background snapshot task through the application lifecycle.
    """
    snapshot_task = asyncio.create_task(
        network_traffic_snapshot_loop(),
        name="network-traffic-snapshots",
    )

    try:
        yield

    finally:
        logger.info("Stopping network traffic snapshot task.")

        snapshot_task.cancel()

        try:
            await snapshot_task
        except asyncio.CancelledError:
            pass

        logger.info("Network traffic snapshot task stopped.")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CyberSentinel API",
    description="Security Operations Center backend for CyberSentinel",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

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


# ============================================================
# ROUTER REGISTRATION
# ============================================================

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
app.include_router(detection_rule_actions_router)
app.include_router(threat_intelligence_router)
app.include_router(identity_router)
app.include_router(identity_actions_router)
app.include_router(vulnerabilities_router)
app.include_router(file_integrity_actions_router)
app.include_router(forensics_router)
app.include_router(audit_logs_router)
app.include_router(security_posture_router)
app.include_router(security_metrics_router)
app.include_router(compliance_router)
app.include_router(reports_router)
app.include_router(risks_router)
app.include_router(risk_actions_router)
app.include_router(policies_router)
app.include_router(policy_actions_router)
app.include_router(exceptions_router)
app.include_router(exception_actions_router)
app.include_router(integrations_router)
app.include_router(integration_actions_router)
app.include_router(playbooks_router)
app.include_router(playbook_executions_router)
app.include_router(architecture_router)
app.include_router(assets_router)
app.include_router(security_configurations_router)
app.include_router(security_configuration_actions_router)
app.include_router(security_changes_router)
app.include_router(security_change_actions_router)
app.include_router(access_governance_router)

# Network
app.include_router(network_router)
app.include_router(network_actions_router)
app.include_router(network_traffic_router)

# Processes
app.include_router(processes_router)

# File Integrity
app.include_router(file_integrity_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "service": "CyberSentinel API",
        "version": "1.0.0",
        "status": "online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "CyberSentinel API",
        "version": "1.0.0",
    }
