// src/components/GuestDashboard.js
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function GuestDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const [queue, setQueue] = useState({});
  const [currentTrack, setCurrentTrack] = useState(null);
  const [fallbackInfo, setFallbackInfo] = useState({name:'', albumArt: ''});
  const [trackUri, setTrackUri] = useState('');
  const [guests, setGuests] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('guest_username'));

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const backendURL = `http://${window.location.hostname}:5000`;


  useEffect(() => {
    if (!sessionId) return;
    if (!username) {
      const promptName = prompt("Enter your username to join the jam:");
      if (promptName) {
        setUsername(promptName);
        localStorage.setItem('guest_username', promptName);
        joinSession(promptName);
      } else {
        navigate('/');
      }
    } else {
      joinSession(username);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
      fetchNowPlaying();
      fetchFallbackPlaylist();
    }
  }, [sessionId]);

  const joinSession = async (guestId) => {
    try {
      await axios.post("http://localhost:5000/session/join", {
        sessionId,
        guestId
      });
      console.log(`✅ ${guestId} joined session ${sessionId}`);
    } catch (error) {
      console.error("Error joining session:", error.response?.data || error.message);
    }
  };

  const leaveSession = async () => {
    try {
      await axios.delete(`http://localhost:5000/session/${sessionId}/leave`, {
        data: { guestId: username }
      });
    } catch (err) {
      console.error("Error leaving session:", err.response?.data || err.message);
    }
  
    localStorage.removeItem("guest_username");
    navigate('/');
  };

  const fetchNowPlaying = async () => {
    try {
      let playbackRes = await axios.get(`http://localhost:5000/session/${sessionId}`);

      console.log("session current track data: ", playbackRes.data.currentTrack)
      // console.log("Now Playing Response:", playbackRes.data.currentTrack.name);

      if (playbackRes.data.currentTrack) {
        setCurrentTrack(playbackRes.data.currentTrack);
      } else {
        // setCurrentTrack("No song playing");
        setCurrentTrack(null)
      }
    } catch (error) {
      console.error("Error fetching Now Playing data:", error.response?.data || error.message);
      setCurrentTrack(null);
    }
  };

  // const fetchFallbackPlaylist = async () => {
  //   try {
  //     const res = await axios.get(`http://localhost:5000/session/${sessionId}/fallback-name`);
  //     setFallbackName(res.data.name);
  //   } catch (error) {
  //     setFallbackName("Error loading fallback playlist");
  //   }
    
  // };
  const fetchFallbackPlaylist = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/session/${sessionId}/fallback-name`);
      const { name, albumArt } = res.data;
      setFallbackInfo({ name, albumArt });
    } catch (error) {
      console.error("Error fetching fallback playlist for guest:", error.response?.data || error.message);
      setFallbackInfo({ name: "No fallback playlist set", albumArt: '' });
    }
  };
  

  const fetchSessionData = async () => {
    try {
      const sessionRes = await axios.get(`http://localhost:5000/session/${sessionId}`);
      const queueRes = await axios.get(`http://localhost:5000/session/${sessionId}/queue-resolved`);

      setQueue(queueRes.data.queue || {});
      setGuests(sessionRes.data.guests || []);
      // setCurrentTrack(sessionRes.data.currentTrack.name + " - " + sessionRes.data.currentTrack.artist || "No song playing");
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const handleAddSong = async () => {
    if (!trackUri || !username || !sessionId) return;
    try {
      await axios.post(`http://localhost:5000/session/${sessionId}/queue/add`, {
        trackUri,
        guestId: username
      });
      setTrackUri('');
      fetchSessionData();
    } catch (error) {
      console.error("Error adding song to queue:", error.response?.data || error.message);
    }
  };

  // 🆕 Search logic
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
      await axios.post(`http://localhost:5000/session/${sessionId}/queue/add`, {
        trackUri: uri,
        guestId: username
      });
      fetchSessionData();
    } catch (err) {
      console.error("Error adding search result to queue:", err);
    }
  };

  return (
    <div className="container">
      <h2>Guest Dashboard</h2>
      <p><strong>Session ID:</strong> {sessionId}</p>
      <p><strong>Logged in as:</strong> {username}</p>
      <button onClick={leaveSession}>🚪 Leave Jam</button>

      <h3>Search for a Song</h3>
      <input
        type="text"
        placeholder="Search songs..."
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
          {searchResults.map((track, index) => (
            <li key={index}>
              <img src={track.albumArt} alt="album" width={40} height={40} />
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
            <h4>{guest}</h4>
            <ul>
              {songs.length > 0 ? songs.map((track, index) => (
                <li key={index}>{track.name} - {track.artist}</li>
              )) : <p>No songs queued</p>}
            </ul>
          </div>
        ))
      ) : <p>No songs in queue</p>}

      {/* <h3>Add a Song to Queue</h3>
      <input
        type="text"
        placeholder="Enter Spotify Track URI"
        value={trackUri}
        onChange={(e) => setTrackUri(e.target.value)}
      />
      <button onClick={handleAddSong}>Add to Queue</button> */}

      {/* <h3>Fallback Playlist</h3>
      <p><strong>Current Fallback:</strong> {fallbackName}</p> */}
      <h3>Fallback Playlist</h3>
      {fallbackInfo.albumArt && (
        <img src={fallbackInfo.albumArt} alt="Fallback Album Art" width="100" />
      )}
      <p><strong>Current Fallback: </strong>{fallbackInfo.name}</p>

    </div>
  );
}

export default GuestDashboard;
