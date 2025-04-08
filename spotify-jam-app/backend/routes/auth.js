const dotenv = require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const querystring = require('querystring');
const express = require('express');
const axios = require('axios');
const router = express.Router();
const cookieParser = require('cookie-parser');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

router.use(cookieParser()); // Enable cookie parsing

let accessToken = null;
let refreshToken = null;

// 🔹 LOGIN ROUTE (Redirect to Spotify Auth)
router.get('/login', (req, res) => {
    const scope = 'user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private user-read-currently-playing user-read-recently-played';

    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            access_type: 'offline',  // Added offline access
            show_dialog: true  // Forces re-authentication
        });

    console.log("🔍 Redirecting to Spotify:", authUrl);
    res.redirect(authUrl);
});



// 🔹 CALLBACK ROUTE (Spotify Returns Auth Code)
router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    console.log("🔍 Received Authorization Code:", code);

    if (!code) {
        console.error("🚨 No authorization code received!");
        return res.status(400).json({ error: "Authorization code missing" });
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const body = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const data = await response.json();
        console.log("🔍 Token Response Data:", data);

        if (!data.access_token) {
            console.error("🚨 Failed to retrieve access token!");
            return res.status(500).json({ error: "Failed to exchange authorization code" });
        }

        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        console.log("✅ Stored Access Token:", accessToken);
        console.log("✅ Stored Refresh Token:", refreshToken);

        // 🔹 Fix: Redirect to `/host-login?access_token=...` instead of `/host-dashboard`
        const redirectUrl = `http://localhost:3000/host-login?access_token=${accessToken}`;
        console.log("🔹 Redirecting to:", redirectUrl);

        res.redirect(redirectUrl);

    } catch (error) {
        console.error("🚨 Error exchanging authorization code:", error);
        res.status(500).json({ error: "Failed to exchange authorization code" });
    }
});



// 🔹 REFRESH ACCESS TOKEN FUNCTION
async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        console.log("No refresh token available. User must log in again.");
        return null;
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        accessToken = response.data.access_token;
        console.log("Access token refreshed:", accessToken);
        return accessToken;
    } catch (error) {
        console.error("Error refreshing token:", error.response?.data || error.message);
        return null;
    }
}

async function getAccessTokenSafe() {
    if (!accessToken) {
        console.log("Access token missing. Attempting to refresh...");
        if (!refreshToken) {
            console.log("No refresh token available.");
            return null;
        }
        accessToken = await refreshAccessToken(refreshToken);
    }
    return accessToken;
}

// 🔹 ROUTE TO HANDLE TOKEN REFRESH (Frontend Calls This)
router.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;  // Retrieve stored refresh token

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token found. Please log in again." });
    }

    const newToken = await refreshAccessToken(refreshToken);
    if (newToken) {
        res.json({ access_token: newToken });
    } else {
        res.status(401).json({ error: "Token refresh failed" });
    }
});

// 🔹 GET ACCESS TOKEN (Auto-refresh if expired)
router.get('/token', async (req, res) => {
    if (!accessToken) {
        console.log("Access token missing. Attempting to refresh...");
        const refreshToken = req.cookies.refresh_token;
        const newToken = await refreshAccessToken(refreshToken);
        if (!newToken) {
            return res.status(401).json({ error: "No access token found. Please log in." });
        }
    }
    res.json({ access_token: accessToken });
});

module.exports = { 
    router, 
    getAccessToken: getAccessTokenSafe,
    refreshAccessToken
};
