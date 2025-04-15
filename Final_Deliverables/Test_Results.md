
# 🧪 Test Results – Better Spotify Jam

Below is a summary of test results based on the test plan. Each feature was tested manually through the live application UI to confirm correct behavior.

---

## ✅ Passed Tests

### TC01: Host Login with Spotify
- ✅ Host successfully logs in and is redirected to the Host Dashboard.

### TC02: Invalid Host Login Attempt
- ✅ Invalid login attempt shows error and does not proceed.

### TC03: Creating a New Jam Session
- ✅ Jam session is created when host starts a session.

### TC04: Guest Joining a Jam Session
- ✅ Guests join by entering valid session code and username.

### TC05: Song Queue Rotation
- ✅ Songs rotate fairly between users as expected.

### TC06: Fallback Playlist Handling
- ✅ When no user has songs queued, fallback playlist begins playing.

### TC07: Show Current Song + Contributor
- ✅ Now Playing view shows current song and who queued it.

### TC08: End Jam Session
- ✅ Host ends session and backend removes it correctly.

### TC09: Save Session Playlist
- ✅ Playlist with played songs is saved with proper title formatting.

### TC10: Song Search
- ✅ Users can search for songs and see Spotify-powered results.

---

## 🟡 Observations

- Fallback playlist works best when set early; host playback device must be active.
- Minor delay observed when transitioning between users in the queue.
- Guests must be on the same Wi-Fi network to access the host session reliably.

---

## ❌ Not Tested or Not Implemented

- Automated testing (unit tests)
- Real-time updates with WebSockets (stretch goal)
- Stress testing the system on heavy load
- Ensuring clean inputs and smash stacking protection behavior

---

**Overall Result:** All core functional features were tested and confirmed to work as expected. Performance held stable in all manual tests conducted by the developer.
