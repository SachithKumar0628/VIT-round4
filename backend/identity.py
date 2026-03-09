"""
Digital Twin Registry — Trust & Identity Layer
Manages vehicle identity profiles, owner verification, and insurance validation.
"""
import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta


class OwnerProfile:
    def __init__(self, owner_id: str, name: str, phone: str, verified: bool = False):
        self.owner_id = owner_id
        self.name = name
        self.phone = phone
        self.verified = verified
        self.verified_at: Optional[float] = None

    def verify(self):
        self.verified = True
        self.verified_at = time.time()

    def to_dict(self):
        return {
            'owner_id': self.owner_id,
            'name': self.name,
            'phone': self.phone,
            'verified': self.verified,
            'verified_at': self.verified_at
        }


class VehicleIdentity:
    def __init__(self, vehicle_id: str, vin: str, owner: OwnerProfile,
                 insurance_expiry: str, make: str, model: str, year: int,
                 vehicle_type: str = 'ICE'):
        self.vehicle_id = vehicle_id
        self.vin = vin
        self.owner = owner
        self.insurance_expiry = insurance_expiry  # ISO date string
        self.make = make
        self.model = model
        self.year = year
        self.vehicle_type = vehicle_type
        self.registered_at = time.time()

    def is_insurance_valid(self) -> bool:
        try:
            expiry = datetime.fromisoformat(self.insurance_expiry)
            return expiry > datetime.now()
        except:
            return False

    def days_until_insurance_expiry(self) -> int:
        try:
            expiry = datetime.fromisoformat(self.insurance_expiry)
            delta = expiry - datetime.now()
            return max(delta.days, 0)
        except:
            return -1

    def to_dict(self):
        return {
            'vehicle_id': self.vehicle_id,
            'vin': self.vin,
            'owner': self.owner.to_dict(),
            'insurance_expiry': self.insurance_expiry,
            'insurance_valid': self.is_insurance_valid(),
            'insurance_days_left': self.days_until_insurance_expiry(),
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'vehicle_type': self.vehicle_type,
            'registered_at': self.registered_at
        }


class DigitalTwinRegistry:
    """Manages all vehicle identities and provides gatekeeper auth."""

    def __init__(self):
        self.identities: Dict[str, VehicleIdentity] = {}
        self.owners: Dict[str, OwnerProfile] = {}
        self._seed_data()

    def _seed_data(self):
        """Pre-populate with demo fleet data."""
        owners_data = [
            ('owner-1', 'Arjun Mehta', '+91-9876543210', True),
            ('owner-2', 'Priya Sharma', '+91-9876543211', True),
            ('owner-3', 'Rahul Verma', '+91-9876543212', False),
        ]
        for oid, name, phone, verified in owners_data:
            o = OwnerProfile(oid, name, phone, verified)
            if verified:
                o.verified_at = time.time() - 86400
            self.owners[oid] = o

        now = datetime.now()
        vehicles_data = [
            ('ICE-Bajaj-001', 'BAJ2024IC001234', 'owner-1', (now + timedelta(days=180)).isoformat(), 'Bajaj', 'Pulsar 150', 2024, 'ICE'),
            ('EV-Tesla-002', 'TSL2025EV005678', 'owner-2', (now + timedelta(days=45)).isoformat(), 'Tesla', 'Model 3', 2025, 'EV'),
            ('ICE-Ford-003', 'FRD2023IC009012', 'owner-3', (now - timedelta(days=10)).isoformat(), 'Ford', 'EcoSport', 2023, 'ICE'),
            ('EV-Tata-004', 'TAT2025EV003456', 'owner-1', (now + timedelta(days=365)).isoformat(), 'Tata', 'Nexon EV', 2025, 'EV'),
            ('ICE-Mahindra-005', 'MAH2024IC007890', 'owner-2', (now + timedelta(days=120)).isoformat(), 'Mahindra', 'Thar', 2024, 'ICE'),
            ('EV-MG-006', 'MG2025EV002345', 'owner-1', (now + timedelta(days=30)).isoformat(), 'MG', 'ZS EV', 2025, 'EV'),
            ('ICE-Hyundai-007', 'HYU2024IC006789', 'owner-3', (now + timedelta(days=200)).isoformat(), 'Hyundai', 'Creta', 2024, 'ICE'),
            ('EV-Ather-008', 'ATH2025EV000123', 'owner-2', (now + timedelta(days=90)).isoformat(), 'Ather', '450X', 2025, 'EV'),
        ]
        for vid, vin, oid, ins_exp, make, model, year, vtype in vehicles_data:
            identity = VehicleIdentity(vid, vin, self.owners[oid], ins_exp, make, model, year, vtype)
            self.identities[vid] = identity

    def register_vehicle(self, vehicle_id: str, vin: str, owner_id: str,
                         insurance_expiry: str, make: str, model: str,
                         year: int, vehicle_type: str = 'ICE') -> Optional[VehicleIdentity]:
        if owner_id not in self.owners:
            return None
        identity = VehicleIdentity(vehicle_id, vin, self.owners[owner_id],
                                    insurance_expiry, make, model, year, vehicle_type)
        self.identities[vehicle_id] = identity
        return identity

    def gatekeeper_check(self, vehicle_id: str) -> Dict[str, Any]:
        """Gatekeeper Auth: blocks telemetry if insurance expired or owner unverified."""
        if vehicle_id not in self.identities:
            return {'allowed': False, 'reason': 'Vehicle not registered in Digital Twin Registry'}

        identity = self.identities[vehicle_id]

        if not identity.owner.verified:
            return {'allowed': False, 'reason': f'Owner "{identity.owner.name}" is not verified'}

        if not identity.is_insurance_valid():
            return {'allowed': False, 'reason': f'Insurance expired on {identity.insurance_expiry}'}

        return {'allowed': True, 'reason': 'All checks passed', 'identity': identity.to_dict()}

    def get_all_identities(self) -> List[Dict]:
        return [v.to_dict() for v in self.identities.values()]

    def get_identity(self, vehicle_id: str) -> Optional[Dict]:
        if vehicle_id in self.identities:
            return self.identities[vehicle_id].to_dict()
        return None

    def verify_owner(self, owner_id: str) -> bool:
        if owner_id in self.owners:
            self.owners[owner_id].verify()
            return True
        return False
