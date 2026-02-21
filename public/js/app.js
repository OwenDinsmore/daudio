function toast(message, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.className = isError ? 'error' : '';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

(() => {
  const modal = document.getElementById('save-modal');
  const saveBtn = document.getElementById('save-btn');
  const confirmBtn = document.getElementById('save-confirm-btn');
  const cancelBtn = document.getElementById('save-cancel-btn');
  const filenameInput = document.getElementById('save-filename');
  const setSelect = document.getElementById('save-set');
  const folderSelect = document.getElementById('save-folder');

  saveBtn.addEventListener('click', () => {
    const meta = Player.getMeta();
    if (!meta || !meta.videoId) return;

    filenameInput.value = meta.title || '';
    populateSetSelect(setSelect);
    updateFolderSelect(setSelect, folderSelect);
    modal.classList.remove('hidden');
  });

  setSelect.addEventListener('change', () => {
    updateFolderSelect(setSelect, folderSelect);
  });

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  confirmBtn.addEventListener('click', async () => {
    const meta = Player.getMeta();
    if (!meta || !meta.videoId) return;

    const filename = filenameInput.value.trim();
    const set = setSelect.value;
    const folder = folderSelect.value;

    if (!filename || !set) {
      toast('Please fill in all fields', true);
      return;
    }

    try {
      await API.saveToSet(meta.videoId, set, folder, filename);
      modal.classList.add('hidden');
      toast(`Saved to ${set}/${folder || '(root)'}`);
      document.getElementById('save-btn').classList.add('hidden');
      Browser.load();
    } catch (err) {
      toast('Save failed', true);
    }
  });
})();

(() => {
  const modal = document.getElementById('folder-modal');
  const newBtn = document.getElementById('new-folder-btn');
  const confirmBtn = document.getElementById('folder-confirm-btn');
  const cancelBtn = document.getElementById('folder-cancel-btn');
  const setSelect = document.getElementById('folder-set');
  const nameInput = document.getElementById('folder-name');

  newBtn.addEventListener('click', () => {
    populateSetSelect(setSelect);
    nameInput.value = '';
    modal.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  confirmBtn.addEventListener('click', async () => {
    const set = setSelect.value;
    const name = nameInput.value.trim();
    if (!set || !name) {
      toast('Please fill in all fields', true);
      return;
    }

    try {
      await API.createFolder(set, name);
      modal.classList.add('hidden');
      toast(`Created ${set}/${name}`);
      Browser.load();
    } catch (err) {
      toast('Failed to create folder', true);
    }
  });
})();

(() => {
  const modal = document.getElementById('set-modal');
  const newBtn = document.getElementById('new-set-btn');
  const confirmBtn = document.getElementById('set-confirm-btn');
  const cancelBtn = document.getElementById('set-cancel-btn');
  const nameInput = document.getElementById('set-name');

  newBtn.addEventListener('click', () => {
    nameInput.value = '';
    modal.classList.remove('hidden');
    nameInput.focus();
  });

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmBtn.click();
  });

  confirmBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) {
      toast('Please enter a set name', true);
      return;
    }

    try {
      await API.createSet(name);
      modal.classList.add('hidden');
      toast(`Created set "${name}"`);
      Browser.load();
    } catch (err) {
      toast(err.message || 'Failed to create set', true);
    }
  });
})();

(() => {
  const syncBtn = document.getElementById('sync-btn');
  const syncBar = document.getElementById('sync-bar');
  const syncText = document.getElementById('sync-text');
  const syncFill = document.getElementById('sync-progress-fill');
  const syncCount = document.getElementById('sync-count');
  let pollTimer = null;

  syncBtn.addEventListener('click', async () => {
    syncBtn.classList.add('syncing');
    syncBtn.textContent = 'Syncing...';

    try {
      const result = await API.startSync();
      if (result.error) {
        toast(result.error, true);
        resetSyncBtn();
        return;
      }
      if (result.newTracks === 0) {
        toast('Everything up to date');
        resetSyncBtn();
        Browser.load();
        return;
      }
      toast(`Syncing ${result.newTracks} new track${result.newTracks === 1 ? '' : 's'}...`);
      syncBar.classList.remove('hidden');
      startPolling();
    } catch (err) {
      toast('Sync failed', true);
      resetSyncBtn();
    }
  });

  function startPolling() {
    pollTimer = setInterval(async () => {
      try {
        const status = await API.getSyncStatus();
        const pct = status.total ? Math.round((status.current / status.total) * 100) : 0;
        syncFill.style.width = pct + '%';
        syncText.textContent = status.csv
          ? `Syncing ${status.csv}...`
          : 'Syncing...';
        syncCount.textContent = `${status.current} / ${status.total} (${status.downloaded} OK, ${status.failed} failed)`;

        if (!status.active) {
          clearInterval(pollTimer);
          pollTimer = null;
          toast(`Sync done: ${status.downloaded} downloaded, ${status.failed} failed`);
          setTimeout(() => {
            syncBar.classList.add('hidden');
            syncFill.style.width = '0%';
          }, 2000);
          resetSyncBtn();
          Browser.load();
        }
      } catch {}
    }, 2000);
  }

  function resetSyncBtn() {
    syncBtn.classList.remove('syncing');
    syncBtn.textContent = 'Sync';
  }

  (async () => {
    try {
      const status = await API.getSyncStatus();
      if (status.active) {
        syncBtn.classList.add('syncing');
        syncBtn.textContent = 'Syncing...';
        syncBar.classList.remove('hidden');
        startPolling();
      }
    } catch {}
  })();
})();

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.code === 'Space') {
    e.preventDefault();
    document.getElementById('play-pause-btn').click();
  }
});

function populateSetSelect(selectEl) {
  const sets = Browser.getSetsData();
  selectEl.innerHTML = sets.map(s =>
    `<option value="${s.name}">${s.name}</option>`
  ).join('');
}

function updateFolderSelect(setSelect, folderSelect) {
  const sets = Browser.getSetsData();
  const set = sets.find(s => s.name === setSelect.value);
  folderSelect.innerHTML = '<option value="">(root)</option>';
  if (set) {
    set.folders.forEach(f => {
      folderSelect.innerHTML += `<option value="${f.name}">${f.name}</option>`;
    });
  }
}

Browser.load();
Search.init();
