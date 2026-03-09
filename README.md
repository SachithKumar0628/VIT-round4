<h1 align="center">
  <span style="color: #3b82f6;">Fleet</span><span style="color: #8b5cf6;">Command</span><br/>
  <span style="font-size: 1.2rem; color: #64748b; font-weight: 500;">Fleet Governance & Scheduling Platform</span>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/CSS3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

<p align="center">
  <strong style="color: #1e293b;">A premium, multi-tenant fleet management dashboard that controls vehicle visibility, manages logistics tasks, and utilizes an AI-driven scheduling engine to automatically recommend the absolute best vehicle for any job.</strong>
</p>

---

## 📋 Table of Contents
- [Problem Statement](#-problem-statement)
- [Core Features](#-core-features)
- [The Smart Scheduling Engine](#-the-smart-scheduling-engine)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [How to Run Locally](#-how-to-run-locally)
- [Project Structure](#-project-structure)

---

## <span style="color: #3b82f6;">01.</span> Problem Statement

Logistics and transport companies struggle to manage diverse fleets consisting of electric vehicles, traditional diesel trucks, and lightweight couriers across multiple organizational boundaries. 

**FleetCommand** solves this by acting as the central intelligence hub. It provides:
1. **Visibility Control**: Ensuring users only see the vehicles and tasks relevant to their specific role and organization.
2. **Intelligent Prioritization**: Automating the complex decision of assigning the right vehicle to the right task based on distance, capacity, battery level, and priority.

---

## <span style="color: #3b82f6;">02.</span> Core Features

### <span style="color: #8b5cf6;">Role-Based Access Control</span>
The system features a secure OTP-based login flow with distinct access levels:
- **Admin**: Full visibility across all organizations and global analytics.
- **Manager**: Access tightly scoped to their specific organization (e.g., FleetCorp or GreenLogistics).
- **Driver**: Restricted access showing only their assigned vehicle and immediate tasks.

### <span style="color: #8b5cf6;">Multi-Tenant Dashboard</span>
A premium, responsive interface featuring ambient glassmorphism aesthetics. The dashboard aggregates real-time metrics, active delivery tasks, and fleet availability status. A universal search bar allows instant filtering and navigation across the entire dataset.

### <span style="color: #8b5cf6;">Vehicle & Task Management</span>
Complete registries to add, track, and update vehicles. Fleet managers can monitor battery levels, fuel status, payload capacities, and health scores. The task manager supports creating complex delivery requests with specific constraints.

### <span style="color: #8b5cf6;">Comprehensive Reporting</span>
Visual analytics breaking down key performance indicators, fleet utilization by fuel type and category, and historical logs of automated scheduling decisions.

---

## <span style="color: #3b82f6;">03.</span> The Smart Scheduling Engine

The flagship feature of FleetCommand is its highly optimized scheduling algorithm.

When a dispatcher needs to assign a vehicle to a task, the engine instantaneously evaluates all available units using a multi-factor weighted scoring system:
- **Priority & Status matching**
- **Geographic Proximity** (Haversine distance calculation)
- **Energy Levels** (Ensuring EVs or Diesel trucks have sufficient range)
- **Payload Capacity** 
- **Category Synergies** (e.g., Routing EVs to city centers)
- **Maintenance Risk** (Health scores)

### Explainable Decisions
Instead of operating as a black box, every vehicle recommendation produced by the engine includes a detailed explanation panel. It explicitly lists the exact mathematical reasons, positive bonuses, and negative penalties that contributed to the final score (0-100), ensuring complete transparency for human operators.

---

## <span style="color: #3b82f6;">04.</span> Architecture & Tech Stack

### Frontend Components
- **Framework**: React.js 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS3 with extensive CSS Variables for scalable theming and responsive grid/flexbox layouts.
- **Animations**: Framer Motion for highly polished, fluid transitions and micro-interactions.
- **Icons**: Lucide React (Clean, professional SVG icons).

### Architecture Layer
- **State Management**: React Context API (`AuthContext`, `DataContext`).
- **Data Persistence**: In-memory simulation and LocalStorage for rapid deployment and testing.
- **Logic Engine**: Custom JavaScript module (`scheduler.js`) handling all algorithmic scoring and conflict resolution entirely on the client-side.

---

## <span style="color: #3b82f6;">05.</span> How to Run Locally

**Clone the repository**:
```bash
git clone https://github.com/Vignesh2139/LogicLoop-VehicleFleetPlatform.git
cd LogicLoop-VehicleFleetPlatform
```

**Install dependencies**:
```bash
npm install
```

**Start the development server**:
```bash
npm run dev
```

**Access the application**:
Open your browser and navigate to `http://localhost:5173`. 
> Use any standard 10-digit mobile number and any 4-digit OTP to authenticate and test the different organizational roles.

---

## <span style="color: #3b82f6;">06.</span> Project Structure

```text
src/
├── assets/             # Static assets
├── components/         # Reusable UI components (Sidebar, Header, Cards, Modals, Icons)
├── context/            # React Context providers for Auth and Data state
├── data/               # Mock database (vehicles, tasks, users, orgs)
├── engine/             # Core algorithmic logic (scheduler.js)
├── pages/              # Main route views (Login, Dashboard, Fleet, Tasks, Engine, Reports)
├── App.jsx             # Root layout and routing configuration
├── index.css           # Global design system, CSS variables, and utility classes
└── main.jsx            # Application entry point
```

---

<p align="center">
  <span style="color: #64748b; font-size: 0.9rem;">
    <i>Developed for the Fleet Governance & Scheduling Hackathon Challenge.</i>
  </span>
</p>
