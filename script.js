document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    
    const trackUri = getTrackUri(); // Extract track URI from URL or hash
    if (trackUri) {
        console.log("Track URI found:", trackUri);
        // Store the track URI in localStorage before redirecting for authentication
        localStorage.setItem("trackUri", trackUri);
        authenticate(); // Start the authentication flow
    } else {
        console.log("No track URI found. Cannot proceed without a track URI.");
    }
});

function authenticate() {
    const clientId = "0e507d976bac454da727e5da965c22fb"; // Replace with your Spotify client ID
    const redirectUri = "https://virabbia.github.io/mystery-song-player/callback.html"; // Registered in Spotify Developer Dashboard
    const scopes = "streaming user-read-playback-state user-modify-playback-state";

    // Spotify authentication URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    console.log("Authentication URL:", authUrl);

    window.location.href = authUrl; // Redirect to Spotify for user login
}

// Helper function to retrieve track URI from the URL query or hash
function getTrackUri() {
    console.log("Running getTrackUri function...");

    // First try to get the track URI from the query parameter
    let trackUri = new URLSearchParams(window.location.search).get("track");

    if (trackUri) {
        console.log("Track URI found in query parameters:", trackUri);
        return trackUri;
    }

    // If not found in query, try to get it from the hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    trackUri = hashParams.get("track");

    console.log("Track URI found in hash:", trackUri ? trackUri : "null");
    return trackUri;
}

function getTokenFromUrl() {
    console.log("Running getTokenFromUrl function...");
    
    const hash = window.location.hash.substring(1);
    console.log("Current hash:", hash);
    
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    
    console.log("Result of getTokenFromUrl:", accessToken ? accessToken : "null");
    return accessToken;
}
