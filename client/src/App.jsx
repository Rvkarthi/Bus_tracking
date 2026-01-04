import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OrgLogin from './pages/OrgLogin';
import OrgDashboard from './pages/OrgDashboard';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import TravelerOrgSelect from './pages/TravelerOrgSelect';
import TravelerBusList from './pages/TravelerBusList';
import BusMap from './pages/BusMap';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/setup" element={<Navigate to="/admin/login" replace />} /> {/* Redirect old route */}

            {/* Organization Routes */}
            <Route path="/org/login" element={<OrgLogin />} />
            <Route path="/org/dashboard" element={<OrgDashboard />} />

            {/* Driver Routes */}
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />

            {/* Traveler Routes */}
            <Route path="/traveler/select-org" element={<TravelerOrgSelect />} />
            <Route path="/traveler/buses" element={<TravelerBusList />} />
            <Route path="/traveler/map/:busId" element={<BusMap />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
