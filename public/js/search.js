const Search = (() => {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const resultsSection = document.getElementById('search-results');
  const resultsList = document.getElementById('results-list');
  const welcome = document.getElementById('welcome');

  function init() {
    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    input.addEventListener('input', () => {
      if (!input.value.trim()) {
        showLibraryView();
      }
    });
  }

  function showLibraryView() {
    resultsSection.classList.add('hidden');
    welcome.classList.add('hidden');
    Browser.showLibrary();
  }

  async function doSearch() {
    const query = input.value.trim();
    if (!query) {
      showLibraryView();
      return;
    }

    welcome.classList.add('hidden');
    Browser.hideLibrary();
    resultsSection.classList.remove('hidden');
    resultsList.innerHTML = '<div class="spinner"></div>';

    try {
      const results = await API.searchYouTube(query);
      renderResults(results);
    } catch (err) {
      resultsList.innerHTML = '<p style="color:var(--danger)">Search failed. Is yt-dlp installed?</p>';
    }
  }

  function formatDuration(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function renderResults(results) {
    resultsList.innerHTML = '';

    if (!results.length) {
      resultsList.innerHTML = '<p style="color:var(--text-dim)">No results found.</p>';
      return;
    }

    results.forEach(r => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <img src="${r.thumbnail}" alt="" onerror="this.style.display='none'">
        <div class="result-info">
          <div class="result-title">${escapeHtml(r.title)}</div>
          <div class="result-channel">${escapeHtml(r.channel)}</div>
        </div>
        <span class="result-duration">${formatDuration(r.duration)}</span>
        <button class="play-btn" title="Play">\u25B6</button>
      `;

      const playBtn = card.querySelector('.play-btn');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playResult(r, card);
      });

      card.addEventListener('click', () => playResult(r, card));

      resultsList.appendChild(card);
    });
  }

  async function playResult(result, card) {
    if (card.classList.contains('loading')) return;
    card.classList.add('loading');
    card.querySelector('.play-btn').innerHTML = '<span class="spinner"></span>';

    try {
      const data = await API.downloadTemp(result.id, result.title);
      Player.play(data.playUrl, {
        title: result.title,
        videoId: result.id,
        channel: result.channel
      });
    } catch (err) {
      toast('Download failed', true);
    } finally {
      card.classList.remove('loading');
      card.querySelector('.play-btn').textContent = '\u25B6';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();
