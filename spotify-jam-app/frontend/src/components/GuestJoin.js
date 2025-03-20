// src/components/GuestJoin.js - Enter Session Code & Join
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GuestJoin() {
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (sessionCode) {
      navigate(`/guest-dashboard?session=${sessionCode}`);
    }
  };

  return (
    <div className="container">
      <h2>Join a Jam</h2>
      <input 
        type="text" 
        placeholder="Enter Session Code" 
        value={sessionCode} 
        onChange={(e) => setSessionCode(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}

export default GuestJoin;