// script.js
(() => {
  const VERSION   = 'v2.3-debug';
  const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
  console.log(`[${VERSION}] Arrancando script…`);

  // Referencias a elementos del DOM
  const startBtn     = document.getElementById('start-button');
  const scannerDiv   = document.getElementById('scanner-container');
  const playDiv      = document.getElementById('play-container');
  const againDiv     = document.getElementById('again-container');
  const playBtn      = document.getElementById('play-button');
  const scanAgainBtn = document.getElementById('scan-again');

  // Creamos un <div> para mostrar estado en pantalla
  const statusEl = document.createElement('div');
  statusEl.id = 'status';
  statusEl.style.cssText = 'margin-top:10px; font-size:.9rem; color:#333;';
  document.querySelector('.content-wrapper').appendChild(statusEl);

  let html5QrCode, lastTrackUri;

  // Helper para log + estado
  function updateStatus(msg) {
    console.log(`[${VERSION}] ${msg}`);
    statusEl.innerText = msg;
  }

  // URI exacta de tu callback.html
  const redirectUri = `${location.origin}${location.pathname}callback.html`;

  // --- 0) Auto–modo post–authentificación
  window.addEventListener('load', () => {
    updateStatus('Página cargada');
    const params     = new URLSearchParams(location.search);
    const trackParam = params.get('track');
    if (trackParam && location.hash.includes('authenticated')) {
      lastTrackUri = trackParam;
      updateStatus(`Auto–detect track → ${lastTrackUri}`);
      startBtn.style.display   = 'none';
      scannerDiv.style.display = 'none';
      playDiv.style.display    = 'block';
    }
  });

  // --- 1) Iniciar escaneo
  startBtn.addEventListener('click', () => {
    updateStatus('Iniciando escaneo…');
    startBtn.style.display   = 'none';
    playDiv.style.display    = 'none';
    againDiv.style.display   = 'none';
    scannerDiv.style.display = 'block';
    initScanner();
  });

  // --- 2) Configurar lector
  function initScanner() {
    updateStatus('Configurando lector QR…');
    html5QrCode = new Html5Qrcode('qr-reader');
    Html5Qrcode.getCameras()
      .then(cams => {
        updateStatus(`Cámaras encontradas: ${cams.length}`);
        return html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, useBarCodeDetectorIfSupported: true },
          onScanSuccess
        );
      })
      .then(() => updateStatus('Escáner activo'))
      .catch(err => {
        updateStatus(`Error al arrancar QR: ${err.message}`);
        console.error(err);
        alert(`No pude acceder a la cámara:\n${err.message}`);
      });
  }

  // --- 3) Al detectar QR
  function onScanSuccess(decoded) {
    updateStatus(`QR detectado: ${decoded}`);
    html5QrCode.stop()
      .then(() => html5QrCode.clear())
      .then(() => {
        scannerDiv.style.display = 'none';
        const m = decoded.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]+)/);
        if (!m) {
          updateStatus('QR inválido');
          alert('QR inválido para Spotify');
          return;
        }
        lastTrackUri = `spotify:track:${m[1]}`;
        updateStatus(`Track URI → ${lastTrackUri}`);
        playDiv.style.display = 'block';
      })
      .catch(err => {
        updateStatus(`Error deteniendo escáner: ${err.message}`);
        console.error(err);
      });
  }

  // --- 4) Reproducir canción
  playBtn.addEventListener('click', async () => {
    updateStatus(`Intentando reproducir ${lastTrackUri}`);
    const token = localStorage.getItem('spotifyAccessToken');
    updateStatus(`Token ${token ? 'encontrado' : 'no encontrado'}`);
    if (!token || !location.hash.includes('authenticated')) {
      updateStatus('Redirigiendo a Spotify para autenticar…');
      localStorage.setItem('trackId', lastTrackUri.split(':').pop());
      return window.location.href =
        `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=user-modify-playback-state&response_type=token`;
    }
    try {
      updateStatus('Obteniendo dispositivos activos…');
      const devRes = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: 'Bearer ' + token }
      });
      updateStatus(`Devices FETCH status: ${devRes.status}`);
      const devJson = await devRes.json();
      console.log('Devices JSON:', devJson);
      updateStatus(`Dispositivos activos: ${devJson.devices.length}`);
      if (!devJson.devices.length) {
        updateStatus('No hay dispositivos activos');
        alert('Activa playback en Spotify Web o App antes de reproducir.');
        return;
      }
      const deviceId = devJson.devices[0].id;
      updateStatus(`Usando device_id: ${deviceId}`);
      updateStatus('Enviando comando play…');
      const playRes = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: 'PUT',
          headers: { Authorization: 'Bearer ' + token },
          body: JSON.stringify({ uris: [ lastTrackUri ] })
        }
      );
      updateStatus(`PLAY FETCH status: ${playRes.status}`);
      if (!playRes.ok) {
        const txt = await playRes.text();
        throw new Error(`HTTP ${playRes.status}: ${txt}`);
      }
      updateStatus('Reproducción iniciada ✔');
      playDiv.style.display  = 'none';
      againDiv.style.display = 'block';
    } catch (e) {
      updateStatus(`ERROR en playTrack: ${e.message}`);
      console.error(e);
      alert(`Error al reproducir:\n${e.message}`);
    }
  });

  // --- 5) Escanear otra canción
  scanAgainBtn.addEventListener('click', () => {
    updateStatus('Listo para nuevo escaneo');
    againDiv.style.display = 'none';
    startBtn.style.display = 'block';
  });

})();
