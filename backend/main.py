"""
AutoIntel Nexus — Unified Fleet OS Backend
Combines: Telemetry Pipeline, Identity Layer, Diagnosis Engine, Service Ledger
"""
import asyncio
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.engine import VehicleFactory
from backend.intelligence import RiskMultiplierEngine
from backend.identity import DigitalTwinRegistry
from backend.service_ledger import ServiceLedger

app = FastAPI(title="AutoIntel Nexus", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ────────────────────────────────────────────────────
registry = DigitalTwinRegistry()
ledger = ServiceLedger()

# Build fleet from the registry
fleet = {}
engines = {}
locked_vehicles = set()  # Vehicles locked due to low health

for vid, identity in registry.identities.items():
    fleet[vid] = VehicleFactory.create_vehicle(identity.vehicle_type, f"{identity.make} {identity.model}")
    engines[vid] = RiskMultiplierEngine()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()
is_simulating = False


# ─── Telemetry Simulation Loop ───────────────────────────────────────
async def simulation_loop():
    global is_simulating
    if is_simulating:
        return
    is_simulating = True

    while True:
        if len(manager.active_connections) > 0:
            fleet_telemetry = []
            new_alerts = []

            for vid, vehicle in fleet.items():
                # Gatekeeper check
                gate = registry.gatekeeper_check(vid)

                telemetry = vehicle.simulate_tick()
                telemetry['id'] = vid
                telemetry['gatekeeper'] = gate

                if gate['allowed']:
                    # Run Intelligence Layer
                    health_score = engines[vid].calculate_health_score(telemetry)
                    fpi = 100.0 - health_score
                    telemetry['fpi'] = fpi
                    telemetry['health_score'] = health_score

                    # RUL estimates
                    rul_data = {}
                    for param in telemetry['state'].keys():
                        rul = engines[vid].estimate_rul(param)
                        if rul >= 0:
                            rul_data[param] = round(rul, 1)
                    telemetry['rul'] = rul_data

                    # Anomaly detection
                    anomalies = engines[vid].detect_anomalies(telemetry['state'])
                    telemetry['anomalies'] = anomalies

                    # Auto-generate service jobs from anomalies
                    if anomalies:
                        new_jobs = ledger.auto_generate_jobs(vid, anomalies, health_score)
                        for job in new_jobs:
                            new_alerts.append({
                                'type': 'service_job_created',
                                'vehicle_id': vid,
                                'job': job.to_dict()
                            })

                    # Auto-lock vehicle if health < 40
                    if health_score < 40 and vid not in locked_vehicles:
                        locked_vehicles.add(vid)
                        new_alerts.append({
                            'type': 'vehicle_locked',
                            'vehicle_id': vid,
                            'health_score': health_score,
                            'reason': f'Health score dropped to {health_score}% — vehicle descheduled from missions'
                        })

                    telemetry['locked'] = vid in locked_vehicles
                else:
                    telemetry['fpi'] = 0
                    telemetry['health_score'] = 0
                    telemetry['rul'] = {}
                    telemetry['anomalies'] = []
                    telemetry['locked'] = True

                # Add identity info
                identity = registry.get_identity(vid)
                if identity:
                    telemetry['identity'] = identity

                fleet_telemetry.append(telemetry)

            payload = {
                'type': 'fleet_update',
                'data': fleet_telemetry,
                'alerts': new_alerts,
                'open_jobs': ledger.get_all_open_jobs(),
                'timestamp': time.time()
            }
            await manager.broadcast(json.dumps(payload))

        await asyncio.sleep(2.0)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())


# ─── WebSocket Endpoint ──────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            command = json.loads(data)

            if command.get('action') == 'injectFault':
                vid = command.get('vehicle_id')
                param = command.get('parameter')
                if vid in fleet and param:
                    fleet[vid].trigger_fault(param)

            elif command.get('action') == 'verifyOwner':
                owner_id = command.get('owner_id')
                registry.verify_owner(owner_id)

            elif command.get('action') == 'unlockVehicle':
                vid = command.get('vehicle_id')
                if vid in locked_vehicles:
                    locked_vehicles.remove(vid)

            elif command.get('action') == 'completeJob':
                job_id = command.get('job_id')
                notes = command.get('notes', '')
                ledger.complete_job(job_id, notes)

    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─── REST Endpoints ──────────────────────────────────────────────────
@app.get("/health")
def read_health():
    return {"status": "ok", "service": "AutoIntel Nexus"}


@app.get("/api/vehicles")
def get_vehicles():
    return registry.get_all_identities()


@app.get("/api/vehicles/{vehicle_id}/identity")
def get_vehicle_identity(vehicle_id: str):
    identity = registry.get_identity(vehicle_id)
    if identity:
        return identity
    return {"error": "Vehicle not found"}


@app.get("/api/vehicles/{vehicle_id}/service-history")
def get_service_history(vehicle_id: str):
    return ledger.get_vehicle_history(vehicle_id)


@app.get("/api/service-jobs")
def get_service_jobs():
    return ledger.get_all_jobs()


@app.get("/api/service-jobs/open")
def get_open_jobs():
    return ledger.get_all_open_jobs()


@app.get("/api/overdue")
def get_overdue():
    return ledger.get_overdue_vehicles()


@app.get("/api/gatekeeper/{vehicle_id}")
def check_gatekeeper(vehicle_id: str):
    return registry.gatekeeper_check(vehicle_id)
