const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const Bus = require('../models/Bus');
const Driver = require('../models/Driver');

// Create Organization (Setup Step 1)
router.post('/organization', async (req, res) => {
    try {
        const { name } = req.body;
        let org = await Organization.findOne({ name });
        if (org) return res.status(400).json({ msg: 'Organization already exists' });

        org = new Organization({ name });
        await org.save();
        res.json(org);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create Bus (Setup Step 2)
router.post('/bus', async (req, res) => {
    try {
        const { name, number, organizationId } = req.body;
        // Basic validation
        if (!name || !number || !organizationId) {
            return res.status(400).json({ msg: 'Please provide all fields' });
        }

        const newBus = new Bus({
            name,
            number,
            organizationId
        });

        // Create a dummy driver for this bus for simplicity 'no complex driver interactions'
        // In a real app, you might have separate driver signup.
        // Here we auto-generate access credentials for the bus.
        const driverUsername = `${name.replace(/\s+/g, '').toLowerCase()}_${number.replace(/\s+/g, '')}`;
        const driverPassword = 'password123'; // Default simple password as requested "Zero-Friction"

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
router.get('/buses/:orgId', async (req, res) => {
    try {
        const buses = await Bus.find({ organizationId: req.params.orgId });
        // For admin, we want to show driver credentials too. 
        // In a real strict app we might hide passwords, but for this specific request we show them.
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
router.delete('/bus/:busId', async (req, res) => {
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
router.delete('/organization/:orgId', async (req, res) => {
    try {
        const orgId = req.params.orgId;

        if (!mongoose.Types.ObjectId.isValid(orgId)) {
            return res.status(400).json({ msg: 'Invalid Organization ID' });
        }

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ msg: 'Org not found' });

        // Find all buses to delete their drivers
        const buses = await Bus.find({ organizationId: orgId });

        // Parallelize driver deletion for speed
        await Promise.all(buses.map(bus => Driver.findOneAndDelete({ assignedBusId: bus._id })));

        // Delete all buses
        await Bus.deleteMany({ organizationId: orgId });

        // Delete the Org
        await Organization.findByIdAndDelete(orgId);

        console.log(`Deleted Org ${orgId} and associated data.`);
        res.json({ msg: 'Organization and all associated data deleted' });
    } catch (err) {
        console.error('Delete Org Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
