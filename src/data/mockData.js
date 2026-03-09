// ============================================
// ApexLogistics – Complete Mock Data
// ============================================

export const organizations = [
    {
        id: 'org-1',
        name: 'FleetCorp Logistics',
        type: 'Logistics',
        logo: 'Building2',
        color: '#3b82f6',
        description: 'Full-service logistics company specializing in urban and interstate deliveries.',
        vehicleCount: 5,
        activeRoutes: 12,
        createdAt: '2024-01-15'
    },
    {
        id: 'org-2',
        name: 'GreenLogistics',
        type: 'Eco Transport',
        logo: 'Leaf',
        color: '#10b981',
        description: 'Sustainable transport solutions with an all-electric fleet.',
        vehicleCount: 4,
        activeRoutes: 8,
        createdAt: '2024-03-22'
    }
];

export const users = [
    {
        id: 'user-1',
        name: 'Arjun Mehta',
        email: 'arjun@fleetcommand.io',
        role: 'admin',
        orgId: null,
        avatar: 'Shield',
        title: 'Platform Administrator'
    },
    {
        id: 'user-2',
        name: 'Priya Sharma',
        email: 'priya@fleetcorp.com',
        role: 'manager',
        orgId: 'org-1',
        avatar: 'UserCircle',
        title: 'Fleet Manager – FleetCorp'
    },
    {
        id: 'user-3',
        name: 'Ravi Kumar',
        email: 'ravi@greenlogistics.com',
        role: 'manager',
        orgId: 'org-2',
        avatar: 'UserCircle',
        title: 'Operations Manager – GreenLogistics'
    },
    {
        id: 'user-4',
        name: 'Sneha Patel',
        email: 'sneha@fleetcorp.com',
        role: 'driver',
        orgId: 'org-1',
        avatar: 'User',
        title: 'Senior Driver – FleetCorp',
        assignedVehicle: 'v-1'
    }
];

