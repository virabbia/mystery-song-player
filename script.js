const VERSION = 'v2.7-playfix';
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';

const statusEl       = document.getElementById('status');
const startBtn       = document.getElementById('start-button');
const scannerDiv     = document.getElementById('scanner-container');
const playDiv        = document.getElementById('play-container');
const againDiv       = document.getElementById('again-container');
const playBtn        = document.getElementById('play-button');
const skipBtn        = document.getElementById('skip-button');
const openSpotifyBtn = document.getElementById('open-spotify-button');
const scanAgainBtn   = document.getElementById('scan-again');

let html5QrCode, lastTrackUri;

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
    localStorage.setItem('lastTrackUri', lastTrackUri);
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
    if (!devJson.devices?.length) {
      setStatus('❌ No hay dispositivos activos');
      openSpotifyBtn.style.display = 'inline-block';
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
    if (!playRes.ok) throw new Error(await playRes.text());
    setStatus('🎉 ¡Reproducción iniciada!');
    playDiv.style.display = 'block';
    againDiv.style.display = 'block';
    openSpotifyBtn.style.display = 'none';

    setTimeout(async () => {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      setStatus("⏱ Canción pausada tras 45s");
    }, 45000);
  } catch (e) {
    setStatus(`❌ Error al reproducir: ${e.message}`);
  }
}

function onScanSuccess(decoded) {
  setStatus(`✅ QR detectado: ${decoded}`);
  html5QrCode.stop()
    .then(() => html5QrCode.clear())
    .then(() => {
      const m = decoded.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]+)/);
      if (!m) {
        setStatus('❌ QR inválido para Spotify');
        return alert('QR inválido para Spotify');
      }
      lastTrackUri = `spotify:track:${m[1]}`;
      saveTrackId(lastTrackUri);
      scannerDiv.style.display = 'none';
      playTrack();
    });
}

function initScanner() {
  setStatus('📷 Solicitando acceso a cámara…');
  html5QrCode = new Html5Qrcode('qr-reader');
  Html5Qrcode.getCameras().then(cams => {
    const filtered = cams.filter(cam => !/0\.5|ultra|wide/i.test(cam.label));
    const camId = (filtered[0] || cams[0]).id;
    return html5QrCode.start({ deviceId: { exact: camId } }, { fps: 10 }, onScanSuccess);
  }).catch(err => {
    setStatus(`❌ Error cámara: ${err.message}`);
    alert(`No pude acceder a la cámara:\n${err.message}`);
  });
}

window.addEventListener('load', () => {
  const params = new URLSearchParams(location.search);
  const trackParam = params.get('track');
  const hashOk = location.hash.includes('#authenticated');
  if (trackParam && hashOk) {
    lastTrackUri = trackParam;
    saveTrackId(lastTrackUri);
    playTrack();
  } else {
    const storedUri = localStorage.getItem('lastTrackUri');
    if (storedUri) {
      lastTrackUri = storedUri;
      playDiv.style.display = 'block';
    }
  }
});

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  playDiv.style.display = 'none';
  againDiv.style.display = 'none';
  scannerDiv.style.display = 'block';
  initScanner();
});

playBtn.addEventListener('click', playTrack);

skipBtn.addEventListener('click', async () => {
  const token = localStorage.getItem("spotifyAccessToken");
  if (!token) return alert("No hay token");
  await fetch("https://api.spotify.com/v1/me/player/seek?position_ms=15000", {
    method: "PUT",
    headers: { Authorization: "Bearer " + token }
  });
  setStatus("⏩ Adelantado 15s");
});

openSpotifyBtn.addEventListener('click', () => {
  window.open("spotify://", "_blank");
});

scanAgainBtn.addEventListener('click', () => {
  againDiv.style.display = 'none';
  startBtn.style.display = 'block';
});
