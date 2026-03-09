import { useState } from 'react';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import {
    Plus, Search, Filter, Battery, Fuel, MapPin,
    Wrench, Eye, Trash2, ChevronDown
} from 'lucide-react';
import { statusConfig } from '../data/mockData';
import './Fleet.css';

export default function Fleet() {
    const { vehicles, addVehicle, removeVehicle, organizations } = useData();
    const { isAdmin, isDriver, currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [newVehicle, setNewVehicle] = useState({
        name: '', type: 'EV', category: 'Light Commercial',
        fuelType: 'Electric', loadCapacity: 500, battery: 100,
        licensePlate: '', orgId: '', image: 'Truck',
        maxRange: 150, currentRange: 150
    });

    const filtered = vehicles.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.licensePlate.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || v.fuelType === filterType;
        const matchStatus = filterStatus === 'all' || v.status === filterStatus;
        return matchSearch && matchType && matchStatus;
    });

    const handleAdd = () => {
        if (!newVehicle.name || !newVehicle.orgId) return;
        addVehicle({
            ...newVehicle,
            battery: newVehicle.fuelType === 'Electric' ? newVehicle.battery : null,
            fuel: newVehicle.fuelType !== 'Electric' ? newVehicle.battery : null,
            lastService: new Date().toISOString().split('T')[0],
            nextService: '2026-06-01',
            specs: { year: 2025, make: '', model: newVehicle.name, color: 'White', vin: `VIN${Date.now()}` }
        });
        setShowAdd(false);
        setNewVehicle({
            name: '', type: 'EV', category: 'Light Commercial',
            fuelType: 'Electric', loadCapacity: 500, battery: 100,
            licensePlate: '', orgId: '', image: 'Truck',
            maxRange: 150, currentRange: 150
        });
    };

    return (
        <div className="fleet-page">
            <div className="page-header">
                <div>
                    <h1>Fleet Registry</h1>
                    <p>Manage and monitor all vehicles in your fleet</p>
                </div>
                {!isDriver && (
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={16} /> Add Vehicle
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="fleet-filters">
                <div className="fleet-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or plate..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={14} />
                    <select
                        className="form-select filter-select"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="Electric">Electric</option>
                        <option value="Diesel">Diesel</option>
                    </select>
                    <select
                        className="form-select filter-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="in-transit">In Transit</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Vehicle Grid */}
            <div className="fleet-grid">
                {filtered.map((v, i) => (
                    <motion.div
                        key={v.id}
                        className="vehicle-card card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedVehicle(v)}
                    >
                        <div className="vehicle-card-top">
                            <div className="vehicle-card-icon"><Icon name={v.image} size={24} /></div>
                            <span
                                className="badge"
                                style={{ background: statusConfig[v.status]?.bg, color: statusConfig[v.status]?.color }}
                            >
                                {statusConfig[v.status]?.label}
                            </span>
                        </div>
                        <h3 className="vehicle-card-name">{v.name}</h3>
                        <p className="vehicle-card-meta">{v.category} • {v.licensePlate}</p>

                        <div className="vehicle-card-stats">
                            <div className="vc-stat">
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
                            <div className="vc-stat">
                                <MapPin size={14} />
                                <span className="vc-stat-location">{v.location?.address}</span>
                            </div>
                        </div>

                        <div className="vehicle-card-bottom">
                            <span className={`vc-type-badge ${v.fuelType === 'Electric' ? 'ev' : 'diesel'}`}>
                                {v.fuelType === 'Electric' ? 'EV' : 'Diesel'}
                            </span>
                            <span className="vc-capacity">{v.loadCapacity} kg</span>
                        </div>

                        <div className="vehicle-card-health">
                            <span>Health</span>
                            <div className="health-bar">
                                <div
                                    className="health-bar-fill"
                                    style={{
                                        width: `${v.healthScore}%`,
                                        background: v.healthScore > 80 ? '#10b981' : v.healthScore > 50 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                            <span className="health-value">{v.healthScore}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <Search size={48} />
                    <h3>No vehicles found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            )}

            {/* Vehicle Detail Modal */}
            <Modal
                isOpen={!!selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
                title={selectedVehicle?.name || 'Vehicle Details'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setSelectedVehicle(null)}>Close</button>
                        {!isDriver && (
                            <button
                                className="btn btn-danger"
                                onClick={() => { removeVehicle(selectedVehicle.id); setSelectedVehicle(null); }}
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        )}
                    </>
                }
            >
                {selectedVehicle && (
                    <div className="vehicle-detail">
                        <div className="vd-header">
                            <span className="vd-icon"><Icon name={selectedVehicle.image} size={28} /></span>
                            <div>
                                <h3>{selectedVehicle.name}</h3>
                                <p>{selectedVehicle.category} • {selectedVehicle.licensePlate}</p>
                            </div>
                            <span
                                className="badge"
                                style={{
                                    background: statusConfig[selectedVehicle.status]?.bg,
                                    color: statusConfig[selectedVehicle.status]?.color
                                }}
                            >
                                {statusConfig[selectedVehicle.status]?.label}
                            </span>
                        </div>

                        <div className="vd-specs-grid">
                            <div className="vd-spec">
                                <label>Fuel Type</label>
                                <span>{selectedVehicle.fuelType}</span>
                            </div>
                            <div className="vd-spec">
                                <label>{selectedVehicle.fuelType === 'Electric' ? 'Battery' : 'Fuel'}</label>
                                <span>{selectedVehicle.battery ?? selectedVehicle.fuel}%</span>
                            </div>
                            <div className="vd-spec">
                                <label>Load Capacity</label>
                                <span>{selectedVehicle.loadCapacity} kg</span>
                            </div>
                            <div className="vd-spec">
                                <label>Range</label>
                                <span>{selectedVehicle.currentRange}/{selectedVehicle.maxRange} km</span>
                            </div>
                            <div className="vd-spec">
                                <label>Mileage</label>
                                <span>{selectedVehicle.mileage?.toLocaleString()} km</span>
                            </div>
                            <div className="vd-spec">
                                <label>Health Score</label>
                                <span style={{ color: selectedVehicle.healthScore > 80 ? '#10b981' : selectedVehicle.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                                    {selectedVehicle.healthScore}/100
                                </span>
                            </div>
                            <div className="vd-spec">
                                <label>Last Service</label>
                                <span>{selectedVehicle.lastService}</span>
                            </div>
                            <div className="vd-spec">
                                <label>Next Service</label>
                                <span>{selectedVehicle.nextService}</span>
                            </div>
                        </div>

                        <div className="vd-location">
                            <MapPin size={14} />
                            <span>{selectedVehicle.location?.address}</span>
                        </div>

                        {selectedVehicle.specs && (
                            <div className="vd-vehicle-specs">
                                <h4>Vehicle Specs</h4>
                                <p>{selectedVehicle.specs.year} {selectedVehicle.specs.make} {selectedVehicle.specs.model} • {selectedVehicle.specs.color}</p>
                                <p className="vd-vin">VIN: {selectedVehicle.specs.vin}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Add Vehicle Modal */}
            <Modal
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                title="Add New Vehicle"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAdd}>Add Vehicle</button>
                    </>
                }
            >
                <div className="add-vehicle-form">
                    <div className="form-group">
                        <label className="form-label">Vehicle Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Tata Ace EV"
                            value={newVehicle.name}
                            onChange={e => setNewVehicle(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Fuel Type</label>
                            <select
                                className="form-select"
                                value={newVehicle.fuelType}
                                onChange={e => setNewVehicle(prev => ({
                                    ...prev,
                                    fuelType: e.target.value,
                                    type: e.target.value === 'Electric' ? 'EV' : 'Diesel'
                                }))}
                            >
                                <option value="Electric">Electric</option>
                                <option value="Diesel">Diesel</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                value={newVehicle.category}
                                onChange={e => setNewVehicle(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option>Light Commercial</option>
                                <option>Heavy Duty</option>
                                <option>Three-Wheeler</option>
                                <option>Two-Wheeler</option>
                                <option>Bus</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Load Capacity (kg)</label>
                            <input
                                className="form-input"
                                type="number"
                                value={newVehicle.loadCapacity}
                                onChange={e => setNewVehicle(prev => ({ ...prev, loadCapacity: +e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Plate</label>
                            <input
                                className="form-input"
                                placeholder="MH-01-XX-1234"
                                value={newVehicle.licensePlate}
                                onChange={e => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Organization</label>
                        <select
                            className="form-select"
                            value={newVehicle.orgId}
                            onChange={e => setNewVehicle(prev => ({ ...prev, orgId: e.target.value }))}
                        >
                            <option value="">Select Organization</option>
                            {organizations.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
