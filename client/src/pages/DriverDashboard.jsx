import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const DriverDashboard = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('Ready');
    const [driver, setDriver] = useState(null);
    const navigate = useNavigate();
    const socket = useSocket();
    const watchId = useRef(null);
    const wakeLock = useRef(null);

    useEffect(() => {
        const d = localStorage.getItem('driver');
        if (!d) return navigate('/driver/login');
        setDriver(JSON.parse(d));
    }, [navigate]);

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLock.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock active');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleTracking = async () => {
        if (isTracking) {
            // Stop tracking
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (wakeLock.current) wakeLock.current.release();
            setIsTracking(false);
            setStatus('Stopped');
        } else {
            // Start tracking
            if (!driver) return;
            await requestWakeLock();

            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }

            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    const data = {
                        busId: driver.busId,
                        lat: latitude,
                        lng: longitude,
                        timestamp: new Date(),
                        speed
                    };

                    // Send to server via socket
                    if (socket) {
                        socket.emit('update-location', data);
                    }

                    setStatus(`Tracking Active...`);
                },
                (error) => {
                    console.error(error);
                    setStatus(`Error: ${error.message}`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );

            setIsTracking(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm text-center space-y-8">
                <div>
                    <h1 className="text-2xl font-bold opacity-80">Drivers Console</h1>
                    <p className="text-gray-400 mt-1">Bus: {driver?.username}</p>
                </div>

                <div className={`text-xl font-mono p-4 rounded-lg bg-gray-800 ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                    {status}
                </div>

                <button
                    onClick={toggleTracking}
                    className={`w-64 h-64 rounded-full text-3xl font-bold shadow-2xl transition-all transform active:scale-95 flex items-center justify-center border-8 
            ${isTracking ? 'bg-red-600 border-red-800 hover:bg-red-700 animate-pulse' : 'bg-green-600 border-green-800 hover:bg-green-700'}`}
                >
                    {isTracking ? 'STOP' : 'START'}
                </button>

                <div className="text-sm text-gray-500">
                    <p>⚠️ Keep this screen ON and open.</p>
                    <p>Do not switch apps if possible.</p>
                </div>

                <button onClick={() => {
                    localStorage.removeItem('driver');
                    navigate('/');
                }} className="text-gray-600 underline text-sm mt-8">Logout</button>
            </div>
        </div>
    );
};

export default DriverDashboard;
