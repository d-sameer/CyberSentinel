from app.database import Base, SessionLocal, engine
from app.models.playbook import SecurityPlaybook


PLAYBOOKS = [
    {
        "playbook_id": "PB-001",
        "name": "Isolate Compromised Endpoint",
        "description": (
            "Contain a suspected compromised endpoint by "
            "isolating it from the production network and "
            "collecting initial security evidence."
        ),
        "category": "Endpoint Response",
        "severity": "CRITICAL",
        "status": "ENABLED",
        "trigger_type": "Critical Endpoint Alert",
        "target_type": "Endpoint",
        "actions": (
            "Validate endpoint alert|"
            "Isolate endpoint from network|"
            "Collect endpoint telemetry|"
            "Create incident|"
            "Notify SOC analyst"
        ),
        "owner": "SOC Operations",
        "version": "1.0",
    },
    {
        "playbook_id": "PB-002",
        "name": "Block Malicious IP",
        "description": (
            "Block a confirmed malicious IP address across "
            "network security controls and record the response "
            "for investigation."
        ),
        "category": "Network Response",
        "severity": "HIGH",
        "status": "ENABLED",
        "trigger_type": "Malicious Network IOC",
        "target_type": "IP Address",
        "actions": (
            "Validate IP reputation|"
            "Check active connections|"
            "Add IP to block list|"
            "Search historical network activity|"
            "Record response"
        ),
        "owner": "Network Security",
        "version": "1.2",
    },
    {
        "playbook_id": "PB-003",
        "name": "Disable Compromised Account",
        "description": (
            "Contain a suspected identity compromise by "
            "disabling the affected account and initiating "
            "credential investigation."
        ),
        "category": "Identity Response",
        "severity": "CRITICAL",
        "status": "ENABLED",
        "trigger_type": "Identity Security Alert",
        "target_type": "User Account",
        "actions": (
            "Validate identity alert|"
            "Disable account|"
            "Revoke active sessions|"
            "Review authentication history|"
            "Create investigation record"
        ),
        "owner": "Identity Security",
        "version": "1.1",
    },
    {
        "playbook_id": "PB-004",
        "name": "Quarantine Malicious File",
        "description": (
            "Respond to a confirmed malicious file by "
            "quarantining the artifact and collecting "
            "supporting endpoint evidence."
        ),
        "category": "Malware Response",
        "severity": "HIGH",
        "status": "ENABLED",
        "trigger_type": "Malware Detection",
        "target_type": "File",
        "actions": (
            "Validate malware detection|"
            "Calculate file hash|"
            "Quarantine malicious file|"
            "Collect process information|"
            "Record evidence"
        ),
        "owner": "Endpoint Security",
        "version": "2.0",
    },
    {
        "playbook_id": "PB-005",
        "name": "Collect Endpoint Evidence",
        "description": (
            "Collect volatile and endpoint telemetry required "
            "for forensic investigation following a security event."
        ),
        "category": "Forensics",
        "severity": "MEDIUM",
        "status": "ENABLED",
        "trigger_type": "Investigation Request",
        "target_type": "Endpoint",
        "actions": (
            "Collect running processes|"
            "Collect active network connections|"
            "Collect security logs|"
            "Collect suspicious files|"
            "Create forensic evidence record"
        ),
        "owner": "Digital Forensics",
        "version": "1.0",
    },
    {
        "playbook_id": "PB-006",
        "name": "Escalate Critical Alert",
        "description": (
            "Escalate a high-confidence critical alert into "
            "an incident investigation with the relevant "
            "security context."
        ),
        "category": "Incident Response",
        "severity": "CRITICAL",
        "status": "ENABLED",
        "trigger_type": "Critical Alert",
        "target_type": "Security Alert",
        "actions": (
            "Validate alert severity|"
            "Correlate related events|"
            "Create incident|"
            "Attach alert evidence|"
            "Assign incident owner"
        ),
        "owner": "SOC Operations",
        "version": "1.3",
    },
    {
        "playbook_id": "PB-007",
        "name": "Run IOC Investigation",
        "description": (
            "Investigate an indicator of compromise across "
            "endpoints, network activity, alerts, and incidents."
        ),
        "category": "Threat Intelligence",
        "severity": "HIGH",
        "status": "ENABLED",
        "trigger_type": "Threat Intelligence Match",
        "target_type": "IOC",
        "actions": (
            "Validate IOC reputation|"
            "Search endpoint telemetry|"
            "Search network connections|"
            "Search security alerts|"
            "Create investigation summary"
        ),
        "owner": "Threat Intelligence",
        "version": "1.4",
    },
    {
        "playbook_id": "PB-008",
        "name": "Reset Compromised Credentials",
        "description": (
            "Respond to suspected credential compromise by "
            "forcing credential remediation and reviewing "
            "recent authentication activity."
        ),
        "category": "Credential Response",
        "severity": "HIGH",
        "status": "DISABLED",
        "trigger_type": "Credential Security Alert",
        "target_type": "User Account",
        "actions": (
            "Validate credential alert|"
            "Force password reset|"
            "Revoke active sessions|"
            "Review authentication activity|"
            "Record remediation"
        ),
        "owner": "Identity Security",
        "version": "1.0",
    },
]

Base.metadata.create_all(bind=engine)

def seed_playbooks():
    db = SessionLocal()

    try:
        for item in PLAYBOOKS:
            existing = (
                db.query(SecurityPlaybook)
                .filter(
                    SecurityPlaybook.playbook_id
                    == item["playbook_id"]
                )
                .first()
            )

            if existing:
                print(
                    f"{item['playbook_id']} already exists"
                )
                continue

            playbook = SecurityPlaybook(**item)

            db.add(playbook)

            print(
                f"Created {item['playbook_id']} - "
                f"{item['name']}"
            )

        db.commit()

        print("Security playbook seeding completed.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_playbooks()