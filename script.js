document.addEventListener("DOMContentLoaded", function () {
    console.log("Script cargado");

    // Función para obtener el track ID desde la URL
    function getTrackFromURL() {
        const params = new URLSearchParams(window.location.search);
        let trackUri = params.get("track"); // Obtiene el URI del QR

        if (trackUri && trackUri.includes("spotify:track:")) {
            return trackUri.replace("spotify:track:", ""); // Extrae solo el ID
        }
        return null;
    }

    // Detecta el track al cargar la página
    let trackId = getTrackFromURL();
    console.log("Track detectado desde URL:", trackId);

    if (trackId) {
        playSong(trackId);
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
