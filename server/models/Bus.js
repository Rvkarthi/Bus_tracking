const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: { // Vehicle number plate or identifier
        type: String,
        required: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    lastLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date,
        speed: Number,
    },
    isActive: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Bus', BusSchema);
