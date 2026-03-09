import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import {
    BarChart3, Truck, Zap, TrendingUp, Fuel, Battery,
    CheckCircle, Clock, AlertTriangle, Activity
} from 'lucide-react';
import './Reports.css';

export default function Reports() {
    const { vehicles, tasks, stats, history } = useData();

    const avgBattery = Math.round(
        vehicles
            .filter(v => v.fuelType === 'Electric')
            .reduce((sum, v) => sum + (v.battery || 0), 0) /
        (vehicles.filter(v => v.fuelType === 'Electric').length || 1)
    );

    const avgHealth = Math.round(
        vehicles.reduce((sum, v) => sum + (v.healthScore || 0), 0) / (vehicles.length || 1)
    );

    const totalMileage = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);

    const categoryBreakdown = vehicles.reduce((acc, v) => {
        acc[v.category] = (acc[v.category] || 0) + 1;
        return acc;
    }, {});

    const fuelBreakdown = vehicles.reduce((acc, v) => {
        acc[v.fuelType] = (acc[v.fuelType] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Fleet utilization, performance metrics, and scheduling history</p>
                </div>
            </div>

            {/* KPI Cards */}
            <motion.div
                className="report-kpis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <Activity size={20} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-value">{Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%</span>
                        <span className="kpi-label">Fleet Availability</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <Battery size={20} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-value">{avgBattery}%</span>
                        <span className="kpi-label">Avg EV Battery</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-value">{avgHealth}</span>
                        <span className="kpi-label">Avg Health Score</span>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                        <Truck size={20} />
                    </div>
                    <div className="kpi-info">
                        <span className="kpi-value">{(totalMileage / 1000).toFixed(0)}k</span>
                        <span className="kpi-label">Total Mileage (km)</span>
                    </div>
                </div>
            </motion.div>

            <div className="report-grid">
                {/* Category Breakdown */}
                <motion.div
                    className="card report-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2><Truck size={18} /> Vehicle Categories</h2>
                    <div className="category-bars">
                        {Object.entries(categoryBreakdown).map(([cat, count]) => (
                            <div key={cat} className="cat-bar-row">
                                <span className="cat-label">{cat}</span>
                                <div className="cat-bar">
                                    <motion.div
                                        className="cat-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / vehicles.length) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    />
                                </div>
                                <span className="cat-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Fuel Breakdown */}
                <motion.div
                    className="card report-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2><Fuel size={18} /> Fuel Type Distribution</h2>
                    <div className="fuel-donut">
                        {Object.entries(fuelBreakdown).map(([fuel, count]) => (
                            <div key={fuel} className="fuel-item">
                                <div className="fuel-circle" style={{
                                    background: fuel === 'Electric'
                                        ? 'linear-gradient(135deg, #10b981, #34d399)'
                                        : 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                                }}>
                                    {fuel === 'Electric' ? <Zap size={20} /> : <Fuel size={20} />}
                                </div>
                                <strong>{count}</strong>
                                <span>{fuel}</span>
                                <span className="fuel-pct">{Math.round((count / vehicles.length) * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Task Summary */}
                <motion.div
                    className="card report-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2><CheckCircle size={18} /> Task Summary</h2>
                    <div className="task-summary-grid">
                        <div className="ts-item">
                            <div className="ts-dot" style={{ background: '#f59e0b' }} />
                            <span>Pending</span>
                            <strong>{stats.pendingTasks}</strong>
                        </div>
                        <div className="ts-item">
                            <div className="ts-dot" style={{ background: '#3b82f6' }} />
                            <span>In Progress</span>
                            <strong>{stats.activeTasks}</strong>
                        </div>
                        <div className="ts-item">
                            <div className="ts-dot" style={{ background: '#10b981' }} />
                            <span>Completed</span>
                            <strong>{stats.completedTasks}</strong>
                        </div>
                        <div className="ts-item">
                            <div className="ts-dot" style={{ background: '#6b7280' }} />
                            <span>Total</span>
                            <strong>{stats.totalTasks}</strong>
                        </div>
                    </div>
                </motion.div>

                {/* Scheduling History */}
                <motion.div
                    className="card report-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2><Clock size={18} /> Recent Assignments</h2>
                    {history.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px' }}>
                            <Clock size={32} />
                            <p>No assignments yet</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((h, i) => {
                                const task = tasks.find(t => t.id === h.taskId);
                                const vehicle = vehicles.find(v => v.id === h.vehicleId);
                                return (
                                    <div key={h.id} className="history-item">
                                        <div className="history-dot" />
                                        <div className="history-info">
                                            <strong>{task?.name || h.taskId}</strong>
                                            <span>→ {vehicle?.name || h.vehicleId} • Score: {h.score}</span>
                                            <span className="history-time">
                                                {new Date(h.assignedAt).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
