import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Organizations from './pages/Organizations';
import Tasks from './pages/Tasks';
import SchedulingEngine from './pages/SchedulingEngine';
import Reports from './pages/Reports';
import Identity from './pages/Identity';
import Telemetry from './pages/Telemetry';
import Diagnosis from './pages/Diagnosis';
import Maintenance from './pages/Maintenance';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DataProvider>
      <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="main-content">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/identity" element={<Identity />} />
              <Route path="/telemetry" element={<Telemetry />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/engine" element={<SchedulingEngine />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </div>
      </div>
    </DataProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
