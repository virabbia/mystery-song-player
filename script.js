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
