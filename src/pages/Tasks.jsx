import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { motion } from 'framer-motion';
import {
    Plus, Clock, MapPin, AlertCircle, CheckCircle, Loader,
    Truck, ArrowRight, Flag
} from 'lucide-react';
import { priorityConfig, taskStatusConfig } from '../data/mockData';
import './Tasks.css';

export default function Tasks() {
    const { tasks, addTask, updateTask, vehicles, organizations } = useData();
    const { currentUser, isAdmin } = useAuth();
    const [showAdd, setShowAdd] = useState(false);
    const [filter, setFilter] = useState('all');
    const [newTask, setNewTask] = useState({
        name: '',
        description: '',
        priority: 'medium',
        category: 'Logistics',
        orgId: currentUser?.orgId || '',
        destination: { address: '', lat: 19.076, lng: 72.877 },
        deadline: '',
        requirements: {
            minCapacity: 100,
            preferEV: false,
            zone: 'city-center',
            maxDistance: 200
        }
    });

    const filteredTasks = tasks.filter(t =>
        filter === 'all' || t.status === filter
    );

    const handleAdd = () => {
        if (!newTask.name) return;
        addTask(newTask);
        setShowAdd(false);
        setNewTask({
            name: '', description: '', priority: 'medium', category: 'Logistics',
            orgId: currentUser?.orgId || '',
            destination: { address: '', lat: 19.076, lng: 72.877 },
            deadline: '',
            requirements: { minCapacity: 100, preferEV: false, zone: 'city-center', maxDistance: 200 }
        });
    };

    const statusIcons = {
        pending: <Clock size={16} />,
        'in-progress': <Loader size={16} />,
        completed: <CheckCircle size={16} />,
        cancelled: <AlertCircle size={16} />
    };

    return (
        <div className="tasks-page">
            <div className="page-header">
                <div>
                    <h1>Task Manager</h1>
                    <p>Create, assign, and track delivery tasks</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Create Task
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="task-filter-tabs">
                {['all', 'pending', 'in-progress', 'completed'].map(f => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All Tasks' : (taskStatusConfig[f]?.label || f)}
                        <span className="filter-count">
                            {f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Task Cards */}
            <div className="tasks-grid">
                {filteredTasks.map((task, i) => {
                    const assignedVehicle = vehicles.find(v => v.id === task.assignedVehicle);
                    return (
                        <motion.div
                            key={task.id}
                            className="task-card card"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <div className="task-card-top">
                                <div
                                    className="task-priority-indicator"
                                    style={{ background: priorityConfig[task.priority]?.color }}
                                />
                                <span
                                    className="badge"
                                    style={{
                                        background: `${priorityConfig[task.priority]?.color}15`,
                                        color: priorityConfig[task.priority]?.color
                                    }}
                                >
                                    <Flag size={10} />
                                    {priorityConfig[task.priority]?.label}
                                </span>
                                <span
                                    className="badge"
                                    style={{
                                        background: taskStatusConfig[task.status]?.bg,
                                        color: taskStatusConfig[task.status]?.color
                                    }}
                                >
                                    {statusIcons[task.status]}
                                    {taskStatusConfig[task.status]?.label}
                                </span>
                            </div>

                            <h3 className="task-card-name">{task.name}</h3>
                            <p className="task-card-desc">{task.description}</p>

                            <div className="task-card-meta">
                                <span className="task-meta-item">
                                    <MapPin size={13} />
                                    {task.destination?.address}
                                </span>
                                <span className="task-meta-item">
                                    <Clock size={13} />
                                    {task.deadline ? new Date(task.deadline).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    }) : 'No deadline'}
                                </span>
                            </div>

                            <div className="task-card-requirements">
                                <span className="req-chip">Min {task.requirements?.minCapacity} kg</span>
                                <span className="req-chip">{task.requirements?.zone}</span>
                                {task.requirements?.preferEV && <span className="req-chip ev-chip">EV Preferred</span>}
                                <span className="req-chip">≤ {task.requirements?.maxDistance} km</span>
                            </div>

                            {assignedVehicle ? (
                                <div className="task-assigned">
                                    <Truck size={14} />
                                    <span>Assigned: <strong>{assignedVehicle.name}</strong></span>
                                </div>
                            ) : (
                                <div className="task-unassigned">
                                    <ArrowRight size={14} />
                                    <span>Not assigned — use Scheduling Engine</span>
                                </div>
                            )}

                            <div className="task-card-category">
                                <span className="badge badge-neutral">{task.category}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredTasks.length === 0 && (
                <div className="empty-state">
                    <ClipboardList size={48} />
                    <h3>No tasks found</h3>
                    <p>Create a new task to get started</p>
                </div>
            )}

            {/* Add Task Modal */}
            <Modal
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                title="Create New Task"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAdd}>Create Task</button>
                    </>
                }
            >
                <div className="add-vehicle-form">
                    <div className="form-group">
                        <label className="form-label">Task Name</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Medical Supply Delivery"
                            value={newTask.name}
                            onChange={e => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            className="form-input"
                            placeholder="Brief description of the task"
                            value={newTask.description}
                            onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={newTask.priority}
                                onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                value={newTask.category}
                                onChange={e => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option>Logistics</option>
                                <option>Medical</option>
                                <option>E-Commerce</option>
                                <option>Courier</option>
                                <option>Transport</option>
                                <option>Grocery</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination Address</label>
                        <input
                            className="form-input"
                            placeholder="e.g. Pune Central Hospital"
                            value={newTask.destination.address}
                            onChange={e => setNewTask(prev => ({
                                ...prev, destination: { ...prev.destination, address: e.target.value }
                            }))}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Min Capacity (kg)</label>
                            <input
                                className="form-input"
                                type="number"
                                value={newTask.requirements.minCapacity}
                                onChange={e => setNewTask(prev => ({
                                    ...prev, requirements: { ...prev.requirements, minCapacity: +e.target.value }
                                }))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Distance (km)</label>
                            <input
                                className="form-input"
                                type="number"
                                value={newTask.requirements.maxDistance}
                                onChange={e => setNewTask(prev => ({
                                    ...prev, requirements: { ...prev.requirements, maxDistance: +e.target.value }
                                }))}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Zone</label>
                            <select
                                className="form-select"
                                value={newTask.requirements.zone}
                                onChange={e => setNewTask(prev => ({
                                    ...prev, requirements: { ...prev.requirements, zone: e.target.value }
                                }))}
                            >
                                <option value="city-center">City Center</option>
                                <option value="highway">Highway</option>
                                <option value="suburban">Suburban</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Prefer EV</label>
                            <select
                                className="form-select"
                                value={newTask.requirements.preferEV ? 'yes' : 'no'}
                                onChange={e => setNewTask(prev => ({
                                    ...prev, requirements: { ...prev.requirements, preferEV: e.target.value === 'yes' }
                                }))}
                            >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="form-group">
                            <label className="form-label">Organization</label>
                            <select
                                className="form-select"
                                value={newTask.orgId}
                                onChange={e => setNewTask(prev => ({ ...prev, orgId: e.target.value }))}
                            >
                                <option value="">Select Organization</option>
                                {organizations.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
