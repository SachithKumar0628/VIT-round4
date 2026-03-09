import { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import {
    Brain, AlertTriangle, Activity, Heart, TrendingDown,
    TrendingUp, Shield, Zap, Search, ChevronRight,
    Thermometer, Droplets, Battery, Gauge, RotateCcw
} from 'lucide-react';
import './Diagnosis.css';

const PARAM_ICONS = {
    coolant_temp: Thermometer,
    oil_pressure: Droplets,
    rpm: RotateCcw,
    speed: Gauge,
    brake_fluid: Droplets,
    battery_soc: Battery,
    cell_voltage_delta: Zap,
    inverter_temp: Thermometer,
};

const PARAM_THRESHOLDS = {
    coolant_temp: { warn: 95, critical: 105, unit: '°C', label: 'Coolant Temperature' },
    oil_pressure: { warn: 25, critical: 15, unit: 'psi', label: 'Oil Pressure', inverted: true },
    rpm: { warn: 5000, critical: 5500, unit: 'rpm', label: 'Engine RPM' },
    speed: { warn: 120, critical: 140, unit: 'km/h', label: 'Speed' },
    brake_fluid: { warn: 60, critical: 30, unit: '%', label: 'Brake Fluid', inverted: true },
    battery_soc: { warn: 30, critical: 10, unit: '%', label: 'Battery SoC', inverted: true },
    cell_voltage_delta: { warn: 0.1, critical: 0.3, unit: 'V', label: 'Cell Voltage Delta' },
    inverter_temp: { warn: 70, critical: 85, unit: '°C', label: 'Inverter Temperature' },
};

function getParamStatus(param, value) {
    const t = PARAM_THRESHOLDS[param];
    if (!t) return 'normal';
    if (t.inverted) {
        if (value <= t.critical) return 'critical';
        if (value <= t.warn) return 'warning';
    } else {
        if (value >= t.critical) return 'critical';
        if (value >= t.warn) return 'warning';
    }
    return 'normal';
}

export default function Diagnosis() {
    const { wsData, sendCommand } = useData();
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const vehicles = wsData?.data || [];
    const selected = selectedVehicle ? vehicles.find(v => v.id === selectedVehicle) : null;

    const getHealthColor = (s) => {
        if (s >= 80) return '#10b981';
        if (s >= 60) return '#f59e0b';
        if (s >= 40) return '#f97316';
        return '#ef4444';
    };

    const getHealthLabel = (s) => {
        if (s >= 80) return 'Healthy';
        if (s >= 60) return 'Fair';
        if (s >= 40) return 'At Risk';
        return 'Critical';
    };

    const sortedVehicles = [...vehicles].sort((a, b) => (a.health_score || 0) - (b.health_score || 0));

    return (
        <div className="diagnosis-page">
            <div className="page-header">
                <div>
                    <h1>Diagnosis Engine</h1>
                    <p>AI-Powered Fault Detection, Anomaly Analysis & Health Scoring</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="diag-summary-row">
                <motion.div className="diag-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="diag-summary-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Heart size={20} /></div>
                    <div>
                        <div className="diag-summary-value">{vehicles.filter(v => (v.health_score || 0) >= 80).length}</div>
                        <div className="diag-summary-label">Healthy</div>
                    </div>
                </motion.div>
                <motion.div className="diag-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="diag-summary-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><AlertTriangle size={20} /></div>
                    <div>
                        <div className="diag-summary-value">{vehicles.filter(v => (v.health_score || 0) >= 40 && (v.health_score || 0) < 80).length}</div>
                        <div className="diag-summary-label">At Risk</div>
                    </div>
                </motion.div>
                <motion.div className="diag-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="diag-summary-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><TrendingDown size={20} /></div>
                    <div>
                        <div className="diag-summary-value">{vehicles.filter(v => (v.health_score || 0) < 40).length}</div>
                        <div className="diag-summary-label">Critical</div>
                    </div>
                </motion.div>
                <motion.div className="diag-summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="diag-summary-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Brain size={20} /></div>
                    <div>
                        <div className="diag-summary-value">{vehicles.reduce((sum, v) => sum + (v.anomalies?.length || 0), 0)}</div>
                        <div className="diag-summary-label">Active Anomalies</div>
                    </div>
                </motion.div>
            </div>

            <div className="diag-layout">
                {/* Vehicle List */}
                <div className="diag-vehicle-list">
                    <h3><Activity size={16} /> Fleet Health Ranking</h3>
                    {sortedVehicles.map((v, i) => (
                        <motion.div
                            key={v.id}
                            className={`diag-vehicle-item ${selectedVehicle === v.id ? 'active' : ''}`}
                            onClick={() => setSelectedVehicle(v.id)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <div className="diag-vehicle-rank" style={{ background: getHealthColor(v.health_score || 0) }}>
                                {i + 1}
                            </div>
                            <div className="diag-vehicle-info">
                                <span className="diag-vehicle-name">{v.id}</span>
                                <span className="diag-vehicle-type">{v.vehicle_type}</span>
                            </div>
                            <div className="diag-vehicle-score">
                                <span style={{ color: getHealthColor(v.health_score || 0) }}>{(v.health_score || 0).toFixed(0)}%</span>
                                {v.anomalies?.length > 0 && <AlertTriangle size={14} className="diag-anomaly-icon" />}
                            </div>
                            <ChevronRight size={16} className="diag-chevron" />
                        </motion.div>
                    ))}
                </div>

                {/* Detail Panel */}
                <div className="diag-detail-panel">
                    {selected ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selected.id}>
                            <div className="diag-detail-header">
                                <h2>{selected.model || selected.id}</h2>
                                <div className="diag-health-big" style={{ borderColor: getHealthColor(selected.health_score || 0) }}>
                                    <span className="diag-health-big-value" style={{ color: getHealthColor(selected.health_score || 0) }}>
                                        {(selected.health_score || 0).toFixed(1)}%
                                    </span>
                                    <span className="diag-health-big-label">{getHealthLabel(selected.health_score || 0)}</span>
                                </div>
                            </div>

                            {/* Parameter Analysis */}
                            <div className="diag-params-section">
                                <h3><Shield size={16} /> Parameter Analysis</h3>
                                <div className="diag-params-grid">
                                    {Object.entries(selected.state || {}).map(([param, value]) => {
                                        const status = getParamStatus(param, value);
                                        const threshold = PARAM_THRESHOLDS[param];
                                        const IconComp = PARAM_ICONS[param] || Activity;
                                        const isAnomaly = selected.anomalies?.includes(param);

                                        return (
                                            <div key={param} className={`diag-param-card ${status} ${isAnomaly ? 'anomaly' : ''}`}>
                                                <div className="diag-param-header">
                                                    <IconComp size={16} />
                                                    <span>{threshold?.label || param}</span>
                                                    {isAnomaly && <span className="diag-anomaly-badge">ANOMALY</span>}
                                                </div>
                                                <div className="diag-param-value">
                                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                                    <span className="diag-param-unit">{threshold?.unit || ''}</span>
                                                </div>
                                                <div className="diag-param-bar">
                                                    <div className="diag-param-fill" style={{
                                                        width: `${Math.min(Math.abs(value) / (threshold?.critical * 1.2 || 100) * 100, 100)}%`,
                                                        background: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981'
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FPI Breakdown */}
                            <div className="diag-fpi-section">
                                <h3><TrendingUp size={16} /> Failure Probability Index (FPI)</h3>
                                <div className="diag-fpi-bar-wrapper">
                                    <div className="diag-fpi-bar">
                                        <div className="diag-fpi-fill" style={{
                                            width: `${selected.fpi || 0}%`,
                                            background: `linear-gradient(90deg, #10b981, #f59e0b ${50}%, #ef4444)`
                                        }} />
                                    </div>
                                    <div className="diag-fpi-labels">
                                        <span>0% Safe</span>
                                        <span className="diag-fpi-current">{(selected.fpi || 0).toFixed(1)}%</span>
                                        <span>100% Failure</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fault Injection */}
                            <div className="diag-inject-section">
                                <h3><Zap size={16} /> Inject Fault (Demo)</h3>
                                <div className="diag-inject-btns">
                                    {Object.keys(selected.state || {}).map(param => (
                                        <button key={param} className="btn btn-sm btn-secondary"
                                            onClick={() => sendCommand({ action: 'injectFault', vehicle_id: selected.id, parameter: param })}>
                                            {(PARAM_THRESHOLDS[param]?.label || param)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="diag-empty">
                            <Brain size={48} />
                            <h3>Select a Vehicle</h3>
                            <p>Choose a vehicle from the health ranking to view its diagnosis report</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
