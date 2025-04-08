// import axios from 'axios';
// import { useEffect, useState } from 'react';

// function HostLogin() {
//   console.log("✅ HostLogin Component Loaded");

//   useEffect(() => {
//     console.log("🔍 Current URL:", window.location.href);

//     // Extract access_token from URL
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('access_token');

//     console.log("🔍 Extracted Token:", token);

//     if (token) {
//       console.log("✅ Storing token in localStorage...");
//       localStorage.setItem('access_token', token);  // Store token
      
//       // 🔹 Clear the access token from the URL for a cleaner UI
//       window.history.replaceState({}, document.title, "/host-dashboard");

//       // 🔹 Redirect to dashboard
//       window.location.href = "/host-dashboard";
//     } else {
//       console.error("🚨 Access token missing from URL.");
//     }
//   }, []);

//   return (
//     <div className="container">
//       <h2>Logging in with Spotify...</h2>
//     </div>
//   );
// }

// export default HostLogin;

import { useEffect, useState } from 'react';
import axios from 'axios';

function HostLogin() {
  const [sessionName, setSessionName] = useState("");
  const [tokenCaptured, setTokenCaptured] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (token) {
      localStorage.setItem('access_token', token);
      setTokenCaptured(true);
      window.history.replaceState({}, document.title, "/host-login");
    }
  }, []);

  const handleStartSession = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken || !sessionName) return alert("Missing token or session name");

    try {
      // Fetch host ID (Spotify user)
      const res = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const hostId = res.data.id;

      // Start session with sessionName
      const backendRes = await axios.post("http://localhost:5000/session/start", {
        hostId,
        sessionId: sessionName
      });

      const sessionId = backendRes.data.sessionId;
      localStorage.setItem("session_id", sessionId);

      window.location.href = "/host-dashboard";
    } catch (err) {
      console.error("Failed to start session", err);
      alert("Could not start session. Try a different name?");
    }
  };

  return (
    <div className="container">
      <h2>🎧 Create Your Jam Session</h2>
      {tokenCaptured ? (
        <>
          <input
            type="text"
            placeholder="Enter a short session name (e.g. room123)"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
          <button onClick={handleStartSession}>Start Session</button>
        </>
      ) : (
        <p>Waiting for Spotify authentication...</p>
      )}
    </div>
  );
}

export default HostLogin;
// Note: Ensure to handle the token expiration and refresh logic in your actual implementation.
