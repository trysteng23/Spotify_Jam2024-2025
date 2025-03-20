// require('dotenv').config(); // Load .env variables
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');

// const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json()); // Allow JSON request bodies

//importing routes
const { router: authRoutes } = require('./routes/auth');
const { router: queueRoutes} = require('./routes/queue'); // Import queue routes
const { router: sessionRoutes } = require('./routes/session');



//attaching routes
app.use('/auth', authRoutes);
app.use('/queue', queueRoutes); // Attach queue routes
app.use('/session', sessionRoutes);

//root route
app.get('/', (req, res) => {
    res.send('Spotify Jam App Backend is Running!');
});

//start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});