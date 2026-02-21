const { execFile } = require('child_process');
const path = require('path');
const { TEMP_DIR } = require('../utils/paths');

function getYtdlpCmd() {
  return 'yt-dlp';
}

function search(query, limit = 5) {
  return new Promise((resolve, reject) => {
    const args = [
      `ytsearch${limit}:${query}`,
      '--dump-json',
      '--no-download',
      '--flat-playlist'
    ];

    execFile(getYtdlpCmd(), args, { timeout: 30000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`yt-dlp search failed: ${err.message}`));

      const results = stdout.trim().split('\n').map(line => {
        try {
          const data = JSON.parse(line);
          return {
            id: data.id,
            title: data.title,
            channel: data.channel || data.uploader || '',
            duration: data.duration || 0,
            thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || ''
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      resolve(results);
    });
  });
}

function downloadTemp(videoId) {
  return new Promise((resolve, reject) => {
    const outTemplate = path.join(TEMP_DIR, `${videoId}.%(ext)s`);
    const args = [
      `https://www.youtube.com/watch?v=${videoId}`,
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--postprocessor-args', 'ffmpeg:-b:a 320k -ar 44100',
      '-o', outTemplate,
      '--no-playlist',
      '--extractor-args', 'youtube:player_client=android',
      '--quiet',
      '--no-warnings'
    ];

    execFile(getYtdlpCmd(), args, { timeout: 120000 }, (err) => {
      if (err) return reject(new Error(`Download failed: ${err.message}`));

      const mp3Path = path.join(TEMP_DIR, `${videoId}.mp3`);
      resolve(mp3Path);
    });
  });
}

module.exports = { search, downloadTemp };
