// script.js actualizado
const VERSION = 'v2.7';
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
let html5QrCode, lastTrackUri;

const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start-button');
const scannerDiv = document.getElementById('scanner-container');
const playDiv = document.getElementById('play-container');
const againDiv = document.getElementById('again-container');
const playBtn = document.getElementById('play-button');
const scanAgainBtn = document.getElementById('scan-again');

const skipBtn = document.createElement('button');
skipBtn.id = 'skip-button';
skipBtn.innerText = '⏩ Adelantar 15s';
skipBtn.style.display = 'none';
document.body.appendChild(skipBtn);

const openSpotifyBtn = document.createElement('button');
openSpotifyBtn.id = 'open-spotify';
openSpotifyBtn.innerText = '📱 Abrir app de Spotify';
openSpotifyBtn.style.display = 'none';
document.body.appendChild(openSpotifyBtn);

const redirectUri = `${location.origin}${location.pathname}callback.html`;

function setStatus(msg) {
  console.log(`[${VERSION}] ${msg}`);
  statusEl.textContent = msg;
}

function saveTrackId(uri) {
  const id = uri.split(':').pop();
  localStorage.setItem('lastTrackUri', uri);
  localStorage.setItem('trackId', id);
  console.log(`[${VERSION}] 💾 Track guardado: ${uri}`);
}

async function playTrack() {
  setStatus(`🟨 Intentando reproducir: ${lastTrackUri}`);
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token || !location.hash.includes('#authenticated')) {
    setStatus('🔑 Token ausente o no autenticado, redirigiendo…');
    localStorage.setItem('trackId', lastTrackUri.split(':').pop());
    return window.location.href =
      `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user-modify-playback-state%20user-read-playback-state` +
      `&response_type=token`;
  }

  try {
    setStatus('📡 Solicitando dispositivos Spotify...');
    const devRes = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const devJson = await devRes.json();
    if (!devJson.devices || !devJson.devices.length) {
      setStatus('❌ No hay dispositivos activos');
      openSpotifyBtn.style.display = 'block';
      return;
    }

    const deviceId = devJson.devices[0].id;
    setStatus(`▶ Reproduciendo en device_id: ${deviceId}`);
    const playRes = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ uris: [lastTrackUri] })
      }
    );

    if (!playRes.ok) throw new Error(`HTTP ${playRes.status}`);

    setStatus('🎉 ¡Reproducción iniciada!');
    playDiv.style.display = 'none';
    againDiv.style.display = 'block';
    skipBtn.style.display = 'inline-block';

    setTimeout(async () => {
      try {
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
        });
        setStatus("⏱ Canción pausada tras 45s");
      } catch (err) {
        console.error("Error al pausar:", err);
      }
    }, 45000);

  } catch (e) {
    console.error(`[${VERSION}] 🟥 ERROR playTrack:`, e);
    setStatus(`❌ Error: ${e.message}`);
  }
}

skipBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("spotifyAccessToken");
  if (!token) return alert("No hay token de Spotify");

  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/seek?position_ms=15000", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) throw new Error(await res.text());
    setStatus("⏩ Adelantado 15 segundos");
  } catch (err) {
    console.error("Error al adelantar:", err);
    setStatus("❌ Error al adelantar");
  }
});

openSpotifyBtn.addEventListener("click", () => {
  window.open("spotify:", "_blank");
});

startBtn.addEventListener("click", () => {
  setStatus('📸 Iniciando escaneo de QR…');
  startBtn.style.display = 'none';
  playDiv.style.display = 'none';
  againDiv.style.display = 'none';
  scannerDiv.style.display = 'block';
  initScanner();
});

scanAgainBtn.addEventListener("click", () => {
  setStatus("🔁 Listo para escanear otra canción");
  againDiv.style.display = "none";
  playDiv.style.display = "block";
  skipBtn.style.display = 'none';
  openSpotifyBtn.style.display = 'none';
});

playBtn.addEventListener("click", () => {
  playTrack();
});

function initScanner() {
  setStatus('📷 Solicitando acceso a cámara…');
  html5QrCode = new Html5Qrcode('qr-reader');
  Html5Qrcode.getCameras().then(cams => {
    const chosenCam = cams.find(cam => !cam.label.toLowerCase().includes('ultra')) || cams[0];
    html5QrCode.start(
      chosenCam.id,
      { fps: 10, useBarCodeDetectorIfSupported: true },
      onScanSuccess
    );
  }).catch(err => {
    console.error(`[${VERSION}] 🟥 ERROR escáner:`, err);
    setStatus(`❌ Error cámara: ${err.message}`);
  });
}

function onScanSuccess(decoded) {
  setStatus(`✅ QR detectado: ${decoded}`);
  html5QrCode.stop().then(() => html5QrCode.clear()).then(() => {
    const m = decoded.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]+)/);
    if (!m) {
      setStatus('❌ QR inválido para Spotify');
      return alert('QR inválido');
    }
    lastTrackUri = `spotify:track:${m[1]}`;
    saveTrackId(lastTrackUri);
    scannerDiv.style.display = 'none';
    playTrack();
  }).catch(err => {
    console.error(`[${VERSION}] 🟥 ERROR al detener escáner:`, err);
    setStatus(`❌ Error al detener escáner`);
  });
}

window.addEventListener('load', () => {
  setStatus('🔎 Verificando si hay track...');
  const params = new URLSearchParams(location.search);
  const trackParam = params.get('track');
  const hashOk = location.hash.includes('#authenticated');

  if (trackParam && hashOk) {
    lastTrackUri = trackParam;
    saveTrackId(lastTrackUri);
    setStatus(`✔ Track detectado desde URL`);
    startBtn.style.display = 'none';
    scannerDiv.style.display = 'none';
    playDiv.style.display = 'none';
    playTrack();
  } else {
    const storedUri = localStorage.getItem('lastTrackUri');
    if (storedUri) {
      lastTrackUri = storedUri;
      setStatus(`💾 Track guardado detectado: ${lastTrackUri}`);
      playDiv.style.display = 'block';
    } else {
      setStatus('💡 Listo para iniciar escaneo');
    }
  }
});
