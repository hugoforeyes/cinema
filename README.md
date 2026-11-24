# Cinema

A small movie discovery and playback MVP for authorized sources. The initial catalog uses open Blender films and public demonstration streams, not scraped commercial movie sites.

## Run locally
Requires Node.js 22+.
```sh
npm install
npm run dev
```
Open http://localhost:5173. API runs on port 8080. To run the production build:
```sh
npm run check
npm test
npm run build
npm start
```
Open http://localhost:8080.

## Deploy to Render
Merge the MVP into main, then create a Web Service from this repository with Docker runtime and Free instance type, or import render.yaml as a Blueprint. Set health check path /api/health. The server listens on 0.0.0.0 and PORT. Render provides the HTTPS subdomain. No database is needed.

## Architecture
- React, TypeScript, Vite, Tailwind CSS, native video + HLS.js.
- Fastify serves REST API and the built frontend from one origin.
- MovieProvider adapters use a canonical catalog ID for deduplication.
- Provider timeouts isolate failures; search and source selection work independently.
- Favorites and viewing progress stay in localStorage.
- Basic installable PWA shell (no offline video downloads).

## Sources and limitations
Demo catalog: Big Buck Bunny, Sintel, Elephants Dream (Blender Foundation, CC BY; see https://www.blender.org/about/projects/). MP4 demonstration URLs are from Google's public sample bucket; HLS demonstration URL from Mux. Availability, CORS and playback depend on the upstream hosts. No commercial source integration is included. Add only providers you have permission to integrate. This app does not bypass access controls or proxy video.

Production tasks: verify actual playback in Safari/Chrome, add end-to-end tests, lock dependencies, and verify Render deployment.
