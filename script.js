document.getElementById("play-button").addEventListener("click", () => {
    // Step 1: Check if we already have an access token in the URL
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");
    
    if (!accessToken) {
        console.log("No access token found. Redirecting to Spotify login...");
        redirectToSpotifyAuth();
    } else {
        console.log("Access token found. Proceeding to play track.");
        const trackUri = new URLSearchParams(window.location.search).get("track");
        
        if (trackUri) {
            console.log("Track URI found:", trackUri);
            playTrack(accessToken, trackUri);
        } else {
            console.log("No track URI found in the URL.");
        }
    }
});

function redirectToSpotifyAuth() {
    const clientId = "YOUR_CLIENT_ID";  // Replace with your Spotify client ID
    const redirectUri = "https://virabbia.github.io/mystery-song-player/callback.html";  // Set correctly in Spotify Developer
    const scopes = "user-modify-playback-state"; // Required scope to control playback

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=token`;
    window.location.href = authUrl;
}

function playTrack(accessToken, trackUri) {
    // Step 2: Make a request to the Spotify API to play the track
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
            if (response.status === 401) {
                console.log("Access token may have expired. Redirecting to Spotify login...");
                redirectToSpotifyAuth();
            }
        }
    })
    .catch(error => {
        console.log("Error occurred while trying to play track:", error);
    });
}
