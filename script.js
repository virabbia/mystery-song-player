const clientId = '0e507d976bac454da727e5da965c22fb'; // Replace with your Spotify app client ID

// Check if we already have an access token in the URL fragment
const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
    const parts = item.split('=');
    acc[parts[0]] = decodeURIComponent(parts[1]);
    return acc;
}, {});
let accessToken = hash.access_token;

console.log("Starting script...");
console.log("Access Token:", accessToken);

// Clear the access token from the URL fragment for a clean URL
if (accessToken) {
    window.location.hash = ''; // Clears the fragment so it’s not visible in the URL
    console.log("Access token cleared from URL.");
}

// Function to get the track URI from the URL query parameter
function getTrackUri() {
    console.log("Running getTrackUri function...");
    const urlParams = new URLSearchParams(window.location.search);
    const trackUri = urlParams.get('track');
    console.log("Track URI from URL:", trackUri);
    return trackUri;
}

// Retrieve the track URI before redirecting for authorization
const trackUri = getTrackUri();

// If no access token, redirect to Spotify authorization with track parameter preserved
if (!accessToken) {
    console.log("No access token found, redirecting to Spotify authorization...");
    // Append the track parameter to the redirect URI without additional encoding
    const redirectUri = `https://virabbia.github.io/mystery-song-player/callback.html?track=${trackUri}`;
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=user-modify-playback-state%20user-read-playback-state`;
    window.location.href = authUrl;
} else {
    console.log("Access token found. Track URI:", trackUri);
    // Here you can proceed with the logic to play the song if trackUri is present
    if (trackUri) {
        console.log("Track URI retrieved successfully:", trackUri);
        // Your play logic here
    } else {
        console.error("Track URI not found in the URL after redirect.");
    }
}
