require('dotenv').config(); // Load .env variables
const express = require('express');
const cors = require('cors');

// const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue'); // Import queue routes


app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json()); // Allow JSON request bodies

app.get('/', (req, res) => {
    res.send('Spotify Jam App Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


//used to implement spotify authentication. Connects to routes/auth.js
app.use('/auth', authRoutes);

app.use('/queue', queueRoutes); // Attach queue routes