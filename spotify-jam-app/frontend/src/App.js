import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Backend URL

function App() {
    const [token, setToken] = useState(null);
    const [clientId, setClientId] = useState("");

    useEffect(() => {
        // ✅ Extract token from URL if present
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("access_token");

        if (accessToken) {
            setToken(accessToken);
            window.history.pushState({}, document.title, "/"); // Remove token from URL
        }

        // ✅ Fetch client ID for Spotify auth
        axios.get(`${API_BASE_URL}/auth/client_id`)
            .then(response => setClientId(response.data.clientId))
            .catch(error => console.error("Error fetching client ID:", error));
    }, []);

    return (
        <div>
            {!token ? (
                <a href={`${API_BASE_URL}/auth/login`}>
                    <button>Login with Spotify</button>
                </a>
            ) : (
                <p>Logged in! Token: {token}</p>
            )}
        </div>
    );
}

export default App;
