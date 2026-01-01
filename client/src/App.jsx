import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminSetup from './pages/AdminSetup';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import TravelerOrgSelect from './pages/TravelerOrgSelect';
import TravelerBusList from './pages/TravelerBusList';
import BusMap from './pages/BusMap';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/traveler/select-org" element={<TravelerOrgSelect />} />
          <Route path="/traveler/buses" element={<TravelerBusList />} />
          <Route path="/traveler/map/:busId" element={<BusMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
