import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Icon from './Icon';
import { Search, Bell, Truck, ClipboardList, Building2, CheckCircle, Menu, X } from 'lucide-react';
import './Header.css';

export default function Header({ toggleSidebar }) {
    const { currentUser } = useAuth();
    const { stats, vehicles, tasks } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const statItems = [
        { icon: Truck, label: 'Fleet', value: stats.totalVehicles, color: '#3b82f6' },
        { icon: ClipboardList, label: 'Active Tasks', value: stats.activeTasks, color: '#f59e0b' },
        { icon: Building2, label: 'Organizations', value: stats.totalOrgs, color: '#8b5cf6' },
        { icon: CheckCircle, label: 'Completed', value: stats.completedTasks, color: '#10b981' },
    ];

    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const searchResults = searchQuery.trim() === '' ? { vehicles: [], tasks: [] } : {
        vehicles: vehicles.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
        tasks: tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    };

    const hasResults = searchResults.vehicles.length > 0 || searchResults.tasks.length > 0;

    return (
        <header className="top-header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="header-date">
                    <span className="header-day">{day}</span>
                    <span className="header-full-date">{date}</span>
                </div>
            </div>

            <div className="header-stats">
                {statItems.map((item, i) => (
                    <div key={i} className="header-stat" style={{ '--stat-color': item.color }}>
                        <item.icon size={16} />
                        <div>
                            <span className="stat-value">{item.value}</span>
                            <span className="stat-label">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="header-right">
                <div className={`header-search ${isSearchFocused ? 'focused' : ''}`}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search fleet, tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />

                    {isSearchFocused && searchQuery.trim() !== '' && (
                        <div className="search-results-dropdown">
                            {hasResults ? (
                                <>
                                    {searchResults.vehicles.length > 0 && (
                                        <div className="search-section">
                                            <h4>Vehicles</h4>
                                            {searchResults.vehicles.map(v => (
                                                <div key={v.id} className="search-item">
                                                    <Icon name={v.image} size={14} />
                                                    <span>{v.name}</span>
                                                    <small>{v.licensePlate}</small>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.tasks.length > 0 && (
                                        <div className="search-section">
                                            <h4>Tasks</h4>
                                            {searchResults.tasks.map(t => (
                                                <div key={t.id} className="search-item">
                                                    <ClipboardList size={14} />
                                                    <span>{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="search-no-results">No matches found for "{searchQuery}"</div>
                            )}
                        </div>
                    )}
                </div>
                <button className="header-notification">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </button>
                <div className="header-user-compact">
                    <span><Icon name={currentUser?.avatar} size={20} /></span>
                </div>
            </div>
        </header>
    );
}
