document.addEventListener("DOMContentLoaded", async function () {
    console.log("Script cargado");

    // Tu Client ID de Spotify Developer
    const CLIENT_ID = "0e507d976bac454da727e5da965c22fb";
    const REDIRECT_URI = "https://virabbia.github.io/mystery-song-player/callback.html"; // Página de autenticación
    const SCOPES = "streaming user-read-playback-state user-modify-playback-state";

    let trackId = getTrackFromURL();
    
    if (trackId) {
        document.getElementById("play-button").addEventListener("click", function () {
            requestSpotifyAuthorization();
        });
    }

    // Obtener el track ID desde la URL del QR
    function getTrackFromURL() {
        const params = new URLSearchParams(window.location.search);
        let trackUri = params.get("track");

        if (trackUri && trackUri.includes("spotify:track:")) {
            return trackUri.split("spotify:track:")[1];
        }
        return null;
    }

    // Solicitar autorización a Spotify
    function requestSpotifyAuthorization() {
        const authURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
        window.location.href = authURL;
    }

    // Función para reproducir la canción en Spotify
    async function playTrack(trackId, accessToken) {
        const response = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`]
            })
        });

        if (response.ok) {
            console.log("Reproducción iniciada");
            setTimeout(() => skipForward(accessToken), 20000); // Detener después de 20s
        } else {
            console.error("Error al reproducir:", await response.json());
        }
    }

    // Saltar 10 segundos
    async function skipForward(accessToken) {
        await fetch("https://api.spotify.com/v1/me/player/seek?position_ms=10000", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        console.log("Se adelantaron 10s");
    }

    // Obtener el token desde la URL después de autenticarse
    function getAccessToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get("access_token");
    }

    // Si el usuario vuelve desde Spotify, obtener el token y reproducir la canción
    let accessToken = getAccessToken();
    if (accessToken && trackId) {
        playTrack(trackId, accessToken);
    }
});
