// src/components/HostLogin.js - Handles Spotify Authentication
import { useEffect } from 'react';

function HostLogin() {
  useEffect(() => {
    window.location.href = 'http://localhost:5000/auth/login'; // Redirect to backend auth
  }, []);

  return (
    <div className="container">
      <h2>Logging in with Spotify...</h2>
    </div>
  );
}

export default HostLogin;
