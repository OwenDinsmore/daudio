const Browser = (() => {
  const tree = document.getElementById('sets-tree');
  const library = document.getElementById('library-list');
  const librarySection = document.getElementById('library');
  let setsData = [];

  async function load() {
    try {
      setsData = await API.getSets();
      render();
      renderLibrary();
    } catch (err) {
      console.error('Failed to load sets:', err);
    }
  }

  function getSetsData() {
    return setsData;
  }

  function showLibrary() {
    librarySection.classList.remove('hidden');
  }

  function hideLibrary() {
    librarySection.classList.add('hidden');
  }

  function render() {
    tree.innerHTML = '';

    setsData.forEach(set => {
      const setEl = document.createElement('div');
      setEl.className = 'set-item';

      const setName = document.createElement('div');
      setName.className = 'set-name';
      setName.innerHTML = `<span class="arrow">\u25B6</span> ${escapeHtml(set.name)}`;
      setName.dataset.set = set.name;
      setEl.appendChild(setName);

      const setChildren = document.createElement('div');
      setChildren.className = 'set-children hidden';

      set.tracks.forEach(track => {
        const trackEl = createTrackEl(track, set.name, null);
        trackEl.classList.add('root-track');
        setChildren.appendChild(trackEl);
      });

      set.folders.forEach(folder => {
        const folderEl = document.createElement('div');
        folderEl.className = 'folder-item';

        const folderName = document.createElement('div');
        folderName.className = 'folder-name';
        folderName.innerHTML = `<span class="arrow">\u25B6</span> ${escapeHtml(folder.name)}`;
        folderName.dataset.set = set.name;
        folderName.dataset.folder = folder.name;
        folderEl.appendChild(folderName);

        const folderChildren = document.createElement('div');
        folderChildren.className = 'folder-children hidden';

        folder.tracks.forEach(track => {
          folderChildren.appendChild(createTrackEl(track, set.name, folder.name));
        });

        folderEl.appendChild(folderChildren);
        setChildren.appendChild(folderEl);

        folderName.addEventListener('click', () => {
          folderChildren.classList.toggle('hidden');
          folderName.querySelector('.arrow').classList.toggle('open');
        });
      });

      setEl.appendChild(setChildren);
      tree.appendChild(setEl);

      setName.addEventListener('click', () => {
        setChildren.classList.toggle('hidden');
        setName.querySelector('.arrow').classList.toggle('open');
      });
    });

    Organizer.init();
  }

  function renderLibrary() {
    library.innerHTML = '';

    const allTracks = [];

    setsData.forEach(set => {
      set.tracks.forEach(filename => {
        allTracks.push({ filename, set: set.name, folder: '' });
      });
      set.folders.forEach(folder => {
        folder.tracks.forEach(filename => {
          allTracks.push({ filename, set: set.name, folder: folder.name });
        });
      });
    });

    if (!allTracks.length) {
      library.innerHTML = '<p class="library-empty">No tracks yet. Search and save some music.</p>';
      return;
    }

    allTracks.forEach(track => {
      const el = document.createElement('div');
      el.className = 'library-track track-item';
      el.dataset.set = track.set;
      el.dataset.folder = track.folder;
      el.dataset.filename = track.filename;
      el.draggable = true;

      const name = track.filename.replace(/\.mp3$/i, '');
      const location = track.folder ? `${track.set} / ${track.folder}` : track.set;

      el.innerHTML =
        '<div class="library-track-info">' +
          '<span class="library-track-name">' + escapeHtml(name) + '</span>' +
          '<span class="library-track-location">' + escapeHtml(location) + '</span>' +
        '</div>' +
        '<button class="library-play-btn" title="Play">\u25B6</button>';

      const playBtn = el.querySelector('.library-play-btn');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track, el);
      });

      el.addEventListener('click', () => playTrack(track, el));

      library.appendChild(el);
    });

    Organizer.init();
  }

  function playTrack(track, el) {
    const url = API.playUrl(track.set, track.folder, track.filename);
    Player.play(url, {
      title: track.filename.replace(/\.mp3$/i, ''),
      set: track.set,
      folder: track.folder,
      filename: track.filename
    });
    document.querySelectorAll('.track-item.playing').forEach(t => t.classList.remove('playing'));
    el.classList.add('playing');
  }

  function createTrackEl(filename, set, folder) {
    const el = document.createElement('div');
    el.className = 'track-item';
    el.textContent = filename.replace(/\.mp3$/i, '');
    el.title = filename;
    el.dataset.set = set;
    el.dataset.folder = folder || '';
    el.dataset.filename = filename;
    el.draggable = true;

    el.addEventListener('click', () => {
      const url = API.playUrl(set, folder, filename);
      Player.play(url, { title: filename.replace(/\.mp3$/i, ''), set, folder, filename });
      document.querySelectorAll('.track-item.playing').forEach(t => t.classList.remove('playing'));
      el.classList.add('playing');
    });

    return el;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { load, render, getSetsData, showLibrary, hideLibrary };
})();
