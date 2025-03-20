// src/components/HostDashboard.js - Host Controls & Session Management
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function HostDashboard() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [fallbackPlaylist, setFallbackPlaylist] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const sessionRes = await axios.get(`http://localhost:5000/session/${sessionId}`);
      setQueue(sessionRes.data.queue);
      const playbackRes = await axios.get('http://localhost:5000/queue/current');
      setCurrentTrack(playbackRes.data);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const handlePlaybackControl = async (action) => {
    try {
      await axios.post(`http://localhost:5000/queue/${action}`);
      fetchSessionData();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleFallbackSet = async () => {
    if (!fallbackPlaylist) return;
    try {
      await axios.patch(`http://localhost:5000/session/${sessionId}/fallback`, {
        fallbackPlaylist,
      });
      alert('Fallback playlist updated!');
    } catch (error) {
      console.error('Error setting fallback playlist:', error);
    }
  };

  return (
    <div className="container">
      <h2>Host Dashboard</h2>
      <p><strong>Session ID:</strong> {sessionId}</p>
      <h3>Now Playing</h3>
      {currentTrack ? (
        <p>{currentTrack.name} - {currentTrack.artist}</p>
      ) : (
        <p>No song currently playing</p>
      )}
      <div>
        <button onClick={() => handlePlaybackControl('play')}>Play</button>
        <button onClick={() => handlePlaybackControl('pause')}>Pause</button>
        <button onClick={() => handlePlaybackControl('skip')}>Skip</button>
      </div>
      <h3>Queue</h3>
      <ul>
        {queue.length > 0 ? queue.map((track, index) => (
          <li key={index}>{track.trackUri}</li>
        )) : <p>No songs in queue</p>}
      </ul>
      <h3>Set Fallback Playlist</h3>
      <input 
        type="text" 
        placeholder="Enter playlist URI" 
        value={fallbackPlaylist} 
        onChange={(e) => setFallbackPlaylist(e.target.value)}
      />
      <button onClick={handleFallbackSet}>Set Fallback</button>
    </div>
  );
}

export default HostDashboard;
