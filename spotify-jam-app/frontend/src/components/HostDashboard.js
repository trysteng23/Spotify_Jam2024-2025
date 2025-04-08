// src/components/HostDashboard.js - Add Queue and Fallback Controls
import { useState, useEffect } from 'react';
import axios from 'axios';

function HostDashboard() {
  const [sessionId, setSessionId] = useState(null);
  const [queue, setQueue] = useState({});
  const [currentTrack, setCurrentTrack] = useState(null);


  const [fallbackPlaylist, setFallbackPlaylist] = useState('');
  const [fallbackInfo, setFallbackInfo] = useState({name: '', albumArt:''});
  const [fallbackSearchTerm, setFallbackSearchTerm] = useState('');
  const [fallbackResults, setFallbackResults] = useState([]);


  const [trackUri, setTrackUri] = useState('');
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const backendURL = `http://${window.location.hostname}:5000`;


  useEffect(() => {
    const init = async () => {
      const existingSession = localStorage.getItem('session_id');
      if (existingSession) {
        console.log("🔁 Reusing existing session ID:", existingSession);
        setSessionId(existingSession);
      } else {
        await startSession();
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionData();
    fetchNowPlaying();
    fetchFallbackPlaylist();
  }, [sessionId]);


  const fetchHostId = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.id;
  };

  const startSession = async () => {
    try {
      const hostId = await fetchHostId();
      const res = await axios.post('http://localhost:5000/session/start', {
        hostId,
        fallbackPlaylist: fallbackPlaylist || null
      });
      console.log("✅ Session started:", res.data.sessionId);
      localStorage.setItem('session_id', res.data.sessionId);
      setSessionId(res.data.sessionId);
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

//   const handleEndSession = async () => {
//     try {
//         await axios.delete(`http://localhost:5000/session/${sessionId}/end`);
//         localStorage.removeItem("session_id");
//         localStorage.removeItem("access_token");
//         alert("Session ended!");
//         window.location.href = "/"; // Redirect to landing page
//     } catch (error) {
//         console.error("Error ending session:", error.response?.data || error.message);
//     }
// };
  const handleEndSession = async () => {
    const confirmSave = window.confirm("Would you like to save this Jam as a playlist?");

    if (confirmSave) {
      try {
        const res = await axios.post(`http://localhost:5000/session/${sessionId}/save-playlist`);
        console.log("🎉 Playlist saved:", res.data.playlistName);

        const confirmEnd = window.confirm("Playlist saved! Do you want to end the Jam?");
        if (!confirmEnd) return;
      } catch (error) {
        alert("Failed to save playlist. Jam will not be ended.");
        console.error("Error saving playlist:", error.response?.data || error.message);
        return;
      }
    } else {
      const confirmEnd = window.confirm("Are you sure you want to end the Jam without saving?");
      if (!confirmEnd) return;
    }

    try {
      await axios.delete(`http://localhost:5000/session/${sessionId}/end`);
      localStorage.removeItem("session_id");
      localStorage.removeItem("access_token");
      alert("Session ended!");
      window.location.href = "/";
    } catch (error) {
      console.error("Error ending session:", error.response?.data || error.message);
    }
  };

    const handlePlay = async () => {
      try {
          await axios.put("https://api.spotify.com/v1/me/player/play", {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
          });
          console.log("✅ Playback started");
      } catch (error) {
          console.error("🚨 Error playing song:", error);
      }
    };

  const handlePause = async () => {
      try {
          await axios.put("https://api.spotify.com/v1/me/player/pause", {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
          });
          console.log("⏸️ Playback paused");
      } catch (error) {
          console.error("🚨 Error pausing song:", error);
      }
  };

  const handleSkip = async () => {
      try {
          await axios.get(`http://localhost:5000/session/${sessionId}/queue/next`);
          console.log("⏭️ Skipped to next song");
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for queue to update
          fetchNowPlaying(); // Refresh now playing data
          fetchSessionData(); // Refresh session data to reflect queue changes
      } catch (error) {
          console.error("🚨 Error skipping song:", error);
      }
  };

  const fetchTrackDetails = async (trackUri) => {
    try {
      const trackId = trackUri.split(':').pop();
      const res = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      return `${res.data.name} - ${res.data.artists.map(a => a.name).join(', ')}`;
    } catch (error) {
      console.error('Error fetching track details:', error);
      return trackUri;
    }
  };

  const fetchNowPlaying = async () => {
    try {
      let playbackRes = await axios.get(`http://localhost:5000/session/${sessionId}`);

      // console.log("Now Playing Response:", playbackRes.data.currentTrack.name);

      if (playbackRes.data.currentTrack) {
        setCurrentTrack(playbackRes.data.currentTrack);
      } else {
        // setCurrentTrack("No song playing");
        setCurrentTrack(null)
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn("Access token expired. Attempting to refresh...");
        await refreshAccessToken();
        fetchNowPlaying();
      } else {
        console.error("Error fetching Now Playing data:", error.response?.data || error.message);
        setCurrentTrack(null);
      }
    }
  };


  // const fetchFallbackPlaylist = async () => {
  //   try {
  //       const res = await axios.get(`http://localhost:5000/session/${sessionId}`);
  //       console.log("🔍 Backend response:", res.data);

  //       if (res.data.fallbackPlaylist) {
  //           let fallbackUri = res.data.fallbackPlaylist;
  //           let endpoint = "";
  //           let fallbackId = "";
  //           let albType = "";

  //           let albumName = "";
  //           let albAuthor = "";

  //           if (fallbackUri.startsWith("spotify:playlist:")) {
  //               fallbackId = fallbackUri.replace("spotify:playlist:", "");
  //               endpoint = `https://api.spotify.com/v1/playlists/${fallbackId}`;
  //               albType = "playlist";
  //           } else if (fallbackUri.startsWith("spotify:album:")) {
  //               fallbackId = fallbackUri.replace("spotify:album:", "");
  //               endpoint = `https://api.spotify.com/v1/albums/${fallbackId}`;
  //               albType = "album";
  //           } else {
  //               console.error("🚨 Invalid fallback type:", fallbackUri);
  //               setFallbackName("Invalid fallback type");
  //               return;
  //           }

  //           console.log("🎵 Fetching Fallback from:", endpoint);

  //           const fallbackRes = await axios.get(endpoint, {
  //               headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  //           });

  //           console.log("✅ Spotify API response:", fallbackRes.data);

  //           if (albType === "playlist") {
  //             albumName = fallbackRes.data.name;
  //             albAuthor = fallbackRes.data.owner?.display_name || "Unknown User";
  //             console.log("🎵 Playlist creator", albAuthor);
  //             setFallbackName(albumName + " (by " + albAuthor + ")");
  //           } else if (albType === "album") {
  //             albumName = fallbackRes.data.name;
  //             albAuthor = fallbackRes.data.artists.map(a => a.name).join(", ");
  //             setFallbackName(albumName + " (by " + albAuthor + ")");
  //           }
  //           else { // No fallback playlist set
  //             setFallbackName("No fallback playlist set");
  //           }

  //           // setFallbackName(fallbackRes.data.name);
  //       } else {
  //           setFallbackName("No fallback playlist set");
  //       }
  //   } catch (error) {
  //       console.error("🚨 Error fetching fallback playlist/album:", error.response?.data || error.message);
  //   }
  // };
  const fetchFallbackPlaylist = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/session/${sessionId}/fallback-name`);
      console.log(res.data)
      const { name, albumArt } = res.data;
  
      setFallbackInfo({ name, albumArt });
    } catch (error) {
      console.error("🚨 Error fetching fallback playlist/album:", error.response?.data || error.message);
      setFallbackInfo({ name: "No fallback playlist set", albumArt: '' });
    }
  };
  

  const fetchSessionData = async () => {
    try {
      const sessionRes = await axios.get(`http://localhost:5000/session/${sessionId}`);
      const rawQueue = sessionRes.data.queue || {};
      const resolvedQueue = {};
  
      for (const guest in rawQueue) {
        resolvedQueue[guest] = await Promise.all(
          rawQueue[guest].map(uri => fetchTrackDetails(uri))
        );
      }
  
      setQueue(resolvedQueue);
      setGuests(sessionRes.data.guests || []);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };
  

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get('http://localhost:5000/auth/refresh');
      localStorage.setItem('access_token', res.data.access_token);
      console.log("Access token refreshed:", res.data.access_token);
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error.message);
      setCurrentTrack(null);
    }
  };

  const handleAddSong = async () => {
    if (!trackUri || !sessionId) return;
    try {
        const guestId = await fetchHostId();  // Host acts as a "guest" in queue
        await axios.post(`http://localhost:5000/session/${sessionId}/queue/add`, {
            trackUri,
            guestId  // ✅ Send guestId instead of userId
        });
        setTrackUri('');
        fetchSessionData();
    } catch (error) {
        console.error("Error adding song to queue:", error.response?.data || error.message);
    }
  };

  // 🆕 Search Functionality
  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/session/spotify/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.results);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSearchAdd = async (uri) => {
    try {
      const guestId = await fetchHostId();
      await axios.post(`http://localhost:5000/session/${sessionId}/queue/add`, {
        trackUri: uri,
        guestId
      });
      fetchSessionData();
    } catch (err) {
      console.error("Error adding search result to queue:", err);
    }
  };

  const searchFallbackItems = async () => {
    if (!fallbackSearchTerm.trim()) return;
  
    try {
      const res = await axios.get(`http://localhost:5000/session/search/fallback?q=${encodeURIComponent(fallbackSearchTerm)}`);
      setFallbackResults(res.data);
    } catch (err) {
      console.error("Fallback search failed:", err.response?.data || err.message);
      setFallbackResults([]);
    }
  };
  const setFallback = async (uri) => {
    try {
      await axios.patch(`http://localhost:5000/session/${encodeURIComponent(sessionId)}/set-fallback`, { 
        fallbackPlaylist: uri 
      });
      fetchFallbackPlaylist(); // refresh UI with new fallback info
      setFallbackResults([]); // clear search results
      setFallbackSearchTerm(''); // clear input
    } catch (err) {
      console.error("Setting fallback failed:", err.response?.data || err.message);
    }
  };
  




  const handleSetFallback = async () => {
    if (!fallbackPlaylist || !sessionId) return;
    try {
      await axios.patch(`http://localhost:5000/session/${sessionId}/set-fallback`, {
        fallbackPlaylist
      });
      console.log("✅ Fallback playlist updated");
      // fetchSessionData(); 
      fetchFallbackPlaylist(); // Refresh fallback playlist name
      setFallbackPlaylist(''); // Clear input field
    } catch (error) {
      console.error("Error setting fallback playlist:", error);
    }
  };

  return (
    <div className="container">
      <h2>Host Dashboard</h2>
      <p><strong>Session ID:</strong> {sessionId || 'Loading...'}</p>
      {/* <h3>End Session</h3> */}
      <button onClick={handleEndSession}>🛑 End Jam</button>

      <h3>Search for Songs</h3>
      <input
        type="text"
        placeholder="Search by song or artist"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={() => {
        setSearchQuery('');
        setSearchResults([]);
      }}>❌ Clear</button>

      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((track, idx) => (
            <li key={idx}>
              <img src={track.albumArt} alt="cover" width="40" />
              {track.name} - {track.artist}
              <button onClick={() => handleSearchAdd(track.uri)}>Add</button>
            </li>
          ))}
        </ul>
      )}

      <h3>Guests in Session</h3>
      <ul>
          {guests.length > 0 ? guests.map((guest, index) => (
              <li key={index}>{guest}</li>
          )) : <p>No guests in session</p>}
      </ul>

      <h3>Now Playing</h3>
      {currentTrack ? (
        <div>
          {currentTrack.albumArt && (
            <img src={currentTrack.albumArt} alt="Album Art" width="100" />
          )}
          <p><strong>{currentTrack.name}</strong> - {currentTrack.artist}</p>
          <p><em>Queued by:</em> {currentTrack.queuedBy}</p>
        </div>
      ) : (
        <p>No song playing</p>
      )}

      <h3>Queue</h3>
      {Object.keys(queue).length > 0 ? (
          Object.entries(queue).map(([guest, songs]) => (
              <div key={guest}>
                  <h4>{guest}</h4> {/* Display guest name */}
                  <ul>
                      {songs.length > 0 ? songs.map((track, index) => (
                          <li key={index}>{track}</li>
                      )) : <p>No songs queued</p>}
                  </ul>
              </div>
          ))
      ) : <p>No songs in queue</p>}


      <h3>Add a Song to Queue</h3>
      <input
        type="text"
        placeholder="Enter Spotify Track URI"
        value={trackUri}
        onChange={(e) => setTrackUri(e.target.value)}
      />
      <button onClick={handleAddSong}>Add to Queue</button>

      {/* <h3>Set Fallback Playlist</h3>
      <p><strong>Current Fallback:</strong> {fallbackName}</p>*/}

      <h3>Set Fallback Playlist</h3>
      
      {fallbackInfo.albumArt && (
        <img src={fallbackInfo.albumArt} alt="Fallback Album Art" width="100" />
      )}
      <p><strong>Current Fallback:</strong> {fallbackInfo.name}</p>
      {/* <input
        type="text"
        placeholder="Enter Playlist URI"
        value={fallbackPlaylist}
        onChange={(e) => setFallbackPlaylist(e.target.value)}
      />
      <button onClick={handleSetFallback}>Set Fallback</button>  */}
      <h4>Search for Fallback Playlist or Album</h4>
      <input
        type="text"
        value={fallbackSearchTerm}
        onChange={(e) => setFallbackSearchTerm(e.target.value)}
        placeholder="Enter playlist or album name"
      />
      <button onClick={searchFallbackItems}>Search</button>
      <button onClick={() => {
        setFallbackSearchTerm('');
        setFallbackResults([]);
      }}>Clear</button>


      {fallbackResults.length > 0 && (
        <div>
          <h5>Results:</h5>
          <ul>
            {fallbackResults.map((item, index) => (
              <li key={index} style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setFallback(item.uri)}>
                <img src={item.image} alt="cover" width="60" />{' '}
                {item.name} — <em>{item.owner}</em> ({item.type})
              </li>
            ))}
          </ul>
        </div>
      )}





      <h3>Host Controls</h3>
      <button onClick={handlePlay}>▶️ Play</button>
      <button onClick={handlePause}>⏸️ Pause</button>
      <button onClick={handleSkip}>⏭️ Skip</button>

    </div>
  );
}

export default HostDashboard;
