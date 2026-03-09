import { useState } from 'react';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecommendations, resolveConflicts } from '../engine/scheduler';
import {
    Brain, Zap, Play, ChevronRight, Award, BarChart3,
    CheckCircle2, AlertTriangle, Info, Truck, Target,
    Sparkles, ArrowRight
} from 'lucide-react';
import { priorityConfig } from '../data/mockData';
import './SchedulingEngine.css';

export default function SchedulingEngine() {
    const { tasks, vehicles, assignVehicleToTask } = useData();
    const [selectedTask, setSelectedTask] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [showExplanation, setShowExplanation] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [batchResults, setBatchResults] = useState(null);

    const pendingTasks = tasks.filter(t => t.status === 'pending');

    const runEngine = (task) => {
        setIsRunning(true);
        setSelectedTask(task);
        setBatchResults(null);

        // Simulate processing delay for visual effect
        setTimeout(() => {
            const results = getRecommendations(vehicles, task);
            setRecommendations(results);
            setIsRunning(false);
        }, 800);
    };

    const runBatch = () => {
        setIsRunning(true);
        setSelectedTask(null);
        setRecommendations(null);

        setTimeout(() => {
            const results = resolveConflicts(pendingTasks, vehicles);
            setBatchResults(results);
            setIsRunning(false);
        }, 1200);
    };

    const handleAssign = (taskId, vehicleId, score, reasons) => {
        assignVehicleToTask(taskId, vehicleId, score, reasons);
        setRecommendations(null);
        setSelectedTask(null);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#3b82f6';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="engine-page">
            <div className="page-header">
                <div>
                    <h1>
                        <Brain size={28} className="engine-title-icon" />
                        Scheduling Engine
                    </h1>
                    <p>AI-powered vehicle assignment with explainable decisions</p>
                </div>
                <button
                    className="btn btn-success btn-lg"
                    onClick={runBatch}
                    disabled={isRunning || pendingTasks.length === 0}
                >
                    <Sparkles size={18} />
                    Auto-Assign All ({pendingTasks.length})
                </button>
            </div>

            <div className="engine-layout">
                {/* Task Selection Panel */}
                <div className="engine-panel card">
                    <div className="panel-header">
                        <h2><Target size={18} /> Select a Task</h2>
                        <span className="badge badge-primary">{pendingTasks.length} pending</span>
                    </div>
                    <div className="task-select-list">
                        {pendingTasks.length === 0 ? (
                            <div className="empty-state" style={{ padding: '30px' }}>
                                <CheckCircle2 size={36} />
                                <h3>All tasks assigned!</h3>
                                <p>Create new tasks from the Task Manager</p>
                            </div>
                        ) : (
                            pendingTasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    className={`task-select-item ${selectedTask?.id === task.id ? 'active' : ''}`}
                                    onClick={() => runEngine(task)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div
                                        className="tsi-priority"
                                        style={{ background: priorityConfig[task.priority]?.color }}
                                    />
                                    <div className="tsi-info">
                                        <strong>{task.name}</strong>
                                        <span>{task.category} • {task.destination?.address}</span>
                                    </div>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${priorityConfig[task.priority]?.color}15`,
                                            color: priorityConfig[task.priority]?.color
                                        }}
                                    >
                                        {priorityConfig[task.priority]?.label}
                                    </span>
                                    <ChevronRight size={16} className="tsi-arrow" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recommendations Panel */}
                <div className="engine-results">
                    {isRunning && (
                        <motion.div
                            className="engine-loading card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="loading-spinner" />
                            <h3>Running Scheduling Algorithm</h3>
                            <p>Calculating optimal vehicle-task assignments...</p>
                            <div className="loading-formula">
                                Score = (w₁ × Priority) + (w₂ × Proximity) + (w₃ × Energy) + (w₄ × Capacity) + (w₅ × Category) + (w₆ × Health)
                            </div>
                        </motion.div>
                    )}

                    {!isRunning && recommendations && selectedTask && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="results-header">
                                <h2>
                                    <Award size={20} />
                                    Recommendations for: {selectedTask.name}
                                </h2>
                            </div>

                            <div className="recommendation-list">
                                {recommendations.map((rec, i) => (
                                    <motion.div
                                        key={rec.vehicle.id}
                                        className={`recommendation-card card ${i === 0 && rec.eligible ? 'top-pick' : ''} ${!rec.eligible ? 'ineligible' : ''}`}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        {i === 0 && rec.eligible && (
                                            <div className="top-pick-badge">
                                                <Sparkles size={12} /> TOP RECOMMENDATION
                                            </div>
                                        )}

                                        <div className="rec-main">
                                            <div className="rec-vehicle">
                                                <span className="rec-icon"><Icon name={rec.vehicle.image} size={24} /></span>
                                                <div className="rec-vehicle-info">
                                                    <strong>{rec.vehicle.name}</strong>
                                                    <span>{rec.vehicle.category} • {rec.vehicle.licensePlate}</span>
                                                </div>
                                            </div>

                                            <div className="rec-score-section">
                                                <div
                                                    className="score-circle"
                                                    style={{
                                                        '--score': rec.score,
                                                        '--score-color': getScoreColor(rec.score)
                                                    }}
                                                >
                                                    <svg viewBox="0 0 36 36">
                                                        <path
                                                            className="score-bg"
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        />
                                                        <path
                                                            className="score-fill"
                                                            strokeDasharray={`${rec.score}, 100`}
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        />
                                                    </svg>
                                                    <span className="score-value">{rec.score}</span>
                                                </div>
                                            </div>

                                            {rec.eligible && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAssign(selectedTask.id, rec.vehicle.id, rec.score, rec.reasons)}
                                                >
                                                    Assign
                                                </button>
                                            )}
                                        </div>

                                        {/* Score Breakdown */}
                                        {rec.eligible && rec.breakdown && (
                                            <div className="rec-breakdown">
                                                {Object.entries(rec.breakdown).map(([key, val]) => (
                                                    <div key={key} className="breakdown-item">
                                                        <span className="breakdown-label">{key}</span>
                                                        <div className="breakdown-bar">
                                                            <div
                                                                className="breakdown-bar-fill"
                                                                style={{
                                                                    width: `${val}%`,
                                                                    background: val > 70 ? '#10b981' : val > 40 ? '#3b82f6' : '#f59e0b'
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="breakdown-val">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Explainable AI */}
                                        <button
                                            className="rec-explain-toggle"
                                            onClick={() => setShowExplanation(showExplanation === rec.vehicle.id ? null : rec.vehicle.id)}
                                        >
                                            <Info size={14} />
                                            {showExplanation === rec.vehicle.id ? 'Hide' : 'Show'} Explanation
                                        </button>

                                        <AnimatePresence>
                                            {showExplanation === rec.vehicle.id && (
                                                <motion.div
                                                    className="rec-explanation"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="explanation-title">
                                                        <Sparkles size={14} />
                                                        Decision Explanation
                                                    </div>
                                                    <ul className="explanation-reasons">
                                                        {rec.reasons.map((reason, ri) => (
                                                            <li key={ri}>{reason}</li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Batch Results */}
                    {!isRunning && batchResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="results-header">
                                <h2><Sparkles size={20} /> Batch Assignment Results</h2>
                            </div>

                            {Object.keys(batchResults).length === 0 ? (
                                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                                    <AlertTriangle size={36} style={{ color: '#f59e0b', marginBottom: '12px' }} />
                                    <h3>No eligible assignments found</h3>
                                    <p style={{ color: '#6b7280' }}>No vehicles match the requirements of the pending tasks</p>
                                </div>
                            ) : (
                                <div className="batch-results">
                                    {Object.entries(batchResults).map(([taskId, assignment], i) => {
                                        const task = tasks.find(t => t.id === taskId);
                                        return (
                                            <motion.div
                                                key={taskId}
                                                className="batch-result-card card"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className="batch-result-row">
                                                    <div className="batch-task">
                                                        <strong>{task?.name}</strong>
                                                        <span className="badge" style={{
                                                            background: `${priorityConfig[task?.priority]?.color}15`,
                                                            color: priorityConfig[task?.priority]?.color
                                                        }}>
                                                            {priorityConfig[task?.priority]?.label}
                                                        </span>
                                                    </div>
                                                    <ArrowRight size={18} style={{ color: '#9ca3af' }} />
                                                    <div className="batch-vehicle">
                                                        <Truck size={16} />
                                                        <strong>{assignment.vehicleName}</strong>
                                                    </div>
                                                    <div
                                                        className="batch-score"
                                                        style={{ color: getScoreColor(assignment.score) }}
                                                    >
                                                        {assignment.score}
                                                    </div>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleAssign(taskId, assignment.vehicleId, assignment.score, assignment.reasons)}
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                                <div className="batch-reasons">
                                                    {assignment.reasons.slice(0, 3).map((r, ri) => (
                                                        <span key={ri} className="batch-reason">{r}</span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {!isRunning && !recommendations && !batchResults && (
                        <div className="engine-empty card">
                            <Brain size={56} className="engine-empty-icon" />
                            <h3>Select a Task to Begin</h3>
                            <p>Choose a pending task from the left panel, or use "Auto-Assign All" to batch process all pending tasks.</p>
                            <div className="engine-formula-box">
                                <h4>Scoring Formula</h4>
                                <code>
                                    Score = (w₁ × Priority) + (w₂ × Proximity) + (w₃ × Energy) + (w₄ × Capacity) + (w₅ × Category) + (w₆ × Health)
                                </code>
                                <div className="formula-weights">
                                    <span>w₁ Priority: 20</span>
                                    <span>w₂ Proximity: 25</span>
                                    <span>w₃ Energy: 20</span>
                                    <span>w₄ Capacity: 15</span>
                                    <span>w₅ Category: 10</span>
                                    <span>w₆ Health: 10</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
