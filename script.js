// Replace with your actual Client ID and Redirect URI
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
const REDIRECT_URI = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Authentication function to get Spotify access token
function authenticate() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=streaming%20user-read-playback-state%20user-modify-playback-state`;
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
