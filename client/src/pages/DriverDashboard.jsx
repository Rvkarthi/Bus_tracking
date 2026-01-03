import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const DriverDashboard = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [driver, setDriver] = useState(null);

  const socket = useSocket();
  const navigate = useNavigate();
  const trackingRef = useRef(false);

  useEffect(() => {
    const d = localStorage.getItem('driver');
    if (!d) {
      navigate('/driver/login');
      return;
    }
    setDriver(JSON.parse(d));
  }, [navigate]);

  /**
   * Android -> WebView bridge
   * LocationService calls this function
   */
  useEffect(() => {
    window.androidLocationUpdate = (location) => {
      if (!trackingRef.current || !socket || !driver) return;

      const data = {
        busId: driver.busId,
        lat: location.latitude,
        lng: location.longitude,
        speed: location.speed,
        timestamp: new Date()
      };

      socket.emit('update-location', data);
      setStatus('Tracking Active...');
    };

    return () => {
      delete window.androidLocationUpdate;
    };
  }, [socket, driver]);

  const toggleTracking = () => {
    if (isTracking) {
      trackingRef.current = false;
      setIsTracking(false);
      setStatus('Stopped');
    } else {
      trackingRef.current = true;
      setIsTracking(true);
      setStatus('Waiting for GPS...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <div>
          <h1 className="text-2xl font-bold opacity-80">Drivers Console</h1>
          <p className="text-gray-400 mt-1">Bus: {driver?.username}</p>
        </div>

        <div
          className={`text-xl font-mono p-4 rounded-lg bg-gray-800 ${
            status.includes('Error') ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {status}
        </div>

        <button
          onClick={toggleTracking}
          className={`w-64 h-64 rounded-full text-3xl font-bold shadow-2xl transition-all transform active:scale-95 flex items-center justify-center border-8 
          ${
            isTracking
              ? 'bg-red-600 border-red-800 hover:bg-red-700 animate-pulse'
              : 'bg-green-600 border-green-800 hover:bg-green-700'
          }`}
        >
          {isTracking ? 'STOP' : 'START'}
        </button>

        <div className="text-sm text-gray-500">
          <p>Native GPS running in background</p>
          <p>No browser location used</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('driver');
            navigate('/');
          }}
          className="text-gray-600 underline text-sm mt-8"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DriverDashboard;