export const vehicles = [
    // FleetCorp vehicles
    {
        id: 'v-1',
        name: 'Tata Ace EV',
        type: 'EV',
        category: 'Light Commercial',
        orgId: 'org-1',
        status: 'available',
        battery: 85,
        fuelType: 'Electric',
        loadCapacity: 750,
        maxRange: 154,
        currentRange: 131,
        licensePlate: 'MH-01-AB-1234',
        lastService: '2026-02-15',
        nextService: '2026-05-15',
        mileage: 15420,
        location: { lat: 19.076, lng: 72.8777, address: 'Andheri East, Mumbai' },
        image: 'Truck',
        healthScore: 92,
        specs: {
            year: 2025,
            make: 'Tata',
            model: 'Ace EV',
            color: 'White',
            vin: 'TAT2025EV001234'
        }
    },
    {
        id: 'v-2',
        name: 'Ashok Leyland Dost+',
        type: 'Diesel',
        category: 'Light Commercial',
        orgId: 'org-1',
        status: 'in-transit',
        battery: null,
        fuel: 72,
        fuelType: 'Diesel',
        loadCapacity: 1500,
        maxRange: 400,
        currentRange: 288,
        licensePlate: 'MH-02-CD-5678',
        lastService: '2026-01-20',
        nextService: '2026-04-20',
        mileage: 48200,
        location: { lat: 19.229, lng: 72.856, address: 'Borivali, Mumbai' },
        image: 'Truck',
        healthScore: 78,
        specs: {
            year: 2024,
            make: 'Ashok Leyland',
            model: 'Dost+',
            color: 'Blue',
            vin: 'ASH2024DS005678'
        }
    },
    {
        id: 'v-3',
        name: 'Mahindra Treo Zor',
        type: 'EV',
        category: 'Three-Wheeler',
        orgId: 'org-1',
        status: 'available',
        battery: 63,
        fuelType: 'Electric',
        loadCapacity: 550,
        maxRange: 125,
        currentRange: 79,
        licensePlate: 'MH-01-EF-9012',
        lastService: '2026-02-28',
        nextService: '2026-05-28',
        mileage: 9800,
        location: { lat: 19.017, lng: 72.856, address: 'Dadar, Mumbai' },
        image: 'Truck',
        healthScore: 88,
        specs: {
            year: 2025,
            make: 'Mahindra',
            model: 'Treo Zor',
            color: 'Yellow',
            vin: 'MAH2025TZ009012'
        }
    },
    {
        id: 'v-4',
        name: 'BharatBenz 1217C',
        type: 'Diesel',
        category: 'Heavy Duty',
        orgId: 'org-1',
        status: 'maintenance',
        battery: null,
        fuel: 45,
        fuelType: 'Diesel',
        loadCapacity: 8500,
        maxRange: 600,
        currentRange: 270,
        licensePlate: 'MH-03-GH-3456',
        lastService: '2026-03-01',
        nextService: '2026-06-01',
        mileage: 92000,
        location: { lat: 18.52, lng: 73.856, address: 'Pune Depot' },
        image: 'Truck',
        healthScore: 45,
        specs: {
            year: 2023,
            make: 'BharatBenz',
            model: '1217C',
            color: 'Red',
            vin: 'BB2023HC003456'
        }
    },
    {
        id: 'v-5',
        name: 'Hero Electric Nyx',
        type: 'EV',
        category: 'Two-Wheeler',
        orgId: 'org-1',
        status: 'available',
        battery: 94,
        fuelType: 'Electric',
        loadCapacity: 30,
        maxRange: 90,
        currentRange: 85,
        licensePlate: 'MH-01-IJ-7890',
        lastService: '2026-02-10',
        nextService: '2026-05-10',
        mileage: 3200,
        location: { lat: 19.113, lng: 72.869, address: 'Bandra, Mumbai' },
        image: 'Bike',
        healthScore: 96,
        specs: {
            year: 2025,
            make: 'Hero Electric',
            model: 'Nyx HX',
            color: 'Black',
            vin: 'HER2025NX007890'
        }
    },
    // GreenLogistics vehicles
    {
        id: 'v-6',
        name: 'Tata Prima EV',
        type: 'EV',
        category: 'Heavy Duty',
        orgId: 'org-2',
        status: 'available',
        battery: 71,
        fuelType: 'Electric',
        loadCapacity: 12000,
        maxRange: 250,
        currentRange: 178,
        licensePlate: 'KA-01-MN-2345',
        lastService: '2026-02-05',
        nextService: '2026-05-05',
        mileage: 34500,
        location: { lat: 12.971, lng: 77.594, address: 'Koramangala, Bangalore' },
        image: 'Truck',
        healthScore: 81,
        specs: {
            year: 2025,
            make: 'Tata',
            model: 'Prima EV',
            color: 'Green',
            vin: 'TAT2025PE002345'
        }
    },
    {
        id: 'v-7',
        name: 'Euler HiLoad',
        type: 'EV',
        category: 'Three-Wheeler',
        orgId: 'org-2',
        status: 'in-transit',
        battery: 38,
        fuelType: 'Electric',
        loadCapacity: 688,
        maxRange: 151,
        currentRange: 57,
        licensePlate: 'KA-02-OP-6789',
        lastService: '2026-01-25',
        nextService: '2026-04-25',
        mileage: 12400,
        location: { lat: 12.935, lng: 77.624, address: 'HSR Layout, Bangalore' },
        image: 'Truck',
        healthScore: 73,
        specs: {
            year: 2024,
            make: 'Euler Motors',
            model: 'HiLoad DV',
            color: 'White',
            vin: 'EUL2024HL006789'
        }
    },
    {
        id: 'v-8',
        name: 'Ather Rizta',
        type: 'EV',
        category: 'Two-Wheeler',
        orgId: 'org-2',
        status: 'available',
        battery: 88,
        fuelType: 'Electric',
        loadCapacity: 20,
        maxRange: 160,
        currentRange: 141,
        licensePlate: 'KA-01-QR-0123',
        lastService: '2026-02-20',
        nextService: '2026-05-20',
        mileage: 1800,
        location: { lat: 12.978, lng: 77.572, address: 'Indiranagar, Bangalore' },
        image: 'Bike',
        healthScore: 98,
        specs: {
            year: 2025,
            make: 'Ather',
            model: 'Rizta S',
            color: 'White',
            vin: 'ATH2025RS000123'
        }
    },
    {
        id: 'v-9',
        name: 'Olectra K9',
        type: 'EV',
        category: 'Bus',
        orgId: 'org-2',
        status: 'available',
        battery: 56,
        fuelType: 'Electric',
        loadCapacity: 5000,
        maxRange: 300,
        currentRange: 168,
        licensePlate: 'KA-03-ST-4567',
        lastService: '2026-01-30',
        nextService: '2026-04-30',
        mileage: 67000,
        location: { lat: 13.035, lng: 77.597, address: 'Yelahanka, Bangalore' },
        image: 'Bus',
        healthScore: 69,
        specs: {
            year: 2024,
            make: 'Olectra',
            model: 'K9',
            color: 'Blue',
            vin: 'OLE2024K9004567'
        }
    }
];

