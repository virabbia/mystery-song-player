// Replace with your actual Client ID and Redirect URI
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
const REDIRECT_URI = 'https://virabbia.github.io/mystery-song-player/callback.html';

// Function to get track URI from the URL
function getTrackUri() {
    console.log("Running getTrackUri function...");
    const urlParams = new URLSearchParams(window.location.search);
    const trackUri = urlParams.get('track');
    if (trackUri) {
        console.log("Track URI found:", trackUri);
    } else {
        console.log("No track URI found in the URL.");
    }
    return trackUri;
}

// Authentication function to get Spotify access token
function authenticate(trackUri) {
    console.log("Running authenticate function...");
    console.log("Track URI passed to authenticate:", trackUri);

    // Include track URI as a query parameter in the redirect URI
    const redirectUriWithTrack = `${REDIRECT_URI}?track=${encodeURIComponent(trackUri)}`;
    console.log("Redirect URI with track parameter:", redirectUriWithTrack);

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUriWithTrack)}&scope=streaming%20user-read-playback-state%20user-modify-playback-state`;
    console.log("Authentication URL:", authUrl);

    // Redirect to Spotify for authentication
    window.location.href = authUrl;
}

// Extract token from URL after authentication
function getTokenFromUrl() {
    console.log("Running getTokenFromUrl function...");
    const hash = window.location.hash;
    if (hash) {
        console.log("Hash found in URL:", hash);
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');
        if (token) {
            console.log("Access token extracted:", token);
        } else {
            console.log("No access token found in the hash.");
        }
        return token;
    } else {
        console.log("No hash found in the URL.");
    }
    return null;
}

// Main: Check if we have a token or need to authenticate
console.log("Starting main flow...");

// Retrieve the track URI from the URL
const trackUri = getTrackUri();
console.log("Result of getTrackUri:", trackUri);

// Retrieve the token from the URL fragment (hash)
const token = getTokenFromUrl();
console.log("Result of getTokenFromUrl:", token);

if (!token) {
    console.log("No token found.");
    if (trackUri) {
        console.log("Track URI is available, proceeding to authenticate...");
        authenticate(trackUri);
    } else {
        console.error("No track URI provided in the URL. Cannot authenticate.");
    }
} else {
    console.log("Token found:", token);
    console.log("Track URI retrieved:", trackUri);
    // This is where you would proceed with making API calls to Spotify to play the track
    console.log("Ready to make API calls with token and track URI.");
}
