// require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });


const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// let accessToken = null; // Get this from the auth module (we will improve this later)
const { getAccessToken, refreshAccessToken } = require('./auth'); // Import token getter

// Middleware to check if we have an access token
const checkAuth = (req, res, next) => {
    console.log("DEBUG: Received Authorization Header:", req.headers.authorization);
    if (!getAccessToken()) {
        return res.status(401).json({ error: "Not authenticated. Please log in." });
    }
    next();
};


async function ensureValidToken() {
    if (!getAccessToken()) {
        await refreshAccessToken(); // Refresh token if expired
    }
}


// Route to add a song to the queue
router.post('/add', checkAuth, async (req, res) => {
    await ensureValidToken(); // Ensure token is valid before request
    const { trackUri } = req.body; // Expected input: { "trackUri": "spotify:track:TRACK_ID" }

    if (!trackUri) {
        return res.status(400).json({ error: "trackUri is required" });
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
        }
    });

    
    if (response.status === 204) {
        res.json({ message: "Song added to queue successfully!" });
    } 
    else {
        let rawResponseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawResponseText);  // Try parsing JSON
        } catch (e) {
            responseData = rawResponseText;  // Use raw response if not JSON
        }

        // If status is 200 or 204, treat it as success
        if (response.status === 204 || response.status === 200) {
            return res.json({ message: "Song added to queue successfully!", responseData });
        }

        // Otherwise, return an error
        console.error("DEBUG: Spotify API Full Error Response:", JSON.stringify(responseData, null, 2));
        res.status(response.status).json({ error: "API Error", responseData });

    }

    
});

// Route to skip to the next song
router.post('/skip', checkAuth, async (req, res) => {
    await ensureValidToken(); // Ensure token is valid

    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });

    if (response.status === 204) {
        return res.json({ message: "Skipped to the next track!" });
    }
    else{
        // If not 204, try to parse the error response
        let rawResponseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawResponseText);  // Try parsing JSON
        } catch (e) {
            responseData = rawResponseText;  // Use raw response if not JSON
        }

        // If status is 200 or 204, treat it as success
        if (response.status === 204 || response.status === 200) {
            return res.json({ message: "Song successfully skipped!", responseData });
        }

        //otherwise
        console.error("DEBUG: Spotify API Full Error Response:", JSON.stringify(responseData, null, 2));
        res.status(response.status).json({ error: responseData });
    }
});

// Route to pause playback
router.post('/pause', checkAuth, async (req, res) => {
    await ensureValidToken(); // Ensure token is valid

    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });

    if (response.status === 204) {
        return res.json({ message: "Playback paused successfully!" });
    } else {
        let rawResponseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawResponseText);  // Try parsing JSON
        } catch (e) {
            responseData = rawResponseText;  // Use raw response if not JSON
        }

        // If status is 200 or 204, treat it as success
        if (response.status === 200 || response.status === 204) {
            return res.json({ message: "Playback paused successfully!", responseData });
        }

        // Otherwise, log and return an error
        console.error("DEBUG: Spotify API Full Error Response:", JSON.stringify(responseData, null, 2));
        res.status(response.status).json({ error: responseData });
    }
});

// Route to resume playback
router.post('/play', checkAuth, async (req, res) => {
    await ensureValidToken(); // Ensure token is valid

    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });

    if (response.status === 204) {
        return res.json({ message: "Playback resumed successfully!" });
    } else {
        let rawResponseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawResponseText);  // Try parsing JSON
        } catch (e) {
            responseData = rawResponseText;  // Use raw response if not JSON
        }

        // If status is 200 or 204, treat it as success
        if (response.status === 200 || response.status === 204) {
            return res.json({ message: "Playback resumed successfully!", responseData });
        }

        // Otherwise, log and return an error
        console.error("DEBUG: Spotify API Full Error Response:", JSON.stringify(responseData, null, 2));
        res.status(response.status).json({ error: responseData });
    }
});




// Export the queue routes
module.exports = { router };