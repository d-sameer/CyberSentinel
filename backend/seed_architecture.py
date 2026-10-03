from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models.architecture import SecurityArchitecture


Base.metadata.create_all(bind=engine)


architecture_records = [
    {
        "architecture_id": "ARC-001",
        "name": "Internet Edge",
        "description": "External network boundary protecting CyberSentinel infrastructure from untrusted internet traffic.",
        "architecture_type": "Network Architecture",
        "zone": "Internet",
        "security_layer": "Perimeter",
        "component_type": "Network Boundary",
        "status": "ACTIVE",
        "criticality": "CRITICAL",
        "owner": "Network Security",
        "technologies": "Edge Router|DDoS Protection|Firewall",
        "security_controls": "Network Segmentation|Traffic Filtering|DDoS Protection",
        "connected_components": "ARC-002|ARC-003",
        "trust_level": "UNTRUSTED",
        "exposure": "EXTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-002",
        "name": "Perimeter Firewall",
        "description": "Primary security enforcement point controlling inbound and outbound traffic between external and protected network zones.",
        "architecture_type": "Network Security",
        "zone": "DMZ",
        "security_layer": "Perimeter",
        "component_type": "Firewall",
        "status": "ACTIVE",
        "criticality": "CRITICAL",
        "owner": "Network Security",
        "technologies": "Next-Generation Firewall|IPS|URL Filtering",
        "security_controls": "Access Control|Intrusion Prevention|Network Filtering",
        "connected_components": "ARC-001|ARC-003|ARC-004",
        "trust_level": "CONTROLLED",
        "exposure": "EXTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-003",
        "name": "DMZ Application Zone",
        "description": "Controlled network zone hosting externally accessible application services while isolating internal systems.",
        "architecture_type": "Network Architecture",
        "zone": "DMZ",
        "security_layer": "Network",
        "component_type": "Security Zone",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Infrastructure Security",
        "technologies": "Network Segmentation|Load Balancer|Reverse Proxy",
        "security_controls": "Network Segmentation|Least Privilege|Ingress Filtering",
        "connected_components": "ARC-002|ARC-005",
        "trust_level": "CONTROLLED",
        "exposure": "EXTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-004",
        "name": "Web Application Tier",
        "description": "Internet-facing application services protected by perimeter and application security controls.",
        "architecture_type": "Application Architecture",
        "zone": "DMZ",
        "security_layer": "Application",
        "component_type": "Web Application",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Application Security",
        "technologies": "React|Node.js|Web Application Firewall",
        "security_controls": "WAF|OWASP Controls|TLS",
        "connected_components": "ARC-002|ARC-003|ARC-005",
        "trust_level": "CONTROLLED",
        "exposure": "EXTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-005",
        "name": "Application Services",
        "description": "Internal application services responsible for business processing and communication with protected data systems.",
        "architecture_type": "Application Architecture",
        "zone": "Internal",
        "security_layer": "Application",
        "component_type": "Application Services",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Application Security",
        "technologies": "FastAPI|Python|REST API",
        "security_controls": "Authentication|Authorization|API Security",
        "connected_components": "ARC-003|ARC-004|ARC-006",
        "trust_level": "TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "MEDIUM",
    },
    {
        "architecture_id": "ARC-006",
        "name": "Protected Database Zone",
        "description": "Restricted data layer containing security and operational data with controlled application access.",
        "architecture_type": "Data Architecture",
        "zone": "Restricted",
        "security_layer": "Data",
        "component_type": "Database",
        "status": "ACTIVE",
        "criticality": "CRITICAL",
        "owner": "Data Security",
        "technologies": "SQLite|Database Encryption|Backup",
        "security_controls": "Encryption at Rest|Access Control|Backup",
        "connected_components": "ARC-005|ARC-007",
        "trust_level": "HIGHLY TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-007",
        "name": "Identity Security Layer",
        "description": "Central identity and access security layer controlling authentication, authorization, and privileged access.",
        "architecture_type": "Identity Architecture",
        "zone": "Internal",
        "security_layer": "Identity",
        "component_type": "Identity Provider",
        "status": "ACTIVE",
        "criticality": "CRITICAL",
        "owner": "Identity Security",
        "technologies": "Entra ID|MFA|RBAC",
        "security_controls": "Multi-Factor Authentication|RBAC|Privileged Access Management",
        "connected_components": "ARC-005|ARC-006|ARC-008",
        "trust_level": "TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-008",
        "name": "Security Operations Layer",
        "description": "Central SOC layer responsible for security monitoring, detection, investigation, and response.",
        "architecture_type": "Security Operations",
        "zone": "Internal",
        "security_layer": "Monitoring",
        "component_type": "SOC Platform",
        "status": "ACTIVE",
        "criticality": "CRITICAL",
        "owner": "SOC Operations",
        "technologies": "SIEM|EDR|SOAR|Threat Intelligence",
        "security_controls": "Security Monitoring|Detection Rules|Incident Response",
        "connected_components": "ARC-007|ARC-009|ARC-010",
        "trust_level": "TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "MEDIUM",
    },
    {
        "architecture_id": "ARC-009",
        "name": "Endpoint Security Layer",
        "description": "Endpoint protection layer providing telemetry, malware detection, response, and device security controls.",
        "architecture_type": "Endpoint Architecture",
        "zone": "Internal",
        "security_layer": "Endpoint",
        "component_type": "Endpoint Security",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Endpoint Security",
        "technologies": "EDR|Antivirus|Host Firewall",
        "security_controls": "Endpoint Detection|Malware Protection|Host Isolation",
        "connected_components": "ARC-008|ARC-010",
        "trust_level": "TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "HIGH",
    },
    {
        "architecture_id": "ARC-010",
        "name": "Threat Intelligence Layer",
        "description": "Threat intelligence capability providing IOC enrichment, reputation analysis, and external threat context.",
        "architecture_type": "Threat Intelligence",
        "zone": "Internal",
        "security_layer": "Intelligence",
        "component_type": "Threat Intelligence Platform",
        "status": "ACTIVE",
        "criticality": "MEDIUM",
        "owner": "Threat Intelligence",
        "technologies": "VirusTotal|IOC Feeds|Threat Intelligence",
        "security_controls": "IOC Validation|Threat Enrichment|Reputation Analysis",
        "connected_components": "ARC-008|ARC-009",
        "trust_level": "CONTROLLED",
        "exposure": "INTERNAL",
        "risk_level": "MEDIUM",
    },
    {
        "architecture_id": "ARC-011",
        "name": "Backup and Recovery Layer",
        "description": "Resilience layer providing protected backup storage and recovery capabilities for critical security and operational data.",
        "architecture_type": "Resilience Architecture",
        "zone": "Restricted",
        "security_layer": "Recovery",
        "component_type": "Backup System",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Infrastructure Security",
        "technologies": "Encrypted Backup|Offline Storage|Recovery Testing",
        "security_controls": "Backup Protection|Encryption|Recovery Testing",
        "connected_components": "ARC-006|ARC-008",
        "trust_level": "HIGHLY TRUSTED",
        "exposure": "INTERNAL",
        "risk_level": "MEDIUM",
    },
    {
        "architecture_id": "ARC-012",
        "name": "Remote Access Gateway",
        "description": "Controlled remote access boundary providing authenticated connectivity for authorized administrative users.",
        "architecture_type": "Access Architecture",
        "zone": "DMZ",
        "security_layer": "Access",
        "component_type": "Remote Access Gateway",
        "status": "ACTIVE",
        "criticality": "HIGH",
        "owner": "Identity Security",
        "technologies": "VPN|MFA|Remote Access Gateway",
        "security_controls": "MFA|Conditional Access|Session Monitoring",
        "connected_components": "ARC-002|ARC-007|ARC-008",
        "trust_level": "CONTROLLED",
        "exposure": "EXTERNAL",
        "risk_level": "HIGH",
    },
]


db = SessionLocal()

created = 0
skipped = 0

try:
    for record in architecture_records:
        existing = (
            db.query(SecurityArchitecture)
            .filter(
                SecurityArchitecture.architecture_id
                == record["architecture_id"]
            )
            .first()
        )

        if existing:
            skipped += 1
            continue

        architecture = SecurityArchitecture(
            **record,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(architecture)
        created += 1

    db.commit()

    print(
        f"Security architecture seeded successfully. "
        f"Created: {created}, Skipped: {skipped}"
    )

finally:
    db.close()