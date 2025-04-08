import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleHostJam = () => {
    // Redirect to Spotify login
    window.location.href = "http://localhost:5000/auth/login";
  };

  return (
    <div className="container">
      <h1>Welcome to Spotify Jam 2.0</h1>
      <button onClick={handleHostJam}>Host a Jam</button>
      <button onClick={() => navigate('/guest-join')}>Join a Jam</button>
    </div>
  );
}

export default LandingPage;