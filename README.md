# CyberSentinel

A full-stack cybersecurity monitoring and Security Operations Center (SOC) dashboard.

CyberSentinel brings together security monitoring, threat detection, incident investigation, network visibility, and security management in one interface.

## Key Features

- SOC Dashboard and Security Metrics
- Security Alerts and Incident Management
- Endpoint Monitoring and Telemetry
- Network Security Monitoring
- Live Network Investigations
- Network Threat Detection
- Windows Firewall Monitoring
- Vulnerability Management
- Threat Intelligence
- File Integrity Monitoring
- Process Monitoring
- Digital Forensics
- Audit Logs and Security Reports
- Risk and Compliance Management
- Security Policies and Playbooks
- User Management and Role-Based Access Control

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Recharts
- Framer Motion
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT Authentication
- Argon2 Password Hashing
- psutil
## Project Structure

- `backend/` — FastAPI backend, API routes, authentication and services.
- `backend/tests/` — Backend security and API tests.
- `frontend/` — React and TypeScript application.
- `README.md` — Project documentation.


## Backend Setup

Open PowerShell in the backend directory:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Set the CYBERSENTINEL_JWT_SECRET environment variable to a secure random value before starting the backend.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

API documentation: http://127.0.0.1:8001/docs

## Frontend Setup

Open a second PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.
Keep the backend and frontend running in separate terminals.

## Testing

### Backend Tests

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
$env:CYBERSENTINEL_JWT_SECRET = "test-only-secret-not-for-production"
$env:PYTHONPATH = (Get-Location).Path
python -m pytest tests -v
```

### Frontend Production Build

```powershell
cd frontend
npm run build
```

## Security Notes

- Passwords are hashed using Argon2.
- API authentication uses signed JWT access tokens.
- Role-based access control supports Admin, Analyst and Viewer.
- Keep secrets and credentials private.
- Never commit passwords, tokens or environment secrets.
- Use this project only for authorized security monitoring and testing.

## License

No license has been specified yet.
