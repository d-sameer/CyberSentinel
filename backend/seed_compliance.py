from datetime import datetime

from app.database import Base, SessionLocal, engine
from app.models.compliance import ComplianceControl


Base.metadata.create_all(bind=engine)


controls = [
    # ============================================================
    # NIST CSF
    # ============================================================
    {
        "control_id": "NIST-AC-01",
        "framework": "NIST CSF",
        "control_name": "Access Control Governance",
        "description": "Access permissions are reviewed and managed according to organizational security requirements.",
        "category": "Access Control",
        "status": "COMPLIANT",
        "owner": "Identity Security",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1046,EVT-1042",
        "related_alert_ids": "ALT-007,ALT-037",
        "related_incident_ids": "INC-002",
        "last_reviewed": datetime(2026, 9, 28, 10, 15, 0),
    },
    {
        "control_id": "NIST-DE-01",
        "framework": "NIST CSF",
        "control_name": "Security Event Monitoring",
        "description": "Security events are continuously monitored and investigated for indicators of compromise.",
        "category": "Detection",
        "status": "COMPLIANT",
        "owner": "SOC Operations",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1048,EVT-1047,EVT-1045",
        "related_alert_ids": "ALT-018,ALT-021,ALT-031",
        "related_incident_ids": "INC-003,INC-001,INC-006",
        "last_reviewed": datetime(2026, 9, 28, 11, 30, 0),
    },
    {
        "control_id": "NIST-RS-01",
        "framework": "NIST CSF",
        "control_name": "Incident Response Procedures",
        "description": "Security incidents are investigated, contained, and tracked through defined response procedures.",
        "category": "Incident Response",
        "status": "PARTIAL",
        "owner": "Incident Response",
        "evidence_status": "PENDING",
        "related_event_ids": "EVT-1048,EVT-1045",
        "related_alert_ids": "ALT-018,ALT-031",
        "related_incident_ids": "INC-003,INC-006",
        "last_reviewed": datetime(2026, 9, 27, 16, 20, 0),
    },
    {
        "control_id": "NIST-PR-01",
        "framework": "NIST CSF",
        "control_name": "Endpoint Protection",
        "description": "Endpoints are monitored for malicious activity and protected using security controls.",
        "category": "Endpoint Security",
        "status": "NEEDS_REVIEW",
        "owner": "Endpoint Security",
        "evidence_status": "PENDING",
        "related_event_ids": "EVT-1043,EVT-1045",
        "related_alert_ids": "ALT-034,ALT-031",
        "related_incident_ids": "INC-007,INC-006",
        "last_reviewed": datetime(2026, 9, 26, 14, 45, 0),
    },

    # ============================================================
    # ISO 27001
    # ============================================================
    {
        "control_id": "ISO-A.05.01",
        "framework": "ISO 27001",
        "control_name": "Information Security Policies",
        "description": "Information security policies are documented, reviewed, and maintained.",
        "category": "Governance",
        "status": "COMPLIANT",
        "owner": "Security Governance",
        "evidence_status": "VERIFIED",
        "related_event_ids": "",
        "related_alert_ids": "",
        "related_incident_ids": "",
        "last_reviewed": datetime(2026, 9, 25, 9, 0, 0),
    },
    {
        "control_id": "ISO-A.08.01",
        "framework": "ISO 27001",
        "control_name": "User Endpoint Management",
        "description": "User endpoint assets are identified, monitored, and managed throughout their operational lifecycle.",
        "category": "Asset Management",
        "status": "COMPLIANT",
        "owner": "IT Operations",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1044,EVT-1041",
        "related_alert_ids": "",
        "related_incident_ids": "",
        "last_reviewed": datetime(2026, 9, 26, 10, 30, 0),
    },
    {
        "control_id": "ISO-A.08.07",
        "framework": "ISO 27001",
        "control_name": "Protection Against Malware",
        "description": "Controls are maintained to detect and respond to malicious software and suspicious endpoint activity.",
        "category": "Malware Protection",
        "status": "NON_COMPLIANT",
        "owner": "Endpoint Security",
        "evidence_status": "MISSING",
        "related_event_ids": "EVT-1045",
        "related_alert_ids": "ALT-031",
        "related_incident_ids": "INC-006",
        "last_reviewed": datetime(2026, 9, 24, 15, 10, 0),
    },
    {
        "control_id": "ISO-A.08.15",
        "framework": "ISO 27001",
        "control_name": "Logging and Monitoring",
        "description": "Relevant security activities are logged and reviewed to support detection and investigation.",
        "category": "Logging",
        "status": "PARTIAL",
        "owner": "SOC Operations",
        "evidence_status": "PENDING",
        "related_event_ids": "EVT-1048,EVT-1047",
        "related_alert_ids": "ALT-018,ALT-021",
        "related_incident_ids": "INC-003,INC-001",
        "last_reviewed": datetime(2026, 9, 27, 12, 0, 0),
    },

    # ============================================================
    # CIS Controls
    # ============================================================
    {
        "control_id": "CIS-01",
        "framework": "CIS Controls",
        "control_name": "Enterprise Asset Inventory",
        "description": "Authorized endpoints and computing assets are identified and maintained in an inventory.",
        "category": "Asset Inventory",
        "status": "COMPLIANT",
        "owner": "IT Operations",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1044,EVT-1041",
        "related_alert_ids": "",
        "related_incident_ids": "",
        "last_reviewed": datetime(2026, 9, 26, 11, 0, 0),
    },
    {
        "control_id": "CIS-05",
        "framework": "CIS Controls",
        "control_name": "Account Management",
        "description": "User and administrative accounts are managed, reviewed, and monitored for suspicious activity.",
        "category": "Identity",
        "status": "NEEDS_REVIEW",
        "owner": "Identity Security",
        "evidence_status": "PENDING",
        "related_event_ids": "EVT-1046,EVT-1042",
        "related_alert_ids": "ALT-007,ALT-037",
        "related_incident_ids": "INC-002",
        "last_reviewed": datetime(2026, 9, 27, 13, 40, 0),
    },
    {
        "control_id": "CIS-08",
        "framework": "CIS Controls",
        "control_name": "Audit Log Management",
        "description": "Audit logs are collected, protected, and reviewed to support security monitoring.",
        "category": "Audit Logging",
        "status": "COMPLIANT",
        "owner": "SOC Operations",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1048,EVT-1043",
        "related_alert_ids": "ALT-018,ALT-034",
        "related_incident_ids": "INC-003,INC-007",
        "last_reviewed": datetime(2026, 9, 28, 8, 45, 0),
    },
    {
        "control_id": "CIS-13",
        "framework": "CIS Controls",
        "control_name": "Network Monitoring and Defense",
        "description": "Network activity is monitored for suspicious connections and anomalous communication patterns.",
        "category": "Network Security",
        "status": "PARTIAL",
        "owner": "Network Security",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1048,EVT-1041",
        "related_alert_ids": "ALT-018",
        "related_incident_ids": "INC-003",
        "last_reviewed": datetime(2026, 9, 28, 9, 30, 0),
    },

    # ============================================================
    # SOC 2
    # ============================================================
    {
        "control_id": "SOC2-CC6.01",
        "framework": "SOC 2",
        "control_name": "Logical Access Controls",
        "description": "Logical access to systems and information is restricted according to authorized requirements.",
        "category": "Access Control",
        "status": "COMPLIANT",
        "owner": "Identity Security",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1042",
        "related_alert_ids": "ALT-037",
        "related_incident_ids": "",
        "last_reviewed": datetime(2026, 9, 27, 10, 20, 0),
    },
    {
        "control_id": "SOC2-CC7.01",
        "framework": "SOC 2",
        "control_name": "Threat Detection",
        "description": "Security events are monitored to identify and respond to potential threats.",
        "category": "Threat Detection",
        "status": "COMPLIANT",
        "owner": "SOC Operations",
        "evidence_status": "VERIFIED",
        "related_event_ids": "EVT-1048,EVT-1047,EVT-1045",
        "related_alert_ids": "ALT-018,ALT-021,ALT-031",
        "related_incident_ids": "INC-003,INC-001,INC-006",
        "last_reviewed": datetime(2026, 9, 28, 12, 15, 0),
    },
    {
        "control_id": "SOC2-CC7.02",
        "framework": "SOC 2",
        "control_name": "Incident Response Monitoring",
        "description": "Security incidents are evaluated and tracked through investigation and response activities.",
        "category": "Incident Management",
        "status": "PARTIAL",
        "owner": "Incident Response",
        "evidence_status": "PENDING",
        "related_event_ids": "EVT-1048,EVT-1043",
        "related_alert_ids": "ALT-018,ALT-034",
        "related_incident_ids": "INC-003,INC-007",
        "last_reviewed": datetime(2026, 9, 27, 17, 0, 0),
    },
    {
        "control_id": "SOC2-CC8.01",
        "framework": "SOC 2",
        "control_name": "Change Management",
        "description": "Changes affecting security-sensitive systems are reviewed and monitored.",
        "category": "Change Management",
        "status": "NON_COMPLIANT",
        "owner": "Security Governance",
        "evidence_status": "MISSING",
        "related_event_ids": "EVT-1043",
        "related_alert_ids": "ALT-034",
        "related_incident_ids": "INC-007",
        "last_reviewed": datetime(2026, 9, 23, 14, 30, 0),
    },
]


def seed_compliance():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for control_data in controls:
            existing = (
                db.query(ComplianceControl)
                .filter(
                    ComplianceControl.control_id
                    == control_data["control_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            control = ComplianceControl(
                **control_data
            )

            db.add(control)
            inserted += 1

        db.commit()

        print(
            "CyberSentinel compliance seeding completed."
        )
        print(f"Inserted: {inserted}")
        print(f"Skipped:  {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_compliance()