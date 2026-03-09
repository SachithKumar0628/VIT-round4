import random
import time
from typing import Dict, Any

class VehicleProfile:
    def __init__(self, vehicle_type: str, model: str):
        self.vehicle_type = vehicle_type
        self.model = model
        self.state = {}
        self.active_faults = {}
        self.tick_count = 0
        self.start_time = time.time()
        
    def initialize_state(self):
        if self.vehicle_type == 'ICE':
            self.state = {
                'coolant_temp': 20.0,
                'oil_pressure': 40.0,
                'rpm': 0,
                'speed': 0,
                'brake_fluid': 100.0,
            }
        else:
            self.state = {
                'battery_soc': 100.0,
                'cell_voltage_delta': 0.01,
                'inverter_temp': 30.0,
                'speed': 0,
                'brake_fluid': 100.0,
            }

    def trigger_fault(self, parameter: str):
        """Triggers a fault that drifts over 60s"""
        self.active_faults[parameter] = {
            'start_tick': self.tick_count,
            'duration_ticks': 30,  # 60s at 2s per tick
        }

    def simulate_tick(self):
        random.seed(time.time() + self.tick_count)
        self.tick_count += 1
        
        if self.vehicle_type == 'ICE':
            target_temp = 90.0
            if self.state['coolant_temp'] < target_temp:
                self.state['coolant_temp'] += (target_temp - self.state['coolant_temp']) * 0.05 + random.gauss(0, 0.5)
            else:
                self.state['coolant_temp'] += random.gauss(0, 1.0)
                
            if self.tick_count > 5:
                self.state['rpm'] = max(800, min(6000, self.state['rpm'] + random.gauss(0, 200)))
                self.state['speed'] = max(0, self.state['rpm'] * 0.015 + random.gauss(0, 2))
                self.state['oil_pressure'] = max(10, 40 + (self.state['rpm'] - 1000) * 0.005 + random.gauss(0, 1.0))
            else:
                self.state['rpm'] = 800 + random.gauss(0, 50)
                self.state['speed'] = 0
            
        else:
            if self.tick_count > 5:
                self.state['speed'] = max(0, self.state['speed'] + random.gauss(0, 5))
                discharge_rate = 0.05 + (self.state['speed'] * 0.001)
                self.state['battery_soc'] = max(0.0, self.state['battery_soc'] - discharge_rate - random.gauss(0, 0.01))
            
            self.state['cell_voltage_delta'] = max(0.01, self.state['cell_voltage_delta'] + random.gauss(0.001, 0.005))
            self.state['inverter_temp'] = max(20.0, 30.0 + (100 - self.state['battery_soc']) * 0.05 + random.gauss(0, 0.5))

        if 'brake_fluid' in self.state:
            self.state['brake_fluid'] += random.gauss(0, 0.05)
            
        for param, fault_info in list(self.active_faults.items()):
            ticks_elapsed = self.tick_count - fault_info['start_tick']
            if ticks_elapsed <= fault_info['duration_ticks']:
                if param == 'brake_fluid' and param in self.state:
                    self.state[param] -= (50.0 / fault_info['duration_ticks']) 
                elif param == 'cell_voltage_delta' and param in self.state:
                    self.state[param] += (0.5 / fault_info['duration_ticks'])
                elif param == 'oil_pressure' and param in self.state:
                    self.state[param] -= (30.0 / fault_info['duration_ticks']) + random.gauss(0, 3.0)
                elif param == 'rpm' and param in self.state:
                    self.state[param] += (2000.0 / fault_info['duration_ticks'])
                    self.state['speed'] -= (20.0 / fault_info['duration_ticks'])
                elif param == 'coolant_temp' and param in self.state:
                    self.state[param] += (40.0 / fault_info['duration_ticks'])
                elif param == 'battery_soc' and param in self.state:
                    self.state[param] -= (3.0 / fault_info['duration_ticks'])
                elif param == 'inverter_temp' and param in self.state:
                    self.state[param] += (30.0 / fault_info['duration_ticks'])

        return {
            'timestamp': time.time(),
            'vehicle_type': self.vehicle_type,
            'model': self.model,
            'state': self.state.copy(),
            'active_faults': list(self.active_faults.keys())
        }

class VehicleFactory:
    @staticmethod
    def create_vehicle(vehicle_type: str, model: str = None) -> VehicleProfile:
        if vehicle_type == 'EV':
            v = VehicleProfile('EV', model or 'Generic EV')
        else:
            v = VehicleProfile('ICE', model or 'Generic ICE')
        v.initialize_state()
        return v
