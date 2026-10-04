from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models.security_configuration import SecurityConfiguration


configurations = [
    {
        "configuration_id": "CFG-001",
        "name": "Production Web Server Security Baseline",
        "description": "Security baseline configuration for the production web server.",
        "configuration_type": "Operating System",
        "category": "Server Hardening",
        "asset_id": "AST-001",
        "asset_name": "Production Web Server",
        "environment": "Production",
        "baseline": "CIS Linux Server Benchmark",
        "baseline_version": "2.0.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "SSH root login disabled; firewall enabled; automatic updates enabled",
        "expected_value": "SSH root login disabled; firewall enabled; automatic updates enabled",
        "control_reference": "CIS-1.1, CIS-4.1",
        "remediation": "No remediation required.",
        "owner": "Infrastructure Security",
    },
    {
        "configuration_id": "CFG-002",
        "name": "SSH Root Login Configuration",
        "description": "Controls whether direct root login through SSH is permitted.",
        "configuration_type": "SSH",
        "category": "Access Control",
        "asset_id": "AST-001",
        "asset_name": "Production Web Server",
        "environment": "Production",
        "baseline": "CIS Linux Server Benchmark",
        "baseline_version": "2.0.0",
        "compliance_status": "NON_COMPLIANT",
        "severity": "CRITICAL",
        "current_value": "PermitRootLogin yes",
        "expected_value": "PermitRootLogin no",
        "control_reference": "CIS-5.2.10",
        "remediation": "Disable direct root login through SSH and require controlled administrative access.",
        "owner": "Infrastructure Security",
    },
    {
        "configuration_id": "CFG-003",
        "name": "Production Application Server Firewall",
        "description": "Host firewall configuration for the production application server.",
        "configuration_type": "Firewall",
        "category": "Network Security",
        "asset_id": "AST-002",
        "asset_name": "Production Application Server",
        "environment": "Production",
        "baseline": "CIS Linux Server Benchmark",
        "baseline_version": "2.0.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Firewall enabled; inbound traffic restricted",
        "expected_value": "Firewall enabled; inbound traffic restricted",
        "control_reference": "CIS-4.1",
        "remediation": "No remediation required.",
        "owner": "Network Security",
    },
    {
        "configuration_id": "CFG-004",
        "name": "Database Encryption at Rest",
        "description": "Encryption configuration for the production customer database.",
        "configuration_type": "Database",
        "category": "Data Protection",
        "asset_id": "AST-003",
        "asset_name": "Customer Database Server",
        "environment": "Production",
        "baseline": "Database Security Baseline",
        "baseline_version": "1.4",
        "compliance_status": "NON_COMPLIANT",
        "severity": "CRITICAL",
        "current_value": "Database storage encryption disabled",
        "expected_value": "AES-256 encryption enabled for database storage",
        "control_reference": "DB-ENC-001",
        "remediation": "Enable encryption at rest for database storage and verify key-management configuration.",
        "owner": "Database Security",
    },
    {
        "configuration_id": "CFG-005",
        "name": "Database Network Access Control",
        "description": "Restricts database network access to approved application systems.",
        "configuration_type": "Network",
        "category": "Network Security",
        "asset_id": "AST-003",
        "asset_name": "Customer Database Server",
        "environment": "Production",
        "baseline": "Database Security Baseline",
        "baseline_version": "1.4",
        "compliance_status": "PARTIALLY_COMPLIANT",
        "severity": "HIGH",
        "current_value": "Application subnet restricted; temporary administrative subnet remains allowed",
        "expected_value": "Only approved application and administrative networks allowed",
        "control_reference": "DB-NET-002",
        "remediation": "Remove unnecessary temporary administrative network access.",
        "owner": "Database Security",
    },
    {
        "configuration_id": "CFG-006",
        "name": "Identity Server Password Policy",
        "description": "Password policy applied to corporate identity services.",
        "configuration_type": "Identity",
        "category": "Authentication",
        "asset_id": "AST-004",
        "asset_name": "Corporate Identity Server",
        "environment": "Production",
        "baseline": "Identity Security Baseline",
        "baseline_version": "3.1",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Minimum length 14; complexity enabled; history 24",
        "expected_value": "Minimum length 14; complexity enabled; history 24",
        "control_reference": "IAM-PWD-001",
        "remediation": "No remediation required.",
        "owner": "Identity Security",
    },
    {
        "configuration_id": "CFG-007",
        "name": "SIEM Log Retention",
        "description": "Retention configuration for centralized security logs.",
        "configuration_type": "SIEM",
        "category": "Logging",
        "asset_id": "AST-005",
        "asset_name": "Security Operations SIEM",
        "environment": "Production",
        "baseline": "SOC Logging Standard",
        "baseline_version": "2.2",
        "compliance_status": "PARTIALLY_COMPLIANT",
        "severity": "HIGH",
        "current_value": "Security logs retained for 180 days",
        "expected_value": "Security logs retained for minimum 365 days",
        "control_reference": "LOG-RET-001",
        "remediation": "Increase centralized security log retention to at least 365 days.",
        "owner": "Security Operations",
    },
    {
        "configuration_id": "CFG-008",
        "name": "Firewall Management Access",
        "description": "Management-plane access configuration for the corporate firewall.",
        "configuration_type": "Firewall",
        "category": "Network Security",
        "asset_id": "AST-006",
        "asset_name": "Corporate Firewall",
        "environment": "Production",
        "baseline": "Network Security Baseline",
        "baseline_version": "4.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Management access restricted to security administration network",
        "expected_value": "Management access restricted to security administration network",
        "control_reference": "NET-MGMT-001",
        "remediation": "No remediation required.",
        "owner": "Network Security",
    },
    {
        "configuration_id": "CFG-009",
        "name": "VPN Multi-Factor Authentication",
        "description": "Multi-factor authentication requirement for remote VPN access.",
        "configuration_type": "VPN",
        "category": "Authentication",
        "asset_id": "AST-007",
        "asset_name": "Corporate VPN Gateway",
        "environment": "Production",
        "baseline": "Remote Access Security Standard",
        "baseline_version": "2.1",
        "compliance_status": "NON_COMPLIANT",
        "severity": "CRITICAL",
        "current_value": "MFA disabled for legacy VPN profile",
        "expected_value": "MFA required for all VPN profiles",
        "control_reference": "RA-MFA-001",
        "remediation": "Enable MFA for the legacy VPN profile and remove password-only authentication.",
        "owner": "Network Security",
    },
    {
        "configuration_id": "CFG-010",
        "name": "Finance Laptop Disk Encryption",
        "description": "Full-disk encryption configuration for the finance employee laptop.",
        "configuration_type": "Endpoint",
        "category": "Data Protection",
        "asset_id": "AST-008",
        "asset_name": "Employee Laptop - Finance",
        "environment": "Corporate",
        "baseline": "Endpoint Security Baseline",
        "baseline_version": "5.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Full-disk encryption enabled",
        "expected_value": "Full-disk encryption enabled",
        "control_reference": "ENDP-ENC-001",
        "remediation": "No remediation required.",
        "owner": "Endpoint Security",
    },
    {
        "configuration_id": "CFG-011",
        "name": "Development Server Security Baseline",
        "description": "Security configuration baseline for the development application server.",
        "configuration_type": "Operating System",
        "category": "Server Hardening",
        "asset_id": "AST-011",
        "asset_name": "Development Application Server",
        "environment": "Development",
        "baseline": "CIS Linux Server Benchmark",
        "baseline_version": "2.0.0",
        "compliance_status": "NON_COMPLIANT",
        "severity": "HIGH",
        "current_value": "Unused services enabled; password aging policy not configured",
        "expected_value": "Unused services disabled; password aging policy configured",
        "control_reference": "CIS-2.1, CIS-5.4",
        "remediation": "Disable unused services and configure password aging according to the security baseline.",
        "owner": "Application Security",
    },
    {
        "configuration_id": "CFG-012",
        "name": "Legacy File Server SMB Configuration",
        "description": "SMB protocol configuration for the legacy file server.",
        "configuration_type": "File Services",
        "category": "Network Security",
        "asset_id": "AST-012",
        "asset_name": "Legacy File Server",
        "environment": "Production",
        "baseline": "Windows Server Security Baseline",
        "baseline_version": "3.0",
        "compliance_status": "NON_COMPLIANT",
        "severity": "CRITICAL",
        "current_value": "SMBv1 enabled",
        "expected_value": "SMBv1 disabled; SMBv2/SMBv3 required",
        "control_reference": "WIN-SMB-001",
        "remediation": "Disable SMBv1 and verify that dependent applications support SMBv2 or SMBv3.",
        "owner": "Infrastructure Security",
    },
    {
        "configuration_id": "CFG-013",
        "name": "Endpoint Antivirus Protection",
        "description": "Endpoint protection configuration for corporate endpoints.",
        "configuration_type": "Endpoint",
        "category": "Endpoint Security",
        "asset_id": "AST-008",
        "asset_name": "Employee Laptop - Finance",
        "environment": "Corporate",
        "baseline": "Endpoint Security Baseline",
        "baseline_version": "5.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Real-time protection enabled; signatures updated",
        "expected_value": "Real-time protection enabled; signatures updated",
        "control_reference": "ENDP-AV-001",
        "remediation": "No remediation required.",
        "owner": "Endpoint Security",
    },
    {
        "configuration_id": "CFG-014",
        "name": "Production Server Audit Logging",
        "description": "Operating system audit logging configuration for production servers.",
        "configuration_type": "Logging",
        "category": "Audit",
        "asset_id": "AST-001",
        "asset_name": "Production Web Server",
        "environment": "Production",
        "baseline": "CIS Linux Server Benchmark",
        "baseline_version": "2.0.0",
        "compliance_status": "COMPLIANT",
        "severity": "LOW",
        "current_value": "Authentication and privileged activity logging enabled",
        "expected_value": "Authentication and privileged activity logging enabled",
        "control_reference": "CIS-4.2",
        "remediation": "No remediation required.",
        "owner": "Security Operations",
    },
    {
        "configuration_id": "CFG-015",
        "name": "Application Server TLS Configuration",
        "description": "TLS configuration for secure application communications.",
        "configuration_type": "TLS",
        "category": "Cryptography",
        "asset_id": "AST-002",
        "asset_name": "Production Application Server",
        "environment": "Production",
        "baseline": "Application Security Baseline",
        "baseline_version": "2.3",
        "compliance_status": "PARTIALLY_COMPLIANT",
        "severity": "MEDIUM",
        "current_value": "TLS 1.2 enabled; TLS 1.0 disabled; legacy cipher suite detected",
        "expected_value": "TLS 1.2/1.3 enabled; legacy cipher suites disabled",
        "control_reference": "TLS-SEC-001",
        "remediation": "Remove legacy cipher suites and restrict TLS configuration to approved secure suites.",
        "owner": "Application Security",
    },
]


def seed_security_configurations():
    db = SessionLocal()

    created = 0
    updated = 0

    try:
        for data in configurations:
            existing = (
                db.query(SecurityConfiguration)
                .filter(
                    SecurityConfiguration.configuration_id
                    == data["configuration_id"]
                )
                .first()
            )

            if existing:
                for field, value in data.items():
                    setattr(existing, field, value)

                existing.last_checked = datetime.utcnow()
                updated += 1
                continue

            configuration = SecurityConfiguration(
                **data,
                last_checked=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            db.add(configuration)
            created += 1

        db.commit()

        print("Security configuration seed completed.")
        print(f"Created: {created}")
        print(f"Updated: {updated}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_security_configurations()