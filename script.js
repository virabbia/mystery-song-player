const clientId = '0e507d976bac454da727e5da965c22fb'; // Replace with your Spotify app client ID
const redirectUri = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Check if we have an access token in the URL hash
const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
    const parts = item.split('=');
    acc[parts[0]] = decodeURIComponent(parts[1]);
    return acc;
}, {});
window.location.hash = '';

let accessToken = hash.access_token;

// If no access token, redirect to Spotify for authentication
if (!accessToken) {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user-modify-playback-state%20user-read-playback-state`;
    window.location.href = authUrl;
} else {
    // Spotify API code to play song once authenticated
    document.getElementById('play-button').addEventListener('click', () => {
        playSong();
    });

    function playSong() {
        fetch('https://api.spotify.com/v1/me/player/play', {
            method: 'PUT',
            body: JSON.stringify({ uris: ['spotify:track:1qWLCuCnNcQVVzJm4pu7Zv'] }), // Example track URI
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.error('Error playing song:', error);
            alert('Please open Spotify on your device and try again.');
        });
    }
}
