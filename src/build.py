"""notewithliqi build: composes the deployable site from site-src/.

  python3 src/build.py            -> repository root (what Netlify publishes; src/ itself is left alone)
  python3 src/build.py --preview  -> ../preview next to the repository (no service worker, links point at index.html)

Source layout
  subjects.json               registry: every subject card on the hub, page titles, manifest shortcuts
  hub.html                    the subject picker (root index.html)
  shared/core.css|core.js     engine used by every subject (layout, router, quiz, flashcards, exam, drill, 3D toolkit)
  shared/shell.html           header, search box, toast and sidebar markup, filled in per subject
  subjects/<id>/main.html     the subject's chapters and practice page
  subjects/<id>/data.js       SUBJ settings + quiz bank, glossary, concept map, drill
  subjects/<id>/labs.js       the subject's own visuals; ends with NL.start([...labs])
"""
import os, sys, json, shutil, hashlib, html
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PREVIEW = '--preview' in sys.argv
ROOT = os.path.abspath(os.path.join(HERE, '..'))
OUT = os.path.abspath(os.path.join(ROOT, '..', 'preview')) if PREVIEW else ROOT
# vendor libraries are committed in vendor/; the build only copies them when building somewhere else
VENDOR = {
    'three': ('vendor/three-r128.min.js', os.path.join(ROOT, 'vendor/three-r128.min.js')),
    'alasql': ('vendor/alasql-4.4.0.min.js', os.path.join(ROOT, 'vendor/alasql-4.4.0.min.js')),
}
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800'
         '&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">')

def rd(p): return open(os.path.join(HERE, p), encoding='utf-8').read()
def wr(p, s):
    p = os.path.join(OUT, p); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)
def cp(src, dst):
    d = os.path.join(OUT, dst); os.makedirs(os.path.dirname(d), exist_ok=True)
    if os.path.abspath(src) != os.path.abspath(d): shutil.copy(src, d)
E = html.escape

subjects = json.loads(rd('subjects.json'))
def subject_files(s):
    return ['data.js'] + s.get('css', []) + s.get('scripts', ['labs.js']) + s.get('files', [])
live = [s for s in subjects if s['status'] == 'live']
link = lambda folder: folder + ('/index.html' if PREVIEW else '/')
HUB_FROM_SUBJECT = '../index.html' if PREVIEW else '../'

# service worker registration (deploy build only). New workers take over at once:
# pages, engine and subject files are fetched network-first, so there is never a stale mix.
def sw_reg(path):
    if PREVIEW: return ''
    return '''<script>
(function(){if(!("serviceWorker" in navigator))return;var h=location.hostname;if(location.protocol!=="https:"&&h!=="localhost"&&h!=="127.0.0.1")return;
 window.addEventListener("load",function(){var first=!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("%s").then(function(reg){
   reg.addEventListener("updatefound",function(){var w=reg.installing;if(!w)return;w.addEventListener("statechange",function(){
    if(w.state==="activated"&&first){first=false;window.bdlToast&&bdlToast("Saved for offline use. This site now works without internet.")}})});
   setInterval(function(){reg.update().catch(function(){})},60*60*1000);
  }).catch(function(){});
 });
})();
</script>''' % path

# clear only what this script generates (never src/ or .git)
if PREVIEW and os.path.isdir(OUT): shutil.rmtree(OUT)
os.makedirs(OUT, exist_ok=True)
for f in ['index.html', 'sw.js', 'manifest.webmanifest', '_headers', 'README.md']:
    if os.path.exists(os.path.join(OUT, f)): os.remove(os.path.join(OUT, f))
for d in ['shared', 'icons'] + [s['id'] for s in subjects]:
    if os.path.isdir(os.path.join(OUT, d)): shutil.rmtree(os.path.join(OUT, d))

# ---------- shared ----------
cp(os.path.join(HERE, 'shared/core.css'), 'shared/core.css')
cp(os.path.join(HERE, 'shared/core.js'), 'shared/core.js')
for name, (dst, src) in VENDOR.items(): cp(src, dst)

