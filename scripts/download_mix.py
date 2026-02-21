#!/usr/bin/env python3
import csv, os, sys, subprocess, re

def sanitize(name):
    return re.sub(r'[<>:"/\\|?*]', '', name)

def download(track, artist, outdir):
    query = f"{artist} {track} audio"
    fname = sanitize(f"{artist} - {track}")
    outpath = os.path.join(outdir, f"{fname}.%(ext)s")

    if os.path.exists(os.path.join(outdir, f"{fname}.mp3")):
        print(f"  ✓ Already exists: {fname}.mp3")
        return True

    cmd = [
        "yt-dlp", f"ytsearch1:{query}",
        "-x", "--audio-format", "mp3", "--audio-quality", "0",
        "-o", outpath, "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "--quiet", "--no-warnings",
    ]

    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            print(f"  ✓ Downloaded: {fname}.mp3")
            return True
        print(f"  ✗ Failed: {query}")
        return False
    except subprocess.TimeoutExpired:
        print(f"  ✗ Timeout: {query}")
        return False
    except FileNotFoundError:
        print("Error: yt-dlp not found. pip install yt-dlp")
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: python download_mix.py <playlist.csv>")
        sys.exit(1)

    csvpath = sys.argv[1]
    if not os.path.exists(csvpath):
        print(f"Error: {csvpath} not found")
        sys.exit(1)

    #output folder = csv name w/o ext
    base = os.path.splitext(os.path.basename(csvpath))[0]
    outdir = os.path.join(os.path.dirname(csvpath) or ".", base)
    os.makedirs(outdir, exist_ok=True)

    print(f"Reading: {csvpath}")
    print(f"Output: {outdir}\n")

    tracks = []
    with open(csvpath, 'r', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            track = row.get('Track Name', '').strip()
            artist = row.get('Artist Name(s)', '').strip()
            if ';' in artist:
                artist = artist.split(';')[0]
            if track and artist:
                tracks.append((track, artist))

    print(f"Found {len(tracks)} tracks")
    print("-" * 50)

    ok, fail = 0, 0
    for i, (track, artist) in enumerate(tracks, 1):
        print(f"[{i}/{len(tracks)}] {artist} - {track}")
        if download(track, artist, outdir):
            ok += 1
        else:
            fail += 1

    print("-" * 50)
    print(f"Done! {ok} downloaded, {fail} failed")
    print(f"Saved to: {outdir}/")

if __name__ == "__main__":
    main()
