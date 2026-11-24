# `pwa.js` and `serviceworker.js` Module Documentation

*[Bahasa Indonesia](../pwa)*

Two files that make a CrootJS web app **open without internet** and **installable** like an app (PWA):

- `pwa.js`, the page module: registers the service worker, announces when a new version is ready, reports online/offline status, provides an "Install app" button, and detects an installed app.
- `serviceworker.js`, the service worker core: stores your pages, CSS, JS, and images in Cache Storage and serves them while offline.

A service worker must live on your own site's domain; browsers do not allow registering one from jsDelivr. So you create one small `sw.js` on your own site that loads `serviceworker.js` from jsDelivr with `importScripts()`.

[`mapcache.js`](mapcache) stores map tiles; `pwa.js` complements it by storing the page itself, so a field map app can open completely without a signal.

Full example: [croot.js.org/examples/pwa/](https://croot.js.org/examples/pwa/).

## Quick steps

App folder layout:

```
index.html
index.js
style.css
manifest.webmanifest
sw.js
icons/icon-192.png
icons/icon-512.png
```

### 1. `sw.js` (in the same folder as `index.html`)

```javascript
importScripts("https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/serviceworker.min.js");

crootjsServiceWorker({
    version: "1",
    precache: [
        "./",
        "style.css",
        "index.js",
        "manifest.webmanifest",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/pwa.min.js"
    ]
});
```

`sw.js` is a classic script, not an ES module, so it uses `importScripts`, not `import`. Call `crootjsServiceWorker` directly at the top level of the file, not inside an async function or event: browsers only listen to `fetch` events that are attached when the file first runs.

### 2. `manifest.webmanifest`

```json
{
  "name": "Field Notes",
  "short_name": "Notes",
  "lang": "en",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#f8fafc",
  "theme_color": "#15803d",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Chrome needs 192 and 512 px PNG icons before an app can be installed. Android crops a `maskable` icon into a circle or other shape, so keep the important part inside the central 80% and fill the background to the edges.

### 3. `index.html`

```html
<meta name="theme-color" content="#15803d">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-192.png">
...
<button type="button" id="install" hidden>Install app</button>
<span id="network" role="status"></span>
<script type="module" src="index.js"></script>
```

### 4. `index.js`

```javascript
import { registerServiceWorker, onNetworkChange, installButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/pwa.min.js";

registerServiceWorker("sw.js");
installButton("install");
onNetworkChange(online => {
    document.getElementById("network").textContent = online ? "Online" : "Offline";
});
```

## `pwa.js`

### `registerServiceWorker(url, options)`

Registers your site's service worker. `url` defaults to `"sw.js"`, relative to the page.

| Option | Default | Description |
|---|---|---|
| `scope` | the service worker file's folder | Folder controlled by the service worker |
| `onUpdate` | built-in notice | `function({ registration, activate })` called when a new version is installed and waiting. `activate()` activates that version and reloads the page |

Without `onUpdate`, a small notice appears at the bottom of the screen when a new version is ready ("Versi baru aplikasi siap.", Indonesian) with **Muat ulang** (reload) and **Nanti** (later) buttons (`role="status"`, class `crootjs-pwa-update`, colours from the `--croot-*` variables of [croot.css](css)). Pass `onUpdate` for your own wording. A new version is never activated without the user agreeing, so unsaved form input is not lost to a sudden reload.

Returns a Promise of `{ ok, registration, error }` that never rejects:

| `error` | Meaning |
|---|---|
| `null` | Registered; `registration` holds the `ServiceWorkerRegistration` |
| `"insecure"` | The page is not `https` or `localhost`. A warning goes to the console; the page keeps working, just without offline mode |
| `"unsupported"` | The browser has no service workers |
| `"failed"` | The file was not found or has an error in it; details in the console |

Your own notice:

```javascript
import { registerServiceWorker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/pwa.min.js";

const result = await registerServiceWorker("sw.js", {
    onUpdate: ({ activate }) => {
        if (confirm("A new version is available. Reload now?")) activate();
    }
});
if (!result.ok) console.log("Offline mode is off:", result.error);
```

Browsers check for a new `sw.js` every time a page inside its scope is opened. An app left open for hours can check itself with `result.registration.update()`.

### `onNetworkChange(callback)`

Calls `callback(online)` right away, then every time the connection drops or comes back. Returns a function that stops listening.

`online` is `false` only when the device has no network at all. Being connected to Wi-Fi with no internet access still counts as online for the browser; a `status: 0` result from [api.js](api) is a surer sign that the server is unreachable.

### `isStandalone()`

`true` when the page is opened as an installed app (its own window, not a browser tab), including "Add to Home Screen" on iOS Safari.

### `installButton(id, options)`

Turns button `#id` into an "Install app" button. The button is hidden (the `hidden` attribute) and only shown when the browser says the app can be installed (the `beforeinstallprompt` event). A click opens the browser's install dialog; afterwards the button is hidden again.

`options.onChoice(outcome)` is called after the dialog closes, with `"accepted"` or `"dismissed"`.

- `beforeinstallprompt` exists only in Chrome, Edge, and other Chromium browsers. In Firefox and Safari the button stays hidden; users install from the browser menu (iOS Safari: Share → Add to Home Screen).
- The browser only sends the event when the requirements are met: `https`/`localhost`, a manifest with `name`, `start_url`, `display` `standalone` (or `fullscreen`/`minimal-ui`), 192 and 512 px icons, and the app not already installed.
- The event is captured as soon as `pwa.js` loads, so calling `installButton` later is fine.

## `serviceworker.js`

### `crootjsServiceWorker(options)`

Called in your `sw.js` after `importScripts`.

| Option | Default | Description |
|---|---|---|
| `version` | — (required) | App version text. See [Updating the version](#updating-the-version) |
| `precache` | `[]` | Files downloaded and stored at install time, relative to `sw.js`. Full jsDelivr URLs are allowed. If any one fails to download, this version is not installed and the old version stays in use |
| `offlinePage` | — | Fallback page (e.g. `"offline.html"`) when offline and the requested page was never stored. Precached automatically |
| `maxEntries` | `100` | Most responses kept in the runtime cache (anything not in `precache`); the oldest stored are dropped |
| `networkTimeout` | `5000` | Milliseconds to wait for the server on a page navigation before using the stored page, for a signal that is present but very slow. A server response that arrives late is still stored for the next visit |
| `name` | `"crootjs-pwa"` | Cache name prefix |

How each request is handled:

| Request | Strategy |
|---|---|
| Page navigation on your own domain | **Network-first**: the latest page from the server, which is then stored; if that fails or exceeds `networkTimeout`, the stored page (same URL, then same URL without `?query`); if there is none, `offlinePage`; failing that, the browser's own offline error page |
| CSS, JS, images, fonts, manifest on your own domain | **Stale-while-revalidate**: straight from the cache while being refetched in the background for the next visit; anything not yet stored comes from the server |
| jsDelivr files with an exact version (`@0.0.33`, or a commit hash) | **Cache-first**: their content never changes, so once stored they are never requested again. Fetched in CORS mode even when the page requests them without CORS (e.g. `<link rel="stylesheet">` without `crossorigin`), so what gets stored is not an *opaque* response |
| Everything else | Left alone, straight to the network |

Only successful responses (status 2xx) without `Cache-Control: no-store` are stored. Error responses (404, 500) and *opaque* responses are never stored.

Cache names include the service worker's `scope`, so several apps on one domain (for example different folders on GitHub Pages) do not delete each other's caches.

### What is not handled

- **Requests other than GET** (POST, PUT, DELETE) and requests with a `Range` header (video, PMTiles) always go straight to the network. Offline they fail as usual (`api.js` gives `status: 0`); no resend queue (*background sync*) is provided.
- **`fetch()` and `XMLHttpRequest` from page code**, including `getJSON` in [api.js](api), are not stored even on your own domain, so data never goes stale without you noticing. For data that must be available offline, store it yourself with [storage.js](storage) or the `cache` option of `api.js`.
- **Other domains** apart from exactly-versioned jsDelivr files: APIs, Google Fonts, other CDNs, and map tiles are not stored. Map tiles are handled by [mapcache.js](mapcache) or [mapoffline.js](mapoffline). jsDelivr with `@latest` or a partial version (`@0`) is not stored either, because its content can change.
- **Pages never opened** cannot be shown offline unless listed in `precache` or covered by `offlinePage`.
- **Push notifications** and *periodic sync* are not provided.
- Browsers may delete Cache Storage when the device is nearly out of space. `navigator.storage.persist()` asks the browser not to.

## Updating the version

The browser sees a new version when the content of `sw.js` changes by even one byte. So on every release:

1. Bump `version` in `sw.js` (e.g. `"1"` → `"2"`). Required when the `precache` list changes or the CrootJS pin goes up (the pin in the `importScripts` URL or in `precache`; changing the pin alone already changes `sw.js`).
2. When users open the app, the new version is downloaded in the background and its whole `precache` is stored in a new cache.
3. `registerServiceWorker` calls `onUpdate` (or shows the built-in notice). After `activate()`/the reload button, the new version is active, the old version's caches are deleted, and the page reloads.

Your own CSS, JS, and images are still rechecked in the background every time they are used (stale-while-revalidate), so file changes without a `version` bump still reach users, one visit late. Bumping `version` makes everything download again at once.

Make sure the server does not keep `sw.js` in an HTTP cache for long. Browsers already ignore the HTTP cache for `sw.js` itself when checking for updates, but a CDN in front of the site may cache it; GitHub Pages uses `max-age=600` (10 minutes).

## Testing in DevTools (Chrome/Edge)

1. Open the site over `https` or `http://localhost` (e.g. `python3 -m http.server 8000`, then `http://localhost:8000/`). A local network IP such as `http://192.168.x.x` is not considered secure, so the service worker is refused (`error: "insecure"`).
2. **Application → Service workers**: the status should be *activated and is running*. Tick **Update on reload** while developing so every reload uses the latest `sw.js`, and untick it again to test the new-version notice.
3. **Application → Cache storage**: shows the `crootjs-pwa <scope> precache <version>` and `... runtime <version>` caches and their contents.
4. **Network → Offline** (or **Application → Service workers → Offline**), then reload: the page should still show. The *Size* column says `(ServiceWorker)` for responses from the cache.
5. **Application → Manifest**: checks the manifest and icons, and tells you which install requirement is missing. The install button also appears in the address bar.
6. To start over: **Application → Storage → Clear site data**.

In Firefox: `about:debugging#/runtime/this-firefox` → Service Workers, and **Storage → Cache Storage** in DevTools.

## Notes

- A service worker only controls pages in the folder where `sw.js` lives and its subfolders. Put `sw.js` in the app's top folder.
- On the first visit the page loads before the service worker is installed; `serviceworker.js` takes over that page as soon as it is active (`clients.claim()`), so files loaded afterwards (images, modules imported later) already go through the cache.
- App data (notes, form input) is not stored by the service worker. Store it with [storage.js](storage) (`localStorage`) or IndexedDB.
- Redirected responses are copied into plain responses before being stored, because Safari refuses redirected responses for navigations served by a service worker.