# ---------- subject pages ----------
shell_t = rd('shared/shell.html')
for s in live:
    sid = s['id']
    base = 'subjects/' + sid + '/'
    shell = (shell_t.replace('{{HUB}}', HUB_FROM_SUBJECT)
             .replace('{{CODE_HTML}}', f'<span class="code">{E(s["code"])} · </span>' if s.get('code') else '')
             .replace('{{TITLE}}', E(s['title'])))
    css = ''.join(f'<link rel="stylesheet" href="{c}">\n' for c in s.get('css', []))
    scripts = '\n'.join(f'<script src="{j}"></script>' for j in s.get('scripts', ['labs.js']))
    vend = ''.join(f'<script src="../{VENDOR[v][0]}"></script>\n' for v in s.get('vendor', []))
    pre = ''.join(f'<link rel="preload" href="../{VENDOR[v][0]}" as="script">\n' for v in s.get('vendor', []))
    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(s["title"])}</title>
<meta name="description" content="{E(s["description"])}">
<meta name="theme-color" content="#0D131E">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:title" content="{E(s["title"])} · notewithliqi">
<meta property="og:description" content="{E(s["description"])}">
<link rel="icon" href="../icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="../icons/apple-touch-icon.png">
<link rel="manifest" href="../manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="notewithliqi">
{pre}{FONTS}
<link rel="stylesheet" href="../shared/core.css">
{css}</head>
<body>
<noscript><p style="padding:16px;color:#E7EBF3">This site needs JavaScript for its labs, flashcards and quiz. The notes still display without it.</p></noscript>
{shell.rstrip()}
{rd(base + "main.html").rstrip()}
</div>

