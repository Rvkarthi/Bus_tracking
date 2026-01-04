import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../context';
import gsap from 'gsap';
import SkeletonLoader from '../components/SkeletonLoader';

const TravelerBusList = () => {
    const [buses, setBuses] = useState([]);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetchBuses();
    }, [navigate]);

    return (
        <div className="min-h-screen p-4"> {/* Global gradient */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{org?.name}</h2>
                    <p className="text-sm text-gray-500">Live Bus Status</p>
                </div>
                <button onClick={() => {
                    localStorage.removeItem('traveler_org');
                    navigate('/traveler/select-org');
                }} className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors">Change Org</button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    // Skeleton Loading
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/50 p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="w-full">
                                <SkeletonLoader type="text" className="h-6 w-1/2 mb-2" />
                                <SkeletonLoader type="text" className="h-4 w-1/3" />
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        {buses.map(bus => (
                            <div
                                key={bus._id}
                                onClick={() => navigate(`/traveler/map/${bus._id}`)}
                                className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-white/50 flex justify-between items-center cursor-pointer hover:bg-white/95 hover:shadow-md transition-all"
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
                    </>
                )}
            </div>
        </div>
    );
};

export default TravelerBusList;
