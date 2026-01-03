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

    // --- NEW: Flag to detect if running in our Android App ---
    const isAndroidApp = !!window.androidLocationUpdate;

    useEffect(() => {
        const d = localStorage.getItem('driver');
        if (!d) return navigate('/driver/login');
        const driverData = JSON.parse(d);
        setDriver(driverData);

        // --- NEW: Bridge to receive location from Android Foreground Service ---
        // This function will be called directly by the native Java code.
        window.androidLocationUpdate = (location) => {
            console.log('Received location from Android:', location);

            // Create a data object similar to the original one
            const data = {
                busId: driverData.busId,
                lat: location.latitude,
                lng: location.longitude,
                timestamp: new Date(),
                speed: location.speed || null // Speed might not always be available
            };

            // Send to server via socket
            if (socket) {
                socket.emit('update-location', data);
            }

            // Update UI status
            setIsTracking(true);
            setStatus(`Tracking Active (Native)`);
        };

        // If in the app, set the status to indicate native tracking is ready.
        if (isAndroidApp) {
            setStatus('Ready for Native Tracking');
        }

        // Cleanup function to avoid memory leaks when the component unmounts
        return () => {
            // Remove the function from the window object
            delete window.androidLocationUpdate;
            // Stop web-based tracking if it's running
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
        // Rerun this effect if the socket connection changes
    }, [navigate, socket, isAndroidApp]);


    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLock.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock active');
            }
        } catch (err) {
            console.error('Could not request Wake Lock:', err);
        }
    };

    const toggleTracking = async () => {
        // --- NEW: Logic to handle Android App vs. Web Browser ---
        if (isAndroidApp) {
            // In the Android app, tracking is automatic via the Foreground Service.
            // The button doesn't need to do anything except provide feedback.
            setStatus("Native tracking is automatic.");
            alert("This app tracks location automatically in the background. You don't need to start it manually.");
            return;
        }

        // --- Existing logic for Web Browsers ---
        if (isTracking) {
            // Stop tracking
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
            if (wakeLock.current) {
                wakeLock.current.release();
                wakeLock.current = null;
            }
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
                    {isAndroidApp ? (
                        <p>✅ Native background tracking is active.</p>
                    ) : (
                        <>
                            <p>⚠️ Keep this screen ON and open.</p>
                            <p>Do not switch apps if possible.</p>
                        </>
                    )}
                </div>

                <button onClick={() => {
                    localStorage.removeItem('driver');
                    if (wakeLock.current) wakeLock.current.release(); // Release wakelock on logout
                    navigate('/');
                }} className="text-gray-600 underline text-sm mt-8">Logout</button>
            </div>
        </div>
    );
};

export default DriverDashboard;

