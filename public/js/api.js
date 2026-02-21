const API = {
  async searchYouTube(query) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async downloadTemp(videoId, title) {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, title })
    });
    if (!res.ok) throw new Error('Download failed');
    return res.json();
  },

  async deleteTempDownload(videoId) {
    const res = await fetch(`/api/download/${videoId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  },

  async saveToSet(videoId, set, folder, filename) {
    const res = await fetch('/api/download/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, set, folder, filename })
    });
    if (!res.ok) throw new Error('Save failed');
    return res.json();
  },

  async createSet(name) {
    const res = await fetch('/api/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create set');
    }
    return res.json();
  },

  async getSets() {
    const res = await fetch('/api/sets');
    if (!res.ok) throw new Error('Failed to load sets');
    return res.json();
  },

  async createFolder(set, name) {
    const res = await fetch(`/api/sets/${encodeURIComponent(set)}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create folder');
    return res.json();
  },

  async moveFile(set, filename, from, to) {
    const res = await fetch(`/api/sets/${encodeURIComponent(set)}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, from, to })
    });
    if (!res.ok) throw new Error('Move failed');
    return res.json();
  },

  async moveFileCross(filename, fromSet, fromFolder, toSet, toFolder) {
    const res = await fetch('/api/sets/move', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, fromSet, fromFolder, toSet, toFolder })
    });
    if (!res.ok) throw new Error('Move failed');
    return res.json();
  },

  playUrl(set, folder, filename) {
    const parts = [set, folder, filename].filter(Boolean).map(encodeURIComponent);
    return `/api/play/${parts.join('/')}`;
  },

  tempPlayUrl(videoId) {
    return `/api/play/tmp/${videoId}`;
  },

  async getImportCsvs() {
    const res = await fetch('/api/import/csvs');
    if (!res.ok) throw new Error('Failed to list CSVs');
    return res.json();
  },

  async startSync() {
    const res = await fetch('/api/import/sync', { method: 'POST' });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  },

  async getSyncStatus() {
    const res = await fetch('/api/import/status');
    if (!res.ok) throw new Error('Failed to get status');
    return res.json();
  }
};
