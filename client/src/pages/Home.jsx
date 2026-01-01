import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-4xl font-bold mb-8 text-brand-900">Bus Tracker</h1>

            <div className="grid gap-6 w-full max-w-sm">
                <Link to="/traveler/select-org" className="p-6 bg-brand-600 text-white rounded-xl shadow-lg hover:bg-brand-500 transition-colors">
                    <h2 className="text-2xl font-semibold">I am a Traveler</h2>
                    <p className="opacity-90">Track your bus</p>
                </Link>

                <Link to="/driver/login" className="p-6 bg-white border-2 border-brand-600 text-brand-600 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                    <h2 className="text-2xl font-semibold">I am a Driver</h2>
                    <p className="opacity-80">Broadcast location</p>
                </Link>
            </div>

            <div className="mt-12 text-sm text-gray-500">
                <Link to="/admin/setup" className="underline">Admin Setup (First Run)</Link>
            </div>
        </div>
    );
};

export default Home;
