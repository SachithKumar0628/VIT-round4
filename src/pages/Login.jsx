import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';
import { Zap, Shield, ChevronRight, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import './Login.css';

export default function Login() {
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: mobile, 2: otp, 3: role
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter out Operations Manager (Ravi Kumar - user-3)
    const availableUsers = users.filter(u => u.id !== 'user-3');

    const handleSendOtp = () => {
        if (mobile.length === 10) setStep(2);
    };

    const handleVerifyOtp = () => {
        if (otp.length === 4) setStep(3);
    };

    const handleLogin = () => {
        if (selectedUser) login(selectedUser);
    };

    const roleDescriptions = {
        admin: 'Full platform access across all organizations',
        manager: 'Manage fleet & tasks for your organization',
        driver: 'View assigned vehicle and active tasks'
    };

    return (
        <div className="login-page">
            <div className="login-bg-shapes">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
                <div className="shape shape-3" />
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="login-header">
                    <div className="login-logo"><Zap size={28} /></div>
                    <h1>ApexLogistics</h1>
                </div>

                {step === 1 && (
                    <motion.div className="login-form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="login-subtitle">
                            <Shield size={14} /><span>Secure Authentication</span>
                        </div>
                        <div className="input-group">
                            <label>Mobile Number</label>
                            <input
                                type="text"
                                placeholder="Mobile number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            />
                        </div>
                        <button className="login-btn" onClick={handleSendOtp} disabled={mobile.length !== 10}>
                            Send OTP
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div className="login-form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="login-subtitle">
                            <Shield size={14} /><span>Verify Mobile: +91 {mobile}</span>
                        </div>
                        <div className="input-group">
                            <label>One Time Password (OTP)</label>
                            <input
                                type="text"
                                placeholder="Enter 4-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            />
                        </div>
                        <button className="login-btn" onClick={handleVerifyOtp} disabled={otp.length !== 4}>
                            Verify & Proceed
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div className="login-form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="login-subtitle">
                            <Shield size={14} /><span>Select your role</span>
                        </div>
                        <div className="login-users">
                            {availableUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    className={`login-user-card ${selectedUser === user.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedUser(user.id)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="login-user-avatar"><Icon name={user.avatar} size={24} /></div>
                                    <div className="login-user-details">
                                        <h3>{user.name}</h3>
                                        <p className="login-user-title">{user.title}</p>
                                        <p className="login-user-desc">{roleDescriptions[user.role]}</p>
                                    </div>
                                    <div className={`login-role-badge role-${user.role}`}>
                                        {user.role}
                                    </div>
                                    <ChevronRight size={18} className="login-arrow" />
                                </motion.div>
                            ))}
                        </div>

                        <button className="login-btn" onClick={handleLogin} disabled={!selectedUser}>
                            <Truck size={18} />
                            <span>Enter ApexLogistics</span>
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
