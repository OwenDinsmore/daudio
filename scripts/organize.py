#!/usr/bin/env python3
import csv, os, sys, shutil, re

def sanitize(name):
    return re.sub(r'[<>:"/\\|?*]', '', name)

def first_artist(s):
    return s.split(';')[0] if ';' in s else s

def get_genre(g, artist=''):
    a = artist.lower()

    if not g or not g.strip():
        #infer from artist if no genre
        if any(x in a for x in ['guetta', 'harris', 'avicii', 'tiesto', 'galantis', 'chainsmokers', 'swedish house']): return 'electronic'
        if any(x in a for x in ['pitbull', 'flo rida', 'lmfao', 'far east']): return 'party'
        if any(x in a for x in ['rihanna', 'gaga', 'katy perry', 'kesha', 'britney', 'madonna']): return 'pop'
        if any(x in a for x in ['coldplay', 'imagine dragon', 'onerepublic', 'maroon', 'train']): return 'alt-rock'
        if any(x in a for x in ['weeknd', 'frank ocean', 'sza', 'childish gambino']): return 'rnb'
        if any(x in a for x in ['nelly furtado', 'timbaland', 'black eyed', 'usher']): return '2000s'
        if any(x in a for x in ['abba', 'queen', 'michael jackson']): return 'classics'
        return 'other'

    g = g.split(',')[0].strip().lower()

    #core genres
    if 'drill' in g: return 'drill'
    if 'cloud' in g or 'emo rap' in g or 'melodic rap' in g: return 'melodic-rap'
    if 'trap' in g or 'rage' in g: return 'trap'
    if 'old school' in g or 'gangster' in g or 'west coast' in g or 'east coast' in g: return 'classic-hiphop'
    if 'hip hop' in g or 'rap' in g: return 'hip-hop'

    if 'house' in g or 'techno' in g or 'garage' in g: return 'house'
    if 'eurodance' in g or 'europop' in g: return 'eurodance'
    if 'edm' in g or 'electronic' in g or 'electro' in g or 'dubstep' in g or 'bass' in g: return 'electronic'

    if 'r&b' in g or 'rnb' in g or 'neo soul' in g or 'afro' in g: return 'rnb'
    if 'pop' in g or 'bedroom' in g: return 'pop'
    if 'indie' in g or 'psychedelic' in g or 'alternative' in g: return 'alt-rock'
    if 'phonk' in g or 'synthwave' in g or 'wave' in g: return 'phonk'
    if 'punk' in g or 'emo' in g or 'rock' in g or 'metal' in g: return 'rock'
    if 'reggae' in g or 'dancehall' in g: return 'reggae'
    if 'jazz' in g or 'soul' in g or 'funk' in g: return 'soul'
    if 'country' in g or 'folk' in g: return 'country'
    if 'disco' in g or 'moombah' in g or 'tropical' in g: return 'dance'
    if 'trip' in g or 'chill' in g or 'ambient' in g: return 'chill'
    return 'other'

def organize(folder):
    csvpath = folder.rstrip('/') + '.csv'
    if not os.path.exists(csvpath):
        print(f"Error: {csvpath} not found")
        sys.exit(1)
    if not os.path.isdir(folder):
        print(f"Error: {folder} not found")
        sys.exit(1)

    tracks = []
    with open(csvpath, 'r', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            track = row.get('Track Name', '').strip()
            artists = row.get('Artist Name(s)', '').strip()
            genre = row.get('Genres', '').strip()
            fname = sanitize(f"{first_artist(artists)} - {track}") + ".mp3"
            tracks.append({
                'fname': fname,
                'artists': artists,
                'genre': get_genre(genre, artists)
            })

    #split by artist
    kanye, drake, other = [], [], []
    for t in tracks:
        if 'Kanye West' in t['artists']: kanye.append(t)
        elif 'Drake' in t['artists']: drake.append(t)
        else: other.append(t)

    print(f"Organizing {folder}/")
    print("-" * 50)

    #move kanye
    kfolder = os.path.join(folder, "Kanye West")
    os.makedirs(kfolder, exist_ok=True)
    print(f"\n[Kanye West] - {len(kanye)} tracks")
    for t in kanye:
        src, dst = os.path.join(folder, t['fname']), os.path.join(kfolder, t['fname'])
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"  → {t['fname']}")

    #move drake
    dfolder = os.path.join(folder, "Drake")
    os.makedirs(dfolder, exist_ok=True)
    print(f"\n[Drake] - {len(drake)} tracks")
    for t in drake:
        src, dst = os.path.join(folder, t['fname']), os.path.join(dfolder, t['fname'])
        if os.path.exists(src):
            shutil.move(src, dst)
            print(f"  → {t['fname']}")

    #group rest by genre
    genres = {}
    for t in other:
        g = t['genre']
        if g not in genres: genres[g] = []
        genres[g].append(t)

    for g in sorted(genres.keys()):
        gfolder = os.path.join(folder, g)
        os.makedirs(gfolder, exist_ok=True)
        print(f"\n[{g}] - {len(genres[g])} tracks")
        for t in genres[g]:
            src, dst = os.path.join(folder, t['fname']), os.path.join(gfolder, t['fname'])
            if os.path.exists(src):
                shutil.move(src, dst)
                print(f"  → {t['fname']}")

    print("\n" + "-" * 50)
    print("Done!")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python organize.py <folder>")
        sys.exit(1)
    organize(sys.argv[1])
