import { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, Clock, AlertTriangle, CheckCircle2, FileText,
    Download, Timer, TrendingDown, Activity, ChevronDown,
    ChevronRight, Shield, XCircle, Search, Filter
} from 'lucide-react';
import './Maintenance.css';

function formatTime(ts) {
    if (!ts) return '---';
    const d = new Date(ts * 1000);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatRUL(seconds) {
    if (seconds < 0 || seconds > 9000) return 'Stable';
    if (seconds === 0) return 'NOW';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
}

const SEVERITY_CONFIG = {
    critical: { color: '#ef4444', bg: '#fef2f2', label: 'Critical' },
    high: { color: '#f97316', bg: '#fff7ed', label: 'High' },
    medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
    low: { color: '#10b981', bg: '#ecfdf5', label: 'Low' },
};

export default function Maintenance() {
    const { wsData, sendCommand } = useData();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [expandedJob, setExpandedJob] = useState(null);

    const vehicles = wsData?.data || [];
    const openJobs = wsData?.open_jobs || [];

    // Group jobs by vehicle
    const jobsByVehicle = {};
    openJobs.forEach(j => {
        if (!jobsByVehicle[j.vehicle_id]) jobsByVehicle[j.vehicle_id] = [];
        jobsByVehicle[j.vehicle_id].push(j);
    });

    const filteredJobs = filterSeverity === 'all' ? openJobs : openJobs.filter(j => j.severity === filterSeverity);

    const selected = selectedVehicle ? vehicles.find(v => v.id === selectedVehicle) : null;

    const handleCompleteJob = (jobId) => {
        sendCommand({ action: 'completeJob', job_id: jobId, notes: 'Resolved via dashboard' });
    };

    const exportJobCard = (job) => {
        const card = {
            ...job,
            exported_at: new Date().toISOString(),
            format: 'ApexLogistics Job Card v1.0',
        };
        const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${job.job_id}_jobcard.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="maintenance-page">
            <div className="page-header">
                <div>
                    <h1>Predictive Maintenance</h1>
                    <p>RUL Estimation, Service History & Automated Job Cards</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="maint-stats-row">
                <motion.div className="maint-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="maint-stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><AlertTriangle size={20} /></div>
                    <div><div className="maint-stat-value">{openJobs.filter(j => j.severity === 'critical').length}</div><div className="maint-stat-label">Critical Jobs</div></div>
                </motion.div>
                <motion.div className="maint-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="maint-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><Wrench size={20} /></div>
                    <div><div className="maint-stat-value">{openJobs.length}</div><div className="maint-stat-label">Open Jobs</div></div>
                </motion.div>
                <motion.div className="maint-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="maint-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Timer size={20} /></div>
                    <div><div className="maint-stat-value">{Object.keys(jobsByVehicle).length}</div><div className="maint-stat-label">Vehicles Affected</div></div>
                </motion.div>
                <motion.div className="maint-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="maint-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><TrendingDown size={20} /></div>
                    <div><div className="maint-stat-value">{vehicles.filter(v => v.locked).length}</div><div className="maint-stat-label">Locked Vehicles</div></div>
                </motion.div>
            </div>

            <div className="maint-layout">
                {/* RUL Panel */}
                <div className="maint-rul-panel">
                    <h3><Timer size={16} /> Remaining Useful Life (RUL)</h3>
                    <p className="maint-rul-desc">Estimated time until critical component failure</p>

                    <div className="maint-rul-list">
                        {vehicles.map((v, i) => (
                            <motion.div key={v.id} className={`maint-rul-vehicle ${selectedVehicle === v.id ? 'active' : ''}`}
                                onClick={() => setSelectedVehicle(v.id)}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                <div className="maint-rul-header">
                                    <span className="maint-rul-vid">{v.id}</span>
                                    <span className={`maint-rul-status ${v.locked ? 'locked' : ''}`}>
                                        {v.locked ? 'LOCKED' : 'Active'}
                                    </span>
                                </div>
                                {Object.entries(v.rul || {}).length > 0 ? (
                                    <div className="maint-rul-bars">
                                        {Object.entries(v.rul).map(([param, seconds]) => {
                                            const isUrgent = seconds < 120;
                                            const pct = Math.min(seconds / 600, 1) * 100;
                                            return (
                                                <div key={param} className="maint-rul-bar-item">
                                                    <div className="maint-rul-bar-label">
                                                        <span>{param.replace(/_/g, ' ')}</span>
                                                        <span className={isUrgent ? 'maint-rul-urgent' : ''}>{formatRUL(seconds)}</span>
                                                    </div>
                                                    <div className="maint-rul-bar">
                                                        <div className="maint-rul-bar-fill" style={{
                                                            width: `${pct}%`,
                                                            background: isUrgent ? '#ef4444' : pct < 50 ? '#f59e0b' : '#10b981'
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="maint-rul-stable"><Shield size={14} /> All components stable</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Service Jobs */}
                <div className="maint-jobs-panel">
                    <div className="maint-jobs-header">
                        <h3><FileText size={16} /> Service Job Cards</h3>
                        <div className="maint-filter-group">
                            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                                <button key={f} className={`maint-filter-btn ${filterSeverity === f ? 'active' : ''}`}
                                    onClick={() => setFilterSeverity(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredJobs.length === 0 ? (
                        <div className="maint-empty">
                            <CheckCircle2 size={40} />
                            <h4>No Open Jobs</h4>
                            <p>All service jobs have been resolved</p>
                        </div>
                    ) : (
                        <div className="maint-jobs-list">
                            <AnimatePresence>
                                {filteredJobs.map((job, i) => {
                                    const sev = SEVERITY_CONFIG[job.severity] || SEVERITY_CONFIG.low;
                                    return (
                                        <motion.div key={job.job_id} className="maint-job-card"
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.03 }}
                                            onClick={() => setExpandedJob(expandedJob === job.job_id ? null : job.job_id)}>
                                            <div className="maint-job-top">
                                                <div className="maint-job-id-row">
                                                    <span className="maint-job-id">{job.job_id}</span>
                                                    <span className="maint-severity-badge" style={{ background: sev.bg, color: sev.color }}>
                                                        {sev.label}
                                                    </span>
                                                </div>
                                                <div className="maint-job-vehicle">{job.vehicle_id}</div>
                                            </div>
                                            <div className="maint-job-desc">{job.description}</div>
                                            <div className="maint-job-meta">
                                                <span><Clock size={12} /> {formatTime(job.created_at)}</span>
                                                <span><Activity size={12} /> Health: {job.health_score_at_creation?.toFixed(0)}%</span>
                                            </div>

                                            <AnimatePresence>
                                                {expandedJob === job.job_id && (
                                                    <motion.div className="maint-job-expanded"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}>
                                                        <div className="maint-job-actions">
                                                            <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); handleCompleteJob(job.job_id); }}>
                                                                <CheckCircle2 size={14} /> Mark Resolved
                                                            </button>
                                                            <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); exportJobCard(job); }}>
                                                                <Download size={14} /> Export Job Card
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
