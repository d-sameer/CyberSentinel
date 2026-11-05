import json
import subprocess
import logging

logger = logging.getLogger("cybersentinel.firewall")


def get_firewall_data(limit: int = 200) -> dict:
    if limit < 1 or limit > 500:
        raise ValueError("Limit must be between 1 and 500.")

    script = r"""
$ErrorActionPreference = 'Stop'
$profiles = @(Get-NetFirewallProfile -PolicyStore ActiveStore |
    Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction)
$allRules = @(Get-NetFirewallRule -PolicyStore ActiveStore)
$rules = @($allRules | Select-Object -First LIMIT_PLACEHOLDER |
    Select-Object Name, DisplayName, Enabled, Direction, Action, Profile, PolicyStoreSourceType)
$result = @{
    profiles = $profiles
    summary = @{
        total_rules = $allRules.Count
        enabled_rules = @($allRules | Where-Object { $_.Enabled -eq 'True' }).Count
        inbound_rules = @($allRules | Where-Object { $_.Direction -eq 'Inbound' }).Count
        outbound_rules = @($allRules | Where-Object { $_.Direction -eq 'Outbound' }).Count
    }
    rules = $rules
    source = 'Windows Defender Firewall - ActiveStore'
}
$result | ConvertTo-Json -Depth 5 -Compress
""".replace("LIMIT_PLACEHOLDER", str(limit))

    try:
        completed = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True, text=True, timeout=30, check=False,
        )
        if completed.returncode != 0:
            logger.error("Firewall PowerShell error: %s", completed.stderr)
            raise RuntimeError(completed.stderr.strip() or "Firewall query failed.")

        payload = json.loads(completed.stdout)
        if not isinstance(payload, dict):
            raise RuntimeError("Unexpected firewall response.")
        return payload

    except FileNotFoundError as exc:
        raise RuntimeError("Windows PowerShell is unavailable.") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Firewall query timed out.") from exc
    except json.JSONDecodeError as exc:
        logger.error("Invalid firewall JSON response.")
        raise RuntimeError("Unable to parse firewall information.") from exc

def get_firewall_rule_details(rule_name: str) -> dict:
    import base64

    if not rule_name or len(rule_name) > 512:
        raise ValueError("Invalid firewall rule name.")

    encoded_name = base64.b64encode(rule_name.encode("utf-8")).decode("ascii")

    script = r"""
$ErrorActionPreference = 'Stop'
$ruleName = [System.Text.Encoding]::UTF8.GetString(
    [System.Convert]::FromBase64String('ENCODED_NAME')
)
$rule = Get-NetFirewallRule -Name $ruleName -PolicyStore ActiveStore -ErrorAction Stop

$port = @($rule | Get-NetFirewallPortFilter)
$address = @($rule | Get-NetFirewallAddressFilter)
$app = @($rule | Get-NetFirewallApplicationFilter)
$service = @($rule | Get-NetFirewallServiceFilter)
$interface = @($rule | Get-NetFirewallInterfaceTypeFilter)

$result = @{
    rule = @{
        Name = $rule.Name
        DisplayName = $rule.DisplayName
        Description = $rule.Description
        Enabled = $rule.Enabled
        Direction = $rule.Direction
        Action = $rule.Action
        Profile = $rule.Profile
        PolicyStoreSource = $rule.PolicyStoreSource
        PolicyStoreSourceType = $rule.PolicyStoreSourceType
        Protocol = @($port | ForEach-Object { $_.Protocol })
        LocalPort = @($port | ForEach-Object { $_.LocalPort })
        RemotePort = @($port | ForEach-Object { $_.RemotePort })
        LocalAddress = @($address | ForEach-Object { $_.LocalAddress })
        RemoteAddress = @($address | ForEach-Object { $_.RemoteAddress })
        Program = @($app | ForEach-Object { $_.Program })
        Package = @($app | ForEach-Object { $_.Package })
        Service = @($service | ForEach-Object { $_.Service })
        InterfaceType = @($interface | ForEach-Object { $_.InterfaceType })
    }
    source = 'Windows Defender Firewall - ActiveStore'
    read_only = $true
}
$result | ConvertTo-Json -Depth 7 -Compress
""".replace("ENCODED_NAME", encoded_name)

    try:
        completed = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True, text=True, timeout=30, check=False,
        )
        if completed.returncode != 0:
            logger.error("Firewall rule detail query failed: %s", completed.stderr)
            raise RuntimeError(
                completed.stderr.strip() or "Firewall rule lookup failed."
            )

        payload = json.loads(completed.stdout)
        if not isinstance(payload, dict) or not isinstance(payload.get("rule"), dict):
            raise RuntimeError("Unexpected firewall rule detail response.")
        return payload

    except FileNotFoundError as exc:
        raise RuntimeError("Windows PowerShell is unavailable.") from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Firewall rule query timed out.") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError("Unable to parse firewall rule details.") from exc