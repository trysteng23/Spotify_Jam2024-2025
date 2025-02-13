require('dotenv').config();

const querystring = require('querystring');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
// console.log("CLIENT_ID:", CLIENT_ID);
// console.log("CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET);
// console.log("REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);






router.get('/login', (req, res) => {
    const scope = 'user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private';
    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
        });
    res.redirect(authUrl);
});



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
    console.log("Stored Access Token:", accessToken); // Debugging log

    res.json(data); // Send tokens to the frontend
});



router.get('/token', (req, res) => {
    if (!accessToken) {
        return res.status(401).json({ error: "No access token found. Please log in." });
    }
    res.json({ access_token: accessToken });
});



module.exports = router;