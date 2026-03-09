"""
Automated Service Ledger — Governance & Lifecycle Layer
Generates service job cards from detected faults and tracks service history.
"""
import time
from typing import Dict, Any, List, Optional


class ServiceJobCard:
    _counter = 0

    def __init__(self, vehicle_id: str, fault_type: str, severity: str,
                 description: str, health_score: float):
        ServiceJobCard._counter += 1
        self.job_id = f'JOB-{ServiceJobCard._counter:04d}'
        self.vehicle_id = vehicle_id
        self.fault_type = fault_type
        self.severity = severity  # 'low', 'medium', 'high', 'critical'
        self.description = description
        self.health_score_at_creation = health_score
        self.status = 'open'  # 'open', 'in-progress', 'completed'
        self.created_at = time.time()
        self.completed_at: Optional[float] = None
        self.mechanic_notes = ''

    def complete(self, notes: str = ''):
        self.status = 'completed'
        self.completed_at = time.time()
        self.mechanic_notes = notes

    def to_dict(self):
        return {
            'job_id': self.job_id,
            'vehicle_id': self.vehicle_id,
            'fault_type': self.fault_type,
            'severity': self.severity,
            'description': self.description,
            'health_score_at_creation': self.health_score_at_creation,
            'status': self.status,
            'created_at': self.created_at,
            'completed_at': self.completed_at,
            'mechanic_notes': self.mechanic_notes
        }


FAULT_DESCRIPTIONS = {
    'coolant_temp': 'Engine overheating detected — coolant temperature exceeds safe threshold',
    'oil_pressure': 'Oil pressure instability detected — potential lubrication system failure',
    'rpm': 'RPM/Speed decorrelation — possible transmission or clutch issue',
    'brake_fluid': 'Brake fluid critically low — immediate inspection required',
    'battery_soc': 'Rapid battery discharge detected — battery health degradation',
    'cell_voltage_delta': 'Cell voltage imbalance — battery cell degradation',
    'inverter_temp': 'Inverter overheating — power electronics thermal issue',
}


def get_severity(health_score: float) -> str:
    if health_score <= 20:
        return 'critical'
    elif health_score <= 40:
        return 'high'
    elif health_score <= 60:
        return 'medium'
    return 'low'


class ServiceLedger:
    """Tracks all service job cards and service history per vehicle."""

    def __init__(self):
        self.jobs: Dict[str, ServiceJobCard] = {}
        self.vehicle_history: Dict[str, List[str]] = {}  # vehicle_id -> [job_ids]

    def create_job_from_fault(self, vehicle_id: str, fault_type: str,
                               health_score: float) -> ServiceJobCard:
        severity = get_severity(health_score)
        description = FAULT_DESCRIPTIONS.get(fault_type,
            f'Anomaly detected in {fault_type} parameter')

        job = ServiceJobCard(vehicle_id, fault_type, severity, description, health_score)
        self.jobs[job.job_id] = job

        if vehicle_id not in self.vehicle_history:
            self.vehicle_history[vehicle_id] = []
        self.vehicle_history[vehicle_id].append(job.job_id)

        return job

    def auto_generate_jobs(self, vehicle_id: str, anomalies: List[str],
                            health_score: float) -> List[ServiceJobCard]:
        """Called by the telemetry loop when anomalies are detected."""
        new_jobs = []
        
        # Only create jobs for anomalies that don't already have open jobs
        open_faults = set()
        for jid in self.vehicle_history.get(vehicle_id, []):
            job = self.jobs[jid]
            if job.status != 'completed':
                open_faults.add(job.fault_type)

        for anomaly in anomalies:
            if anomaly not in open_faults:
                job = self.create_job_from_fault(vehicle_id, anomaly, health_score)
                new_jobs.append(job)

        return new_jobs

    def get_vehicle_history(self, vehicle_id: str) -> List[Dict]:
        job_ids = self.vehicle_history.get(vehicle_id, [])
        return [self.jobs[jid].to_dict() for jid in job_ids if jid in self.jobs]

    def get_all_open_jobs(self) -> List[Dict]:
        return [j.to_dict() for j in self.jobs.values() if j.status != 'completed']

    def get_all_jobs(self) -> List[Dict]:
        return [j.to_dict() for j in self.jobs.values()]

    def complete_job(self, job_id: str, notes: str = '') -> bool:
        if job_id in self.jobs:
            self.jobs[job_id].complete(notes)
            return True
        return False

    def get_overdue_vehicles(self) -> List[str]:
        """Vehicles with critical open jobs older than 5 minutes (demo speed)."""
        overdue = set()
        now = time.time()
        for job in self.jobs.values():
            if job.status != 'completed' and job.severity in ('critical', 'high'):
                if now - job.created_at > 300:  # 5 min for demo
                    overdue.add(job.vehicle_id)
        return list(overdue)
