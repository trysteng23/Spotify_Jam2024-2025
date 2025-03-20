// src/components/GuestDashboard.js - Guest View & Song Queue
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function GuestDashboard() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackUri, setTrackUri] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const sessionRes = await axios.get(`http://localhost:5000/session/${sessionId}/queue`);
      setQueue(sessionRes.data.queue);
      const playbackRes = await axios.get('http://localhost:5000/queue/current');
      setCurrentTrack(playbackRes.data);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  const handleAddSong = async () => {
    if (!trackUri) return;
    try {
      await axios.post(`http://localhost:5000/session/${sessionId}/queue/add`, {
        guestId: 'guest-placeholder', // Replace with actual guest ID if needed
        trackUri,
      });
      setTrackUri('');
      fetchSessionData();
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  return (
    <div className="container">
      <h2>Guest Dashboard</h2>
      <p><strong>Session ID:</strong> {sessionId}</p>
      <h3>Now Playing</h3>
      {currentTrack ? (
        <p>{currentTrack.name} - {currentTrack.artist}</p>
      ) : (
        <p>No song currently playing</p>
      )}
      <h3>Queue</h3>
      <ul>
        {queue.length > 0 ? queue.map((track, index) => (
          <li key={index}>{track.trackUri}</li>
        )) : <p>No songs in queue</p>}
      </ul>
      <h3>Add a Song</h3>
      <input 
        type="text" 
        placeholder="Enter Spotify Track URI" 
        value={trackUri} 
        onChange={(e) => setTrackUri(e.target.value)}
      />
      <button onClick={handleAddSong}>Add to Queue</button>
    </div>
  );
}

export default GuestDashboard;
