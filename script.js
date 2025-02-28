document.addEventListener("DOMContentLoaded", function () {
    console.log("Script cargado");

    // Obtener el track ID desde la URL del QR
    function getTrackFromURL() {
        const params = new URLSearchParams(window.location.search);
        let trackUri = params.get("track"); // Obtiene el track desde la URL

        if (trackUri && trackUri.includes("spotify:track:")) {
            return trackUri.split("spotify:track:")[1]; // Extrae solo el ID
        }
        return null;
    }

    // Detecta el track al cargar la página
    let trackId = getTrackFromURL();
    console.log("Track detectado desde URL:", trackId);

    // Elemento botón para iniciar la música
    const playButton = document.getElementById("play-button");

    // Si hay un track válido, actualiza el botón para iniciar la canción
    if (trackId) {
        playButton.addEventListener("click", function () {
            playSong(trackId);
        });

        // Mostrar mensaje para que el usuario haga clic
        playButton.innerText = "Haz clic para escuchar 🎵";
    } else {
        playButton.innerText = "No se encontró canción";
        playButton.disabled = true;
    }

    // Función para actualizar el reproductor sin abrir nueva pestaña
    function playSong(trackId) {
        console.log("Reproduciendo canción:", trackId);

        let existingIframe = document.getElementById("spotify-player");
        if (existingIframe) {
            existingIframe.src = `https://open.spotify.com/embed/track/${trackId}`;
        } else {
            let iframe = document.createElement("iframe");
            iframe.setAttribute("id", "spotify-player");
            iframe.setAttribute("src", `https://open.spotify.com/embed/track/${trackId}`);
            iframe.setAttribute("width", "100%");
            iframe.setAttribute("height", "80");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowtransparency", "true");
            iframe.setAttribute("allow", "encrypted-media");

            document.querySelector(".content-wrapper").appendChild(iframe);
        }
    }
});
