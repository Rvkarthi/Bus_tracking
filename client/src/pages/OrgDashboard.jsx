import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../context';
import { useNavigate } from 'react-router-dom';

const OrgDashboard = () => {
    const [buses, setBuses] = useState([]);
    const [busName, setBusName] = useState('');
    const [busNumber, setBusNumber] = useState('');
    const [editingBus, setEditingBus] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('orgToken');
    const orgName = localStorage.getItem('orgName');

    useEffect(() => {
        if (!token) {
            navigate('/org/login');
            return;
        }
        fetchBuses();
    }, [navigate, token]);

    const fetchBuses = async () => {
        try {
            const res = await axios.get(`${api}/api/organization/my-buses`, {
                headers: { 'x-auth-token': token }
            });
            setBuses(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) navigate('/org/login');
        }
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${api}/api/organization/bus`,
                { name: busName, number: busNumber },
                { headers: { 'x-auth-token': token } }
            );
            setBusName('');
            setBusNumber('');
            fetchBuses();
            alert('Bus Added Successfully');
        } catch (err) {
            alert('Error adding bus');
        }
    };

    const handleDeleteBus = async (id) => {
        if (!window.confirm('Delete this bus?')) return;
        try {
            await axios.delete(`${api}/api/organization/bus/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchBuses();
        } catch (err) {
            alert('Error deleting bus');
        }
    };

    const startEdit = (bus) => {
        setEditingBus(bus._id);
        setEditUsername(bus.driver?.username || '');
        setEditPassword(bus.driver?.password || '');
    };

    const saveEdit = async (id) => {
        try {
            await axios.put(`${api}/api/organization/bus/${id}`,
                { driverUsername: editUsername, driverPassword: editPassword },
                { headers: { 'x-auth-token': token } }
            );
            setEditingBus(null);
            fetchBuses();
            alert('Credentials Updated');
        } catch (err) {
            alert('Error updating credentials');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Organization Dashboard</h1>
                        <p className="text-gray-500">Welcome, {orgName}</p>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('orgToken'); localStorage.removeItem('orgName'); navigate('/org/login'); }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Add Bus Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold mb-4">Add New Bus</h2>
                    <form onSubmit={handleAddBus} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Bus Name (e.g. Route 501)"
                            value={busName}
                            onChange={(e) => setBusName(e.target.value)}
                            className="p-2 border rounded flex-1"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Bus Number (e.g. KL-01-AB-1234)"
                            value={busNumber}
                            onChange={(e) => setBusNumber(e.target.value)}
                            className="p-2 border rounded flex-1"
                            required
                        />
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700 transition-colors font-semibold">
                            Add Bus
                        </button>
                    </form>
                </div>

                {/* Bus List */}
                <div className="grid gap-6">
                    {buses.map(bus => (
                        <div key={bus._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{bus.name}</h3>
                                <p className="text-gray-500 font-mono">{bus.number}</p>
                            </div>

                            <div className="flex-1 w-full md:w-auto md:mx-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Driver Credentials</h4>
                                {editingBus === bus._id ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            value={editUsername}
                                            onChange={e => setEditUsername(e.target.value)}
                                            className="p-1 border rounded text-sm"
                                            placeholder="Username"
                                        />
                                        <input
                                            value={editPassword}
                                            onChange={e => setEditPassword(e.target.value)}
                                            className="p-1 border rounded text-sm"
                                            placeholder="Password"
                                        />
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => saveEdit(bus._id)} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                                            <button onClick={() => setEditingBus(null)} className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <p><span className="font-semibold">User:</span> {bus.driver?.username}</p>
                                            <p><span className="font-semibold">Pass:</span> {bus.driver?.password}</p>
                                        </div>
                                        <button onClick={() => startEdit(bus)} className="text-blue-500 hover:underline text-s bg-blue-50 hover:bg-blue-100 p-2 font-medium whitespace-nowrap ml-4">Edit</button>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => handleDeleteBus(bus._id)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 font-medium whitespace-nowrap">
                                Delete Bus
                            </button>
                        </div>
                    ))}
                    {buses.length === 0 && <p className="text-center text-gray-500 py-8">No buses added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default OrgDashboard;
