import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../context';

const AdminSetup = () => {
    // State
    const [view, setView] = useState('list'); // 'list' | 'create-org' | 'create-bus'
    const [orgs, setOrgs] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [orgName, setOrgName] = useState('');
    const [busName, setBusName] = useState('');
    const [busNumber, setBusNumber] = useState('');

    const navigate = useNavigate();

    // Initial Load
    useEffect(() => {
        fetchOrgs();
    }, []);

    // Fetch Orgs
    const fetchOrgs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(api+'/api/traveler/organizations');
            setOrgs(res.data);
            // If currently selected org is deleted or not in list, deselect
            if (selectedOrg && !res.data.find(o => o._id === selectedOrg._id)) {
                setSelectedOrg(null);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Fetch Buses
    const fetchBuses = async (orgId) => {
        try {
            const res = await axios.get(`${api}/api/admin/buses/${orgId}`);
            setBuses(res.data);
        } catch (err) { console.error(err); }
    };

    const handleOrgSelect = (org) => {
        setSelectedOrg(org);
        fetchBuses(org._id);
        setView('list');
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(api + '/api/admin/organization', { name: orgName });
            setOrgs([...orgs, res.data]);
            setSelectedOrg(res.data);
            fetchBuses(res.data._id); // Clear buses
            setOrgName('');
            setView('list');
        } catch (err) { alert('Error creating organization. Name might be taken.'); }
    };

    const handleDeleteOrg = async (e, orgId) => {
        e.stopPropagation();
        if (!confirm('DANGER: This will delete the Organization and ALL its BUSES/DRIVERS. Continue?')) return;
        try {
            await axios.delete(`${api}/api/admin/organization/${orgId}`);
            if (selectedOrg?._id === orgId) {
                setSelectedOrg(null);
                setBuses([]);
            }
            fetchOrgs();
        } catch (err) { alert('Failed to delete organization'); }
    }

    const handleCreateBus = async (e) => {
        e.preventDefault();
        if (!selectedOrg) return;
        try {
            const res = await axios.post(api+'/api/admin/bus', {
                name: busName,
                number: busNumber,
                organizationId: selectedOrg._id
            });
            // Construct the unified object to push to state immediately to avoid re-fetch lag,
            // OR just re-fetch. Since returning {bus, driver}, we can construct it.
            const newBus = {
                ...res.data.bus,
                driver: res.data.driver
            };

            setBuses(prev => [...prev, newBus]);
            setBusName('');
            setBusNumber('');
            // fetchBuses(selectedOrg._id); // Optional: Double check with server
            alert('Bus Created Successfully');
        } catch (err) { alert('Error creating bus'); }
    };

    const handleDeleteBus = async (busId) => {
        if (!confirm('Are you sure? This will delete the bus and its driver.')) return;
        try {
            await axios.delete(`${api}/api/admin/bus/${busId}`);
            fetchBuses(selectedOrg._id);
        } catch (err) { alert('Error deleting bus'); }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-900">Admin Dashboard</h1>
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:underline">Home</button>
                </div>

                {/* Organization Selector */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">1. Select Organization</h2>
                        {view !== 'create-org' && (
                            <button onClick={() => setView('create-org')} className="text-sm bg-brand-50 text-brand-600 px-3 py-1 rounded-full font-medium hover:bg-brand-100">+ New Org</button>
                        )}
                    </div>

                    {view === 'create-org' ? (
                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                            <h3 className="text-sm font-semibold mb-2">Create New Organization</h3>
                            <form onSubmit={handleCreateOrg} className="flex gap-2">
                                <input
                                    className="border p-2 rounded flex-1 focus:ring-2 ring-brand-200 outline-none"
                                    placeholder="e.g. Springfield High"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                />
                                <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700">Create</button>
                                <button type="button" onClick={() => setView('list')} className="text-gray-500 px-2 hover:text-gray-700">Cancel</button>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {orgs.map(org => (
                                <div
                                    key={org._id}
                                    onClick={() => handleOrgSelect(org)}
                                    className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${selectedOrg?._id === org._id ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' : 'bg-white border-gray-200 hover:border-brand-300'}`}
                                >
                                    <div className="font-medium truncate pr-6 text-gray-800">{org.name}</div>
                                    <button
                                        onClick={(e) => handleDeleteOrg(e, org._id)}
                                        className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Organization"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {orgs.length === 0 && !loading && <p className="text-gray-400 italic text-sm col-span-2">No organizations found. Create one to get started.</p>}
                        </div>
                    )}
                </div>

                {/* Bus Management Area */}
                {selectedOrg ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">2. Manage Buses</h2>
                                <p className="text-sm text-gray-500">for <span className="font-semibold text-brand-600">{selectedOrg.name}</span></p>
                            </div>
                            <button
                                onClick={() => setView(view === 'create-bus' ? 'list' : 'create-bus')}
                                className={`px-4 py-2 rounded transition-colors ${view === 'create-bus' ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                                {view === 'create-bus' ? 'Cancel Adding' : '+ Add Bus'}
                            </button>
                        </div>

                        {view === 'create-bus' && (
                            <form onSubmit={handleCreateBus} className="mb-8 bg-green-50 p-6 rounded-xl border border-green-100 shadow-inner">
                                <h3 className="font-bold text-green-900 mb-4">Add New Bus</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-green-700 uppercase mb-1">Bus Name / Route</label>
                                        <input
                                            className="w-full border p-2 rounded focus:ring-2 ring-green-200 outline-none"
                                            placeholder="e.g. Route A - North"
                                            value={busName}
                                            onChange={(e) => setBusName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-green-700 uppercase mb-1">Vehicle License Plate</label>
                                        <input
                                            className="w-full border p-2 rounded focus:ring-2 ring-green-200 outline-none"
                                            placeholder="e.g. KA-01-AB-1234"
                                            value={busNumber}
                                            onChange={(e) => setBusNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded shadow-sm hover:bg-green-700 font-medium">Save Bus & Generate Credentials</button>
                                </div>
                            </form>
                        )}

                        {/* Bus List Table */}
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-left bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600 text-sm tracking-wide">BUS DETAILS</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm tracking-wide">DRIVER LOGIN</th>
                                        <th className="p-4 font-semibold text-gray-600 text-sm tracking-wide text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {buses.map(bus => (
                                        <tr key={bus._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{bus.name}</div>
                                                <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1 rounded">{bus.number}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm">
                                                        <span className="w-20 text-gray-400 text-xs uppercase">Username:</span>
                                                        <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono select-all text-sm">{bus.driver?.username || 'Missing'}</code>
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <span className="w-20 text-gray-400 text-xs uppercase">Password:</span>
                                                        <code className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-mono select-all text-sm">{bus.driver?.password || 'Missing'}</code>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteBus(bus._id)}
                                                    className="text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-all font-medium text-sm"
                                                    title="Delete Bus"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {buses.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-12 text-center text-gray-400 bg-gray-50">
                                                <p className="mb-2">No buses found for {selectedOrg.name}.</p>
                                                <button onClick={() => setView('create-bus')} className="text-brand-600 font-medium hover:underline">Add one now</button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                        Select an Organization above to manage its buses.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSetup;
