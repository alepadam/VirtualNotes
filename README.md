# notewithliqi

Interactive revision notes. The home page lists every subject; each subject has its own chapters,
3D/2D labs, flashcards, quizzes and timed exams. Summarised from lecture slides; not official course material.

## Folders
| Path | What it is |
| --- | --- |
| `index.html` | Home page: pick a subject, see progress, continue where you left off |
| `big-data/` | Big Data Applications and Analytics (WIH3003) |
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
