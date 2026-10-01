from datetime import date

from app.database import Base, SessionLocal, engine
from app.models.policy import Policy


Base.metadata.create_all(bind=engine)


POLICIES = [
    {
        "policy_id": "POL-001",
        "title": "Information Security Policy",
        "description": (
            "Defines the organization's overall information "
            "security principles, responsibilities, governance "
            "requirements, and security objectives."
        ),
        "category": "Information Security",
        "status": "ACTIVE",
        "owner": "CISO Office",
        "version": "3.1",
        "effective_date": date(2026, 1, 15),
        "review_date": date(2027, 1, 15),
        "frameworks": "ISO 27001,NIST CSF,SOC 2",
        "related_control_ids": "ISO-A.05.01,NIST-GV.PO,SOC-2-CC1",
        "related_risk_ids": "RSK-006,RSK-007",
    },
    {
        "policy_id": "POL-002",
        "title": "Access Control Policy",
        "description": (
            "Establishes requirements for authentication, "
            "authorization, least privilege, privileged access, "
            "and periodic access reviews."
        ),
        "category": "Access Control",
        "status": "ACTIVE",
        "owner": "Identity Security",
        "version": "2.4",
        "effective_date": date(2026, 2, 1),
        "review_date": date(2027, 2, 1),
        "frameworks": "CIS Controls,ISO 27001,SOC 2",
        "related_control_ids": "CIS-06,ISO-A.08.02,SOC-2-CC6",
        "related_risk_ids": "RSK-002,RSK-007",
    },
    {
        "policy_id": "POL-003",
        "title": "Vulnerability Management Policy",
        "description": (
            "Defines vulnerability identification, prioritization, "
            "remediation, validation, and reporting requirements "
            "for organizational assets."
        ),
        "category": "Vulnerability Management",
        "status": "ACTIVE",
        "owner": "Security Operations",
        "version": "2.2",
        "effective_date": date(2026, 1, 20),
        "review_date": date(2027, 1, 20),
        "frameworks": "CIS Controls,NIST CSF",
        "related_control_ids": "CIS-07,NIST-ID.RA",
        "related_risk_ids": "RSK-001",
    },
    {
        "policy_id": "POL-004",
        "title": "Incident Response Policy",
        "description": (
            "Defines the organizational process for detecting, "
            "investigating, containing, eradicating, recovering "
            "from, and documenting security incidents."
        ),
        "category": "Incident Response",
        "status": "ACTIVE",
        "owner": "SOC Operations",
        "version": "4.0",
        "effective_date": date(2026, 3, 10),
        "review_date": date(2027, 3, 10),
        "frameworks": "NIST CSF,SOC 2",
        "related_control_ids": "NIST-RS.MA,SOC-2-CC7",
        "related_risk_ids": "RSK-003,RSK-005",
    },
    {
        "policy_id": "POL-005",
        "title": "Security Monitoring Policy",
        "description": (
            "Establishes requirements for security telemetry, "
            "logging, monitoring coverage, alerting, and "
            "security event investigation."
        ),
        "category": "Security Monitoring",
        "status": "UNDER_REVIEW",
        "owner": "SOC Engineering",
        "version": "1.8",
        "effective_date": date(2025, 10, 1),
        "review_date": date(2026, 10, 15),
        "frameworks": "CIS Controls,NIST CSF",
        "related_control_ids": "CIS-08,NIST-DE.CM",
        "related_risk_ids": "RSK-003,RSK-004",
    },
    {
        "policy_id": "POL-006",
        "title": "Data Protection and Privacy Policy",
        "description": (
            "Defines requirements for protecting sensitive data, "
            "data handling, retention, access, transmission, "
            "and privacy responsibilities."
        ),
        "category": "Data Protection",
        "status": "ACTIVE",
        "owner": "GRC Team",
        "version": "2.0",
        "effective_date": date(2026, 4, 1),
        "review_date": date(2027, 4, 1),
        "frameworks": "ISO 27001,SOC 2",
        "related_control_ids": "ISO-A.08.10,SOC-2-CC6",
        "related_risk_ids": "RSK-006",
    },
    {
        "policy_id": "POL-007",
        "title": "Endpoint Security Policy",
        "description": (
            "Defines security requirements for organizational "
            "endpoints including hardening, protection, telemetry, "
            "file integrity, and endpoint monitoring."
        ),
        "category": "Endpoint Security",
        "status": "DRAFT",
        "owner": "Endpoint Security",
        "version": "1.0",
        "effective_date": date(2026, 11, 1),
        "review_date": date(2027, 11, 1),
        "frameworks": "CIS Controls,NIST CSF",
        "related_control_ids": "CIS-04,CIS-08",
        "related_risk_ids": "RSK-001,RSK-004,RSK-008",
    },
    {
        "policy_id": "POL-008",
        "title": "Security Awareness Policy",
        "description": (
            "Defines security awareness, training, phishing "
            "simulation, and workforce security education "
            "requirements."
        ),
        "category": "Security Awareness",
        "status": "EXPIRED",
        "owner": "GRC Team",
        "version": "1.5",
        "effective_date": date(2025, 6, 1),
        "review_date": date(2026, 6, 1),
        "frameworks": "ISO 27001,CIS Controls",
        "related_control_ids": "ISO-A.06.03,CIS-14",
        "related_risk_ids": "RSK-002",
    },
]


def seed_policies() -> None:
    db = SessionLocal()

    inserted = 0
    skipped = 0

    try:
        for record in POLICIES:
            existing = (
                db.query(Policy)
                .filter(
                    Policy.policy_id
                    == record["policy_id"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            db.add(
                Policy(
                    **record
                )
            )

            inserted += 1

        db.commit()

        print(
            "CyberSentinel policy seeding completed."
        )
        print(f"Inserted: {inserted}")
        print(f"Skipped: {skipped}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_policies()