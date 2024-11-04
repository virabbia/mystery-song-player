// Replace with your actual Client ID and Redirect URI
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
const REDIRECT_URI = 'http://localhost:5500/callback.html';
let token;

// Function to get the track URI from the URL query parameter or `state` after redirect
function getTrackUri() {
    const urlParams = new URLSearchParams(window.location.search);
    let trackUri = urlParams.get('track');

    // If redirected back from Spotify, retrieve track URI from state parameter
    if (!trackUri) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        trackUri = hashParams.get('state');
    }

    // Default to backup track if no URI found
    trackUri = trackUri || 'spotify:track:0t0Kl5jxxV3s8bdpILkgmd';
    console.log("Retrieved track URI:", trackUri); // Log the retrieved track URI for debugging
    return trackUri;
}

// Function to get the access token from the URL hash fragment
function getTokenFromUrl() {
    const hash = window.location.hash.substring(1); // Remove the '#' at the start
    const hashParams = new URLSearchParams(hash);
    return hashParams.get('access_token');
}

// Authentication function to get Spotify access token
function authenticate() {
    const trackUri = getTrackUri(); // Get the track URI to preserve it
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=streaming%20user-read-playback-state%20user-modify-playback-state&state=${encodeURIComponent(trackUri)}`;
    window.location.href = authUrl;
}

// Initialize the Spotify Player
window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new Spotify.Player({
        name: 'Mystery Song Player',
        getOAuthToken: cb => { cb(token); },
    });

    player.addListener('ready', ({ device_id }) => {
        console.log('Player ready with Device ID:', device_id);
        
        // Get the track URI from the state parameter or URL and play the song
        const trackUri = getTrackUri();
        playSong(device_id, trackUri);
    });

    player.connect();
};

// Play a specific song by URI
function playSong(device_id, trackUri) {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
    }).catch(error => console.error("Playback error:", error));
}

// Main: Check if we have a token or need to authenticate
token = getTokenFromUrl();
if (!token) {
    console.log("No token found, redirecting to authenticate...");
    authenticate();
} else {
    console.log("Token found:", token);
    // Load Spotify SDK Script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
}
