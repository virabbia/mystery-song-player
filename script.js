const VERSION = 'v3.6-timerfixs';
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
let isPlaying = false;
let timerTimeout = null;
let timerInterval = null;
let secondsLeft = 45;

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
    setStatus('📡 Buscando dispositivos…');
    const devRes = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const devJson = await devRes.json();
    if (!devJson.devices?.length) {
  setStatus('❗ Necesitamos que Spotify esté activo en este dispositivo');
  openSpotifyBtn.style.display = 'inline-block';
  document.getElementById('spotify-instructions').style.display = 'block';
  alert("Para escuchar la canción, toca el botón para activar Spotify en segundo plano. No verás el nombre de la canción.");
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

    isPlaying = true;
    playBtn.textContent = "⏸ Pausar";
    setStatus('🎉 ¡Reproducción iniciada!');
    playDiv.style.display = 'block';
    againDiv.style.display = 'block';
    openSpotifyBtn.style.display = 'none';

    // Iniciar temporizador si aún no está corriendo
    if (!timerInterval) {
      timerEl.style.display = 'block';
      timerEl.textContent = `⏱ ${secondsLeft}s`;

      timerInterval = setInterval(() => {
        secondsLeft--;
        timerEl.textContent = `⏱ ${secondsLeft}s`;
        if (secondsLeft <= 0) clearInterval(timerInterval);
      }, 1000);

      timerTimeout = setTimeout(async () => {
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
        });
        isPlaying = false;
        playBtn.textContent = "▶ Reproducir";
        timerEl.style.display = 'none';
        againDiv.style.display = 'block';
        setStatus("⏱ Canción pausada tras 45s");
      }, secondsLeft * 1000);
    }

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
  setStatus('📷 Buscando cámara trasera estándar...');
  html5QrCode = new Html5Qrcode('qr-reader');

  Html5Qrcode.getCameras().then(cams => {
    const cam1x = cams.find(cam =>
      /back|environment/i.test(cam.label) && /1x/i.test(cam.label)
    );
    const fallback = cams.find(cam => /back|environment/i.test(cam.label)) || cams[0];
    const selectedCam = cam1x || fallback;

    if (!selectedCam) {
      setStatus("❌ No se encontró cámara trasera válida");
      alert("No encontré cámara trasera");
      return;
    }

    html5QrCode.start(
      { deviceId: { exact: selectedCam.id } },
      { fps: 10 },
      onScanSuccess
    ).catch(err => {
      setStatus(`❌ Error al iniciar cámara: ${err.message}`);
      alert(`No pude acceder a la cámara:\n${err.message}`);
    });
  });
}

window.addEventListener('load', () => {
  const params = new URLSearchParams(location.search);
  const trackParam = params.get('track');
  const hashOk = location.hash.includes('#authenticated');

  if (trackParam) {
    lastTrackUri = trackParam;
    saveTrackId(lastTrackUri);
    if (hashOk) {
      playTrack();
    } else {
      setStatus("🎶 Canción escaneada, esperando autenticación");
      playDiv.style.display = 'block';
    }
  } else {
    const storedUri = localStorage.getItem('lastTrackUri');
    if (storedUri) {
      lastTrackUri = storedUri;
      setStatus("💾 Track guardado detectado");
      playDiv.style.display = 'block';
    } else {
      setStatus("💡 Listo para escanear");
    }
  }
});

playBtn.addEventListener('click', async () => {
  const token = localStorage.getItem("spotifyAccessToken");

  if (!token || !location.hash.includes('#authenticated')) {
    setStatus('🔑 Redirigiendo a Spotify para autenticación…');
    saveTrackId(lastTrackUri);
    return window.location.href =
      `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user-modify-playback-state%20user-read-playback-state` +
      `&response_type=token`;
  }

  if (!isPlaying && !timerTimeout) {
    await playTrack(); // primera vez
    return;
  }

  if (isPlaying) {
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });
    isPlaying = false;
    playBtn.textContent = "▶ Reproducir";
    setStatus("⏸ Canción pausada");

    clearInterval(timerInterval);
    clearTimeout(timerTimeout);
    timerInterval = null;
    timerTimeout = null;
  } else {
    await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });
    isPlaying = true;
    playBtn.textContent = "⏸ Pausar";
    setStatus("▶️ Reanudado");

    timerEl.style.display = 'block';
    timerEl.textContent = `⏱ ${secondsLeft}s`;

    timerInterval = setInterval(() => {
      secondsLeft--;
      timerEl.textContent = `⏱ ${secondsLeft}s`;
      if (secondsLeft <= 0) clearInterval(timerInterval);
    }, 1000);

    timerTimeout = setTimeout(async () => {
      await fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token }
      });
      isPlaying = false;
      playBtn.textContent = "▶ Reproducir";
      timerEl.style.display = 'none';
      againDiv.style.display = 'block';
      setStatus("⏱ Canción pausada tras 45s");
    }, secondsLeft * 1000);
  }
});

skipBtn.addEventListener('click', async () => {
  const token = localStorage.getItem("spotifyAccessToken");
  if (!token) return alert("No hay token");

  try {
    const res = await fetch("https://api.spotify.com/v1/me/player", {
      headers: { Authorization: "Bearer " + token }
    });
    const json = await res.json();
    const current = json.progress_ms || 0;
    const newPos = current + 15000;

    await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${newPos}`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    setStatus(`⏩ Adelantado a ${Math.floor(newPos / 1000)}s`);
  } catch (e) {
    console.error(e);
    setStatus("❌ Error al adelantar");
  }
});

openSpotifyBtn.addEventListener('click', () => {
  window.open("spotify://", "_blank");
});

scanAgainBtn.addEventListener('click', () => {
  againDiv.style.display = 'none';
  playDiv.style.display = 'none';
  timerEl.style.display = 'none';
  secondsLeft = 45;
  clearTimeout(timerTimeout);
  clearInterval(timerInterval);
  timerTimeout = null;
  timerInterval = null;
  html5QrCode?.clear();
  scannerDiv.style.display = 'block';
  setStatus('🔁 Listo para escanear otra canción');
  initScanner();
});
