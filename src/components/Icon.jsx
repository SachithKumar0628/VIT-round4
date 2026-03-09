import React from 'react';
import {
    Building2, Leaf, Shield, UserCircle, User,
    Truck, Bike, Bus, Car, HelpCircle
} from 'lucide-react';

export default function Icon({ name, size = 20, className = '' }) {
    const icons = {
        Building2,
        Leaf,
        Shield,
        UserCircle,
        User,
        Truck,
        Bike,
        Bus,
        Car
    };

    const ResolvedIcon = icons[name] || HelpCircle;
    return <ResolvedIcon size={size} className={className} />;
}
