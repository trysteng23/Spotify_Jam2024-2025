import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GuestJoin() {
  const [sessionCode, setSessionCode] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!sessionCode || !username) {
      alert('Please enter both a session code and username.');
      return;
    }

    localStorage.setItem('guest_username', username); // Save for GuestDashboard use
    navigate(`/guest-dashboard?session=${sessionCode}`);
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
      <br />
      <input
        type="text"
        placeholder="Enter Your Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}

export default GuestJoin;
