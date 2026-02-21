const fs = require('fs');
const path = require('path');
const { SETS_DIR } = require('../utils/paths');

function safePath(base, ...segments) {
  const resolved = path.resolve(base, ...segments);
  if (!resolved.startsWith(path.resolve(base) + path.sep) && resolved !== path.resolve(base)) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

function listSets() {
  const entries = fs.readdirSync(SETS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .map(e => {
      const setPath = path.join(SETS_DIR, e.name);
      const stat = fs.statSync(setPath);
      return {
        name: e.name,
        mtime: stat.mtimeMs,
        folders: listFolders(setPath),
        tracks: listTracks(setPath)
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function listFolders(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory())
    .map(e => ({
      name: e.name,
      tracks: listTracks(path.join(dirPath, e.name))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function listTracks(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.mp3'))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b));
}

module.exports = { safePath, listSets, listFolders, listTracks };
