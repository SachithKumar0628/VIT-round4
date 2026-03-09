import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import {
    Activity, Gauge, Thermometer, Fuel, Battery, Zap,
    AlertTriangle, TrendingDown, TrendingUp, Heart, Lock,
    Unlock, Radio, Droplets, RotateCcw
} from 'lucide-react';
import './Telemetry.css';

function AnimatedGauge({ value, max, label, unit, color, icon: Icon }) {
    const pct = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="tele-gauge">
            <svg viewBox="0 0 100 100" className="tele-gauge-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gray-200)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <div className="tele-gauge-center">
                <span className="tele-gauge-value">{typeof value === 'number' ? value.toFixed(1) : '---'}</span>
                <span className="tele-gauge-unit">{unit}</span>
            </div>
            <div className="tele-gauge-label"><Icon size={13} /> {label}</div>
        </div>
    );
}

function HealthBar({ score }) {
    const getColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#f59e0b';
        if (s >= 40) return '#f97316';
        return '#ef4444';
    };
    return (
        <div className="tele-health-bar">
            <div className="tele-health-fill" style={{ width: `${score}%`, background: getColor(score), transition: 'width 1s ease-out, background 0.5s' }} />
        </div>
    );
}

export default function Telemetry() {
    const { wsData, sendCommand } = useData();
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const vehicles = wsData?.data || [];
    const alerts = wsData?.alerts || [];

    const selected = selectedVehicle ? vehicles.find(v => v.id === selectedVehicle) : vehicles[0];

    const handleFaultInject = (vehicleId, param) => {
        sendCommand({ action: 'injectFault', vehicle_id: vehicleId, parameter: param });
    };

    const handleUnlock = (vehicleId) => {
        sendCommand({ action: 'unlockVehicle', vehicle_id: vehicleId });
    };

    return (
        <div className="telemetry-page">
            <div className="page-header">
                <div>
                    <h1>Live Telemetry</h1>
                    <p>Real-time vehicle telemetry stream via WebSocket</p>
                </div>
                <div className="tele-live-badge"><Radio size={14} /> <span>LIVE</span></div>
            </div>

            {/* Fleet Status Grid */}
            <div className="tele-fleet-grid">
                {vehicles.map((v, i) => (
                    <motion.div
                        key={v.id}
                        className={`tele-fleet-card ${selectedVehicle === v.id || (!selectedVehicle && i === 0) ? 'active' : ''} ${v.locked ? 'locked' : ''}`}
                        onClick={() => setSelectedVehicle(v.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        <div className="tele-fleet-card-top">
                            <span className="tele-fleet-id">{v.id}</span>
                            {v.locked && <Lock size={14} className="tele-lock-icon" />}
                        </div>
                        <HealthBar score={v.health_score || 0} />
                        <div className="tele-fleet-score">{(v.health_score || 0).toFixed(0)}%</div>
                        {v.anomalies?.length > 0 && (
                            <div className="tele-fleet-alert"><AlertTriangle size={12} /> {v.anomalies.length}</div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Selected Vehicle Detail */}
            {selected && (
                <motion.div className="tele-detail-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selected.id}>
                    <div className="tele-detail-header">
                        <div>
                            <h2>{selected.model || selected.id}</h2>
                            <span className="tele-detail-type">{selected.vehicle_type} - {selected.id}</span>
                        </div>
                        <div className="tele-detail-health">
                            <Heart size={18} style={{ color: (selected.health_score || 0) >= 60 ? '#10b981' : '#ef4444' }} />
                            <span className="tele-health-value">{(selected.health_score || 0).toFixed(1)}%</span>
                            <span className="tele-health-label">Health</span>
                        </div>
                    </div>

                    {/* Gauges */}
                    <div className="tele-gauges-row">
                        {selected.vehicle_type === 'ICE' ? (
                            <>
                                <AnimatedGauge value={selected.state?.speed || 0} max={150} label="Speed" unit="km/h" color="#3b82f6" icon={Gauge} />
                                <AnimatedGauge value={selected.state?.coolant_temp || 0} max={130} label="Coolant" unit="°C" color="#ef4444" icon={Thermometer} />
                                <AnimatedGauge value={selected.state?.rpm || 0} max={6000} label="RPM" unit="rpm" color="#8b5cf6" icon={RotateCcw} />
                                <AnimatedGauge value={selected.state?.oil_pressure || 0} max={60} label="Oil Pressure" unit="psi" color="#f59e0b" icon={Droplets} />
                                <AnimatedGauge value={selected.state?.brake_fluid || 0} max={100} label="Brake Fluid" unit="%" color="#10b981" icon={Droplets} />
                            </>
                        ) : (
                            <>
                                <AnimatedGauge value={selected.state?.speed || 0} max={150} label="Speed" unit="km/h" color="#3b82f6" icon={Gauge} />
                                <AnimatedGauge value={selected.state?.battery_soc || 0} max={100} label="Battery SoC" unit="%" color="#10b981" icon={Battery} />
                                <AnimatedGauge value={selected.state?.inverter_temp || 0} max={100} label="Inverter" unit="°C" color="#ef4444" icon={Thermometer} />
                                <AnimatedGauge value={(selected.state?.cell_voltage_delta || 0) * 1000} max={500} label="Cell V Delta" unit="mV" color="#f59e0b" icon={Zap} />
                                <AnimatedGauge value={selected.state?.brake_fluid || 0} max={100} label="Brake Fluid" unit="%" color="#8b5cf6" icon={Droplets} />
                            </>
                        )}
                    </div>

                    {/* Anomalies */}
                    {selected.anomalies?.length > 0 && (
                        <div className="tele-anomaly-section">
                            <h3><AlertTriangle size={16} /> Active Anomalies</h3>
                            <div className="tele-anomaly-list">
                                {selected.anomalies.map(a => (
                                    <div key={a} className="tele-anomaly-tag">
                                        <AlertTriangle size={12} /> {a.replace(/_/g, ' ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fault Injection Controls */}
                    <div className="tele-controls">
                        <h3><Zap size={16} /> Fault Injection (Demo)</h3>
                        <div className="tele-inject-btns">
                            {Object.keys(selected.state || {}).map(param => (
                                <button key={param} className="btn btn-sm btn-secondary tele-inject-btn" onClick={() => handleFaultInject(selected.id, param)}>
                                    {param.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                        {selected.locked && (
                            <button className="btn btn-sm btn-success tele-unlock-btn" onClick={() => handleUnlock(selected.id)}>
                                <Unlock size={14} /> Unlock Vehicle
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Live Alerts Feed */}
            {alerts.length > 0 && (
                <div className="tele-alerts-section">
                    <h3><Activity size={16} /> Live Alert Feed</h3>
                    <div className="tele-alerts-list">
                        {alerts.map((alert, i) => (
                            <motion.div key={i} className={`tele-alert-item ${alert.type === 'vehicle_locked' ? 'alert-critical' : 'alert-warning'}`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                {alert.type === 'vehicle_locked' ? <Lock size={14} /> : <AlertTriangle size={14} />}
                                <div>
                                    <strong>{alert.vehicle_id}</strong>
                                    <span>{alert.reason || `Service job created: ${alert.job?.fault_type}`}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
