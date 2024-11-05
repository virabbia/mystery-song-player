// Replace with your actual Client ID and Redirect URI
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
const REDIRECT_URI = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Function to get track URI from the URL
function getTrackUri() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('track');
}

// Authentication function to get Spotify access token
function authenticate(trackUri) {
    // Include track URI as a query parameter in the redirect URI
    const redirectUriWithTrack = `${REDIRECT_URI}?track=${encodeURIComponent(trackUri)}`;
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUriWithTrack)}&scope=streaming%20user-read-playback-state%20user-modify-playback-state`;
    window.location.href = authUrl;
}

// Extract token from URL after authentication
function getTokenFromUrl() {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        return params.get('access_token');
    }
    return null;
}

// Main: Check if we have a token or need to authenticate
const trackUri = getTrackUri();
const token = getTokenFromUrl();

if (!token) {
    if (trackUri) {
        console.log("No token found, redirecting to authenticate with track URI:", trackUri);
        authenticate(trackUri);
    } else {
        console.error("No track URI provided in the URL.");
    }
} else {
    console.log("Token found:", token);
    console.log("Track URI retrieved:", trackUri);
    // You can use this token to call Spotify's API and play the track
}
