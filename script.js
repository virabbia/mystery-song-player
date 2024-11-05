const clientId = '0e507d976bac454da727e5da965c22fb'; // Replace with your Spotify app client ID
const redirectUri = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Parse the URL fragment for the access token
const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
    const parts = item.split('=');
    acc[parts[0]] = decodeURIComponent(parts[1]);
    return acc;
}, {});

let accessToken = hash.access_token;

// Clear the access token from the URL fragment for a clean URL
if (accessToken) {
    window.location.hash = ''; // Clears the fragment so it’s not visible in the URL
}

// Function to get the track URI from the URL query parameter
function getTrackUri() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('track');
}

if (!accessToken) {
    // If no access token, redirect to Spotify authorization
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-modify-playback-state%20user-read-playback-state`;
    window.location.href = authUrl;
} else {
    // Spotify API code to play song once authenticated
    document.getElementById('play-button').addEventListener('click', () => {
        playSong();
    });

    function playSong() {
        const trackUri = getTrackUri(); // Get the track URI from the URL

        if (trackUri) {
            fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                body: JSON.stringify({ uris: [trackUri] }), // Use the track URI from the URL
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.error('Error playing song:', error);
                alert('Please open Spotify on your device and try again.');
            });
        } else {
            alert("No track URI provided in the URL.");
        }
    }
}