export const tasks = [
    {
        id: 't-1',
        name: 'Medical Supply Delivery',
        description: 'Urgent delivery of medical supplies to Pune Central Hospital',
        priority: 'critical',
        category: 'Medical',
        status: 'pending',
        orgId: 'org-1',
        assignedVehicle: null,
        requirements: {
            minCapacity: 200,
            preferEV: true,
            zone: 'city-center',
            maxDistance: 150
        },
        destination: { address: 'Pune Central Hospital', lat: 18.52, lng: 73.856 },
        createdAt: '2026-03-06T09:00:00',
        deadline: '2026-03-06T14:00:00'
    },
    {
        id: 't-2',
        name: 'Warehouse Restock',
        description: 'Transport inventory from main warehouse to distribution center',
        priority: 'high',
        category: 'Logistics',
        status: 'pending',
        orgId: 'org-1',
        assignedVehicle: null,
        requirements: {
            minCapacity: 5000,
            preferEV: false,
            zone: 'highway',
            maxDistance: 400
        },
        destination: { address: 'Nashik Distribution Center', lat: 20.0, lng: 73.78 },
        createdAt: '2026-03-06T08:30:00',
        deadline: '2026-03-07T08:00:00'
    },
    {
        id: 't-3',
        name: 'Document Pickup',
        description: 'Pick up legal documents from Bandra office',
        priority: 'medium',
        category: 'Courier',
        status: 'pending',
        orgId: 'org-1',
        assignedVehicle: null,
        requirements: {
            minCapacity: 5,
            preferEV: true,
            zone: 'city-center',
            maxDistance: 30
        },
        destination: { address: 'Bandra Office Complex', lat: 19.054, lng: 72.840 },
        createdAt: '2026-03-06T10:00:00',
        deadline: '2026-03-06T16:00:00'
    },
    {
        id: 't-4',
        name: 'E-Commerce Delivery Batch',
        description: 'Deliver 50 packages to HSR Layout residential area',
        priority: 'high',
        category: 'E-Commerce',
        status: 'pending',
        orgId: 'org-2',
        assignedVehicle: null,
        requirements: {
            minCapacity: 600,
            preferEV: true,
            zone: 'city-center',
            maxDistance: 100
        },
        destination: { address: 'HSR Layout, Bangalore', lat: 12.914, lng: 77.637 },
        createdAt: '2026-03-06T07:00:00',
        deadline: '2026-03-06T18:00:00'
    },
    {
        id: 't-5',
        name: 'Staff Shuttle Service',
        description: 'Morning shuttle service from Yelahanka to Electronic City',
        priority: 'medium',
        category: 'Transport',
        status: 'in-progress',
        orgId: 'org-2',
        assignedVehicle: 'v-9',
        requirements: {
            minCapacity: 3000,
            preferEV: true,
            zone: 'highway',
            maxDistance: 50
        },
        destination: { address: 'Electronic City, Bangalore', lat: 12.839, lng: 77.677 },
        createdAt: '2026-03-06T06:00:00',
        deadline: '2026-03-06T09:00:00'
    },
    {
        id: 't-6',
        name: 'Grocery Last-Mile',
        description: 'Deliver fresh groceries to Indiranagar residences',
        priority: 'low',
        category: 'Grocery',
        status: 'pending',
        orgId: 'org-2',
        assignedVehicle: null,
        requirements: {
            minCapacity: 15,
            preferEV: true,
            zone: 'city-center',
            maxDistance: 20
        },
        destination: { address: 'Indiranagar, Bangalore', lat: 12.978, lng: 77.640 },
        createdAt: '2026-03-06T09:30:00',
        deadline: '2026-03-06T13:00:00'
    }
];

export const scheduleHistory = [
    {
        id: 's-1',
        taskId: 't-5',
        vehicleId: 'v-9',
        score: 82,
        assignedAt: '2026-03-06T05:45:00',
        status: 'active',
        explanation: [
            'Vehicle has sufficient capacity (5000 kg ≥ 3000 kg required)',
            'Electric vehicle preferred for this route — bonus applied',
            'Closest available vehicle to the pickup location',
            'Good battery level (56%) sufficient for 50 km route'
        ]
    }
];

export const priorityConfig = {
    critical: { label: 'Critical', color: '#dc2626', weight: 1.0 },
    high: { label: 'High', color: '#f59e0b', weight: 0.75 },
    medium: { label: 'Medium', color: '#3b82f6', weight: 0.5 },
    low: { label: 'Low', color: '#6b7280', weight: 0.25 }
};

export const statusConfig = {
    available: { label: 'Available', color: '#10b981', bg: '#ecfdf5' },
    'in-transit': { label: 'In Transit', color: '#3b82f6', bg: '#eff6ff' },
    maintenance: { label: 'Maintenance', color: '#f59e0b', bg: '#fffbeb' },
    offline: { label: 'Offline', color: '#6b7280', bg: '#f3f4f6' }
};

export const taskStatusConfig = {
    pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
    'in-progress': { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
    completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
    cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#f3f4f6' }
};
