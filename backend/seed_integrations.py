from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models.integration import SecurityIntegration


Base.metadata.create_all(bind=engine)


integrations = [
    {
        "integration_id": "INT-001",
        "name": "Splunk SIEM",
        "description": "Centralized security event collection and SIEM correlation platform.",
        "category": "SIEM",
        "provider": "Splunk",
        "integration_type": "Security Information and Event Management",
        "status": "CONNECTED",
        "health": "HEALTHY",
        "endpoint": "https://splunk.cybersentinel.local",
        "owner": "SOC Operations",
        "data_collected": "Security Events|Authentication Logs|Network Logs|Endpoint Alerts",
        "sync_frequency": "Every 1 minute",
        "last_sync": datetime.utcnow() - timedelta(minutes=2),
        "error_message": "",
    },
    {
        "integration_id": "INT-002",
        "name": "CrowdStrike Falcon",
        "description": "Endpoint detection and response telemetry integration.",
        "category": "EDR",
        "provider": "CrowdStrike",
        "integration_type": "Endpoint Detection and Response",
        "status": "CONNECTED",
        "health": "HEALTHY",
        "endpoint": "https://api.crowdstrike.cybersentinel.local",
        "owner": "Endpoint Security",
        "data_collected": "Endpoint Telemetry|Process Events|Network Connections|Detection Alerts",
        "sync_frequency": "Every 2 minutes",
        "last_sync": datetime.utcnow() - timedelta(minutes=3),
        "error_message": "",
    },
    {
        "integration_id": "INT-003",
        "name": "Palo Alto Firewall",
        "description": "Network security and firewall event integration.",
        "category": "Network Security",
        "provider": "Palo Alto Networks",
        "integration_type": "Next-Generation Firewall",
        "status": "CONNECTED",
        "health": "HEALTHY",
        "endpoint": "https://firewall.cybersentinel.local",
        "owner": "Network Security",
        "data_collected": "Firewall Logs|Network Sessions|Blocked Connections|Threat Events",
        "sync_frequency": "Every 5 minutes",
        "last_sync": datetime.utcnow() - timedelta(minutes=4),
        "error_message": "",
    },
    {
        "integration_id": "INT-004",
        "name": "Tenable Nessus",
        "description": "Vulnerability assessment and vulnerability management integration.",
        "category": "Vulnerability Management",
        "provider": "Tenable",
        "integration_type": "Vulnerability Scanner",
        "status": "DEGRADED",
        "health": "UNHEALTHY",
        "endpoint": "https://nessus.cybersentinel.local",
        "owner": "Vulnerability Management",
        "data_collected": "Vulnerability Findings|CVEs|Risk Scores|Asset Exposure",
        "sync_frequency": "Every 30 minutes",
        "last_sync": datetime.utcnow() - timedelta(hours=2),
        "error_message": "Last vulnerability synchronization exceeded the expected interval.",
    },
    {
        "integration_id": "INT-005",
        "name": "VirusTotal Intelligence",
        "description": "Threat intelligence enrichment for files, URLs, domains, and IP addresses.",
        "category": "Threat Intelligence",
        "provider": "VirusTotal",
        "integration_type": "Threat Intelligence Platform",
        "status": "CONNECTED",
        "health": "HEALTHY",
        "endpoint": "https://virustotal.cybersentinel.local",
        "owner": "Threat Intelligence",
        "data_collected": "IP Reputation|URL Reputation|File Hashes|Domain Intelligence",
        "sync_frequency": "On Demand",
        "last_sync": datetime.utcnow() - timedelta(minutes=8),
        "error_message": "",
    },
    {
        "integration_id": "INT-006",
        "name": "Microsoft Entra ID",
        "description": "Identity and authentication telemetry integration.",
        "category": "Identity Security",
        "provider": "Microsoft",
        "integration_type": "Identity and Access Management",
        "status": "CONNECTED",
        "health": "HEALTHY",
        "endpoint": "https://entra.cybersentinel.local",
        "owner": "Identity Security",
        "data_collected": "Authentication Events|Sign-In Logs|Account Changes|MFA Events",
        "sync_frequency": "Every 5 minutes",
        "last_sync": datetime.utcnow() - timedelta(minutes=6),
        "error_message": "",
    },
    {
        "integration_id": "INT-007",
        "name": "Proofpoint Email Security",
        "description": "Email security and phishing detection telemetry integration.",
        "category": "Email Security",
        "provider": "Proofpoint",
        "integration_type": "Email Security Gateway",
        "status": "DISCONNECTED",
        "health": "UNHEALTHY",
        "endpoint": "https://proofpoint.cybersentinel.local",
        "owner": "Email Security",
        "data_collected": "Email Threats|Phishing Events|Malware Attachments|URL Threats",
        "sync_frequency": "Every 5 minutes",
        "last_sync": datetime.utcnow() - timedelta(hours=6),
        "error_message": "Integration endpoint is currently unavailable.",
    },
    {
        "integration_id": "INT-008",
        "name": "ServiceNow SecOps",
        "description": "Security incident and workflow management integration.",
        "category": "Incident Response",
        "provider": "ServiceNow",
        "integration_type": "Security Operations Workflow",
        "status": "DISABLED",
        "health": "UNHEALTHY",
        "endpoint": "https://servicenow.cybersentinel.local",
        "owner": "Incident Response",
        "data_collected": "Security Incidents|Tasks|Assignments|Response Updates",
        "sync_frequency": "Every 10 minutes",
        "last_sync": None,
        "error_message": "Integration is administratively disabled.",
    },
]


def seed_integrations():
    db = SessionLocal()

    try:
        created = 0
        skipped = 0

        for data in integrations:
            existing = (
                db.query(SecurityIntegration)
                .filter(
                    SecurityIntegration.integration_id
                    == data["integration_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            integration = SecurityIntegration(**data)
            db.add(integration)
            created += 1

        db.commit()

        print(
            f"Security integrations seeded successfully. "
            f"Created: {created}, Skipped: {skipped}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_integrations()