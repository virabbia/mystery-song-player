document.addEventListener("DOMContentLoaded", async function () {
    console.log("🎵 Script cargado");

    const CLIENT_ID = "TU_CLIENT_ID";  // Replace with your Spotify Client ID
    const REDIRECT_URI = "https://virabbia.github.io/mystery-song-player/callback.html";
    const SCOPES = "streaming user-read-playback-state user-modify-playback-state";

    let trackId = getTrackFromURL();

    if (trackId) {
        localStorage.setItem("trackId", trackId);
        document.getElementById("play-button").addEventListener("click", function () {
            requestSpotifyAuthorization();
        });

        document.getElementById("play-button").innerText = "Haz clic para escuchar 🎵";
    } else {
        trackId = localStorage.getItem("trackId");
        console.log("📀 Recuperando Track ID desde localStorage:", trackId);
    }

    let accessToken = getAccessToken();
    if (accessToken && trackId) {
        console.log("🎶 Token y Track ID disponibles, intentando reproducir...");
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
        console.log(`🎧 Intentando reproducir: ${trackId}`);

        // Ensure there's an active device
        let deviceId = await getActiveDevice(accessToken);
        if (!deviceId) {
            console.error("🚨 No active Spotify device found. Open Spotify and play a song.");
            alert("Por favor, abre Spotify en tu teléfono o PC y empieza a reproducir una canción manualmente.");
            return;
        }

        // Play the song
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
        });

        const data = await response.json().catch(() => {});
        if (response.ok) {
            console.log("✅ Reproducción iniciada con éxito.");
            setTimeout(() => pausePlayback(accessToken), 20000); // Stop after 20s
        } else {
            console.error("❌ Error al reproducir:", data);
            alert("Error al reproducir la canción. Revisa la consola (F12) para más detalles.");
        }
    }

    async function pausePlayback(accessToken) {
        await fetch("https://api.spotify.com/v1/me/player/pause", {
            method: "PUT",
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        console.log("⏸️ Reproducción detenida después de 20s");
    }

    async function getActiveDevice(accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });

        const data = await response.json();
        if (data.devices.length > 0) {
            console.log("🎵 Dispositivo activo:", data.devices[0].id);
            return data.devices[0].id;
        } else {
            return null;
        }
    }

    function getAccessToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get("access_token");
    }
});
