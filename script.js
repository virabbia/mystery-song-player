document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    
    const trackUri = getTrackUri(); // Extract track URI from URL hash
    const accessToken = getTokenFromUrl(); // Extract access token from URL hash
    
    if (accessToken) {
        console.log("Access token found:", accessToken);
        if (trackUri) {
            console.log("Track URI found:", trackUri);
            playTrack(accessToken, trackUri);
        } else {
            console.log("No track URI found.");
        }
    } else {
        console.log("No access token found. Please authenticate.");
    }
});

// Helper function to retrieve track URI from the URL hash
function getTrackUri() {
    console.log("Running getTrackUri function...");

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const trackUri = params.get("track");

    console.log("Result of getTrackUri:", trackUri ? trackUri : "null");
    return trackUri;
}

// Helper function to retrieve the access token from the URL hash
function getTokenFromUrl() {
    console.log("Running getTokenFromUrl function...");
    
    const hash = window.location.hash.substring(1);
    console.log("Current hash:", hash);
    
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    
    console.log("Result of getTokenFromUrl:", accessToken ? accessToken : "null");
    return accessToken;
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
