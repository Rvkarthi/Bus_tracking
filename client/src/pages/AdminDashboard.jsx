import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../context';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [orgs, setOrgs] = useState([]);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Edit State
    const [editingOrg, setEditingOrg] = useState(null);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchOrgs();
    }, [navigate, token]);

    const fetchOrgs = async () => {
        try {
            const res = await axios.get(`${api}/api/admin/organizations`, {
                headers: { 'x-auth-token': token }
            });
            setOrgs(res.data);
        } catch (err) {
            if (err.response && err.response.status === 401) navigate('/admin/login');
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${api}/api/admin/organization`,
                { name, username, password },
                { headers: { 'x-auth-token': token } }
            );
            setName('');
            setUsername('');
            setPassword('');
            fetchOrgs();
            alert('Organization Created Successfully');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error creating org');
        }
    };

    const handleDeleteOrg = async (id) => {
        if (!window.confirm('Are you sure? This will delete all buses and drivers for this org.')) return;
        try {
            await axios.delete(`${api}/api/admin/organization/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchOrgs();
        } catch (err) {
            alert('Error deleting org');
        }
    };

    const startEdit = (org) => {
        setEditingOrg(org._id);
        setEditName(org.name);
        setEditUsername(org.username);
        setEditPassword(''); // Don't show old password hash/text for security, just let reset
    };

    const saveEdit = async (id) => {
        try {
            await axios.put(`${api}/api/admin/organization/${id}`,
                { name: editName, username: editUsername, password: editPassword || undefined },
                { headers: { 'x-auth-token': token } }
            );
            setEditingOrg(null);
            fetchOrgs();
            alert('Organization Updated Successfully');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error updating org');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button
                        onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Create Org Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold mb-4">Create New Organization</h2>
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <form onSubmit={handleCreateOrg} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Org Name (e.g. City Transport)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="p-2 border rounded"
                            required
                        />
                        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors md:col-span-3 font-semibold">
                            Create Organization
                        </button>
                    </form>
                </div>

                {/* Org List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Existing Organizations</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Username</th>
                                    <th className="p-2">Created At</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgs.map(org => (
                                    <tr key={org._id} className="border-b hover:bg-gray-50">
                                        {editingOrg === org._id ? (
                                            <>
                                                <td className="p-2">
                                                    <input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="p-1 border rounded w-full"
                                                        placeholder="Name"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        value={editUsername}
                                                        onChange={e => setEditUsername(e.target.value)}
                                                        className="p-1 border rounded w-full"
                                                        placeholder="Username"
                                                    />
                                                    <input
                                                        value={editPassword}
                                                        onChange={e => setEditPassword(e.target.value)}
                                                        className="p-1 border rounded w-full mt-1"
                                                        placeholder="New Password (Optional)"
                                                    />
                                                </td>
                                                <td className="p-2 text-gray-400 text-sm">Now</td>
                                                <td className="p-2">
                                                    <button onClick={() => saveEdit(org._id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2">Save</button>
                                                    <button onClick={() => setEditingOrg(null)} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">Cancel</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-2 font-medium">{org.name}</td>
                                                <td className="p-2 text-gray-600">{org.username}</td>
                                                <td className="p-2 text-gray-400 text-sm">{new Date(org.createdAt).toLocaleDateString()}</td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() => startEdit(org)}
                                                        className="text-blue-500 bg-blue-50 p-2 hover:text-blue-700 text-sm font-medium mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrg(org._id)}
                                                        className="text-red-500 bg-red-50 p-2 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {orgs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-4 text-center text-gray-500">No organizations found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
