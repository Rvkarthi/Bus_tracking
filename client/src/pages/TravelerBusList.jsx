import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../context';

const TravelerBusList = () => {
    const [buses, setBuses] = useState([]);
    const [org, setOrg] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedOrg = localStorage.getItem('traveler_org');
        if (!savedOrg) return navigate('/traveler/select-org');

        const parsedOrg = JSON.parse(savedOrg);
        setOrg(parsedOrg);

        const fetchBuses = async () => {
            try {
                const res = await axios.get(`${api}/api/traveler/buses/${parsedOrg._id}`);
                setBuses(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBuses();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-brand-900">{org?.name}</h2>
                    <p className="text-sm text-gray-500">Live Bus Status</p>
                </div>
                <button onClick={() => {
                    localStorage.removeItem('traveler_org');
                    navigate('/traveler/select-org');
                }} className="text-xs text-brand-600 font-medium">Change Org</button>
            </div>

            <div className="grid gap-4">
                {buses.map(bus => (
                    <div
                        key={bus._id}
                        onClick={() => navigate(`/traveler/map/${bus._id}`)}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{bus.name}</h3>
                            <p className="text-sm text-gray-500">{bus.number}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-600">Track</span>
                        </div>
                    </div>
                ))}
                {buses.length === 0 && <p className="text-gray-500">No buses found for this organization.</p>}
            </div>
        </div>
    );
};

export default TravelerBusList;
