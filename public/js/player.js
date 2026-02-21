const Player = (() => {
  const audio = new Audio();
  let currentMeta = null;

  const bar = document.getElementById('player-bar');
  const titleEl = document.getElementById('player-title');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const timeEl = document.getElementById('player-time');
  const seekBar = document.getElementById('seek-bar');
  const volumeBar = document.getElementById('volume-bar');
  const saveBtn = document.getElementById('save-btn');

  audio.volume = 0.8;

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      seekBar.value = (audio.currentTime / audio.duration) * 100;
      timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
  });

  audio.addEventListener('ended', () => {
    playPauseBtn.textContent = '\u25B6';
  });

  playPauseBtn.addEventListener('click', () => {
    if (!audio.src) return;
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = '\u23F8';
    } else {
      audio.pause();
      playPauseBtn.textContent = '\u25B6';
    }
  });

  seekBar.addEventListener('input', () => {
    if (audio.duration) {
      audio.currentTime = (seekBar.value / 100) * audio.duration;
    }
  });

  volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value / 100;
  });

  function play(url, meta) {
    currentMeta = meta;
    audio.src = url;
    audio.play();
    bar.classList.remove('hidden');
    playPauseBtn.textContent = '\u23F8';
    titleEl.textContent = meta.title || 'Unknown';

    if (meta.videoId) {
      saveBtn.classList.remove('hidden');
    } else {
      saveBtn.classList.add('hidden');
    }

    document.querySelectorAll('.track-item.playing').forEach(el => el.classList.remove('playing'));
  }

  function getMeta() {
    return currentMeta;
  }

  return { play, getMeta, audio };
})();
