// require('dotenv').config();
const dotenv = require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const querystring = require('querystring');
const express = require('express');
const router = express.Router();
// const dotenv = require('dotenv');


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
console.log("CLIENT_ID:", CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET);
console.log("REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);






router.get('/login', (req, res) => {
    // const scope = 'user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private';
    const scope = 'user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private user-read-currently-playing user-read-recently-played';

    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
        });
    res.redirect(authUrl);
});


let refreshToken = null;
let accessToken = null; // Store the token in memory (temporary)

router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const tokenUrl = 'https://accounts.spotify.com/api/token';

    const body = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    });

    const data = await response.json();
    accessToken = data.access_token; // Store the access token in memory
    refreshToken = data.refresh_token;  // Store refresh token

    console.log("Stored Access Token:", accessToken); // Debugging log
    console.log("Stored Refresh Token:", refreshToken);
    res.json(data); // Send tokens to the frontend
});

// Function to refresh token
async function refreshAccessToken() {

    if (!refreshToken) {
        console.log("No refresh token available. User must log in again.");
        return;
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const body = querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    });

    const data = await response.json();
    if (data.access_token) {
        accessToken = data.access_token; // Update token
        console.log("Access token refreshed:", accessToken);
        return accessToken
    } else {
        console.log("Failed to refresh token:", data);
        return null;
    }
}

//token auto refreshes if needed
router.get('/token', async (req, res) => {
    if (!accessToken) {
        console.log("Access token missing. Attempting to refresh...");
        const newToken = await refreshAccessToken();
        if (!newToken) {
            return res.status(401).json({ error: "No access token found. Please log in." });
        }
    }
    res.json({ access_token: accessToken });
});

// module.exports = { router, getAccessToken: () => accessToken, refreshAccessToken }; //export router access token
module.exports = { 
    router, 
    getAccessToken: () => accessToken, 
    refreshAccessToken 
};

