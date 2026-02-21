const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { downloadTemp } = require('../services/ytdlp');
const tempManager = require('../services/tempManager');
const { safePath } = require('../services/fileManager');
const { SETS_DIR } = require('../utils/paths');
const { sanitizeFilename } = require('../utils/sanitize');

router.post('/', async (req, res) => {
  const { videoId, title } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }

  const existing = tempManager.getPath(videoId);
  if (existing) {
    return res.json({ videoId, playUrl: `/api/play/tmp/${videoId}` });
  }

  try {
    const filePath = await downloadTemp(videoId);
    tempManager.register(videoId, filePath);
    res.json({ videoId, playUrl: `/api/play/tmp/${videoId}` });
  } catch (err) {
    console.error('Download error:', err.message);
    res.status(500).json({ error: 'Download failed' });
  }
});

router.delete('/:videoId', (req, res) => {
  const { videoId } = req.params;
  tempManager.remove(videoId);
  res.json({ ok: true });
});

router.post('/save', (req, res) => {
  const { videoId, set, folder, filename } = req.body;
  if (!videoId || !set || !filename) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const srcPath = tempManager.getPath(videoId);
  if (!srcPath) {
    return res.status(404).json({ error: 'Temp file not found' });
  }

  try {
    const safeName = sanitizeFilename(filename);
    const name = safeName.endsWith('.mp3') ? safeName : safeName + '.mp3';

    let destDir;
    if (folder) {
      destDir = safePath(SETS_DIR, set, folder);
    } else {
      destDir = safePath(SETS_DIR, set);
    }

    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, name);

    fs.renameSync(srcPath, destPath);
    tempManager.remove(videoId);

    res.json({ ok: true, path: `${set}/${folder ? folder + '/' : ''}${name}` });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
