document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    const trackUri = getTrackUri();
    const accessToken = getTokenFromUrl();

    if (accessToken) {
        console.log("Access token found. Proceeding to play track.");
        if (trackUri) {
            console.log("Track URI found:", trackUri);
            playTrack(accessToken, trackUri);
        } else {
            console.log("No track URI found. Attempting to retrieve from local storage...");
            const savedTrackUri = localStorage.getItem("trackUri");
            if (savedTrackUri) {
                console.log("Track URI retrieved from local storage:", savedTrackUri);
                playTrack(accessToken, savedTrackUri);
            } else {
                console.log("No track URI available.");
            }
        }
    } else {
        console.log("No token found. Redirecting to Spotify authentication...");
        if (trackUri) {
            console.log("Saving track URI to local storage before authentication...");
            localStorage.setItem("trackUri", trackUri);
        }
        authenticate();
    }
});

function authenticate() {
    const clientId = "0e507d976bac454da727e5da965c22fb"; // Replace with your Spotify client ID
    const redirectUri = "https://virabbia.github.io/mystery-song-player/callback.html"; // Registered in Spotify Developer Dashboard
    const scopes = "streaming user-read-playback-state user-modify-playback-state";

    // Spotify authentication URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    console.log("Authentication URL:", authUrl);

    window.location.href = authUrl; // Redirect to Spotify authentication
}

function getTrackUri() {
    console.log("Running getTrackUri function...");

    const urlParams = new URLSearchParams(window.location.search);
    const trackUri = urlParams.get("track");

    console.log("Result of getTrackUri:", trackUri ? trackUri : "null");
    return trackUri;
}
