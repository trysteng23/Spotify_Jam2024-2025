require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

let accessToken = null; // Get this from the auth module (we will improve this later)

// Middleware to check if we have an access token
const checkAuth = (req, res, next) => {
    if (!accessToken) {
        return res.status(401).json({ error: "Not authenticated. Please log in." });
    }
    next();
};





// Route to add a song to the queue
router.post('/add', checkAuth, async (req, res) => {
    const { trackUri } = req.body; // Expected input: { "trackUri": "spotify:track:TRACK_ID" }

    if (!trackUri) {
        return res.status(400).json({ error: "trackUri is required" });
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 204) {
        res.json({ message: "Song added to queue successfully!" });
    } else {
        const errorData = await response.json();
        res.status(response.status).json(errorData);
    }
});

// Route to skip to the next song
router.post('/skip', checkAuth, async (req, res) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 204) {
        res.json({ message: "Skipped to the next track!" });
    } else {
        const errorData = await response.json();
        res.status(response.status).json(errorData);
    }
});

// Export the queue routes
module.exports = router;