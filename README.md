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

## Local media inspector
For pages you own or have permission to integrate, run:
```sh
npm install
npx playwright install chromium
npm run inspect -- "https://example.com/watch"
```
Confirm the permission prompt, start playback normally, and press Enter in the terminal to export .cinema/sources.json. In Cinema, open Media tools (or the episode player) and import the JSON file. Select a compatible HLS or MP4 observation to try it in the existing player. No film or website is hard-coded into the inspector. The report is private and gitignored; no backend upload or remote browser endpoint is provided. URLs may expire or be restricted. The inspector observes only normal successful responses and does not bypass access controls. DASH/iframe/subtitle observations are informational; select a local VTT file for captions. Chromium installation is local only; Render does not need it.

## Embedded player
Media Tools and the episode player also accept authorized external HTTPS embed URLs. The iframe is sandboxed without popups, top-level navigation or same-origin permission. Websites can refuse framing or require permissions this sandbox does not provide; Cinema does not bypass those restrictions. Use the source's official player in that case. No server-side browser streaming or video proxy is installed.

## Cropped iframe view
External catalog listings now use a single cropped iframe view instead of a direct-video selector. Choose a site, select the episode in the full-page preview, then adjust the visible rectangle and save it. Crop coordinates are saved locally per listing URL. Cinema cannot inspect or modify cross-origin page DOM and does not bypass frame restrictions or mandatory source controls. There are no verified per-episode URLs for these listings. Native playback remains available for the authorized demo catalog; diagnostic Media Tools is still accessible via its direct route but removed from the main navigation.
