document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    const trackUri = getTrackUri();
    const accessToken = getTokenFromUrl();
    
    if (accessToken && trackUri) {
        console.log("Access token and Track URI found. Proceeding to play track.");
        console.log("Track URI found:", trackUri);
        playTrack(accessToken, trackUri);
    } else {
        console.log("No token or track URI found. Redirecting to Spotify authentication...");
        authenticate();
    }
});

// Helper function to retrieve track URI from the URL fragment
function getTrackUri() {
    console.log("Running getTrackUri function...");
    
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.substring(1));
    const trackUri = hashParams.get("track");
    
    console.log("Result of getTrackUri:", trackUri ? trackUri : "null");
    return trackUri;
}

// Helper function to retrieve the access token from URL fragment
function getTokenFromUrl() {
    console.log("Running getTokenFromUrl function...");
    const hash = window.location.hash;
    console.log("Current hash:", hash);
    
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    console.log("Result of getTokenFromUrl:", accessToken ? accessToken : "null");
    return accessToken;
}

function authenticate() {
    const clientId = "0e507d976bac454da727e5da965c22fb"; // Replace with your Spotify client ID
    const redirectUri = "https://virabbia.github.io/mystery-song-player/callback.html"; // Registered in Spotify Developer Dashboard
    const scopes = "streaming user-read-playback-state user-modify-playback-state";
    
    // Spotify authentication URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;
    console.log("Authentication URL:", authUrl);
    
    window.location.href = authUrl;
}

function playTrack(accessToken, trackUri) {
    console.log("Attempting to play track...");
    
    fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: [trackUri] })
    })
    .then(response => {
        if (response.status === 204) {
            console.log("Track is playing successfully.");
        } else {
            console.log("Failed to play track:", response.status);
        }
    })
    .catch(error => {
        console.log("Error occurred while trying to play track:", error);
    });
}
