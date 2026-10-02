from datetime import date

from app.database import Base, SessionLocal, engine
from app.models.exception import SecurityException


Base.metadata.create_all(bind=engine)


exceptions = [
    SecurityException(
        exception_id="EXC-001",
        title="Legacy Endpoint Patch Deferral",
        description=(
            "Temporary exception for legacy endpoints that "
            "cannot receive the current security patch without "
            "application compatibility testing."
        ),
        category="Vulnerability Management",
        status="APPROVED",
        severity="HIGH",
        requester="Endpoint Engineering",
        owner="Security Operations",
        approver="CISO Office",
        justification=(
            "Immediate patching may interrupt critical legacy "
            "applications. A controlled remediation window is "
            "required."
        ),
        compensating_controls=(
            "Enhanced endpoint monitoring, network segmentation, "
            "restricted administrative access, and weekly "
            "vulnerability review."
        ),
        requested_date=date(2026, 8, 12),
        expiry_date=date(2026, 12, 15),
        related_policy_ids="POL-003,POL-007",
        related_risk_ids="RSK-001,RSK-008",
        related_control_ids="CIS-07,CIS-08",
        related_vulnerability_ids="VUL-001,VUL-003",
    ),

    SecurityException(
        exception_id="EXC-002",
        title="Privileged Access Review Extension",
        description=(
            "Temporary extension for completing a privileged "
            "access review for selected administrative accounts."
        ),
        category="Access Control",
        status="UNDER_REVIEW",
        severity="HIGH",
        requester="Identity Security",
        owner="Identity Security",
        approver="CISO Office",
        justification=(
            "Additional validation is required for legacy "
            "administrative accounts before access changes "
            "are applied."
        ),
        compensating_controls=(
            "MFA enforcement, privileged session monitoring, "
            "restricted administrative access, and daily "
            "access review."
        ),
        requested_date=date(2026, 9, 5),
        expiry_date=date(2026, 11, 30),
        related_policy_ids="POL-002",
        related_risk_ids="RSK-007",
        related_control_ids="CIS-06,ISO-A.08.02",
        related_vulnerability_ids="",
    ),

    SecurityException(
        exception_id="EXC-003",
        title="Security Monitoring Coverage Gap",
        description=(
            "Temporary exception for systems that are not yet "
            "fully integrated with centralized security telemetry."
        ),
        category="Security Monitoring",
        status="REQUESTED",
        severity="MEDIUM",
        requester="SOC Engineering",
        owner="SOC Engineering",
        approver="Security Operations",
        justification=(
            "Telemetry integration requires additional agent "
            "deployment and validation across the remaining "
            "systems."
        ),
        compensating_controls=(
            "Manual log review, network monitoring, endpoint "
            "health checks, and daily SOC validation."
        ),
        requested_date=date(2026, 9, 18),
        expiry_date=date(2026, 12, 31),
        related_policy_ids="POL-005",
        related_risk_ids="RSK-004",
        related_control_ids="CIS-08,NIST-DE.CM",
        related_vulnerability_ids="",
    ),

    SecurityException(
        exception_id="EXC-004",
        title="Critical Vulnerability Remediation Window",
        description=(
            "Temporary exception for a critical vulnerability "
            "requiring an approved maintenance window."
        ),
        category="Vulnerability Management",
        status="APPROVED",
        severity="CRITICAL",
        requester="Infrastructure Security",
        owner="Security Operations",
        approver="CISO Office",
        justification=(
            "Emergency remediation requires coordinated "
            "maintenance to avoid service disruption."
        ),
        compensating_controls=(
            "Network isolation, enhanced IDS monitoring, "
            "restricted exposure, and continuous vulnerability "
            "tracking."
        ),
        requested_date=date(2026, 9, 1),
        expiry_date=date(2026, 10, 20),
        related_policy_ids="POL-003",
        related_risk_ids="RSK-001",
        related_control_ids="CIS-07,NIST-ID.RA",
        related_vulnerability_ids="VUL-003",
    ),

    SecurityException(
        exception_id="EXC-005",
        title="Security Awareness Training Extension",
        description=(
            "Temporary exception for users who require "
            "additional time to complete mandatory security "
            "awareness training."
        ),
        category="Security Awareness",
        status="REJECTED",
        severity="MEDIUM",
        requester="Human Resources",
        owner="GRC Team",
        approver="GRC Manager",
        justification=(
            "Additional completion time was requested due to "
            "extended employee leave."
        ),
        compensating_controls=(
            "Targeted training reminders and manager follow-up."
        ),
        requested_date=date(2026, 8, 20),
        expiry_date=date(2026, 10, 10),
        related_policy_ids="POL-008",
        related_risk_ids="RSK-002",
        related_control_ids="ISO-A.06.03,CIS-14",
        related_vulnerability_ids="",
    ),

    SecurityException(
        exception_id="EXC-006",
        title="Data Protection Control Implementation Delay",
        description=(
            "Temporary exception for delayed implementation of "
            "a data protection control while the required "
            "technical capability is being deployed."
        ),
        category="Data Protection",
        status="APPROVED",
        severity="HIGH",
        requester="Data Protection Team",
        owner="GRC Team",
        approver="CISO Office",
        justification=(
            "The required technical capability is undergoing "
            "deployment and validation."
        ),
        compensating_controls=(
            "Restricted data access, enhanced audit logging, "
            "manual review, and data handling monitoring."
        ),
        requested_date=date(2026, 7, 15),
        expiry_date=date(2026, 11, 15),
        related_policy_ids="POL-006",
        related_risk_ids="RSK-006",
        related_control_ids="ISO-A.08.10,SOC-2-CC6",
        related_vulnerability_ids="",
    ),

    SecurityException(
        exception_id="EXC-007",
        title="Endpoint Security Baseline Deviation",
        description=(
            "Temporary exception for endpoints that require "
            "additional validation before the new security "
            "baseline can be enforced."
        ),
        category="Endpoint Security",
        status="EXPIRED",
        severity="MEDIUM",
        requester="Endpoint Security",
        owner="Endpoint Security",
        approver="Security Operations",
        justification=(
            "Legacy endpoint configuration requires review "
            "before baseline enforcement."
        ),
        compensating_controls=(
            "Endpoint monitoring, restricted network access, "
            "and manual configuration review."
        ),
        requested_date=date(2026, 5, 10),
        expiry_date=date(2026, 8, 31),
        related_policy_ids="POL-007",
        related_risk_ids="RSK-004,RSK-008",
        related_control_ids="CIS-04,CIS-08",
        related_vulnerability_ids="",
    ),

    SecurityException(
        exception_id="EXC-008",
        title="Incident Response Process Exception",
        description=(
            "Temporary exception for a documented deviation "
            "from the standard incident response workflow "
            "during a specialized investigation."
        ),
        category="Incident Response",
        status="REVOKED",
        severity="LOW",
        requester="SOC Operations",
        owner="SOC Operations",
        approver="SOC Manager",
        justification=(
            "Specialized investigation requirements required "
            "a temporary deviation from the standard process."
        ),
        compensating_controls=(
            "Senior analyst approval, investigation logging, "
            "evidence preservation, and post-incident review."
        ),
        requested_date=date(2026, 6, 1),
        expiry_date=date(2026, 9, 30),
        related_policy_ids="POL-004",
        related_risk_ids="RSK-005",
        related_control_ids="NIST-RS.MA,SOC-2-CC7",
        related_vulnerability_ids="",
    ),
]


db = SessionLocal()

try:
    existing_ids = {
        row.exception_id
        for row in db.query(SecurityException).all()
    }

    added = 0

    for exception in exceptions:
        if exception.exception_id in existing_ids:
            continue

        db.add(exception)
        added += 1

    db.commit()

    print(
        f"Security exception seed complete. "
        f"Added {added} records."
    )

finally:
    db.close()