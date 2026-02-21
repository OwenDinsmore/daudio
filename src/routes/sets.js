const express = require('express');
const fs = require('fs');
const router = express.Router();
const { listSets, safePath } = require('../services/fileManager');
const { SETS_DIR } = require('../utils/paths');

router.get('/', (req, res) => {
  try {
    const sets = listSets();
    res.json(sets);
  } catch (err) {
    console.error('List sets error:', err.message);
    res.status(500).json({ error: 'Failed to list sets' });
  }
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Missing set name' });
  }

  try {
    const setPath = safePath(SETS_DIR, name.trim());
    if (fs.existsSync(setPath)) {
      return res.status(409).json({ error: 'Set already exists' });
    }
    fs.mkdirSync(setPath, { recursive: true });
    res.json({ ok: true, name: name.trim() });
  } catch (err) {
    console.error('Create set error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/:set/folders', (req, res) => {
  const { set } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Missing folder name' });
  }

  try {
    const folderPath = safePath(SETS_DIR, set, name.trim());
    fs.mkdirSync(folderPath, { recursive: true });
    res.json({ ok: true, path: `${set}/${name.trim()}` });
  } catch (err) {
    console.error('Create folder error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/move', (req, res) => {
  const { filename, fromSet, fromFolder, toSet, toFolder } = req.body;
  if (!filename || !fromSet || !toSet) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const srcPath = fromFolder
      ? safePath(SETS_DIR, fromSet, fromFolder, filename)
      : safePath(SETS_DIR, fromSet, filename);

    const destDir = toFolder
      ? safePath(SETS_DIR, toSet, toFolder)
      : safePath(SETS_DIR, toSet);

    if (!fs.existsSync(srcPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.mkdirSync(destDir, { recursive: true });
    const destPath = safePath(destDir, filename);
    fs.renameSync(srcPath, destPath);

    res.json({ ok: true });
  } catch (err) {
    console.error('Cross-set move error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:set/move', (req, res) => {
  const { set } = req.params;
  const { filename, from, to } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Missing filename' });
  }

  try {
    const srcPath = from
      ? safePath(SETS_DIR, set, from, filename)
      : safePath(SETS_DIR, set, filename);

    const destDir = to
      ? safePath(SETS_DIR, set, to)
      : safePath(SETS_DIR, set);

    if (!fs.existsSync(srcPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.mkdirSync(destDir, { recursive: true });
    const destPath = safePath(destDir, filename);
    fs.renameSync(srcPath, destPath);

    res.json({ ok: true });
  } catch (err) {
    console.error('Move error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
