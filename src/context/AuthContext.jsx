import { createContext, useContext, useState } from 'react';
import { users } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const login = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('fleetcommand_user', JSON.stringify(user));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('fleetcommand_user');
    };

    const isAdmin = currentUser?.role === 'admin';
    const isManager = currentUser?.role === 'manager';
    const isDriver = currentUser?.role === 'driver';

    // Determine which orgs the user can see
    const canSeeOrg = (orgId) => {
        if (isAdmin) return true;
        return currentUser?.orgId === orgId;
    };

    // Determine which vehicles the user can see
    const canSeeVehicle = (vehicle) => {
        if (isAdmin) return true;
        if (isDriver) return vehicle.id === currentUser?.assignedVehicle;
        return vehicle.orgId === currentUser?.orgId;
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            login,
            logout,
            isAdmin,
            isManager,
            isDriver,
            canSeeOrg,
            canSeeVehicle,
            isAuthenticated: !!currentUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
