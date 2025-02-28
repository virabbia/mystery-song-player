document.addEventListener("DOMContentLoaded", async function () {
    console.log("Script cargado");

    const CLIENT_ID = "TU_CLIENT_ID";
    const REDIRECT_URI = "https://virabbia.github.io/mystery-song-player/callback.html";
    const SCOPES = "streaming user-read-playback-state user-modify-playback-state";

    let trackId = getTrackFromURL();

    if (trackId) {
        // Store track in localStorage so it's not lost after authentication
        localStorage.setItem("trackId", trackId);

        document.getElementById("play-button").addEventListener("click", function () {
            requestSpotifyAuthorization();
        });

        document.getElementById("play-button").innerText = "Haz clic para escuchar 🎵";
    } else {
        // Retrieve track from localStorage after authentication
        trackId = localStorage.getItem("trackId");
        console.log("Recuperando Track ID desde localStorage:", trackId);
    }

    let accessToken = getAccessToken();
    if (accessToken && trackId) {
        playTrack(trackId, accessToken);
    }

    function getTrackFromURL() {
        const params = new URLSearchParams(window.location.search);
        let trackUri = params.get("track");

        if (trackUri && trackUri.includes("spotify:track:")) {
            return trackUri.split("spotify:track:")[1];
        }
        return null;
    }

    function requestSpotifyAuthorization() {
        const authURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
        window.location.href = authURL;
    }

    async function playTrack(trackId, accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
        });

        if (response.ok) {
            console.log("Reproducción iniciada");
            setTimeout(() => pausePlayback(accessToken), 20000); // Stop after 20s
        } else {
            console.error("Error al reproducir:", await response.json());
        }
    }

    async function pausePlayback(accessToken) {
        await fetch("https://api.spotify.com/v1/me/player/pause", {
            method: "PUT",
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        console.log("Reproducción detenida después de 20s");
    }

    function getAccessToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get("access_token");
    }
});
