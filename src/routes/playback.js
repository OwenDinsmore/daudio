const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { safePath } = require('../services/fileManager');
const tempManager = require('../services/tempManager');
const { SETS_DIR } = require('../utils/paths');

function streamMp3(filePath, req, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg'
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes'
    });

    fs.createReadStream(filePath).pipe(res);
  }
}

router.get('/tmp/:videoId', (req, res) => {
  const filePath = tempManager.getPath(req.params.videoId);
  if (!filePath) {
    return res.status(404).json({ error: 'Temp file not found or expired' });
  }
  streamMp3(filePath, req, res);
});

router.get('/:set/*', (req, res) => {
  try {
    const set = req.params.set;
    const rest = req.params[0];
    const filePath = safePath(SETS_DIR, set, rest);

    streamMp3(filePath, req, res);
  } catch (err) {
    console.error('Playback error:', err.message);
    res.status(403).json({ error: 'Invalid path' });
  }
});

module.exports = router;
