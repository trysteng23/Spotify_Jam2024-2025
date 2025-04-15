
# ✅ Senior Design Test Plan  
**Author:** Trysten Giorgione  
**Semester:** Spring 2025  

---

## Part I. Overall Test Plan Description

This test plan outlines the testing strategy for the Spotify Web App that enhances the group listening experience. The testing will be a combination of functional, integration, and performance testing to ensure that key features work correctly. Blackbox testing will be primarily used since the system interacts with Spotify’s API. Testing will include normal, abnormal, and boundary cases to validate expected behaviors.

---

## Part II. Test Case Descriptions

### 🔐 TC01: Host Login with Spotify
- **Purpose:** Verify that a host can log in using their Spotify credentials.
- **Inputs:** Valid Spotify credentials
- **Expected Output:** Successful login and redirection to the host dashboard
- **Classification:** Normal / Blackbox / Functional / Unit

---

### ❌ TC02: Invalid Host Login Attempt
- **Purpose:** Verify system response to invalid login credentials
- **Inputs:** Invalid Spotify credentials
- **Expected Output:** Error message and login failure
- **Classification:** Abnormal / Blackbox / Functional / Unit

---

### 🆕 TC03: Creating a New Jam Session
- **Purpose:** Ensure that the host can create a Jam session
- **Inputs:** Host clicks "Start Jam"
- **Expected Output:** Jam session successfully created
- **Classification:** Normal / Blackbox / Functional / Unit

---

### 👥 TC04: Guest Joining a Jam Session
- **Purpose:** Validate that guests can join an ongoing Jam session
- **Inputs:** Guest attempts to join with session ID and username
- **Expected Output:** Guest is added to the session
- **Classification:** Normal / Blackbox / Functional / Integration

---

### 🔄 TC05: Song Queue Rotation
- **Purpose:** Ensure fair rotation of songs between users
- **Inputs:** Multiple users add songs
- **Expected Output:** Songs alternate in round-robin fashion
- **Classification:** Normal / Blackbox / Functional / Integration

---

### 🎵 TC06: Fallback Playlist Handling
- **Purpose:** Ensure fallback playlist plays when no user has songs queued
- **Inputs:** Queue is empty, fallback playlist is set
- **Expected Output:** A song from the fallback playlist starts playing
- **Classification:** Boundary / Blackbox / Functional / Unit

---

### 👁️ TC07: Users See Who Queued the Current Song
- **Purpose:** Display current track’s contributor and individual queues
- **Inputs:** User refreshes the page
- **Expected Output:** Current track + contributor name + user queues shown
- **Classification:** Normal / Blackbox / Functional / Unit

---

### 🛑 TC08: Host Ending a Jam Session
- **Purpose:** Verify that the host can end the session
- **Inputs:** Host clicks “End Jam”
- **Expected Output:** Session ends, users removed, backend cleaned up
- **Classification:** Normal / Blackbox / Functional / Unit

---

### 💾 TC09: Saving a Jam Session Playlist
- **Purpose:** Allow host to save a playlist of played songs
- **Inputs:** Host clicks “End Jam” → “Ok” to save → chooses to cancel or confirm end
- **Expected Output:** Playlist saved as “Jam MM/DD/YYYY”; Jam continues or ends
- **Classification:** Normal / Blackbox / Functional / Integration

---

### 🔍 TC10: Song Search Functionality
- **Purpose:** Validate that users can search for songs using the app's interface
- **Inputs:** User types a search term in the search bar
- **Expected Output:** Spotify API returns valid search results displayed in UI
- **Classification:** Normal / Blackbox / Functional / Unit

---

## Part III. Test Case Matrix

| Test Case | Normal/Abnormal | Type      | Category     | Scope       |
|-----------|------------------|-----------|--------------|-------------|
| TC01      | Normal           | Blackbox  | Functional   | Unit        |
| TC02      | Abnormal         | Blackbox  | Functional   | Unit        |
| TC03      | Normal           | Blackbox  | Functional   | Unit        |
| TC04      | Normal           | Blackbox  | Functional   | Integration |
| TC05      | Normal           | Blackbox  | Functional   | Integration |
| TC06      | Boundary         | Blackbox  | Functional   | Unit        |
| TC07      | Normal           | Blackbox  | Functional   | Unit        |
| TC08      | Normal           | Blackbox  | Functional   | Unit        |
| TC09      | Normal           | Blackbox  | Functional   | Integration |
| TC10      | Normal           | Blackbox  | Functional   | Unit        |

---

*End of Test Plan*
