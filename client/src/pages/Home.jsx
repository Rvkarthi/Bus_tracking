import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/trackmybus.jpeg';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hasVisited = localStorage.getItem('hasVisited');
        if (hasVisited) {
            navigate('/traveler/select-org', { replace: true });
        }
    }, [navigate]);

    const handleStart = () => {
        localStorage.setItem('hasVisited', 'true');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            {/* Top Right Org Login Button */}
            <div className="absolute top-4 right-4 flex items-center gap-4">
                <Link
                    to="/org/login"
                    className="bg-white/80 hover:bg-white text-yellow-600 font-semibold py-2 px-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm border border-yellow-100 backdrop-blur-sm"
                >
                    Organization Login
                </Link>
                {/* <Link to="/admin/setup" onClick={handleStart} className="hover:text-yellow-600 transition-colors flex items-center gap-2">
                    <span>⚙️</span> Admin Setup
                </Link> */}
            </div>
            <div className="mb-8 p-1 bg-white rounded-full shadow-2xl">
                <img src={logo} alt="Bus Tracker Logo" className="w-40 h-40 rounded-full object-cover border-4 border-white" />
            </div>

            <h1 className="text-5xl font-extrabold mb-10 text-gray-800 tracking-tight drop-shadow-sm">
                Track <span className='text-yellow-500'>My</span> Bus
            </h1>

            <div className="grid gap-6 w-full max-w-sm">
                <Link to="/traveler/select-org" onClick={handleStart} className="group relative p-6 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-yellow-100">
                    <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-yellow-700 transition-colors">I am a Traveler</h2>
                            <p className="text-gray-500 font-medium">Track your bus in real-time</p>
                        </div>
                        <span className="text-4xl filter drop-shadow-md">🚌</span>
                    </div>
                </Link>
            </div>

            <div className="mt-16 text-sm text-gray-400">

            </div>
        </div>
    );
};

export default Home;
