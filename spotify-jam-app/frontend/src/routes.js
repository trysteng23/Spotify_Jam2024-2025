// src/routes.js - Handles navigation between pages
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HostLogin from './components/HostLogin';
import GuestJoin from './components/GuestJoin';
import HostDashboard from './components/HostDashboard';
import GuestDashboard from './components/GuestDashboard';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host-login" element={<HostLogin />} />
        <Route path="/guest-join" element={<GuestJoin />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
