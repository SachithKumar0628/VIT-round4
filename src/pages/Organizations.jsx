import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import { Building2, Truck, Users, Shield, MapPin, Activity } from 'lucide-react';
import './Organizations.css';

export default function Organizations() {
    const { organizations, vehicles, tasks } = useData();

    return (
        <div className="orgs-page">
            <div className="page-header">
                <div>
                    <h1>Organizations</h1>
                    <p>Multi-tenant fleet management across organizations</p>
                </div>
            </div>

            <div className="orgs-grid">
                {organizations.map((org, i) => {
                    const orgVehicles = vehicles.filter(v => v.orgId === org.id);
                    const orgTasks = tasks.filter(t => t.orgId === org.id);
                    const evCount = orgVehicles.filter(v => v.fuelType === 'Electric').length;
                    const availableCount = orgVehicles.filter(v => v.status === 'available').length;

                    return (
                        <motion.div
                            key={org.id}
                            className="org-card card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="org-card-header" style={{ '--org-color': org.color }}>
                                <div className="org-card-logo"><Icon name={org.logo} size={28} /></div>
                                <div>
                                    <h2>{org.name}</h2>
                                    <span className="org-type-badge">{org.type}</span>
                                </div>
                            </div>

                            <p className="org-card-desc">{org.description}</p>

                            <div className="org-stats-grid">
                                <div className="org-stat-item">
                                    <Truck size={18} />
                                    <div>
                                        <strong>{orgVehicles.length}</strong>
                                        <span>Total Vehicles</span>
                                    </div>
                                </div>
                                <div className="org-stat-item">
                                    <Activity size={18} />
                                    <div>
                                        <strong>{availableCount}</strong>
                                        <span>Available</span>
                                    </div>
                                </div>
                                <div className="org-stat-item">
                                    <Shield size={18} />
                                    <div>
                                        <strong>{evCount}</strong>
                                        <span>Electric</span>
                                    </div>
                                </div>
                                <div className="org-stat-item">
                                    <MapPin size={18} />
                                    <div>
                                        <strong>{orgTasks.length}</strong>
                                        <span>Tasks</span>
                                    </div>
                                </div>
                            </div>

                            <div className="org-vehicles-preview">
                                <h4>Fleet Overview</h4>
                                <div className="org-vehicle-list">
                                    {orgVehicles.map(v => (
                                        <div key={v.id} className="org-vehicle-chip">
                                            <span><Icon name={v.image} size={14} /></span>
                                            <span>{v.name}</span>
                                            <span className={`org-v-status ${v.status}`}>
                                                {v.status === 'available' ? '●' : v.status === 'in-transit' ? '◉' : '○'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="org-card-footer">
                                <span>Created {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                <span className="org-id">{org.id}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Visibility Explanation */}
            <motion.div
                className="visibility-card card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="visibility-header">
                    <Shield size={20} />
                    <h2>Visibility & Governance</h2>
                </div>
                <div className="visibility-grid">
                    <div className="visibility-rule">
                        <div className="vr-role">👨‍💼 Admin</div>
                        <div className="vr-desc">Full access to all organizations, vehicles, and tasks across the platform</div>
                    </div>
                    <div className="visibility-rule">
                        <div className="vr-role">👩‍💻 Manager</div>
                        <div className="vr-desc">Can only view and manage vehicles and tasks belonging to their own organization</div>
                    </div>
                    <div className="visibility-rule">
                        <div className="vr-role">👩‍✈️ Driver</div>
                        <div className="vr-desc">Can only see their assigned vehicle and active tasks. No access to fleet-wide data</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
