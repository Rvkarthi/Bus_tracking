require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev, restrict in prod
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/organization', require('./routes/organization'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/traveler', require('./routes/traveler'));

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Basic location update relay
    socket.on('update-location', (data) => {
        // data: { busId, lat, lng }
        io.emit(`bus-location-${data.busId}`, data);
        // Also broadcast to organization room if needed later
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
