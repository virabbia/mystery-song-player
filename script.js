document.addEventListener("DOMContentLoaded", function () {
    const playButton = document.getElementById("play-button");

    playButton.addEventListener("click", function () {
        // Retrieve the latest track URI from localStorage (or from the QR code)
        const trackUri = localStorage.getItem("trackUri");

        if (trackUri) {
            console.log("Playing song: ", trackUri);

            // Create an embedded Spotify player without opening a new tab
            const existingIframe = document.getElementById("spotify-player");
            
            if (existingIframe) {
                existingIframe.src = `https://open.spotify.com/embed/track/${trackUri}`;
            } else {
                const iframe = document.createElement("iframe");
                iframe.setAttribute("id", "spotify-player");
                iframe.setAttribute("src", `https://open.spotify.com/embed/track/${trackUri}`);
                iframe.setAttribute("width", "100%");
                iframe.setAttribute("height", "80");
                iframe.setAttribute("frameborder", "0");
                iframe.setAttribute("allowtransparency", "true");
                iframe.setAttribute("allow", "encrypted-media");

                document.querySelector(".content-wrapper").appendChild(iframe);
            }
        } else {
            alert("No song found. Scan a QR code first.");
        }
    });
});
