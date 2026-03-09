// ============================================
// ApexLogistics – Scheduling Engine
// Weighted Scoring Algorithm with Explainability
// ============================================

/**
 * Calculate distance between two lat/lng points (Haversine formula)
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Weights for the scoring algorithm
 */
const WEIGHTS = {
    priority: 20,      // w1: How well the vehicle priority matches task urgency
    proximity: 25,     // w2: How close the vehicle is to the destination
    energy: 20,        // w3: Battery/fuel availability
    capacity: 15,      // w4: Load capacity match
    categoryBonus: 10, // w5: Category-specific bonuses
    health: 10         // w6: Vehicle health score
};

/**
 * Score a single vehicle for a given task
 * Returns { score, breakdown, reasons }
 */
export function scoreVehicle(vehicle, task) {
    const breakdown = {};
    const reasons = [];
    let totalScore = 0;

    // 1. Vehicle Availability Check
    if (vehicle.status !== 'available') {
        return {
            score: 0,
            breakdown: {},
            reasons: [`❌ Vehicle is currently "${vehicle.status}" — not available for assignment`],
            eligible: false
        };
    }

    // 2. Organization Match
    if (vehicle.orgId !== task.orgId) {
        return {
            score: 0,
            breakdown: {},
            reasons: ['❌ Vehicle belongs to a different organization'],
            eligible: false
        };
    }

    // 3. Capacity Check
    const capacityRatio = vehicle.loadCapacity / task.requirements.minCapacity;
    if (capacityRatio < 1) {
        breakdown.capacity = 0;
        reasons.push(`❌ Insufficient capacity: ${vehicle.loadCapacity} kg < ${task.requirements.minCapacity} kg required`);
        return {
            score: 0,
            breakdown,
            reasons,
            eligible: false
        };
    }
    // Score: perfect match = 100%, oversized = diminishing returns
    const capacityScore = Math.min(capacityRatio, 3) / 3 * 100;
    breakdown.capacity = Math.round(capacityScore);
    totalScore += (capacityScore / 100) * WEIGHTS.capacity;
    if (capacityRatio >= 1 && capacityRatio <= 2) {
        reasons.push(`✅ Good capacity match: ${vehicle.loadCapacity} kg can carry ${task.requirements.minCapacity} kg (${Math.round(capacityRatio * 100)}% fit)`);
    } else {
        reasons.push(`⚠️ Vehicle oversized for task: ${vehicle.loadCapacity} kg for ${task.requirements.minCapacity} kg needed`);
    }

    // 4. Proximity Score
    let proximityScore = 50; // Default if no location data
    if (vehicle.location && task.destination) {
        const distance = haversineDistance(
            vehicle.location.lat, vehicle.location.lng,
            task.destination.lat, task.destination.lng
        );
        const maxDist = task.requirements.maxDistance || 500;
        proximityScore = Math.max(0, (1 - distance / maxDist) * 100);
        breakdown.proximity = Math.round(proximityScore);
        totalScore += (proximityScore / 100) * WEIGHTS.proximity;

        if (distance < maxDist * 0.3) {
            reasons.push(`✅ Very close to destination: ${Math.round(distance)} km away`);
        } else if (distance < maxDist) {
            reasons.push(`📍 Within range: ${Math.round(distance)} km to destination (max ${maxDist} km)`);
        } else {
            reasons.push(`⚠️ Far from destination: ${Math.round(distance)} km (exceeds ${maxDist} km preferred range)`);
        }
    }

    // 5. Energy Score (Battery/Fuel)
    const energyLevel = vehicle.battery ?? vehicle.fuel ?? 50;
    const energyScore = energyLevel; // Direct percentage
    breakdown.energy = Math.round(energyScore);
    totalScore += (energyScore / 100) * WEIGHTS.energy;

    const fuelLabel = vehicle.fuelType === 'Electric' ? 'Battery' : 'Fuel';
    if (energyLevel >= 70) {
        reasons.push(`✅ ${fuelLabel} level strong: ${energyLevel}%`);
    } else if (energyLevel >= 40) {
        reasons.push(`${fuelLabel} level adequate: ${energyLevel}%`);
    } else {
        reasons.push(`⚠️ Low ${fuelLabel.toLowerCase()} level: ${energyLevel}% — may need charging/refueling`);
    }

    // 6. Category / EV Bonus
    let categoryScore = 50; // Base
    if (task.requirements.preferEV && vehicle.fuelType === 'Electric') {
        categoryScore = 100;
        reasons.push('🌱 Electric vehicle preferred for this task — bonus applied');
    } else if (task.requirements.preferEV && vehicle.fuelType !== 'Electric') {
        categoryScore = 20;
        reasons.push('⚠️ Non-electric vehicle: EV preferred for this zone/task');
    } else {
        categoryScore = 60;
        reasons.push(`🔧 Vehicle type (${vehicle.fuelType}) is acceptable for this task`);
    }

    // Zone-specific bonuses
    if (task.requirements.zone === 'city-center' && vehicle.fuelType === 'Electric') {
        categoryScore = Math.min(100, categoryScore + 20);
        reasons.push('🏙️ EV bonus for city-center delivery zone');
    }
    if (task.requirements.zone === 'highway' && vehicle.category === 'Heavy Duty') {
        categoryScore = Math.min(100, categoryScore + 15);
        reasons.push('🛣️ Heavy-duty vehicle bonus for highway route');
    }

    breakdown.categoryBonus = Math.round(categoryScore);
    totalScore += (categoryScore / 100) * WEIGHTS.categoryBonus;

    // 7. Health Score
    const healthScore = vehicle.healthScore || 50;
    breakdown.health = Math.round(healthScore);
    totalScore += (healthScore / 100) * WEIGHTS.health;

    if (healthScore >= 80) {
        reasons.push(`✅ Excellent vehicle health: ${healthScore}/100`);
    } else if (healthScore >= 60) {
        reasons.push(`📊 Acceptable vehicle health: ${healthScore}/100`);
    } else {
        reasons.push(`⚠️ Low health score: ${healthScore}/100 — maintenance may be needed soon`);
    }

    // 8. Priority weight (how well aligned this vehicle is for the task priority)
    const priorityWeights = { critical: 1.0, high: 0.75, medium: 0.5, low: 0.25 };
    const taskUrgency = priorityWeights[task.priority] || 0.5;
    // Higher health + higher energy = better for urgent tasks
    const priorityScore = ((healthScore / 100) * 0.5 + (energyLevel / 100) * 0.5) * 100 * taskUrgency;
    breakdown.priority = Math.round(priorityScore);
    totalScore += (priorityScore / 100) * WEIGHTS.priority;

    const finalScore = Math.min(100, Math.round(totalScore));

    return {
        score: finalScore,
        breakdown,
        reasons,
        eligible: true
    };
}

