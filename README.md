# daudio

localhost music manager that lets you search YouTube, download tracks as MP3s, organize them into sets (playlists), and play them in the browser.

## Setup

1. **Install Node.js** (if you don't have it):
   ```bash
   # macOS/Linux
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install node

   # Windows — download the installer from https://nodejs.org
   ```

2. **Install ffmpeg** (needed for audio conversion):
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt install ffmpeg

   # Windows
   winget install Gyan.FFmpeg
   ```

3. **Install Python dependencies** (yt-dlp):
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Node dependencies and start the server:**
   ```bash
   npm install
   npm start
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

To use a different port: `PORT=8080 npm start`

## How It Works

### Core Flow

1. **Search** — Query YouTube via yt-dlp from the search bar
2. **Download** — Click a result to download it as a 320kbps MP3 to a temporary cache (auto-expires after 10 minutes)
3. **Save** — Save downloaded tracks into a named set, optionally organized into folders
4. **Play** — Stream any track directly in the browser with the built-in player

### CSV Import

Import Spotify-exported CSVs (placed in `data/`) to bulk-download playlists. The app reads `Track Name` and `Artist Name(s)` columns, searches YouTube for each, and downloads them into a set.

### Python Scripts

| Script | Usage | Purpose |
|--------|-------|---------|
| `scripts/download_mix.py` | `python scripts/download_mix.py data/playlist.csv` | Bulk download from CSV without the web UI |
| `scripts/organize.py` | `python scripts/organize.py sets/MySet/` | Auto-organize a set's files by artist/genre |

## Project Structure

```
server.js              # Express server entry point
src/
  routes/              # API endpoints (search, download, playback, sets, import)
  services/            # Business logic (yt-dlp wrapper, CSV importer, file/temp management)
  utils/               # Path constants, filename sanitization
public/                # Frontend (vanilla HTML/CSS/JS)
scripts/               # Python utility scripts
data/                  # CSV playlist files for import
sets/                  # Saved music library (gitignored)
tmp/                   # Temporary downloads (auto-cleaned)
```
