import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import {
    LayoutDashboard,
    Truck,
    Building2,
    ClipboardList,
    Brain,
    BarChart3,
    LogOut,
    Zap,
    Shield,
    ShieldCheck,
    Radio,
    Activity,
    Wrench,
    MoreVertical,
    X
} from 'lucide-react';
import './Sidebar.css';

const navSections = [
    {
        label: 'Overview',
        items: [
            { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'driver'] },
        ]
    },
    {
        label: 'Intelligence',
        items: [
            { path: '/identity', icon: ShieldCheck, label: 'Secure Onboarding', roles: ['admin', 'manager'], badge: 'ID' },
            { path: '/telemetry', icon: Radio, label: 'Live Telemetry', roles: ['admin', 'manager', 'driver'], badge: 'LIVE' },
            { path: '/diagnosis', icon: Activity, label: 'Diagnosis Engine', roles: ['admin', 'manager'], badge: 'AI' },
            { path: '/maintenance', icon: Wrench, label: 'Maintenance', roles: ['admin', 'manager'] },
        ]
    },
    {
        label: 'Fleet Operations',
        items: [
            { path: '/fleet', icon: Truck, label: 'Fleet Registry', roles: ['admin', 'manager', 'driver'] },
            { path: '/tasks', icon: ClipboardList, label: 'Task Manager', roles: ['admin', 'manager'] },
            { path: '/engine', icon: Brain, label: 'Scheduling Engine', roles: ['admin', 'manager'], badge: 'AI' },
        ]
    },
    {
        label: 'Management',
        items: [
            { path: '/organizations', icon: Building2, label: 'Organizations', roles: ['admin'] },
            { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
        ]
    }
];

export default function Sidebar() {
    const { currentUser, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <aside className={`sidebar ${menuOpen ? 'menu-expanded' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Zap size={22} />
                </div>
                <div className="sidebar-brand-text">
                    <h2>ApexLogistics</h2>
                </div>
                <button className="sidebar-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={18} /> : <MoreVertical size={18} />}
                </button>
            </div>

            <nav className={`sidebar-nav ${menuOpen ? 'nav-visible' : ''}`}>
                {navSections.map(section => {
                    const visibleItems = section.items.filter(item =>
                        item.roles.includes(currentUser?.role)
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.label} className="nav-section">
                            <div className="nav-section-label">{section.label}</div>
                            {visibleItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? 'active' : ''}`
                                    }
                                    end={item.path === '/'}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <item.icon size={19} />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className={`nav-badge nav-badge-${item.badge.toLowerCase()}`}>{item.badge}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-bottom">
                {isAdmin && (
                    <div className="sidebar-admin-badge">
                        <Shield size={14} />
                        <span>Admin Access</span>
                    </div>
                )}
                <div className="sidebar-user">
                    <div className="sidebar-avatar"><Icon name={currentUser?.avatar} size={24} /></div>
                    <div className="sidebar-user-info">
                        <p className="sidebar-username">{currentUser?.name}</p>
                        <p className="sidebar-role">{currentUser?.title}</p>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={logout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
