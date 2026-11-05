from fastapi import APIRouter, HTTPException, Query
from app.services.firewall_service import get_firewall_data

router = APIRouter(
    prefix="/api/firewall",
    tags=["Windows Firewall Security Center"],
)


@router.get("/summary")
def firewall_summary():
    try:
        data = get_firewall_data(limit=1)
        return {
            "profiles": data["profiles"],
            "summary": data["summary"],
            "source": data["source"],
            "read_only": True,
        }
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/rules")
def firewall_rules(limit: int = Query(default=200, ge=1, le=500)):
    try:
        data = get_firewall_data(limit=limit)
        return {
            "total": data["summary"]["total_rules"],
            "returned": len(data["rules"]),
            "rules": data["rules"],
            "source": data["source"],
            "read_only": True,
        }
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

@router.get("/rule")
def firewall_rule_details(name: str = Query(..., min_length=1, max_length=512)):
    from app.services.firewall_service import get_firewall_rule_details

    try:
        return get_firewall_rule_details(name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        status = 404 if "No MSFT_NetFirewallRule objects found" in str(exc) else 503
        raise HTTPException(status_code=status, detail=str(exc)) from exc