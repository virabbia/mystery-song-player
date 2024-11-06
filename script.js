document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    
    const trackUri = getTrackUri(); // Extract track URI from URL
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

function getTrackUri() {
    console.log("Running getTrackUri function...");

    const urlParams = new URLSearchParams(window.location.search);
    const trackUri = urlParams.get("track");

    console.log("Result of getTrackUri:", trackUri ? trackUri : "null");
    return trackUri;
}
