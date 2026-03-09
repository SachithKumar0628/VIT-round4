import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { motion } from 'framer-motion';
import {
    Truck, Battery, Fuel, AlertTriangle, CheckCircle2,
    ArrowUpRight, ArrowDownRight, Zap, MapPin, Clock,
    TrendingUp, Activity
} from 'lucide-react';
import { statusConfig, priorityConfig } from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
    const { vehicles, tasks, stats, organizations } = useData();
    const { currentUser } = useAuth();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    const recentTasks = tasks.slice(0, 4);
    const topVehicles = vehicles.filter(v => v.status === 'available').slice(0, 4);

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {currentUser?.name?.split(' ')[0]}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                className="dashboard-stats"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div className="stat-card stat-fleet" variants={item}>
                    <div className="stat-card-icon">
                        <Truck size={22} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{stats.totalVehicles}</span>
                        <span className="stat-card-label">Total Fleet</span>
                    </div>
                    <div className="stat-card-trend up">
                        <ArrowUpRight size={14} />
                        <span>Active</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-available" variants={item}>
                    <div className="stat-card-icon icon-success">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{stats.availableVehicles}</span>
                        <span className="stat-card-label">Available</span>
                    </div>
                    <div className="stat-card-trend up">
                        <ArrowUpRight size={14} />
                        <span>{Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-transit" variants={item}>
                    <div className="stat-card-icon icon-primary">
                        <Activity size={22} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{stats.inTransit}</span>
                        <span className="stat-card-label">In Transit</span>
                    </div>
                    <div className="stat-card-trend neutral">
                        <TrendingUp size={14} />
                        <span>On route</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card stat-ev" variants={item}>
                    <div className="stat-card-icon icon-ev">
                        <Zap size={22} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{stats.evCount}</span>
                        <span className="stat-card-label">Electric Vehicles</span>
                    </div>
                    <div className="stat-card-trend up">
                        <ArrowUpRight size={14} />
                        <span>Green</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Fleet Overview */}
                <motion.div
                    className="card dashboard-fleet-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="card-title-row">
                        <h2>Fleet Overview</h2>
                        <span className="badge badge-primary">{stats.totalVehicles} vehicles</span>
                    </div>
                    <div className="fleet-status-bar">
                        <div
                            className="status-segment available"
                            style={{ width: `${(stats.availableVehicles / stats.totalVehicles) * 100}%` }}
                            data-tooltip={`${stats.availableVehicles} Available`}
                        />
                        <div
                            className="status-segment in-transit"
                            style={{ width: `${(stats.inTransit / stats.totalVehicles) * 100}%` }}
                            data-tooltip={`${stats.inTransit} In Transit`}
                        />
                        <div
                            className="status-segment maintenance"
                            style={{ width: `${(stats.maintenance / stats.totalVehicles) * 100}%` }}
                            data-tooltip={`${stats.maintenance} Maintenance`}
                        />
                    </div>
                    <div className="fleet-legend">
                        <span><i className="dot dot-available" /> Available ({stats.availableVehicles})</span>
                        <span><i className="dot dot-transit" /> In Transit ({stats.inTransit})</span>
                        <span><i className="dot dot-maintenance" /> Maintenance ({stats.maintenance})</span>
                    </div>

                    <div className="fleet-vehicle-list">
                        {topVehicles.map((v, i) => (
                            <motion.div
                                key={v.id}
                                className="fleet-vehicle-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.05 }}
                            >
                                <div className="vehicle-row-icon"><Icon name={v.image} size={18} /></div>
                                <div className="vehicle-row-info">
                                    <strong>{v.name}</strong>
                                    <span>{v.category} • {v.licensePlate}</span>
                                </div>
                                <div className="vehicle-row-energy">
                                    {v.fuelType === 'Electric' ? <Battery size={14} /> : <Fuel size={14} />}
                                    <span>{v.battery ?? v.fuel}%</span>
                                    <div className="mini-bar">
                                        <div
                                            className="mini-bar-fill"
                                            style={{
                                                width: `${v.battery ?? v.fuel}%`,
                                                background: (v.battery ?? v.fuel) > 60 ? '#10b981' : (v.battery ?? v.fuel) > 30 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>
                                <span
                                    className="badge"
                                    style={{
                                        background: statusConfig[v.status]?.bg,
                                        color: statusConfig[v.status]?.color
                                    }}
                                >
                                    {statusConfig[v.status]?.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Active Tasks */}
                <motion.div
                    className="card dashboard-tasks-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="card-title-row">
                        <h2>Active Tasks</h2>
                        <span className="badge badge-warning">{stats.pendingTasks} pending</span>
                    </div>

                    <div className="task-list">
                        {recentTasks.map((t, i) => (
                            <motion.div
                                key={t.id}
                                className="task-row"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.05 }}
                            >
                                <div
                                    className="task-priority-dot"
                                    style={{ background: priorityConfig[t.priority]?.color }}
                                />
                                <div className="task-row-info">
                                    <strong>{t.name}</strong>
                                    <span className="task-row-meta">
                                        <MapPin size={12} />
                                        {t.destination?.address}
                                    </span>
                                </div>
                                <div className="task-row-right">
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${priorityConfig[t.priority]?.color}15`,
                                            color: priorityConfig[t.priority]?.color
                                        }}
                                    >
                                        {priorityConfig[t.priority]?.label}
                                    </span>
                                    <span className="task-row-time">
                                        <Clock size={12} />
                                        {new Date(t.deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Organizations */}
                <motion.div
                    className="card dashboard-orgs-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="card-title-row">
                        <h2>Organizations</h2>
                    </div>
                    <div className="org-list">
                        {organizations.map((org, i) => {
                            const orgVehicles = vehicles.filter(v => v.orgId === org.id);
                            return (
                                <motion.div
                                    key={org.id}
                                    className="org-row"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                >
                                    <div className="org-row-logo" style={{ background: `${org.color}15`, color: org.color }}>
                                        <Icon name={org.logo} size={24} />
                                    </div>
                                    <div className="org-row-info">
                                        <strong>{org.name}</strong>
                                        <span>{org.type}</span>
                                    </div>
                                    <div className="org-row-stats">
                                        <div className="org-stat">
                                            <Truck size={13} />
                                            <span>{orgVehicles.length}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className="card dashboard-actions-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                >
                    <div className="card-title-row">
                        <h2>Quick Insights</h2>
                    </div>
                    <div className="insights-grid">
                        <div className="insight-item">
                            <div className="insight-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                                <Zap size={18} />
                            </div>
                            <div>
                                <strong>{Math.round((stats.evCount / stats.totalVehicles) * 100)}%</strong>
                                <span>Fleet is Electric</span>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                <Activity size={18} />
                            </div>
                            <div>
                                <strong>{Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%</strong>
                                <span>Fleet Utilization</span>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <strong>{stats.maintenance}</strong>
                                <span>Need Maintenance</span>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                <Clock size={18} />
                            </div>
                            <div>
                                <strong>{stats.pendingTasks}</strong>
                                <span>Tasks Pending</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
