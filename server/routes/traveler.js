const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Bus = require('../models/Bus');

// Get all organizations
router.get('/organizations', async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ name: 1 });
        res.json(orgs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get buses for an organization
router.get('/buses/:orgId', async (req, res) => {
    try {
        const buses = await Bus.find({ organizationId: req.params.orgId });
        res.json(buses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
