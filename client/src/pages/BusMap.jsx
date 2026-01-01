import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSocket } from '../context/SocketContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Child component to update map view
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

const BusMap = () => {
    const { busId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();
    const [position, setPosition] = useState(null); // [lat, lng]
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleLocationUpdate = (data) => {
            if (data.busId === busId) {
                setPosition([data.lat, data.lng]);
                setLastUpdate(new Date());
            }
        };

        socket.on(`bus-location-${busId}`, handleLocationUpdate);

        return () => {
            socket.off(`bus-location-${busId}`, handleLocationUpdate);
        };
    }, [socket, busId]);

    return (
        <div className="h-screen w-full relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-[9999] bg-white p-3 rounded-full shadow-lg"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>

            {/* Info Card */}
            <div className="absolute bottom-6 left-4 right-4 z-[9999] bg-white p-4 rounded-xl shadow-xl">
                <h3 className="font-bold text-lg">Bus Location</h3>
                <p className="text-gray-500 text-sm">
                    {lastUpdate ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Waiting for signal...'}
                </p>
            </div>

            <MapContainer
                center={[20.5937, 78.9629]} // Default India center, or user's location
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                {position && (
                    <>
                        <Marker position={position}>
                            <Popup>Current Bus Location</Popup>
                        </Marker>
                        <MapUpdater center={position} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default BusMap;
