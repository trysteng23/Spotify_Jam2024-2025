const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const sessions = {}; // In-memory storage

let lastTrackId = null; // Store last track ID for detecting transitions
let activeSessionId = null; // Store active session ID for polling

const { getAccessToken, refreshAccessToken } = require("./auth");

function generateShortId(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}


// Start a new session
router.post("/start", (req, res) => {
    const { hostId, fallbackPlaylist, sessionId: customId} = req.body; // Host's Spotify user ID

    if (!hostId) {
        return res.status(400).json({ error: "Missing host ID" });
    }

    // const sessionId = uuidv4(); // Generate unique session ID
    const sessionId = customId || generateShortId(); // Use provided session ID or generate a new one
    if (sessions[sessionId]) {
        return res.status(400).json({ error: "Session ID already exists" });
    }
    sessions[sessionId] = {
        host: hostId,
        guests: [],
        queue: {},
        playedTracks: [], // Store played tracks for saving the session as playlist
        currentIndex: 0, // Track the current index for round-robin
        fallbackPlaylist: fallbackPlaylist || null, // Optional: Fallback playlist URI
        currentTrack: null // Store the current track URI
        // fallbackIndex: 0 // Track the next song from the fallback list
    };

    activeSessionId = sessionId; // Set active session ID for polling

    console.log(hostId); //see if hostId is being passed in
    sessions[sessionId].guests.push(hostId); // Add host to session as 'guest'
    sessions[sessionId].queue[hostId] = []; // Initialize host's queue
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
    else{
        return res.status(400).json({ error: "Guest already joined session" });
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

    res.json({
        host: sessions[sessionId].host,
        guests: sessions[sessionId].guests || [], // ✅ Send guest list
        queue: sessions[sessionId].queue || {},
        playedTracks: sessions[sessionId].playedTracks || [], // ✅ Send played tracks
        currentIndex: sessions[sessionId].currentIndex,
        currentTrack: sessions[sessionId].currentTrack,
        fallbackPlaylist: sessions[sessionId].fallbackPlaylist
    });
    // res.json(sessions[sessionId]);
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

router.get("/:sessionId/current-track", (req, res) => {
    const { sessionId } = req.params;
    const session = sessions[sessionId];
    
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ currentTrack: session.currentTrack });
});

  
// Guest removes a song from the queue
router.delete("/:sessionId/queue/remove", (req, res) => {
    const { sessionId } = req.params;
    const { guestId, trackUri } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    if (!guestId || !trackUri) {
        return res.status(400).json({ error: "Missing guest ID or track URI" });
    }

    if (!sessions[sessionId].queue[guestId]) {
        return res.status(404).json({ error: "Guest not found in queue" });
    }

    const guestQueue = sessions[sessionId].queue[guestId];
    const trackIndex = guestQueue.indexOf(trackUri);

    if (trackIndex === -1) {
        return res.status(404).json({ error: "Track not found in guest queue" });
    }

    guestQueue.splice(trackIndex, 1); // Remove track from guest queue
    res.json({ message: "Song removed from queue", queue: sessions[sessionId].queue });
});

// get readable queue (resolved through spotify API)
router.get("/:sessionId/queue-resolved", async (req, res) => {
    const { sessionId } = req.params;
    const session = sessions[sessionId];

    if (!session) return res.status(404).json({ error: "Session not found" });

    const accessToken = await getAccessToken();
    const resolvedQueue = {};

    for (const guest in session.queue) {
        resolvedQueue[guest] = await Promise.all(
            session.queue[guest].map(uri => getTrackInfo(uri, accessToken))
        );
    }

    res.json({ queue: resolvedQueue });
});

// Guest adds a song to the queue
router.post("/:sessionId/queue/add", (req, res) => {
    console.log("Received request body:", req.body);  // 🔍 Debug request
    const { sessionId } = req.params;
    const { guestId, trackUri } = req.body;

    if (!sessions[sessionId]) {
        console.log("Session not found");
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
        // for (let i = 0; i < guestIds.length; i++) {
        //     const guestId = guestIds[session.currentIndex % guestIds.length];
        //     if (queue[guestId].length > 0) {
        //         nextSong = queue[guestId].shift();
        //         selectedGuest = guestId;
        //         session.currentIndex = (session.currentIndex + 1) % guestIds.length; // Update rotation index
        //         break;
        //     }
        // }
        let found = false;
        for (let i = 0; i < guestIds.length; i++) {
            const index = (session.currentIndex + i) % guestIds.length;
            const guestId = guestIds[index];

            if (queue[guestId] && queue[guestId].length > 0) {
                nextSong = queue[guestId].shift();
                selectedGuest = guestId;
                session.currentIndex = (index + 1) % guestIds.length;
                found = true;
                console.log(`🎧 Playing from ${selectedGuest}, setting next check index to ${session.currentIndex}`);
                break;
            }
        }
    }

    // If queue is empty, get a song from the fallback playlist
    if (!nextSong) {
        console.log("💤 No guest queues available. Using fallback.");
        session.currentIndex = 0; // Reset rotation index
        if (!session.fallbackPlaylist) {
            return res.json({ message: "No songs available and no fallback playlist set." });
        }

        try {
            // Extract ID from URI
            const uriParts = session.fallbackPlaylist.split(":");
            const type = uriParts[1]; // "playlist" or "album"
            const playlistOrAlbumId = uriParts[2];
            const hostAccessToken = await getAccessToken();
            const apiUrl = type === "album"
            ? `https://api.spotify.com/v1/albums/${playlistOrAlbumId}/tracks`
            : `https://api.spotify.com/v1/playlists/${playlistOrAlbumId}/tracks`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { Authorization: `Bearer ${hostAccessToken}` }
            });

            const data = await response.json();
            
            //for if we want to iterate from beginning to end of fallback playlist rather than random...
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
        const accessToken = await getAccessToken();
        const playbackResponse = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uris: [nextSong] })
        });

        if (playbackResponse.status === 204) {
            const trackInfo = await getTrackInfo(nextSong, accessToken);
            session.currentTrack = {
                ...trackInfo,
                queuedBy: selectedGuest
            };

            if (!session.playedTracks.includes(nextSong)) {
                session.playedTracks.push(nextSong); // Add to played tracks
                console.log("Adding to played tracks:", session.playedTracks);
            }              
            
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

router.patch("/:sessionId/set-fallback", (req, res) => {
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

// Get the name of the fallback playlist/album
router.get("/:sessionId/fallback-name", async (req, res) => {
    const { sessionId } = req.params;
    const session = sessions[sessionId];
    const accessToken = await getAccessToken();

    if (!session) {
        return res.status(404).json({ error: "Session does not exist" });
    }
    //if no fallback playlist, send that as the name.
    if(!session.fallbackPlaylist){
        res.json({name: "No fallback playlist set!"});
    }
    else{
        try {
            const uriParts = session.fallbackPlaylist.split(":");
            const type = uriParts[1]; // playlist or album
            const id = uriParts[2];
            const apiType = type === "album" ? "albums" : "playlists";

            const response = await fetch(`https://api.spotify.com/v1/${apiType}/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const data = await response.json();

            let displayName;
            if (type === "playlist") {
                displayName = `${data.name} (by ${data.owner.display_name})`;
            } else {
                const artists = data.artists.map(a => a.name).join(", ");
                displayName = `${data.name} (by ${artists})`;
            }
            
            
            const albumArt = data.images?.[0]?.url || null;
            if (!data.images || data.images.length === 0) {
                console.warn("⚠️ No album art found for fallback");
            }
            
            res.json({ name: displayName, albumArt });

        } catch (err) {
            console.error("Error fetching fallback name:", err);
            res.status(500).json({ error: "Failed to fetch fallback info" });
        }
    }
});

router.post("/:sessionId/save-playlist", async (req, res) => {
    const { sessionId } = req.params;
    const session = sessions[sessionId];
    const accessToken = await getAccessToken();
  
    if (!session || !accessToken) {
      return res.status(404).json({ error: "Session or host token not found" });
    }
  
    const playedTracks = session.playedTracks;
    if (!playedTracks || playedTracks.length === 0) {
      return res.status(400).json({ error: "No tracks played to save" });
    }
  
    try {
      // Step 1: Get host's user ID
      const userRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      const userData = await userRes.json();
      const userId = userData.id;
  
      if (!userId) {
        console.error("Failed to get user ID:", userData);
        return res.status(500).json({ error: "Failed to fetch user profile" });
      }
  
      // Step 2: Create playlist
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      const playlistName = `Jam ${formattedDate}`;
  
      const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: playlistName,
          description: "Songs played during your Spotify Jam",
          public: false
        })
      });
  
      const playlistData = await createRes.json();
      const playlistId = playlistData.id;
  
      if (!playlistId) {
        console.error("Failed to create playlist:", playlistData);
        return res.status(500).json({ error: "Failed to create playlist" });
      }
  
      console.log("🎵 Played Tracks to be saved:", playedTracks);
  
      // Step 3: Add tracks to playlist (up to 100 per request)
      const chunks = [];
      for (let i = 0; i < playedTracks.length; i += 100) {
        chunks.push(playedTracks.slice(i, i + 100));
      }
  
      for (const chunk of chunks) {
        console.log("🚚 Sending chunk to playlist:", chunk);
  
        const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ uris: chunk })
        });
  
        const result = await addRes.json();
  
        if (!addRes.ok) {
          console.error("❌ Failed to add tracks to playlist:", result);
          return res.status(addRes.status).json({ error: "Failed to add tracks", details: result });
        } else {
          console.log("✅ Tracks successfully added:", result);
        }
      }
  
      return res.json({ message: "Playlist saved!", playlistName });
    } catch (err) {
      console.error("🛑 Error saving playlist:", err);
      return res.status(500).json({ error: "Failed to create playlist" });
    }
  });
  
  //function to help search for songs in Spotify
  router.get("/spotify/search", async (req, res) => {
    const query = req.query.query;
    const accessToken = await getAccessToken();
  
    if (!query || !accessToken) {
      return res.status(400).json({ error: "Missing search query or token" });
    }
  
    try {
      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
  
      const data = await spotifyRes.json();
  
      const simplified = data.tracks.items.map(track => ({
        uri: track.uri,
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        albumArt: track.album.images[0]?.url || ""
      }));
  
      res.json({ results: simplified });
    } catch (err) {
      console.error("Spotify search failed:", err);
      res.status(500).json({ error: "Failed to search Spotify" });
    }
  });
  router.get("/search/fallback", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing search query" });
  
    try {
      const token = await getAccessToken();
      const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,playlist&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await searchRes.json();
      const results = [];
      
      const albums = data.albums?.items || [];
      const playlists = data.playlists?.items || [];

      if (albums) {
        data.albums.items.forEach(album => {
            if(album?.uri){
                results.push({
                    uri: album.uri || '',
                    name: album.name,
                    owner: album.artists.map(a => a.name).join(", "),
                    image: album.images[0]?.url || '',
                    type: "album"
                });
            }
        });
      }
  
      if (playlists){
        data.playlists.items.forEach(pl => {
            if(pl?.uri){
                results.push({
                    uri: pl.uri,
                    name: pl.name,
                    owner: pl.owner.display_name || "Unknown",
                    image: pl.images[0]?.url || '',
                    type: "playlist"
                });
            }
        });
      }
  
      res.json(results);
    } catch (err) {
      console.error("Search fallback error:", err);
      res.status(500).json({ error: "Failed to search fallback items" });
    }
  });

router.delete("/:sessionId/end", (req, res) => {
    const { sessionId } = req.params;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session not found" });
    }

    delete sessions[sessionId]; // Remove session

    res.json({ message: "Session ended" });
});

router.delete("/:sessionId/leave", (req, res) => {
    const { sessionId } = req.params;
    const { guestId } = req.body;
  
    const session = sessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
  
    if (!guestId) {
      return res.status(400).json({ error: "Missing guest ID" });
    }
  
    // Remove guest from guest list
    session.guests = session.guests.filter(id => id !== guestId);
  
    // Delete their queue
    delete session.queue[guestId];
  
    res.json({ message: `Guest ${guestId} has left the session.` });
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
async function getTrackInfo(uri, accessToken) {
    const trackId = uri.split(":").pop();
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error("Failed to fetch track metadata");

        const data = await response.json();

        return {
            uri: uri,
            name: data.name,
            artist: data.artists.map(a => a.name).join(", "),
            albumArt: data.album.images[0]?.url || null
        };
    } catch (err) {
        console.error("Error fetching track info:", err);
        return { uri, name: "Unknown Track", artist: "Unknown Artist" };
    }
}

const checkPlaybackState = async () => {
    try {
        const token = await getAccessToken(); //wait for the token to be retrieved

        const response = await fetch("https://api.spotify.com/v1/me/player", {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
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
                    headers: { 'Authorization': `Bearer ${token}` }
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




module.exports = { router, sessions };