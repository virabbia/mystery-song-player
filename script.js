const VERSION = 'v2.9-final';
const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';

const statusEl       = document.getElementById('status');
const scannerDiv     = document.getElementById('scanner-container');
const playDiv        = document.getElementById('play-container');
const againDiv       = document.getElementById('again-container');
const playBtn        = document.getElementById('play-button');
const skipBtn        = document.getElementById('skip-button');
const openSpotifyBtn = document.getElementById('open-spotify-button');
const scanAgainBtn   = document.getElementById('scan-again');
const timerEl        = document.getElementById('timer');

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
}

async function playTrack() {
  setStatus(`🟨 Intentando reproducir: ${lastTrackUri}`);
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token || !location.hash.includes('#authenticated')) {
    setStatus('🔑 Token ausente o no autenticado, redirigiendo…');
    saveTrackId(lastTrackUri);
    return window.location.href =
      `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user-modify-playback-state%20user-read-playback-state` +
      `&response_type=token`;
  }

  try {
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

    // Mostrar y actualizar contador
    timerEl.style.display = 'block';
    let secondsLeft = 45;
    timerEl.textContent = `⏱ ${secondsLeft}s`;
    const interval = setInterval(() => {
      secondsLeft--;
      timerEl.textContent = `⏱ ${secondsLeft}s`;
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);

    // Detener canción después de 45 segundos
    setTimeout(async () => {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      timerEl.style.display = 'none';
      setStatus("⏱ Canción pausada tras 45s");
    }, 45000);
  } catch (e) {
    setStatus(`❌ Error al reproducir: ${e.message}`);
  }
}

function onScanSuccess(decoded) {
  setStatus(`✅ QR detectado: ${decoded}`);
  html5QrCode.stop().then(() => html5QrCode.clear()).then(() => {
    const m = decoded.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]+)/);
    if (!m) return alert('QR inválido para Spotify');
    lastTrackUri = `spotify:track:${m[1]}`;
    saveTrackId(lastTrackUri);
    scannerDiv.style.display = 'none';
    playTrack();
  });
}

function initScanner() {
  setStatus('📷 Iniciando cámara...');
  html5QrCode = new Html5Qrcode('qr-reader');

  Html5Qrcode.getCameras().then(cams => {
    const backCams = cams.filter(cam =>
      /back|rear|environment|1x/i.test(cam.label) && !/0\.5|ultra/i.test(cam.label)
    );
    const selectedCam = backCams[0] || cams[0];
    return html5QrCode.start(
      { deviceId: { exact: selectedCam.id } },
      { fps: 10 },
      onScanSuccess
    );
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
    playTrack(); // ✅ reproducción automática al cargar con ?track=
  } else {
    const storedUri = localStorage.getItem('lastTrackUri');
    if (storedUri) {
      lastTrackUri = storedUri;
      playDiv.style.display = 'block';
      setStatus("💾 Track guardado detectado");
    } else {
      setStatus("💡 Listo para escanear");
    }
  }
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
  playDiv.style.display = 'none';
  timerEl.style.display = 'none';
  scannerDiv.style.display = 'block';
  setStatus('🔁 Listo para escanear otra canción');
  initScanner(); // ✅ se abre solo cuando lo pide el usuario
});
