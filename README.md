# BehavGuard

BehavGuard is a React prototype for an AI-driven EDR agent focused on endpoint anomaly detection. It follows the FYP proposal by presenting endpoint telemetry, anomaly scores, MITRE ATT&CK context, risk levels, and controlled response actions in one security operations dashboard.

## Implemented Proposal Areas

- Endpoint telemetry view for Sysmon, OSQuery, and Elastic Beats style events
- AI anomaly scoring with Low, Medium, and High risk classification
- MITRE ATT&CK tactic and technique enrichment for suspicious behavior
- Alert queue with risk filtering and event drill-down
- Controlled response actions for process termination, isolation, and false positive approval
- Simulated attack injection for demonstration and testing
- Model threshold control to show risk-based alert tuning

## Run Locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Set the backend API base URL before running the app:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

This Create React App scaffold also accepts `REACT_APP_API_BASE_URL` as a local compatibility fallback.

## Verify

```bash
npm test -- --watchAll=false
npm run build
```

## Auth Backend

Run the Express auth API:

```bash
npm run server:dev
```

The backend listens on `http://localhost:5000` by default and exposes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /alerts/stats`
- `GET /alerts`
- `PATCH /alerts/:alertId/status`
- `GET /telemetry/stats`
- `GET /telemetry/processes`
- `GET /telemetry/files`
- `GET /telemetry/registry`
- `GET /telemetry/resources`
- `GET /telemetry/network`
- `GET /telemetry/persistence`
- `GET /telemetry/:eventId`
- `GET /false-positives/stats`
- `GET /false-positives/review`
- `POST /false-positives/feedback`
- `GET /false-positives/whitelist`
- `POST /false-positives/whitelist`
- `GET /false-positives/tuning`
- `PATCH /false-positives/tuning`
- `GET /false-positives/metrics`
- `GET /health`

Copy `server/.env.example` to `server/.env` or set equivalent environment variables before production use. Replace the default JWT secrets with long random values. The development repository stores users in `server/data/users.json`; replace the repository layer with a database before deploying in a real environment.

## Real Endpoint Telemetry Collection

The dashboard can ingest real Windows endpoint telemetry through the backend ingestion API. Start the backend, then run the collector:

```bash
npm run server:dev
npm run collector:once
```

The collector posts to `POST /ingest/telemetry` with `x-ingest-api-key`. By default local development uses `dev-ingest-key`; set `INGEST_API_KEY` in production. The collector gathers:

- running processes
- established network connections when available
- recent temp-file activity
- registry Run key persistence indicators
- scheduled-task persistence indicators when available
- CPU, memory, and disk usage

Collected telemetry is stored in SQLite at `server/data/db/behavguard.sqlite` and served through the protected `/telemetry/*` APIs that the React dashboard already consumes.

Live alerts are generated automatically during telemetry ingestion when rule-based conditions are met, such as critical severity, risk score >= 85, suspicious PowerShell/rundll32 execution, persistence indicators, or high-risk telemetry. Alerts are stored in SQLite and available in the protected `/alerts` dashboard.

For continuous collection:

```bash
npm run collector:loop
```

To install the collector as a Windows startup task, run PowerShell as Administrator:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-collector-task.ps1 -ApiUrl "http://YOUR_BACKEND_HOST:5000/ingest/telemetry" -IngestApiKey "YOUR_INGEST_KEY" -IntervalSeconds 30
```

For Sysmon and OSQuery integration starters:

- Sysmon config: `server/sysmon/behavguard-sysmon-config.xml`
- OSQuery pack: `server/osquery/behavguard-pack.conf`

Multiple endpoints are supported by installing the collector task on each endpoint and pointing all of them to the same backend API URL and ingest key.

## Future Extensions

- Connect the telemetry cards to real OSQuery or Sysmon logs
- Store alerts in Elasticsearch and mirror them into Kibana
- Replace simulated scoring with a Python anomaly detection service using Isolation Forest or One-Class SVM
- Add authenticated analyst accounts and audit logging for response actions

## Telemetry Frontend Contract

The React app does not collect endpoint telemetry directly. The backend is responsible for OSQuery, Sysmon, Elastic Beats, and pipeline ingestion. The frontend consumes these authenticated API routes:

- `GET /telemetry/stats`
- `GET /telemetry/processes`
- `GET /telemetry/files`
- `GET /telemetry/registry`
- `GET /telemetry/resources`
- `GET /telemetry/network`
- `GET /telemetry/persistence`
- `GET /telemetry/:eventId`

Telemetry list endpoints accept `endpoint`, `severity`, `minRiskScore`, `from`, `to`, `search`, `page`, and `limit` query parameters.

## False Positive Reduction Frontend Contract

The React app does not retrain ML models directly. It sends analyst decisions, whitelist rules, and threshold updates to the backend. The backend uses this feedback for detection tuning and false-positive reduction.

- `GET /false-positives/stats`
- `GET /false-positives/review`
- `POST /false-positives/feedback`
- `GET /false-positives/whitelist`
- `POST /false-positives/whitelist`
- `GET /false-positives/tuning`
- `PATCH /false-positives/tuning`
- `GET /false-positives/metrics`

False-positive list endpoints accept `endpoint`, `severity`, `modelName`, `processName`, `from`, `to`, `search`, `page`, and `limit` query parameters.
