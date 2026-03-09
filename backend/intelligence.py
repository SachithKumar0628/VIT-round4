import numpy as np
from typing import Dict, Any, List

class RiskMultiplierEngine:
    def __init__(self):
        self.history: Dict[str, List[float]] = {}
        self.max_history = 100

    def calculate_fpi(self, vehicle_data: Dict[str, Any]) -> float:
        """FPI is Failure Probability Index (0-100)"""
        fpi = 0.0
        state = vehicle_data['state']
        v_type = vehicle_data['vehicle_type']
        
        for k, v in state.items():
            if k not in self.history:
                self.history[k] = []
            self.history[k].append(v)
            if len(self.history[k]) > self.max_history:
                self.history[k].pop(0)

        if v_type == 'ICE':
            if 'coolant_temp' in self.history and len(self.history['coolant_temp']) > 5:
                slope = self.history['coolant_temp'][-1] - self.history['coolant_temp'][-5]
                if slope > 5.0:
                    fpi += 15.0
                if state.get('coolant_temp', 0) > 105:
                    fpi += 30.0
            
            if 'oil_pressure' in self.history and len(self.history['oil_pressure']) > 10:
                jitter = np.std(self.history['oil_pressure'][-10:])
                if jitter > 5.0:
                    fpi += 20.0
            
            if 'rpm' in self.history and 'speed' in self.history and len(self.history['rpm']) > 10:
                rpm_vals = self.history['rpm'][-10:]
                speed_vals = self.history['speed'][-10:]
                if np.std(rpm_vals) > 0 and np.std(speed_vals) > 0:
                    correlation = np.corrcoef(rpm_vals, speed_vals)[0, 1]
                    if correlation < 0.2:
                        fpi += 25.0

        elif v_type == 'EV':
            if 'battery_soc' in self.history and len(self.history['battery_soc']) > 5:
                slope = self.history['battery_soc'][-1] - self.history['battery_soc'][-5]
                if slope < -2.0:
                    fpi += 25.0
                    
            if state.get('cell_voltage_delta', 0) > 0.05:
                fpi += 15.0
            if state.get('cell_voltage_delta', 0) > 0.2:
                fpi += 30.0
                
            if 'inverter_temp' in self.history and len(self.history['inverter_temp']) > 10:
                jitter = np.std(self.history['inverter_temp'][-10:])
                if jitter > 2.0:
                    fpi += 15.0
            if state.get('inverter_temp', 0) > 80:
                fpi += 30.0

        if state.get('brake_fluid', 100) < 60:
            fpi += 50.0

        anomalies = self.detect_anomalies(state)
        fpi += len(anomalies) * 10.0
        
        return min(max(fpi, 0.0), 100.0)

    def calculate_health_score(self, vehicle_data: Dict[str, Any]) -> float:
        """Health Score is inverse of FPI: 100 = perfect, 0 = critical"""
        fpi = self.calculate_fpi(vehicle_data)
        return round(100.0 - fpi, 1)

    def detect_anomalies(self, state: Dict[str, float]) -> List[str]:
        anomalies = []
        for k, v in state.items():
            if k in self.history and len(self.history[k]) > 10:
                mean = np.mean(self.history[k][:-1])
                std = np.std(self.history[k][:-1])
                if std > 0:
                    z_score = abs((v - mean) / std)
                    if z_score > 3.0:
                        anomalies.append(k)
        return anomalies

    def estimate_rul(self, parameter: str) -> float:
        """Linear trend estimator for Remaining Useful Life"""
        if parameter not in self.history or len(self.history[parameter]) < 10:
            return -1.0
            
        y = np.array(self.history[parameter])
        x = np.arange(len(y))
        
        try:
            slope, intercept = np.polyfit(x, y, 1)
        except:
            return -1.0
            
        if slope == 0:
            return 9999.0
            
        if parameter == 'brake_fluid' and slope < 0:
            current = y[-1]
            ticks_to_fail = -(current - 20) / slope
            return ticks_to_fail * 2.0 if ticks_to_fail > 0 else 0.0
            
        if parameter == 'battery_soc' and slope < 0:
            current = y[-1]
            ticks_to_fail = -current / slope
            return ticks_to_fail * 2.0 if ticks_to_fail > 0 else 0.0
            
        if parameter == 'cell_voltage_delta' and slope > 0:
            current = y[-1]
            ticks_to_fail = (0.5 - current) / slope
            return ticks_to_fail * 2.0 if ticks_to_fail > 0 else 0.0

        if parameter == 'coolant_temp' and slope > 0:
            current = y[-1]
            ticks_to_fail = (120 - current) / slope
            return ticks_to_fail * 2.0 if ticks_to_fail > 0 else 0.0

        if parameter == 'inverter_temp' and slope > 0:
            current = y[-1]
            ticks_to_fail = (90 - current) / slope
            return ticks_to_fail * 2.0 if ticks_to_fail > 0 else 0.0

        return -1.0