/**
 * Score all vehicles for a given task and return sorted recommendations
 */
export function getRecommendations(vehicles, task) {
    const results = vehicles.map(vehicle => {
        const result = scoreVehicle(vehicle, task);
        return {
            vehicle,
            ...result
        };
    });

    // Sort by score (highest first), eligible first
    results.sort((a, b) => {
        if (a.eligible && !b.eligible) return -1;
        if (!a.eligible && b.eligible) return 1;
        return b.score - a.score;
    });

    return results;
}

/**
 * Auto-assign the best vehicle for a task
 */
export function autoAssign(vehicles, task) {
    const recommendations = getRecommendations(vehicles, task);
    const best = recommendations.find(r => r.eligible);

    if (!best) {
        return {
            success: false,
            message: 'No eligible vehicles found for this task',
            recommendations
        };
    }

    return {
        success: true,
        assignedVehicle: best.vehicle,
        score: best.score,
        reasons: best.reasons,
        breakdown: best.breakdown,
        recommendations
    };
}

/**
 * Resolve conflicts when multiple tasks want the same vehicle
 */
export function resolveConflicts(tasks, vehicles) {
    const assignments = {};
    const assignedVehicles = new Set();

    // Sort tasks by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedTasks = [...tasks]
        .filter(t => t.status === 'pending')
        .sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

    for (const task of sortedTasks) {
        const availableVehicles = vehicles.filter(v => !assignedVehicles.has(v.id));
        const result = autoAssign(availableVehicles, task);

        if (result.success) {
            assignments[task.id] = {
                vehicleId: result.assignedVehicle.id,
                vehicleName: result.assignedVehicle.name,
                score: result.score,
                reasons: result.reasons
            };
            assignedVehicles.add(result.assignedVehicle.id);
        }
    }

    return assignments;
}
