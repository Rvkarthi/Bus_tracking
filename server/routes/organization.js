const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyOrg } = require('../middleware/auth');
const Organization = require('../models/Organization');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');

// Organization Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const org = await Organization.findOne({ username });
        if (!org) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Simple string comparison for now as per plan
        if (password !== org.password) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = jwt.sign({ role: 'organization', id: org._id }, 'your_jwt_secret', { expiresIn: '12h' });
        res.json({ token, orgId: org._id, orgName: org.name });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Buses for specific Org (Protected)
router.get('/my-buses', verifyOrg, async (req, res) => {
    try {
        const buses = await Bus.find({ organizationId: req.user.id });
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

// Add Bus (Org Portal Step)
router.post('/bus', verifyOrg, async (req, res) => {
    try {
        const { name, number } = req.body;
        if (!name || !number) {
            return res.status(400).json({ msg: 'Please provide all fields' });
        }

        const newBus = new Bus({
            name,
            number,
            organizationId: req.user.id // From token
        });

        // Auto-generate credentials
        const driverUsername = `${name.replace(/\s+/g, '').toLowerCase()}_${number.replace(/\s+/g, '')}`;
        const driverPassword = 'password123';

        const newDriver = new Driver({
            username: driverUsername,
            password: driverPassword,
            organizationId: req.user.id,
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

// Update Bus / Driver Credentials
router.put('/bus/:busId', verifyOrg, async (req, res) => {
    try {
        const { name, number, driverUsername, driverPassword } = req.body;
        const bus = await Bus.findOne({ _id: req.params.busId, organizationId: req.user.id });

        if (!bus) return res.status(404).json({ msg: 'Bus not found or unauthorized' });

        // Update Bus info
        if (name) bus.name = name;
        if (number) bus.number = number;
        await bus.save();

        // Update Driver info
        const driver = await Driver.findOne({ assignedBusId: bus._id });
        if (driver) {
            if (driverUsername) driver.username = driverUsername;
            if (driverPassword) driver.password = driverPassword;
            await driver.save();
        }

        res.json({ bus, driver: { username: driver.username, password: driver.password } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Bus (Org Portal)
router.delete('/bus/:busId', verifyOrg, async (req, res) => {
    try {
        const bus = await Bus.findOne({ _id: req.params.busId, organizationId: req.user.id });
        if (!bus) return res.status(404).json({ msg: 'Bus not found or unauthorized' });

        await Driver.findOneAndDelete({ assignedBusId: bus._id });
        await Bus.findByIdAndDelete(req.params.busId);

        res.json({ msg: 'Bus deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
