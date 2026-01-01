const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Bus = require('../models/Bus');

// Driver Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const driver = await Driver.findOne({ username });
        if (!driver || driver.password !== password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Fetch associated bus
        const bus = await Bus.findById(driver.assignedBusId);

        res.json({
            driverId: driver._id,
            username: driver.username,
            busId: bus._id,
            organizationId: driver.organizationId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
