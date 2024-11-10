document.getElementById("play-button").addEventListener("click", () => {
    console.log("Starting main flow...");
    
    const accessToken = getTokenFromUrl(); // Extract access token from the URL hash
    const trackUri = getTrackUri(); // Extract track URI from the URL hash or query

    if (accessToken && trackUri) {
        console.log("Access token and track URI found. Proceeding to play track.");
        getActiveDevice(accessToken)
            .then(deviceId => {
                if (deviceId) {
                    playTrack(accessToken, trackUri, deviceId);
                } else {
                    console.log("No active device found. Please open Spotify on one of your devices.");
                }
            })
            .catch(error => console.error("Error while getting active device:", error));
    } else if (trackUri) {
        console.log("Track URI found:", trackUri);
        // Store the track URI in localStorage before redirecting for authentication
        localStorage.setItem("trackUri", trackUri);
        authenticate(); // Start the authentication flow
    } else {
        console.log("No track URI found. Cannot proceed without a track URI.");
    }
});

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

// Helper function to retrieve the access token from URL hash
function getTokenFromUrl() {
    console.log("Running getTokenFromUrl function...");
    
    const hash = window.location.hash.substring(1);
    console.log("Current hash:", hash);
    
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    
    console.log("Result of getTokenFromUrl:", accessToken ? accessToken : "null");
    return accessToken;
}

function authenticate() {
    const clientId = "0e507d976bac454da727e5da965c22fb"; // Replace with your Spotify client ID
    const redirectUri = "https://virabbia.github.io/mystery-song-player/callback.html"; // Registered in Spotify Developer Dashboard
    const scopes = "streaming user-read-playback-state user-modify-playback-state";

    // Spotify authentication URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    console.log("Authentication URL:", authUrl);

    window.location.href = authUrl; // Redirect to Spotify for user login
}

function getActiveDevice(accessToken) {
    console.log("Retrieving active device...");
    
    return fetch("https://api.spotify.com/v1/me/player/devices", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.devices && data.devices.length > 0) {
            const activeDevice = data.devices.find(device => device.is_active && device.is_restricted === false) || data.devices[0];
            if (activeDevice) {
                console.log("Active device found:", activeDevice.id);
                return activeDevice.id;
            } else {
                console.log("No active device found.");
                return null;
            }
        } else {
            console.log("No devices available.");
            return null;
        }
    })
    .catch(error => {
        console.error("Error occurred while getting active devices:", error);
        return null;
    });
}

function playTrack(accessToken, trackUri, deviceId) {
    console.log("Attempting to play track...");

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
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
        } else if (response.status === 404) {
            console.error("Failed to play track. No active Spotify session. Please make sure a Spotify device is available and playing.");
        } else {
            console.log("Failed to play track:", response.status);
        }
    })
    .catch(error => {
        console.log("Error occurred while trying to play track:", error);
    });
}
