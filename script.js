console.log("Starting track URI retrieval test...");

function getTrackUri() {
    console.log("Running getTrackUri function...");
    const urlParams = new URLSearchParams(window.location.search);
    const trackUri = urlParams.get('track');
    console.log("Track URI from URL:", trackUri); // Should show track URI or null
    return trackUri;
}

// Run the function to test track URI retrieval
const trackUri = getTrackUri();
if (trackUri) {
    console.log("Track URI successfully retrieved:", trackUri);
} else {
    console.error("No track URI provided in the URL or unable to retrieve it.");
}
