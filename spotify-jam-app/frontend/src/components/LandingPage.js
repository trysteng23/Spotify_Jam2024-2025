import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome to Spotify Jam</h1>
      <button onClick={() => navigate('/host-login')}>Host a Jam</button>
      <button onClick={() => navigate('/guest-join')}>Join a Jam</button>
    </div>
  );
}

export default LandingPage;