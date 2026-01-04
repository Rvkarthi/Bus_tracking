const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require('../middleware/auth');
const Organization = require('../models/Organization');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');

// Admin Login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === 'WhoIsTheHero') {
        const token = jwt.sign({ role: 'admin' }, 'your_jwt_secret', { expiresIn: '12h' });
        res.json({ token });
    } else {
        res.status(400).json({ msg: 'Invalid Credentials' });
    }
});

// Create Organization (Setup Step 1) - Protected
router.post('/organization', verifyAdmin, async (req, res) => {
    try {
        const { name, username, password } = req.body;
        let org = await Organization.findOne({ name });
        if (org) return res.status(400).json({ msg: 'Organization already exists' });

        // Check username uniqueness
        const userExists = await Organization.findOne({ username });
        if (userExists) return res.status(400).json({ msg: 'Username already taken' });

        org = new Organization({ name, username, password });
        await org.save();
        res.json(org);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get All Organizations - Protected
router.get('/organizations', verifyAdmin, async (req, res) => {
    try {
        const orgs = await Organization.find().select('-password');
        res.json(orgs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create Bus (Setup Step 2) - Protected (Admin can still manually add if strictly needed, but mainly org does this now)
router.post('/bus', verifyAdmin, async (req, res) => {
    // ... Keeping this for admin manual override if needed, or remove. 
    // Let's keep it but protect it.
    try {
        const { name, number, organizationId } = req.body;
        if (!name || !number || !organizationId) {
            return res.status(400).json({ msg: 'Please provide all fields' });
        }

        const newBus = new Bus({ name, number, organizationId });

        const driverUsername = `${name.replace(/\s+/g, '').toLowerCase()}_${number.replace(/\s+/g, '')}`;
        const driverPassword = 'password123';

        const newDriver = new Driver({
            username: driverUsername,
            password: driverPassword,
            organizationId,
            assignedBusId: newBus._id
        });

        await newBus.save();
        newDriver.assignedBusId = newBus._id;
        await newDriver.save();

        res.json({ bus: newBus, driver: { username: driverUsername, password: driverPassword } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Buses for Organization (Admin View)
router.get('/buses/:orgId', verifyAdmin, async (req, res) => {
    try {
        const buses = await Bus.find({ organizationId: req.params.orgId });
        const busesWithDrivers = await Promise.all(buses.map(async (bus) => {
            const driver = await Driver.findOne({ assignedBusId: bus._id });
            return {
                ...bus._doc,
                driver: driver ? { username: driver.username, password: driver.password } : null
            };
        }));
        res.json(busesWithDrivers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete Bus
router.delete('/bus/:busId', verifyAdmin, async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId);
        if (!bus) return res.status(404).json({ msg: 'Bus not found' });

        await Driver.findOneAndDelete({ assignedBusId: bus._id });
        await Bus.findByIdAndDelete(req.params.busId);

        res.json({ msg: 'Bus and Driver deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete Organization
router.delete('/organization/:orgId', verifyAdmin, async (req, res) => {
    try {
        const orgId = req.params.orgId;
        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ msg: 'Invalid Organization ID' });
        }
        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ msg: 'Org not found' });

        const buses = await Bus.find({ organizationId: orgId });
        await Promise.all(buses.map(bus => Driver.findOneAndDelete({ assignedBusId: bus._id })));
        await Bus.deleteMany({ organizationId: orgId });
        await Organization.findByIdAndDelete(orgId);

        res.json({ msg: 'Organization and all associated data deleted' });
    } catch (err) {
        console.error('Delete Org Error:', err);
        res.status(500).send('Server Error');
    }
});


// Update Organization (Admin)
router.put('/organization/:orgId', verifyAdmin, async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const orgId = req.params.orgId;

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ msg: 'Invalid Organization ID' });
        }

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ msg: 'Organization not found' });

        if (name) org.name = name;
        if (username) org.username = username;
        if (password) org.password = password;

        await org.save();
        res.json(org);
    } catch (err) {
        // Handle duplicate key error (code 11000) for name/username unique constraint
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Name or Username already exists' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
