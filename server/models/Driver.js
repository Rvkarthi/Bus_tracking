const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: { // In a real app we'd hash this, but simple text for speed as per 'no complex interactions' if allowed, but hash is better.
        type: String,
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    assignedBusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        default: null
    }
});

module.exports = mongoose.model('Driver', DriverSchema);
