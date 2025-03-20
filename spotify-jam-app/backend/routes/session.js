const express = require("express");
const { v4: uuidv4 } = require("uuid"); // For generating unique session IDs
const fetch = require("node-fetch");
const router = express.Router();
const sessions = {}; // In-memory storage

let lastTrackId = null; // Store last track ID for detecting transitions
let activeSessionId = null; // Store active session ID for polling

const { getAccessToken, refreshAccessToken } = require("./auth");

// Start a new session
router.post("/start", (req, res) => {
    const { hostId, fallbackPlaylist} = req.body; // Host's Spotify user ID

    if (!hostId) {
        return res.status(400).json({ error: "Missing host ID" });
    }

    const sessionId = uuidv4(); // Generate unique session ID
    sessions[sessionId] = {
        host: hostId,
        guests: [],
        queue: {},
        currentIndex: 0, // Track the current index for round-robin
        fallbackPlaylist: fallbackPlaylist || null, // Optional: Fallback playlist URI
        fallbackIndex: 0 // Track the next song from the fallback list
    };

    activeSessionId = sessionId; // Set active session ID for polling
    res.json({ message: "Session created", sessionId, fallbackPlaylist });
});

router.post("/join", (req, res) => {
    const { sessionId, guestId } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    if (!guestId) {
        return res.status(400).json({ error: "Missing guest ID" });
    }

    if (!sessions[sessionId].guests.includes(guestId)) {
        sessions[sessionId].guests.push(guestId); // Add guest to session
        sessions[sessionId].queue[guestId] = []; // Initialize guest's queue
    }

    res.json({ message: "Guest joined session", sessionId, guests: sessions[sessionId].guests });
});

// Check if the host has an active session
router.get("/active", (req, res) => {
    const { hostId } = req.query; // Get hostId from query parameters

    if (!hostId) {
        return res.status(400).json({ error: "Missing host ID" });
    }

    // Find session associated with the given hostId
    const activeSession = Object.entries(sessions).find(
        ([sessionId, sessionData]) => sessionData.host === hostId
    );

    if (!activeSession) {
        return res.status(404).json({ error: "Session not found" });
    }

    const [sessionId, sessionData] = activeSession;
    res.json({ sessionId, ...sessionData });
});

router.get("/:sessionId", (req, res) => {
    const { sessionId } = req.params;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    res.json(sessions[sessionId]);
});

// View queue
router.get("/:sessionId/queue", (req, res) => {
    const { sessionId } = req.params;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    // Ensure queue exists
    if (!sessions[sessionId].queue || Object.keys(sessions[sessionId].queue).length === 0) {
        return res.json({ queue: [] });
    }

    // Properly format queue before sending response
    const formattedQueue = Object.entries(sessions[sessionId].queue).map(([guestId, trackUris]) => ({
        guestId,
        trackUris // Ensure it's an array of strings
    }));

    res.json({ queue: formattedQueue });
});

// Guest adds a song to the queue
router.post("/:sessionId/queue/add", (req, res) => {
    const { sessionId } = req.params;
    const { guestId, trackUri } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    if (!guestId || !trackUri) {
        return res.status(400).json({ error: "Missing guest ID or track URI" });
    }

    // Ensure guest has an entry in the queue
    if (!Array.isArray(sessions[sessionId].queue[guestId])) {
        sessions[sessionId].queue[guestId] = [];
    }

    sessions[sessionId].queue[guestId].push(trackUri);
    console.log(`Queue after adding song:`, JSON.stringify(sessions[sessionId].queue, null, 2));

    res.json({ message: "Song added to queue", queue: sessions[sessionId].queue });
});

// Get the next song in rotation
// router.get("/:sessionId/queue/next", async (req, res) => {
//     const { sessionId } = req.params;

//     if (!sessions[sessionId]) {
//         return res.status(404).json({ error: "Session not found" });
//     }
    
//     const queue = sessions[sessionId].queue;
//     const guestIds = Object.keys(queue);

//     if (guestIds.length === 0) {
//         return res.json({ message: "No songs in queue" });
//     }

//     // Rotate through guests fairly
//     let nextSong = null;
//     let selectedGuest = null;

//     for (let i = 0; i < guestIds.length; i++) {
//         const guestId = guestIds[i];
//         if (queue[guestId].length > 0) {
//             nextSong = queue[guestId].shift(); // Remove from guest queue
//             selectedGuest = guestId;
//             break;
//         }
//     }

