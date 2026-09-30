from datetime import date

from app.database import Base, SessionLocal, engine
from app.models.risk import Risk


Base.metadata.create_all(bind=engine)


risk_records = [
    {
        "risk_id": "RSK-001",
        "title": "Unpatched Critical Endpoint Vulnerabilities",
        "description": "Critical vulnerabilities remain present on endpoint systems and could allow unauthorized execution or system compromise if exploited.",
        "category": "Vulnerability Management",
        "likelihood": 5,
        "impact": 5,
        "inherent_score": 25,
        "residual_likelihood": 4,
        "residual_impact": 5,
        "residual_score": 20,
        "severity": "CRITICAL",
        "status": "UNDER_TREATMENT",
        "treatment": "MITIGATE",
        "owner": "Security Operations",
        "treatment_plan": "Prioritize critical vulnerability remediation, validate patch deployment, and perform follow-up vulnerability scans.",
        "due_date": date(2026, 10, 15),
        "related_vulnerability_ids": "VUL-001,VUL-003",
        "related_incident_ids": "INC-002",
        "related_control_ids": "CIS-05",
    },
    {
        "risk_id": "RSK-002",
        "title": "Credential Compromise Through Phishing",
        "description": "Phishing activity could result in credential theft and unauthorized access to corporate identities.",
        "category": "Identity Security",
        "likelihood": 4,
        "impact": 5,
        "inherent_score": 20,
        "residual_likelihood": 3,
        "residual_impact": 5,
        "residual_score": 15,
        "severity": "HIGH",
        "status": "UNDER_TREATMENT",
        "treatment": "MITIGATE",
        "owner": "Identity Security",
        "treatment_plan": "Strengthen phishing-resistant authentication, monitor suspicious authentication activity, and conduct user security awareness training.",
        "due_date": date(2026, 10, 20),
        "related_vulnerability_ids": "",
        "related_incident_ids": "INC-003",
        "related_control_ids": "ISO-A.08.07",
    },
    {
        "risk_id": "RSK-003",
        "title": "Malicious Network Activity",
        "description": "Suspicious network connections may indicate command-and-control activity or unauthorized communication from protected endpoints.",
        "category": "Network Security",
        "likelihood": 4,
        "impact": 4,
        "inherent_score": 16,
        "residual_likelihood": 3,
        "residual_impact": 4,
        "residual_score": 12,
        "severity": "HIGH",
        "status": "MONITORING",
        "treatment": "MITIGATE",
        "owner": "Network Security",
        "treatment_plan": "Continue network monitoring, investigate anomalous connections, and improve detection coverage for suspicious destinations.",
        "due_date": date(2026, 11, 1),
        "related_vulnerability_ids": "",
        "related_incident_ids": "INC-007",
        "related_control_ids": "CIS-08",
    },
    {
        "risk_id": "RSK-004",
        "title": "Insufficient Endpoint Telemetry Coverage",
        "description": "Incomplete endpoint telemetry could reduce the ability to detect, investigate, and respond to security activity.",
        "category": "Security Monitoring",
        "likelihood": 3,
        "impact": 4,
        "inherent_score": 12,
        "residual_likelihood": 2,
        "residual_impact": 4,
        "residual_score": 8,
        "severity": "MEDIUM",
        "status": "OPEN",
        "treatment": "MITIGATE",
        "owner": "SOC Engineering",
        "treatment_plan": "Improve telemetry collection coverage and establish monitoring health checks for protected endpoints.",
        "due_date": date(2026, 11, 10),
        "related_vulnerability_ids": "",
        "related_incident_ids": "",
        "related_control_ids": "NIST-DE.CM",
    },
    {
        "risk_id": "RSK-005",
        "title": "Delayed Security Alert Investigation",
        "description": "A backlog of security alerts could increase the time required to identify and contain potentially malicious activity.",
        "category": "Security Operations",
        "likelihood": 3,
        "impact": 4,
        "inherent_score": 12,
        "residual_likelihood": 2,
        "residual_impact": 3,
        "residual_score": 6,
        "severity": "MEDIUM",
        "status": "UNDER_TREATMENT",
        "treatment": "MITIGATE",
        "owner": "SOC Operations",
        "treatment_plan": "Improve alert prioritization, tune detection rules, and establish investigation SLAs for high-severity alerts.",
        "due_date": date(2026, 11, 15),
        "related_vulnerability_ids": "",
        "related_incident_ids": "INC-002",
        "related_control_ids": "SOC-2-CC7",
    },
    {
        "risk_id": "RSK-006",
        "title": "Compliance Evidence Gaps",
        "description": "Missing or pending evidence for selected controls could reduce confidence in the organization's compliance posture.",
        "category": "Compliance",
        "likelihood": 3,
        "impact": 3,
        "inherent_score": 9,
        "residual_likelihood": 2,
        "residual_impact": 3,
        "residual_score": 6,
        "severity": "MEDIUM",
        "status": "OPEN",
        "treatment": "MITIGATE",
        "owner": "GRC Team",
        "treatment_plan": "Collect missing evidence, validate control ownership, and schedule recurring evidence reviews.",
        "due_date": date(2026, 11, 20),
        "related_vulnerability_ids": "",
        "related_incident_ids": "",
        "related_control_ids": "CIS-05,CIS-08",
    },
    {
        "risk_id": "RSK-007",
        "title": "Unauthorized Privileged Access",
        "description": "Excessive or unauthorized privileged access could allow an attacker or compromised account to make high-impact changes.",
        "category": "Access Control",
        "likelihood": 3,
        "impact": 5,
        "inherent_score": 15,
        "residual_likelihood": 2,
        "residual_impact": 4,
        "residual_score": 8,
        "severity": "HIGH",
        "status": "ACCEPTED",
        "treatment": "ACCEPT",
        "owner": "Identity Security",
        "treatment_plan": "Maintain privileged access reviews and monitor privileged authentication activity.",
        "due_date": date(2026, 12, 1),
        "related_vulnerability_ids": "",
        "related_incident_ids": "",
        "related_control_ids": "SOC-2-CC6",
    },
    {
        "risk_id": "RSK-008",
        "title": "File Integrity Monitoring Blind Spot",
        "description": "Insufficient file integrity coverage could allow unauthorized modifications to important system or application files to remain undetected.",
        "category": "Endpoint Security",
        "likelihood": 2,
        "impact": 4,
        "inherent_score": 8,
        "residual_likelihood": 1,
        "residual_impact": 3,
        "residual_score": 3,
        "severity": "LOW",
        "status": "MITIGATED",
        "treatment": "MITIGATE",
        "owner": "Endpoint Security",
        "treatment_plan": "Maintain file integrity monitoring rules and periodically review monitored paths.",
        "due_date": date(2026, 9, 30),
        "related_vulnerability_ids": "",
        "related_incident_ids": "",
        "related_control_ids": "CIS-08",
    },
]


def seed_risks():
    db = SessionLocal()

    try:
        inserted = 0
        skipped = 0

        for record in risk_records:
            existing = (
                db.query(Risk)
                .filter(Risk.risk_id == record["risk_id"])
                .first()
            )

            if existing:
                skipped += 1
                continue

            db.add(Risk(**record))
            inserted += 1

        db.commit()

        print("CyberSentinel risk seeding completed.")
        print(f"Inserted: {inserted}")
        print(f"Skipped: {skipped}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_risks()