

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hitster Versión Viki v2.2</title>

  <!-- html5-qrcode -->
  <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/html5-qrcode/minified/html5-qrcode.min.js"></script>

  <!-- Estilos -->
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { background: linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%); font-family:'Open Sans',sans-serif;
           margin:0; padding:0; display:flex; flex-direction:column;
           align-items:center; justify-content:center; height:100vh; overflow:hidden; }
    header { font-family:'Fredoka One',cursive; font-size:3rem; color:#fff;
             text-shadow:2px 2px #ff6363; margin-bottom:10px; text-align:center; }
    header small { font-size:1rem; opacity:.8; }
    .content-wrapper { background:#fff; border-radius:20px; padding:30px;
                       box-shadow:0 10px 20px rgba(0,0,0,0.2);
                       text-align:center; width:80%; max-width:600px; }
    .play-button { background:#ff6363; color:#fff; border:none; padding:10px 20px;
                   border-radius:30px; font-weight:600; cursor:pointer;
                   box-shadow:0 4px 10px rgba(255,99,99,0.4);
                   transition:transform .2s,box-shadow .2s;font-size:.9rem; }
    .play-button:hover { transform:scale(1.1); box-shadow:0 6px 15px rgba(255,99,99,0.6); }
    #qr-reader { width:300px; margin:20px auto; }
    #log {
      position: fixed;
      bottom: 0; left: 0;
      width: 100%; max-height: 150px;
      background: rgba(0,0,0,0.85);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 9999;
      padding: 5px;
      box-sizing: border-box;
    }
    .dancing-viki { position:absolute; bottom:10px; right:10px;
                    width:120px; animation:flip-dance 1.5s infinite; }
    @keyframes flip-dance { 0%,100%{transform:scaleX(1);}50%{transform:scaleX(-1);} }
  </style>
</head>
<body>
  <header>Hitster Versión Viki <small>v2.2</small></header>
  <div class="content-wrapper">
    <button id="start-button" class="play-button">Iniciar escaneo</button>

    <div id="scanner-container" style="display:none; margin-top:20px;">
      <div id="qr-reader"></div>
      <p style="font-size:.8rem;color:#666;">Apunta al QR</p>
    </div>

    <div id="play-container" style="display:none; margin-top:15px;">
      <button id="play-button" class="play-button">Reproducir canción</button>
    </div>

    <div id="again-container" style="display:none; margin-top:15px;">
      <button id="scan-again" class="play-button">Escanear otra canción</button>
    </div>
  </div>

  <img src="https://github.com/virabbia/mystery-song-player/raw/main/vikibailarina.png"
       alt="Dancing Viki" class="dancing-viki">

  <!-- Panel de logs -->
  <div id="log"></div>

  <script>
    // ── Override de console para mostrar en panel ─────────────────────────────────
    (function(){
      const levels = ['log','info','warn','error'];
      levels.forEach(level => {
        const old = console[level];
        console[level] = function(...args) {
          old.apply(console,args);
          const logDiv = document.getElementById('log');
          if (!logDiv) return;
          const msg = args.map(a =>
            typeof a==='object' ? JSON.stringify(a) : a
          ).join(' ');
          const line = document.createElement('div');
          line.textContent = `[${level.toUpperCase()}] ${msg}`;
          line.style.whiteSpace = 'pre-wrap';
          logDiv.appendChild(line);
          logDiv.scrollTop = logDiv.scrollHeight;
        };
      });
    })();

    // ── Lógica principal ─────────────────────────────────────────────────────────
    const VERSION   = 'v2.2';
    const CLIENT_ID = '0e507d976bac454da727e5da965c22fb';
    console.log(`[${VERSION}] Página cargada: ${location.href}`);

    const startBtn     = document.getElementById('start-button');
    const scannerDiv   = document.getElementById('scanner-container');
    const playDiv      = document.getElementById('play-container');
    const againDiv     = document.getElementById('again-container');
    const playBtn      = document.getElementById('play-button');
    const scanAgainBtn = document.getElementById('scan-again');
    let html5QrCode, lastTrackUri;

    // Construimos dinámica la URI de callback
    const redirectUri = `${location.origin}${location.pathname}callback.html`;

    startBtn.addEventListener('click', () => {
      console.log('Inicia escaneo');
      startBtn.style.display   = 'none';
      playDiv.style.display    = 'none';
      againDiv.style.display   = 'none';
      scannerDiv.style.display = 'block';
      initScanner();
    });

    function initScanner() {
      html5QrCode = new Html5Qrcode('qr-reader');
      Html5Qrcode.getCameras()
        .then(cameras => {
          console.log('Cámaras detectadas:', cameras);
          return html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, useBarCodeDetectorIfSupported: true },
            onScanSuccess,
            err => console.warn('Escaneo fallo:', err)
          );
        })
        .catch(err => {
          console.error('ERROR escáner:', err);
          alert(`No pude acceder a la cámara:\n${err.message}`);
        });
    }

    function onScanSuccess(decoded) {
      console.log('QR detectado:', decoded);
      html5QrCode.stop()
        .then(() => html5QrCode.clear())
        .then(() => {
          scannerDiv.style.display = 'none';
          const m = decoded.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([A-Za-z0-9]+)/);
          if (!m) {
            alert('QR inválido para Spotify');
            return console.warn('Formato inválido:', decoded);
          }
          lastTrackUri = `spotify:track:${m[1]}`;
          playDiv.style.display = 'block';
        })
        .catch(err => console.error('fallo stop/clear:', err));
    }

    playBtn.addEventListener('click', async () => {
      console.log('playTrack →', lastTrackUri);
      let token = localStorage.getItem('spotifyAccessToken');
      if (!token || !location.hash.includes('#authenticated')) {
        console.log('redirectUri →', redirectUri);
        console.log('Autenticando...');
        localStorage.setItem('trackId', lastTrackUri.split(':').pop());
        window.location.href =
          `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&scope=user-modify-playback-state&response_type=token`;
        return;
      }
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: { Authorization: 'Bearer ' + token },
          body: JSON.stringify({ uris: [ lastTrackUri ] })
        });
        console.log('Respuesta Spotify:', res.status, res.statusText);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        playDiv.style.display  = 'none';
        againDiv.style.display = 'block';
      } catch (e) {
        console.error('ERROR playTrack:', e);
        alert(`Error al reproducir:\n${e.message}`);
      }
    });

    scanAgainBtn.addEventListener('click', () => {
      console.log('Escanear otra canción');
      againDiv.style.display = 'none';
      startBtn.style.display = 'block';
    });
  </script>
</body>
</html>
