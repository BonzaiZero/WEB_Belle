const loadingSeenKey = "romantic-site-loading-seen";
const savedThemeKey = "romantic-site-theme";
const loadingScreen = document.querySelector("#loadingScreen");

try {
  const savedTheme = localStorage.getItem(savedThemeKey);
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch {}

window.addEventListener("load", () => {
  let hasSeenLoading = false;

  try {
    hasSeenLoading = sessionStorage.getItem(loadingSeenKey) === "true";
  } catch {
    hasSeenLoading = document.documentElement.classList.contains("skip-loading");
  }

  if (!loadingScreen) return;

  if (hasSeenLoading) {
    loadingScreen.classList.add("done");
    return;
  }

  try {
    sessionStorage.setItem(loadingSeenKey, "true");
  } catch {}

  loadingScreen.classList.add("done");
});

const playlist = [
  {
    title: "Olivia - the cure",
    src: "assets/musik/the cure - Olivia Rodrigo  Lirik Terjemahan Indonesia.mp3",
    description: "Lagu lokal — klik untuk memutar",
  },
  {
    title: "Nadin - Di Akhir Perang",
    src: "assets/musik/Nadin Amizah - Di Akhir Perang (Official Lyric Video).mp3",
    description: "Lagu lokal — klik untuk memutar",
  },
  {
    title: "Nadin - Sorai",
    src: "assets/musik/Nadin Amizah - Sorai (Official Music Video).mp3",
    description: "Lagu lokal — klik untuk memutar",
  },
  {
    title: "Nadin - Rayuan Perempuan Gila",
    src: "assets/musik/Nadin Amizah - Rayuan Perempuan Gila (Official Lyric Video).mp3",
    description: "Lagu lokal — klik untuk memutar",
  },
  {
    title: "Nadin - Kekal",
    src: "assets/musik/Nadin Amizah - Kekal (Official Lyric Video).mp3",
    description: "Lagu lokal — klik untuk memutar",
  },
  
];
// ensure playlist UI exists on every page by injecting if missing
function injectPlaylistUI() {
  if (!document.getElementById('playlistToggle')) {
    const btn = document.createElement('button');
    btn.className = 'playlist-toggle';
    btn.id = 'playlistToggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open playlist');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" fill="currentColor"/></svg></span>';
    document.body.appendChild(btn);
  }

  if (!document.querySelector('.playlist-panel')) {
    const panelHtml = `
      <div class="playlist-panel" aria-label="Playlist musik latar">
        <div class="playlist-meta">
          <strong id="playlistTrackTitle">Melodi Senja</strong>
          <small id="playlistTrackIndex">1 / ${playlist.length}</small>
        </div>
        <div class="playlist-controls">
          <button class="playlist-control prev-button" type="button" aria-label="Lagu sebelumnya">Prev</button>
          <button class="playlist-control play-button" type="button" aria-label="Putar atau jeda">Play</button>
          <button class="playlist-control next-button" type="button" aria-label="Lagu berikutnya">Next</button>
        </div>
        <div class="playlist-list" id="playlistList" aria-label="Daftar lagu"></div>
        <div class="playlist-player" hidden>
          <iframe id="spotifyPlayerFrame" src="" allow="autoplay; clipboard-write; encrypted-media" allowfullscreen></iframe>
        </div>
        <audio id="backgroundAudio" preload="metadata"></audio>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = panelHtml;
    document.body.appendChild(wrapper.firstElementChild);
  }
}

injectPlaylistUI();

const injectedPlaylistPanel = document.querySelector('.playlist-panel');
const injectedPlaylistToggle = document.getElementById('playlistToggle');
if (injectedPlaylistPanel && !injectedPlaylistPanel.classList.contains('hidden')) {
  injectedPlaylistPanel.classList.add('hidden');
}
if (injectedPlaylistToggle) {
  injectedPlaylistToggle.setAttribute('aria-expanded', 'false');
}

let currentTrackIndex = 0;
let spotifyMode = false;
const audio = document.getElementById("backgroundAudio");
const spotifyPlayer = document.getElementById("spotifyPlayerFrame");
const playlistPlayer = document.querySelector(".playlist-player");
const trackTitle = document.getElementById("playlistTrackTitle");
const trackIndex = document.getElementById("playlistTrackIndex");
const playButton = document.querySelector(".play-button");
const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");
const playlistList = document.getElementById("playlistList");
const pageSize = 5;
let pageIndex = 0;

function normalizeSpotifyEmbedUrl(url) {
  try {
    // support common spotify URL forms and spotify:uri form
    // examples:
    // https://open.spotify.com/track/{id}
    // https://open.spotify.com/intl-id/track/{id}?si=...
    // spotify:track:{id}
    const str = String(url);
    // try spotify:uri
    let m = str.match(/^spotify:(track|album|playlist):([A-Za-z0-9]+)/i);
    if (m) return `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}`;

    // try HTTP(S) form
    m = str.match(/open\.spotify\.com\/(?:intl-[^\/]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)/i);
    if (m) return `https://open.spotify.com/embed/${m[1].toLowerCase()}/${m[2]}`;

    // fallback: attempt to parse as URL and extract pathname segments
    const parsed = new URL(str);
    if (!parsed.hostname.includes('spotify.com')) return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    // parts like ['track', '{id}'] or ['intl-id','track','{id}']
    const idx = parts.findIndex(p => /^(track|album|playlist)$/.test(p));
    if (idx >= 0 && parts[idx + 1]) {
      return `https://open.spotify.com/embed/${parts[idx]}/${parts[idx + 1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

function updatePlaylistDisplay() {
  const track = playlist[currentTrackIndex];
  trackTitle.textContent = track.title;
  trackIndex.textContent = `${currentTrackIndex + 1} / ${playlist.length}`;
  if (spotifyMode) {
    playButton.textContent = "Embedded Spotify";
    playButton.disabled = true;
  } else {
    playButton.textContent = audio.paused ? "Play" : "Pause";
    playButton.disabled = false;
  }
  renderPlaylistList();
}

function renderPlaylistList() {
  if (!playlistList) return;
  const totalPages = Math.max(1, Math.ceil(playlist.length / pageSize));
  // clamp pageIndex
  if (pageIndex < 0) pageIndex = 0;
  if (pageIndex > totalPages - 1) pageIndex = totalPages - 1;
  const start = pageIndex * pageSize;
  const pageItems = playlist.slice(start, start + pageSize);

  const itemsHtml = pageItems
    .map((track, i) => {
      const index = start + i;
      const activeClass = index === currentTrackIndex ? " active" : "";
      const label = track.type === "spotify" ? "Putar di player" : track.description || "Klik untuk memutar";
      return `
      <button class="playlist-item${activeClass}" type="button" data-index="${index}">
        <strong>${track.title}</strong>
        <small>${label}</small>
      </button>
    `;
    })
    .join("");

  let pager = "";
  if (totalPages > 1) {
    pager = `<div class="playlist-pager">
      ${pageIndex > 0 ? '<button class="pager-button" type="button" data-action="page-prev" aria-label="Previous list">‹</button>' : ''}
      ${pageIndex < totalPages - 1 ? '<button class="pager-button" type="button" data-action="page-next" aria-label="Next list">›</button>' : ''}
    </div>`;
  }

  playlistList.innerHTML = itemsHtml + pager;
}

function setTrack(index) {
  currentTrackIndex = (index + playlist.length) % playlist.length;
  const track = playlist[currentTrackIndex];
  spotifyMode = track.type === "spotify";

  if (spotifyMode) {
    const embedUrl = normalizeSpotifyEmbedUrl(track.src);
    if (spotifyPlayer) spotifyPlayer.src = embedUrl || "";
    if (playlistPlayer) playlistPlayer.hidden = !embedUrl;
    audio.src = "";
    audio.pause();
  } else {
    if (spotifyPlayer) spotifyPlayer.src = "";
    if (playlistPlayer) playlistPlayer.hidden = true;
    audio.src = track.src;
  }

  updatePlaylistDisplay();
  savePlaybackState();
}

function togglePlay() {
  if (spotifyMode) return;
  if (!audio.src) setTrack(currentTrackIndex);
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
  savePlaybackState();
}

function playNext() {
  setTrack(currentTrackIndex + 1);
  audio.play().catch(() => {});
  savePlaybackState();
}

function playPrev() {
  setTrack(currentTrackIndex - 1);
  audio.play().catch(() => {});
  savePlaybackState();
}

if (audio && playButton && prevButton && nextButton && playlistList) {
  const savedState = restorePlaybackState();
  if (savedState && Number.isInteger(savedState.index) && savedState.index >= 0 && savedState.index < playlist.length) {
    pageIndex = Math.floor(savedState.index / pageSize);
    setTrack(savedState.index);
    if (!spotifyMode && typeof savedState.time === 'number' && !Number.isNaN(savedState.time)) {
      audio.addEventListener(
        'loadedmetadata',
        () => {
          audio.currentTime = Math.min(savedState.time, audio.duration || savedState.time);
        },
        { once: true }
      );
    }
    if (savedState.playing) {
      audio.autoplay = true;
      audio.play().catch(() => {});
    }
  } else {
    setTrack(0);
  }
  renderPlaylistList();
  audio.addEventListener('timeupdate', savePlaybackState);
  audio.addEventListener('pause', savePlaybackState);
  playButton.addEventListener("click", togglePlay);
  prevButton.addEventListener("click", playPrev);
  nextButton.addEventListener("click", playNext);
  playlistList.addEventListener("click", (event) => {
    const pagerBtn = event.target.closest('.pager-button');
    if (pagerBtn) {
      const action = pagerBtn.dataset.action;
      if (action === 'page-next') pageIndex++;
      if (action === 'page-prev') pageIndex--;
      renderPlaylistList();
      return;
    }

    const item = event.target.closest(".playlist-item");
    if (!item) return;
    const index = Number(item.dataset.index);
    setTrack(index);
    // if the selected track is outside current page, navigate there
    const newPage = Math.floor(index / pageSize);
    if (newPage !== pageIndex) {
      pageIndex = newPage;
      renderPlaylistList();
    }
    if (!spotifyMode) {
      audio.play().catch(() => {});
    }
  });
  audio.addEventListener("play", updatePlaylistDisplay);
  audio.addEventListener("pause", updatePlaylistDisplay);
  audio.addEventListener("ended", playNext);
}

// playback state persistence across pages
function savePlaybackState() {
  try {
    sessionStorage.setItem(
      'romantic-music-state',
      JSON.stringify({
        index: currentTrackIndex,
        time: audio.currentTime,
        playing: !audio.paused,
      })
    );
  } catch {}
}

function restorePlaybackState() {
  try {
    const raw = sessionStorage.getItem('romantic-music-state');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const playlistToggleBtn = document.getElementById('playlistToggle');
if (playlistToggleBtn && playlistToggleBtn.dataset.playlistToggleBound !== 'true') {
  playlistToggleBtn.addEventListener('click', () => {
    const panel = document.querySelector('.playlist-panel');
    if (!panel) return;
    const isHidden = panel.classList.toggle('hidden');
    playlistToggleBtn.setAttribute('aria-expanded', String(!isHidden));
  });
}

window.addEventListener('beforeunload', savePlaybackState);
window.addEventListener('pagehide', savePlaybackState);

