import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../context';

const DriverLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(api + '/api/driver/login', { username, password });
            // Store driver info in session storage or state - keeping in localStorage for persistence
            localStorage.setItem('driver', JSON.stringify(res.data));
            navigate('/driver/dashboard');
        } catch (err) {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <h2 className="text-3xl font-bold text-brand-900 text-center">Driver Login</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-brand-700 shadow-lg transition-transform active:scale-95">
                    Login & Start
                </button>
            </form>
        </div>
    );
};

export default DriverLogin;
