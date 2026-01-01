import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TravelerOrgSelect = () => {
    const [orgs, setOrgs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if valid org already saved
        const savedOrg = localStorage.getItem('traveler_org');
        if (savedOrg) {
            navigate('/traveler/buses'); // Skip checking if valid for speed, or could validate
        }

        const fetchOrgs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/traveler/organizations');
                setOrgs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOrgs();
    }, [navigate]);

    const selectOrg = (org) => {
        localStorage.setItem('traveler_org', JSON.stringify(org));
        navigate('/traveler/buses');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Select Organization</h2>
            <div className="space-y-4">
                {orgs.map(org => (
                    <button
                        key={org._id}
                        onClick={() => selectOrg(org)}
                        className="w-full text-left p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                        <h3 className="font-semibold text-lg text-gray-800">{org.name}</h3>
                        <p className="text-xs text-gray-400">Tap to view buses</p>
                    </button>
                ))}
                {orgs.length === 0 && <p className="text-gray-500">No organizations found.</p>}
            </div>
        </div>
    );
};

export default TravelerOrgSelect;
