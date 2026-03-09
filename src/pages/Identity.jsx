import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ShieldAlert, ShieldX, User, Car, Clock,
    CheckCircle2, XCircle, AlertTriangle, FileText, Search,
    ChevronDown, Eye, RefreshCw
} from 'lucide-react';
import './Identity.css';

export default function Identity() {
    const { wsData, sendCommand } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const vehicles = wsData?.data || [];

    const filteredVehicles = vehicles.filter(v => {
        const identity = v.identity;
        if (!identity) return false;
        const matchesSearch = identity.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            identity.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            identity.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            identity.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'verified') return matchesSearch && identity.insurance_valid && identity.owner?.verified;
        if (filterStatus === 'expired') return matchesSearch && !identity.insurance_valid;
        if (filterStatus === 'unverified') return matchesSearch && !identity.owner?.verified;
        return matchesSearch;
    });

    const stats = {
        total: vehicles.length,
        verified: vehicles.filter(v => v.identity?.insurance_valid && v.identity?.owner?.verified).length,
        expired: vehicles.filter(v => !v.identity?.insurance_valid).length,
        unverified: vehicles.filter(v => !v.identity?.owner?.verified).length,
    };

    const handleVerifyOwner = (ownerId) => {
        sendCommand({ action: 'verifyOwner', owner_id: ownerId });
    };

    const getInsuranceBadge = (identity) => {
        if (!identity) return null;
        const days = identity.insurance_days_left;
        if (!identity.insurance_valid) return <span className="id-badge id-badge-danger"><ShieldX size={12} /> Expired</span>;
        if (days <= 30) return <span className="id-badge id-badge-warning"><ShieldAlert size={12} /> {days}d left</span>;
        return <span className="id-badge id-badge-success"><ShieldCheck size={12} /> Valid</span>;
    };

    const getGateBadge = (v) => {
        if (v.gatekeeper?.allowed) return <span className="id-badge id-badge-success"><CheckCircle2 size={12} /> Cleared</span>;
        return <span className="id-badge id-badge-danger"><XCircle size={12} /> Blocked</span>;
    };

    return (
        <div className="identity-page">
            <div className="page-header">
                <div>
                    <h1>Secure Onboarding</h1>
                    <p>Digital Twin Registry & Vehicle Identity Management</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="id-stats-row">
                <motion.div className="id-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="id-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Car size={20} /></div>
                    <div className="id-stat-info"><span className="id-stat-value">{stats.total}</span><span className="id-stat-label">Total Vehicles</span></div>
                </motion.div>
                <motion.div className="id-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="id-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><ShieldCheck size={20} /></div>
                    <div className="id-stat-info"><span className="id-stat-value">{stats.verified}</span><span className="id-stat-label">Fully Verified</span></div>
                </motion.div>
                <motion.div className="id-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="id-stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><ShieldX size={20} /></div>
                    <div className="id-stat-info"><span className="id-stat-value">{stats.expired}</span><span className="id-stat-label">Insurance Expired</span></div>
                </motion.div>
                <motion.div className="id-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="id-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><AlertTriangle size={20} /></div>
                    <div className="id-stat-info"><span className="id-stat-value">{stats.unverified}</span><span className="id-stat-label">Owner Unverified</span></div>
                </motion.div>
            </div>

            {/* Toolbar */}
            <div className="id-toolbar">
                <div className="id-search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Search by VIN, make, model, or owner..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="id-filter-group">
                    {['all', 'verified', 'expired', 'unverified'].map(f => (
                        <button key={f} className={`id-filter-btn ${filterStatus === f ? 'active' : ''}`} onClick={() => setFilterStatus(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vehicle Identity Cards */}
            <div className="id-grid">
                <AnimatePresence>
                    {filteredVehicles.map((v, i) => {
                        const id = v.identity;
                        if (!id) return null;
                        return (
                            <motion.div
                                key={v.id}
                                className={`id-card ${selectedVehicle === v.id ? 'selected' : ''} ${!v.gatekeeper?.allowed ? 'blocked' : ''}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelectedVehicle(selectedVehicle === v.id ? null : v.id)}
                            >
                                <div className="id-card-header">
                                    <div className="id-card-title">
                                        <div className="id-vehicle-icon" style={{ background: v.vehicle_type === 'EV' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                            <Car size={18} />
                                        </div>
                                        <div>
                                            <h3>{id.make} {id.model}</h3>
                                            <span className="id-vin">{id.vin}</span>
                                        </div>
                                    </div>
                                    <div className="id-badges">
                                        {getGateBadge(v)}
                                    </div>
                                </div>

                                <div className="id-card-body">
                                    <div className="id-info-row">
                                        <div className="id-info-item">
                                            <span className="id-info-label"><User size={13} /> Owner</span>
                                            <span className="id-info-value">{id.owner?.name}</span>
                                        </div>
                                        <div className="id-info-item">
                                            <span className="id-info-label"><ShieldCheck size={13} /> Owner Status</span>
                                            {id.owner?.verified
                                                ? <span className="id-badge id-badge-success"><CheckCircle2 size={12} /> Verified</span>
                                                : <span className="id-badge id-badge-danger"><XCircle size={12} /> Unverified</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="id-info-row">
                                        <div className="id-info-item">
                                            <span className="id-info-label"><FileText size={13} /> Insurance</span>
                                            {getInsuranceBadge(id)}
                                        </div>
                                        <div className="id-info-item">
                                            <span className="id-info-label"><Clock size={13} /> Year</span>
                                            <span className="id-info-value">{id.year}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {selectedVehicle === v.id && (
                                        <motion.div className="id-card-expanded" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <div className="id-expanded-content">
                                                <div className="id-detail-grid">
                                                    <div className="id-detail"><span>Vehicle ID</span><strong>{v.id}</strong></div>
                                                    <div className="id-detail"><span>Type</span><strong>{id.vehicle_type}</strong></div>
                                                    <div className="id-detail"><span>Phone</span><strong>{id.owner?.phone}</strong></div>
                                                    <div className="id-detail"><span>Insurance Expiry</span><strong>{id.insurance_expiry?.split('T')[0]}</strong></div>
                                                </div>
                                                {!id.owner?.verified && (
                                                    <button className="btn btn-primary btn-sm id-verify-btn" onClick={(e) => { e.stopPropagation(); handleVerifyOwner(id.owner?.owner_id); }}>
                                                        <CheckCircle2 size={14} /> Verify Owner
                                                    </button>
                                                )}
                                                {!v.gatekeeper?.allowed && (
                                                    <div className="id-gate-reason">
                                                        <AlertTriangle size={14} />
                                                        <span>Gatekeeper blocked: {v.gatekeeper?.reason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
