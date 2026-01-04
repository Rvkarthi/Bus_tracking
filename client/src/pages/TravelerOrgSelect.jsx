import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../context';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import SkeletonLoader from '../components/SkeletonLoader';

const TravelerOrgSelect = () => {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Checking for saved org can be immediate, but if we want to show loading...
        const savedOrg = localStorage.getItem('traveler_org');
        if (savedOrg) {
            navigate('/traveler/buses');
            return;
        }

        const fetchOrgs = async () => {
            try {
                const res = await axios.get(api + '/api/traveler/organizations');
                // Simulate a small delay to show skeleton if network is too fast (optional, but good for UX feel)
                // await new Promise(resolve => setTimeout(resolve, 800)); 
                setOrgs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, [navigate]);

    const selectOrg = (org) => {
        localStorage.setItem('traveler_org', JSON.stringify(org));
        navigate('/traveler/buses');
    };

    return (
        <div className="min-h-screen p-6"> {/* Inherits global gradient from index.css */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 drop-shadow-sm">Select Organization</h2>
            <div className="space-y-4">
                {loading ? (
                    // Skeleton Loading
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="w-full p-4 bg-white/50 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                            <SkeletonLoader type="text" className="h-6 w-1/3" />
                            <SkeletonLoader type="text" className="h-3 w-1/4" />
                        </div>
                    ))
                ) : (
                    <>
                        {orgs.map(org => (
                            <button
                                key={org._id}
                                onClick={() => selectOrg(org)}
                                className="w-full text-left p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-white/50"
                            >
                                <h3 className="font-semibold text-lg text-gray-800">{org.name}</h3>
                                <p className="text-xs text-gray-500">Tap to view buses</p>
                            </button>
                        ))}
                        {orgs.length === 0 && <p className="text-gray-500">No organizations found.</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default TravelerOrgSelect;
