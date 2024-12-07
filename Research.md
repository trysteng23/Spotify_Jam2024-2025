# Spotify Fair Queue Project Research

1. [Create an App at Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. [Spotify’s API Helper Webpage](https://developer.spotify.com/documentation/web-api)
   - [Web Playback SDK for creating a new player and stream for Spotify inside a web app](https://developer.spotify.com/documentation/web-playback-sdk)
   - [Display your Spotify profile data in a web app - GUIDE](https://developer.spotify.com/documentation/web-api/howtos/web-app-profile)
     - **Requirements**: Node.js LTS, npm, and a Spotify account.
     - **Description**: Creates UI and retrieves the data.

---

# Topics and Concepts to Research for the Spotify Fair Queue Project

## 1. Spotify Developer Tools
   - **Spotify Developer Dashboard**: Understanding how to create and manage apps on Spotify's developer platform.
   - **Spotify Web API**: 
     - **Authentication and Authorization**:
       - OAuth 2.0 for user authentication.
       - Scopes required for managing playback, playlists, and user data.
     - **Core API functionalities**:
       - Managing playback (e.g., play, pause, skip).
       - Accessing and modifying playlists.
       - Retrieving user profile and song metadata.
   - **Web Playback SDK**: 
     - Creating a custom player.
     - Streaming music directly from Spotify into a web app.
     - Controlling playback using the SDK.

## 2. Backend Development
   - **Node.js**: For building the backend application, handling API requests, and managing Spotify authentication.
   - **Express.js**: Setting up routes for handling user actions (e.g., adding songs, managing queue).
   - **Database Management**: 
     - Storing user queue data (e.g., song IDs, user information).
     - Database options: 
       - **SQL** (e.g., PostgreSQL or MySQL) for structured data.
       - **NoSQL** (e.g., MongoDB) for dynamic, JSON-like structures.

## 3. Frontend Development
   - **React.js or Vanilla JavaScript**: 
     - Building a dynamic user interface to show the queue, current song, and users.
     - Displaying real-time queue updates.
   - **CSS Frameworks (optional)**: For styling the web app, e.g., Tailwind CSS or Bootstrap.

## 4. Queue Management Logic
   - **Fair Queue Algorithm**: 
     - Design logic to rotate song selection among users fairly.
     - Handling edge cases:
       - Users without songs in their queue.
       - Adding/removing users dynamically.
       - Queue changes and songs being added at the same time.
   - **Synchronization**: 
     - Ensuring consistent queue management across multiple users and devices.

## 5. Real-Time Communication
   - **WebSockets**: 
     - For real-time updates to the queue and playback status.
     - Broadcasting changes when users add/remove songs or join/leave the session.

## 6. Testing and Debugging
   - **API Testing**: 
     - Using tools like Postman to test Spotify API endpoints.
   - **Frontend Testing**: 
     - Ensuring the queue displays correctly for all users.
   - **Load Testing**: 
     - Checking performance with multiple users joining and interacting with the queue.

## 7. Hosting and Deployment
   - **Backend Hosting**: 
     - Options: AWS, Heroku, or Vercel for Node.js apps.
   - **Frontend Hosting**: 
     - Options: Netlify, Vercel, or GitHub Pages.
   - **Dom