{vend}<script src="data.js"></script>
<script src="../shared/core.js"></script>
{scripts}
{sw_reg("../sw.js")}
</body>
</html>
'''
    wr(sid + '/index.html', page)
    for f in subject_files(s):
        cp(os.path.join(HERE, base + f), sid + '/' + f)

# ---------- hub ----------
def card(s):
    st = f'--a1:{s["accent"][0]};--a2:{s["accent"][1]}'
    if s['status'] != 'live':
        return f'''      <article class="sc soon" style="{st}" aria-label="{E(s["title"])}, coming soon">
        <div class="row">{f'<span class="code">{E(s["code"])}</span>' if s.get("code") else ""}<span class="st">Coming soon</span></div>
        <h2>{E(s["title"])}</h2>
        <p>{E(s["blurb"])}</p>
        <div class="ghost" aria-hidden="true"><i></i><i></i><i></i></div>
      </article>'''
    href = link(s['id'])
    chs = '\n'.join(f'          <li data-ch="{i+1}"><span class="n">CH {i+1:02d}</span><span class="t"><span>{E(c)}</span><span class="bar"><i></i></span></span><span class="v">–</span></li>' for i, c in enumerate(s['chapters']))
    return f'''      <article class="sc live" data-subject="{s["id"]}" style="{st}">
        <div class="row">{f'<span class="code">{E(s["code"])}</span>' if s.get("code") else ""}<span class="st">{len(s["chapters"])} chapters{f' · {E(s["extra"])}' if s.get("extra") else ""}</span></div>
        <h2><a href="{href}">{E(s["title"])}</a></h2>
        <p>{E(s["blurb"])}</p>
        <ul class="chs" aria-label="Chapters">
{chs}
        </ul>
        <div class="stats"><div><span>Topics learned</span><b data-k="learned">–</b></div><div><span>Cards due</span><b data-k="due">–</b></div>{'<div><span>Drill accuracy</span><b data-k="drill">–</b></div>' if s.get('drill') else '<div><span>Quiz bank</span><b>' + str(s.get('quiz', '–')) + '</b></div>'}<div><span>Last exam</span><b data-k="exam">–</b></div></div>
        <div class="cta"><a class="go" href="{href}">Open subject <span aria-hidden="true">→</span></a><a class="cont" href="{href}" hidden>Continue <span></span></a></div>
      </article>'''

reg = [{k: s[k] for k in ('id', 'status', 'title', 'short') if k in s} | ({'prefix': s['prefix'], 'href': link(s['id'])} if s['status'] == 'live' else {}) for s in subjects]
hub = (rd('hub.html').replace('{{CARDS}}', '\n'.join(card(s) for s in subjects))
       .replace('{{SUBJECTS_JSON}}', json.dumps(reg, ensure_ascii=False))
       .replace('{{IDS}}', json.dumps([s['id'] for s in subjects]))
       .replace('{{LEGACY}}', link(live[0]['id']))
       .replace('{{SW}}', sw_reg('sw.js')))
assert '{{' not in hub
wr('index.html', hub)

# ---------- icons ----------
BG, AMBER, TEAL = (13, 19, 30), (245, 184, 61), (79, 209, 197)
def icon(size, maskable=False, path=None):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if maskable: d.rectangle([0, 0, S, S], fill=BG); scale = 0.58
    else: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * .22), fill=BG); scale = 0.78
    box = S * scale; ox = (S - box) / 2; bw, gap, bh = box * .40, box * .12, box * .62; top = (S - bh) / 2
    d.rounded_rectangle([ox + box * .04, top, ox + box * .04 + bw, top + bh], radius=int(bw * .18), fill=AMBER)
    x2 = ox + box * .04 + bw + gap
    d.rounded_rectangle([x2, top, x2 + bw, top + bh], radius=int(bw * .18), fill=TEAL)
    p = os.path.join(OUT, path); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.resize((size, size), Image.LANCZOS).save(p)
icon(192, path='icons/icon-192.png'); icon(512, path='icons/icon-512.png')
icon(512, maskable=True, path='icons/maskable-512.png'); icon(180, maskable=True, path='icons/apple-touch-icon.png')
ICONS = ['icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png']

# ---------- manifest ----------
shortcuts = [{"name": s['title'], "short_name": s['short'], "url": './' + s['id'] + '/'} for s in live]
extra = [[{"name": n, "url": './' + s['id'] + '/' + h} for n, h in s.get('shortcuts', [])] for s in live]
while any(extra):  # round-robin so every subject gets a shortcut before any gets two
    for lst in extra:
        if lst: shortcuts.append(lst.pop(0))
manifest = {
    "name": "notewithliqi", "short_name": "notewithliqi",
    "description": "Interactive revision notes for university subjects: 3D labs, flashcards, quizzes and timed exams. Works offline.",
    "start_url": "./", "scope": "./", "display": "standalone",
    "background_color": "#0D131E", "theme_color": "#0D131E",
    "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
              {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}],
    "shortcuts": shortcuts[:4],
}
wr('manifest.webmanifest', json.dumps(manifest, indent=2, ensure_ascii=False))

if PREVIEW:
    print('preview built ->', OUT); sys.exit()

# ---------- service worker ----------
STATIC = [VENDOR[v][0] for v in VENDOR] + ICONS
PAGES = ['./', 'shared/core.css', 'shared/core.js', 'manifest.webmanifest']
for s in live: PAGES += [s['id'] + '/'] + [s['id'] + '/' + f for f in subject_files(s)]
def digest(files, n=10):
    h = hashlib.sha256()
    for f in files: h.update(open(os.path.join(OUT, 'index.html' if f == './' else (f + 'index.html' if f.endswith('/') else f)), 'rb').read())
    return h.hexdigest()[:n]
sv, pv = digest(STATIC), digest(PAGES)
sw = r'''/* notewithliqi service worker
   - vendor libraries and icons: cache first (their file names change when their content does)
   - pages, shared engine and subject files: network first, cached copy when offline
   - Google Fonts: cached, refreshed in the background
   A new worker takes over immediately; because everything that changes is fetched network-first,
   a page never mixes an old engine with new content. */
const STATIC = "nlq-static-%SV%";
const PAGES = "nlq-pages-%PV%";
const FONTS = "nlq-fonts";
const STATIC_FILES = %STATIC%;
const PAGE_FILES = %PAGES%;
const SUBJECT_DIRS = %DIRS%;

