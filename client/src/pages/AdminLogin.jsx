import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../context';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${api}/api/admin/login`, { password });
            localStorage.setItem('adminToken', res.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid Password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
                {error && <p className="text-red-500 text-sm md-4 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Master Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                            placeholder="Enter password..."
                        />
                    </div>
                    <button type="submit" className="w-full bg-yellow-400 text-white font-bold py-2 rounded hover:bg-yellow-500 transition-colors">
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/org/login')}
                        className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        Go to Organization Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