//     if (!nextSong) {
//         return res.json({ message: "No songs available" });
//     }

//     // Retrieve the host's access token (replace with actual token retrieval logic)
//     const accessToken = getAccessToken(); // Ensure this function retrieves a valid token

//     if (!accessToken) {
//         return res.status(401).json({ error: "Host is not authenticated" });
//     }

//     // Send a request to Spotify to force play the next song
//     try {
//         const response = await fetch("https://api.spotify.com/v1/me/player/play", {
//             method: "PUT",
//             headers: {
//                 "Authorization": `Bearer ${accessToken}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 uris: [nextSong] // Play the selected song
//             })
//         });

//         if (response.status === 204) {
//             res.json({ message: "Now playing next track", guestId: selectedGuest, trackUri: nextSong });
//         } else {
//             let errorData = await response.text();
//             console.error("DEBUG: Spotify API Full Error Response:", errorData);
//             res.status(response.status).json({ error: "Spotify Playback Failed", details: errorData });
//         }
//     } catch (error) {
//         console.error("DEBUG: Playback Request Failed:", error);
//         res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// });
router.get("/:sessionId/queue/next", async (req, res) => {
    const { sessionId } = req.params;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    const session = sessions[sessionId];
    const queue = session.queue;
    const guestIds = Object.keys(queue);

    let nextSong = null;
    let selectedGuest = null;

    // Rotate through guests fairly
    if (guestIds.length > 0) {
        for (let i = 0; i < guestIds.length; i++) {
            const guestId = guestIds[session.currentIndex % guestIds.length];
            if (queue[guestId].length > 0) {
                nextSong = queue[guestId].shift();
                selectedGuest = guestId;
                session.currentIndex = (session.currentIndex + 1) % guestIds.length; // Update rotation index
                break;
            }
        }
    }

    // If queue is empty, get a song from the fallback playlist
    if (!nextSong) {
        if (!session.fallbackPlaylist) {
            return res.json({ message: "No songs available and no fallback playlist set." });
        }

        try {
            // Extract ID from URI
            const uriParts = session.fallbackPlaylist.split(":");
            const type = uriParts[1]; // "playlist" or "album"
            const playlistOrAlbumId = uriParts[2];
            const hostAccessToken = getAccessToken();
            const apiUrl = type === "album"
            ? `https://api.spotify.com/v1/albums/${playlistOrAlbumId}/tracks`
            : `https://api.spotify.com/v1/playlists/${playlistOrAlbumId}/tracks`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { Authorization: `Bearer ${hostAccessToken}` }
            });

            const data = await response.json();
            // if (data.items && data.items.length > 0) {
            //     // Ensure fallbackIndex does not exceed available tracks
            //     session.fallbackIndex = session.fallbackIndex % data.items.length;
            //     nextSong = data.items[session.fallbackIndex].track.uri;
            //     selectedGuest = "fallback";

            //     // Move to the next song for the next time fallback is triggered
            //     session.fallbackIndex++;
            // } else {
            //     return res.json({ message: "Fallback playlist/album is empty or unavailable." });
            // }
            
            if (data.items && data.items.length > 0) {
                if (type === "album") {
                    // Album tracks don't have a `track` wrapper, so access directly
                    nextSong = data.items[Math.floor(Math.random() * data.items.length)].uri;
                } else {
                    // Playlist tracks have a `track` wrapper
                    nextSong = data.items[Math.floor(Math.random() * data.items.length)].track.uri;
                }
                selectedGuest = "fallback";
            } else {
                return res.json({ message: "Fallback playlist/album is empty or unavailable." });
            }
            
        } catch (error) {
            console.error("Error retrieving fallback playlist:", error);
            return res.status(500).json({ error: "Failed to retrieve fallback playlist" });
        }
    }

    // Force play next song
    try {
        const accessToken = getAccessToken();
        const playbackResponse = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uris: [nextSong] })
        });

        if (playbackResponse.status === 204) {
            return res.json({ message: "Now playing next track", trackUri: nextSong, guestId: selectedGuest });
        } else {
            let errorData = await playbackResponse.text();
            console.error("DEBUG: Spotify API Full Error Response:", errorData);
            return res.status(playbackResponse.status).json({ error: "Spotify Playback Failed", details: errorData });
        }
    } catch (error) {
        console.error("DEBUG: Playback Request Failed:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

router.patch("/:sessionId/fallback", (req, res) => {
    const { sessionId } = req.params;
    const { fallbackPlaylist } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    if (!fallbackPlaylist) {
        return res.status(400).json({ error: "Missing fallback playlist URI" });
    }

    // If the fallback playlist changes, reset the fallback index
    if (sessions[sessionId].fallbackPlaylist !== fallbackPlaylist) {
        sessions[sessionId].fallbackIndex = 0;
    }
    // Update session fallback playlist
    sessions[sessionId].fallbackPlaylist = fallbackPlaylist;

    res.json({ message: "Fallback playlist updated", fallbackPlaylist });
});


router.delete("/:sessionId/end", (req, res) => {
    const { sessionId } = req.params;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    delete sessions[sessionId]; // Remove session

    res.json({ message: "Session ended" });
});




// Function to check if a song has finished playing
// async function checkSongCompletion(sessionId) {
//     const session = sessions[sessionId];
//     if (!session) return;

//     const accessToken = session.accessToken;
//     if (!accessToken) return;

//     try {
//         // Get the currently playing track
//         const currentTrackRes = await fetch("https://api.spotify.com/v1/me/player", {
//             method: "GET",
//             headers: { Authorization: `Bearer ${accessToken}` }
//         });
//         const currentTrackData = await currentTrackRes.json();

//         // Get recently played track
//         const recentlyPlayedRes = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
//             method: "GET",
//             headers: { Authorization: `Bearer ${accessToken}` }
//         });
//         const recentlyPlayedData = await recentlyPlayedRes.json();

//         // Get the Spotify queue
//         const queueRes = await fetch("https://api.spotify.com/v1/me/player/queue", {
//             method: "GET",
//             headers: { Authorization: `Bearer ${accessToken}` }
//         });
//         const queueData = await queueRes.json();

//         const currentTrack = currentTrackData?.item?.id;
//         const lastPlayedTrack = recentlyPlayedData?.items?.[0]?.track?.id;
//         const repeatState = currentTrackData?.repeat_state;
//         const spotifyQueueNotEmpty = queueData?.queue?.length > 0;

//         // CASE 1: Repeat is enabled → Do nothing
//         if (repeatState === "track" || repeatState === "context") {
//             console.log("Repeat mode detected, skipping queue rotation.");
//             return;
//         }

//         // CASE 2: Spotify queue is not empty → Do nothing
//         if (spotifyQueueNotEmpty) {
//             console.log("Spotify queue has songs, skipping queue rotation.");
//             return;
//         }

//         // CASE 3: Last played matches currently playing (possible repeat/manual replay)
//         if (lastPlayedTrack === currentTrack) {
//             console.log("Song repeated, skipping queue rotation.");
//             return;
//         }

//         // CASE 4: Song has changed → Fetch the next song from session queue
//         console.log("Song has finished, fetching next song.");
//         await fetch(`http://localhost:5000/session/${sessionId}/queue/next`, {
//             method: "GET",
//             headers: { Authorization: `Bearer ${accessToken}` }
//         });
//     } catch (error) {
//         console.error("Error checking song completion:", error);
//     }
// }

const checkPlaybackState = async () => {
    try {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
            method: "GET",
            headers: { 'Authorization': `Bearer ${getAccessToken()}` }
        });

        if (!response.ok) {
            console.error("Error fetching playback state:", response.status);
            return;
        }

        const data = await response.json();
        if (!data || !data.item) return;

        const currentTrack = data.item.id;
        const progress = data.progress_ms;
        const isPlaying = data.is_playing;
        const sessionId = activeSessionId;

        // Check if playback is paused at 0ms and song hasn't changed
        if (!isPlaying && progress === 0 && lastTrackId === currentTrack) {
            console.log("Detected song pause at 0ms. Triggering queue/next!");
            if (!sessionId) {
                console.error("No active session ID detected!");
                return;
            }
            try {
                const queueResponse = await fetch(`http://localhost:5000/session/${sessionId}/queue/next`, {
                    method: "GET",
                    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
                });

                if (!queueResponse.ok) {
                    console.error(`Error triggering queue/next: ${queueResponse.status} - ${await queueResponse.text()}`);
                } else {
                    console.log("Successfully triggered queue/next!");
                }
            } catch (error) {
                console.error("Failed to fetch queue/next:", error);
            }
        }

        lastTrackId = currentTrack; // Update last track ID for next poll
    } catch (error) {
        console.error("Error checking playback state:", error);
    }
};

// Poll every 5 seconds to detect end of song & trigger next
setInterval(checkPlaybackState, 5000);




module.exports = { router };