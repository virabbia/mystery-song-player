// Replace with your actual Client ID and Redirect URI
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
const REDIRECT_URI = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Function to get track URI from the URL
function getTrackUri() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('track');
}
