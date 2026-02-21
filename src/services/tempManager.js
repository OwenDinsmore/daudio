const fs = require('fs');
const path = require('path');
const { TEMP_DIR } = require('../utils/paths');

const EXPIRY_MS = 10 * 60 * 1000;
const registry = new Map();

function register(videoId, filePath) {
  registry.set(videoId, { path: filePath, createdAt: Date.now() });
}

function getPath(videoId) {
  const entry = registry.get(videoId);
  if (!entry) return null;

  if (!fs.existsSync(entry.path)) {
    registry.delete(videoId);
    return null;
  }

  return entry.path;
}

function remove(videoId) {
  const entry = registry.get(videoId);
  if (entry && fs.existsSync(entry.path)) {
    fs.unlinkSync(entry.path);
  }
  registry.delete(videoId);
}

function cleanExpired() {
  const now = Date.now();

  for (const [videoId, entry] of registry) {
    if (now - entry.createdAt > EXPIRY_MS) {
      if (fs.existsSync(entry.path)) {
        fs.unlinkSync(entry.path);
      }
      registry.delete(videoId);
    }
  }
}

function startCleanupInterval() {
  setInterval(cleanExpired, 60 * 1000);
}

module.exports = { register, getPath, remove, cleanExpired, startCleanupInterval };
