const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { DATA_DIR, SETS_DIR } = require('../utils/paths');
const { sanitizeFilename } = require('../utils/sanitize');

let syncState = {
  active: false,
  csv: '',
  current: 0,
  total: 0,
  downloaded: 0,
  skipped: 0,
  failed: 0,
  log: []
};

function getStatus() {
  return { ...syncState };
}

function listCsvs() {
  if (!fs.existsSync(DATA_DIR)) return [];

  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.csv'))
    .map(f => {
      const tracks = parseCsv(path.join(DATA_DIR, f));
      const setName = f.replace(/\.csv$/i, '');
      const setDir = path.join(SETS_DIR, setName);

      let downloaded = 0;
      if (fs.existsSync(setDir)) {
        downloaded = countMp3s(setDir);
      }

      return { name: setName, file: f, trackCount: tracks.length, downloaded };
    });
}

function countMp3s(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.mp3')) count++;
    if (e.isDirectory()) count += countMp3s(path.join(dir, e.name));
  }

  return count;
}

function parseCsv(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const clean = content.replace(/^\uFEFF/, '');
  const lines = clean.split('\n');
  if (lines.length < 2) return [];

  const header = parseRow(lines[0]);
  const trackIdx = header.indexOf('Track Name');
  const artistIdx = header.indexOf('Artist Name(s)');
  if (trackIdx === -1 || artistIdx === -1) return [];

  const tracks = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseRow(lines[i]);
    const track = (cols[trackIdx] || '').trim();
    const artist = (cols[artistIdx] || '').trim();

    if (track && artist) {
      const firstArtist = artist.split(';')[0].trim();
      tracks.push({ track, artist: firstArtist, allArtists: artist });
    }
  }

  return tracks;
}

function parseRow(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  cols.push(current.replace(/\r$/, ''));
  return cols;
}

function expectedFilename(artist, track) {
  return sanitizeFilename(`${artist} - ${track}`) + '.mp3';
}

function fileExistsInDir(dir, filename) {
  if (!fs.existsSync(dir)) return false;
  if (fs.existsSync(path.join(dir, filename))) return true;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (fs.existsSync(path.join(dir, e.name, filename))) return true;
    }
  }

  return false;
}

function downloadTrack(query, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      `ytsearch1:${query}`,
      '-x', '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--postprocessor-args', 'ffmpeg:-b:a 320k -ar 44100',
      '-o', outPath,
      '--no-playlist',
      '--extractor-args', 'youtube:player_client=android',
      '--quiet', '--no-warnings'
    ];

    execFile('yt-dlp', args, { timeout: 120000 }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function syncAll() {
  if (syncState.active) return { error: 'Sync already in progress' };

  const csvs = listCsvs();
  if (!csvs.length) return { error: 'No CSVs found in data/' };

  const jobs = [];

  for (const csv of csvs) {
    const csvPath = path.join(DATA_DIR, csv.file);
    const tracks = parseCsv(csvPath);
    const setDir = path.join(SETS_DIR, csv.name);
    fs.mkdirSync(setDir, { recursive: true });

    for (const t of tracks) {
      const fname = expectedFilename(t.artist, t.track);
      if (!fileExistsInDir(setDir, fname)) {
        jobs.push({ csv: csv.name, track: t.track, artist: t.artist, fname, setDir });
      }
    }
  }

  if (!jobs.length) return { newTracks: 0 };

  syncState = {
    active: true,
    csv: '',
    current: 0,
    total: jobs.length,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    log: []
  };

  processJobs(jobs);

  return { newTracks: jobs.length };
}

async function processJobs(jobs) {
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    syncState.current = i + 1;
    syncState.csv = job.csv;

    const query = `${job.artist} ${job.track} audio`;
    const outPath = path.join(job.setDir, job.fname.replace(/\.mp3$/, '.%(ext)s'));

    try {
      await downloadTrack(query, outPath);
      syncState.downloaded++;
      syncState.log.push(`OK: ${job.artist} - ${job.track}`);
    } catch (err) {
      syncState.failed++;
      syncState.log.push(`FAIL: ${job.artist} - ${job.track}`);
    }
  }

  syncState.active = false;
}

module.exports = { listCsvs, syncAll, getStatus };
