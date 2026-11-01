# WIH3003 Big Data Applications and Analytics: revision site

Interactive revision companion for WIH3003 (Universiti Malaya, FSKTM): Chapter 1 Big Data overview,
Chapter 2 Hadoop (HDFS, MapReduce, YARN) and Chapter 3 Hive. Summarised from the lecture slides;
not official course material.

## What's inside
- One page per chapter with 3D/2D labs, exam tips, slide notes and common misconceptions
- HiveQL practice area that runs in the browser
- Spaced-repetition flashcards, chapter quizzes (20 random questions per attempt) and a timed exam
- Works offline and can be installed as an app (service worker + web manifest)

## Files
| File | Purpose |
| --- | --- |
| `index.html` | The whole site (HTML, CSS and JS in one file) |
| `sw.js` | Service worker: offline support and caching |
| `manifest.webmanifest` | App name, icons and shortcuts for installing |
| `_headers` | Netlify caching and security headers |
| `vendor/` | Self-hosted three.js r128 (3D) and AlaSQL 4.4.0 (HiveQL practice) |
| `icons/` | App and home-screen icons |

## Deploy on Netlify from GitHub
1. Push this folder to a GitHub repository (these files at the repository root).
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repository.
3. Build command: *leave empty*. Publish directory: `.` (the repository root).
4. Every push to the main branch redeploys automatically; Deploys → any older deploy → **Publish deploy** rolls back.

## Updating
Most updates only change `index.html`. If `sw.js` changes, visitors see a "new version is ready" prompt.