self.addEventListener("install", e => {
  e.waitUntil(Promise.all([
    caches.open(STATIC).then(c => c.addAll(STATIC_FILES)),
    caches.open(PAGES).then(c => c.addAll(PAGE_FILES.map(u => new Request(u, { cache: "no-cache" }))))
  ]).then(() => self.skipWaiting()));
});
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== STATIC && k !== PAGES && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const scope = new URL(self.registration.scope);
// one cache key per page: /big-data/index.html and /big-data/ are the same page; query and hash ignored
function keyOf(url) {
  const u = new URL(url); u.hash = ""; u.search = "";
  if (u.pathname.endsWith("/index.html")) u.pathname = u.pathname.slice(0, -10);
  return u.href;
}
async function fromNetwork(req, ms) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(req, { signal: ctl.signal }); } finally { clearTimeout(t); }
}
async function networkFirst(req, isPage) {
  const cache = await caches.open(PAGES), key = keyOf(req.url);
  try {
    const res = await fromNetwork(req, isPage ? 4000 : 6000);
    if (res.ok && res.type === "basic" && !res.redirected) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key) || await caches.match(key);
    if (hit) return hit;
    if (isPage) {  // offline and never opened: fall back to that subject's home, then the hub
      const p = new URL(key).pathname, dir = SUBJECT_DIRS.find(d => p.startsWith(new URL(d, scope).pathname));
      return (dir && await cache.match(new URL(dir, scope).href)) || await cache.match(scope.href) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    const rel = url.pathname.slice(scope.pathname.length);
    if (rel.startsWith("vendor/") || rel.startsWith("icons/")) {
      e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(STATIC).then(c => c.put(req, copy)); }
        return res;
      })));
      return;
    }
    if (rel === "sw.js") return;
    e.respondWith(networkFirst(req, req.mode === "navigate"));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
'''
sw = (sw.replace('%SV%', sv).replace('%PV%', pv).replace('%STATIC%', json.dumps(STATIC))
      .replace('%PAGES%', json.dumps(PAGES)).replace('%DIRS%', json.dumps([s['id'] + '/' for s in live])))
wr('sw.js', sw)

# ---------- Netlify headers ----------
wr('_headers', '''# Netlify headers: caching + security
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'

# everything else uses Netlify's default (public, max-age=0, must-revalidate): browsers re-check on every visit

# the service worker must never be cached by the browser
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

/manifest.webmanifest
  Content-Type: application/manifest+json

# versioned file names: safe to cache for a year
/vendor/*
  Cache-Control: public, max-age=31536000, immutable

/icons/*
  Cache-Control: public, max-age=604800

# source files are public in the repo anyway; just keep them out of search results
/src/*
  X-Robots-Tag: noindex
''')

# ---------- README ----------
rows = '\n'.join(f"| `{s['id']}/` | {s['title']}{' (' + s['code'] + ')' if s.get('code') else ''} |" for s in live)
wr('README.md', f"""# notewithliqi

Interactive revision notes. The home page lists every subject; each subject has its own chapters,
3D/2D labs, flashcards, quizzes and timed exams. Summarised from lecture slides; not official course material.

## Folders
| Path | What it is |
| --- | --- |
| `index.html` | Home page: pick a subject, see progress, continue where you left off |
{rows}
| `shared/core.css`, `shared/core.js` | Engine shared by every subject (layout, navigation, search, quiz, flashcards, exam, drill, 3D toolkit) |
| `vendor/` | Self-hosted three.js r128 (3D) and AlaSQL 4.4.0 (HiveQL practice) |
| `sw.js` | Service worker: offline support and caching |
| `manifest.webmanifest` | App name, icons and shortcuts for installing |
| `_headers` | Netlify caching and security headers |
| `icons/` | App and home-screen icons |
| `src/` | Source: `python3 src/build.py` regenerates everything above from it |

To add a subject: create `src/subjects/<folder>/` (main.html, data.js, labs.js), add it to `src/subjects.json`, run the build.

Old links such as `/#ch2` or `/#quiz` still work: the home page forwards them to `/big-data/`.

## Deploy on Netlify from GitHub
1. Push this folder to a GitHub repository (these files at the repository root).
2. Netlify: **Add new site → Import an existing project → GitHub**, pick the repository.
3. Build command: *leave empty*. Publish directory: `.`
4. Every push to the main branch redeploys automatically. Deploys → any older deploy → **Publish deploy** rolls back.
""")
print('built', OUT, 'static', sv, 'pages', pv)
