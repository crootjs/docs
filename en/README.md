# Human in The Loop Documentation

*[Bahasa Indonesia](../)*

Documentation for using CrootJS with an AI Companion and a human in the loop.

Coming from **JSCroot**? Read [From JSCroot to CrootJS](migrasi): new import URLs, removed functions and their replacements, and changed behavior.

Import every module from a pinned version, e.g. `https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.min.js`. In production use `.min.js` for **every** CrootJS import on a page, never mixed with `.js`: `api.min.js` and `storage.js` are different module URLs, so a module imported by both is loaded twice, each copy with its own state. Since 0.0.38 the `.min.js` files in every release import the `.min.js` of their sibling modules.

Pin to a **tag** (`@0.0.39`), not to a commit SHA from `main`. Our own `.min.js` files only exist in the release commits (on the `dist` branch, since 0.0.40); for a SHA from `main`, jsDelivr minifies on its own and its `api.min.js` imports `"./storage.js"` again.

### Loading faster with `modulepreload`

A browser only learns that a module needs another one after it has downloaded it, so every level of imports adds one round trip to the server (about 150 ms on mobile networks). These modules import others:

| Module | Also loads | Levels |
|---|---|---|
| `api.js` | `storage.js` | 1 |
| `auth.js` | `cookie.js`, `api.js`, `storage.js`, `url.js`, `element.js`, `template.js`, `useragent.js`, `qr.js` | 2 |
| `config.js` | `auth.js`, `cookie.js`, `api.js`, `storage.js`, `url.js`, `element.js`, `template.js`, `useragent.js`, `qr.js` | 3 |
| `form.js` | `element.js` | 1 |
| `geomeasure.js` | `geo.js` | 1 |
| `georoute.js` | `geo.js`, `geomeasure.js` | 2 |
| `map.js` | `geo.js` | 1 |
| `mapcluster.js` | `geo.js` | 1 |
| `mapdraw.js` | `geo.js` | 1 |
| `mapheat.js` | `geo.js` | 1 |
| `mapmodel.js` | `model3d.js` | 1 |
| `mapoffline.js` | `mapvector.js` | 1 |
| `maptools.js` | `geomeasure.js`, `geo.js` | 2 |

Add `<link rel="modulepreload">` in `<head>` for the modules you import **and** the ones in the "Also loads" column, with the same version and `.min.js` suffix. They are then all downloaded together from the start. Example for a page that imports `api.min.js`:

```html
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.min.js" integrity="sha384-FkrcJYDj82Td9axSh3O+A2TIpwCIg67PsrurLGMr5vk4KnL8c+zONZlBbaMEU0Cy">
<link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/storage.min.js" integrity="sha384-I68UpwZkgCfB4R68KBk7oSjwdRZqI+8zHf73gCvG+J2YFk5fxD3kBQjgt45dGk0Z">
<script type="module" src="index.js"></script>
```

On the croot.js.org landing page this moves the first API request about 300 ms earlier at 150 ms latency. The table above is generated from the code with `python3 tools/module-deps.py` in the `lib` repo.

The `integrity` attributes in the example are explained in the next section. `python3 tools/module-deps.py <version>` prints the `modulepreload` lines of every module with their hashes.

### Locking file contents with `integrity` (SRI)

Pinning a version keeps the URL the same, not the content: what is behind `@0.0.41` still depends on jsDelivr and GitHub. With an SRI (Subresource Integrity) hash the browser hashes the downloaded file and refuses to run it when the hash doesn't match. Since 0.0.42 every release includes `integrity.json` (`https://cdn.jsdelivr.net/gh/crootjs/lib@<version>/integrity.json`): sha384 hashes of every `.js`, `.min.js`, and `.css`, plus the modules each module imports.

`integrity` on `<link rel="modulepreload">` alone is not enough: only Chromium rejects a changed file, Firefox and Safari still run the module loaded by `import`. All three enforce an import map with an `integrity` key, and that import map also covers imports inside modules (`api.min.js` imports `storage.min.js`). Install it from `integrity.js`, the first script in `<head>` and a **classic** one (the only exception to the [ES module rule](../conventions#2-javascript-must-be-loaded-as-an-es-module)):

```html
<head>
  <script src="integrity.js"></script>
  <link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.min.js" integrity="sha384-FkrcJYDj82Td9axSh3O+A2TIpwCIg67PsrurLGMr5vk4KnL8c+zONZlBbaMEU0Cy">
  <link rel="modulepreload" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/storage.min.js" integrity="sha384-I68UpwZkgCfB4R68KBk7oSjwdRZqI+8zHf73gCvG+J2YFk5fxD3kBQjgt45dGk0Z">
  <script type="module" src="index.js"></script>
</head>
```

```javascript
// integrity.js: import map with the SRI hashes of the CrootJS modules. A classic script loaded
// first, because Firefox ignores an import map added after a module or preload started loading.
const map = document.createElement("script");
map.type = "importmap";
map.textContent = JSON.stringify({
    integrity: {
        "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.min.js": "sha384-FkrcJYDj82Td9axSh3O+A2TIpwCIg67PsrurLGMr5vk4KnL8c+zONZlBbaMEU0Cy",
        "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/storage.min.js": "sha384-I68UpwZkgCfB4R68KBk7oSjwdRZqI+8zHf73gCvG+J2YFk5fxD3kBQjgt45dGk0Z"
    }
});
document.currentScript.after(map);
```

- List every module the page imports **and** the ones in the "Also loads" column (`openapi.js` also loads `yaml.js` and `markdown.js` when needed). A module missing from the list still loads, just unchecked; `bump-pins.py` reports it.
- Put the same hash on `modulepreload`. Without it Chromium discards the preloaded copy and downloads the module again.
- Modules need no `crossorigin` (they are always requested with CORS). For CSS use `<link rel="stylesheet" href="…/croot.css" integrity="…" crossorigin="anonymous">` with `.css`, not `.min.css`: `croot.min.css` is minified by jsDelivr itself and isn't part of the release, so its hash is not guaranteed to stay the same.
- No need to write hashes by hand: write `integrity=""` or `"…/api.min.js": ""`, then run `bump-pins.py` (next section) to fill them in.
- Browsers that don't know `integrity` in import maps still load the modules, unchecked. If the page already has its own import map, add the `integrity` key there. The Draco decoder that `model3d.js` downloads from gstatic.com is not covered.

### Bumping versions with `bump-pins.py`

The version is written in several places (imports, `modulepreload`, `integrity.js`) and the hashes change with every version. Missing one means the same module is downloaded twice, or rejected by the browser. `tools/bump-pins.py` (just Python 3, no packages) replaces them all in a folder:

```sh
curl -fsSLO https://raw.githubusercontent.com/crootjs/lib/main/tools/bump-pins.py
python3 bump-pins.py latest .     # or a specific version: python3 bump-pins.py 0.0.42 .
```

Every `crootjs/lib@x.y.z` in `.html`, `.js`, `.md`, `.txt`, and `.json` files becomes the new version, and every `integrity` next to a CrootJS URL gets that version's hash (from `integrity.json`, or from the downloaded file for versions before 0.0.42). If one hash can't be fetched, no file is written. `latest` reads https://croot.js.org/lib/version.json.

To get a pull request for every new version (like Dependabot), copy this workflow into your repo. In Settings → Actions → General, enable "Allow GitHub Actions to create and approve pull requests". Pull requests opened with `github.token` don't trigger other workflows, so your CI won't run on them automatically.

```yaml
# .github/workflows/crootjs.yml
name: crootjs
on:
  schedule:
    - cron: "0 2 * * 1"
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - env:
          GH_TOKEN: ${{ github.token }}
        run: |
          VERSION=$(curl -fsS https://croot.js.org/lib/version.json | jq -r .version)
          branch="crootjs-$VERSION"
          if git ls-remote --exit-code origin "refs/heads/$branch" > /dev/null; then exit 0; fi
          curl -fsSL https://raw.githubusercontent.com/crootjs/lib/main/tools/bump-pins.py -o /tmp/bump-pins.py
          python3 /tmp/bump-pins.py "$VERSION" .
          if git diff --quiet; then exit 0; fi
          git config user.name "github-actions[bot]"
          git config user.email "41898341+github-actions[bot]@users.noreply.github.com"
          git switch -c "$branch"
          git commit -am "CrootJS $VERSION"
          git push origin "$branch"
          gh pr create --title "CrootJS $VERSION" --body "https://github.com/crootjs/lib/releases/tag/v$VERSION"
```

## Module Reference

Per-module documentation for `crootjs/lib`:

- [api.js](api/) — `getJSON`, `postJSON`, `putJSON`, `deleteJSON` (callback or `await`, headers, timeout, cancellation, ETag cache), `uploadFile` with progress, `downloadFile`
- [element.js](element/) — `onClick`, `setInner`, `getValue`, `serializeForm`, `fillForm`, and other DOM helpers
- [croot.css](css) — small, green CSS framework (~2 KB gzipped): plain HTML looks finished without classes, plus layout (`.container`, `.stack`, `.cluster`, `.grid`), cards, badges, alerts, navigation, dark mode, and theming through CSS variables; optional `icons.css` (49 icons, ~1.9 KB gzipped)
- [ui.css, themes.css, tabs.js](ui) — optional app components (shell with sidebar, tabs, menus, accordion, summary numbers, switch, steps, and more), four themes with character (`kampus`, `kertas`, `kontras`, `niaga`), `initTabs`, and copy-ready [page patterns](https://croot.js.org/examples/pola/)
- [form.js](form) — form validation with a message under each field, screen-reader friendly (`handleForm`, `validateForm`, `clearFormErrors`)
- [router.js](router) — single-page app router: hash/history mode, `:id` params, query, 404 page, async handlers, focus and `aria-current` (`startRouter`)
- [table.js](table) — data table: per-column sort, search, pagination, server mode; replaces jQuery DataTables (`createTable`)
- [chart.js](chart) — hand-written SVG bar, line, and donut charts: round-number axes, Indonesian number format, dark mode, accessible data table and keyboard tooltips (`createChart`)
- [markdown.js](markdown) — Markdown to safe HTML (raw HTML escaped, dangerous URLs rejected), render into an element, load `.md` files (`markdownToHTML`, `renderMarkdown`, `getMarkdown`)
- [qr.js](qr) — QR codes as SVG, written from scratch (`renderQR`, `qrSVG`, `qrMatrix`)
- [openapi.js](openapi) — API documentation from `openapi.yaml`/`.json`, a Swagger UI replacement, with `api.js` code and a try-it button per operation (`renderOpenAPI`, `loadOpenAPI`, `openAPIExample`); its YAML parser is `yaml.js` (`parseYAML`)
- [cookie.js](cookie) — set/get/delete cookies
- [storage.js](storage) — set/get/delete data in localStorage & sessionStorage (with an optional expiry)
- [debounce.js](debounce) — `debounce`/`throttle` to limit how often a function runs (search-as-you-type, scroll, etc.)
- [toast.js](toast) — lightweight notifications with no external dependency (`toast`, `toastSuccess`, `toastError`, `toastWarning`, `toastInfo`)
- [pwa.js and serviceworker.js](pwa) — installable apps that still open without internet: a service worker on your own domain, new-version notice, online/offline status, install button (`registerServiceWorker`, `installButton`, `crootjsServiceWorker`)
- [geo.js](geo) — read GeoJSON geospatial data from a URL or a local file (`getGeoJSON`, `readGeoJSONFile`, `parseGeoJSON`), plus bounding box, center point, and property list
- [map.js](map) — interactive maps with no external library: tile basemaps (OpenStreetMap), GeoJSON drawing, popups, coordinate clicks, right-click, named layers, labels, hover, basemap switching, canvas renderer (`createMap`, `addGeoJSON`, `fitMap`, `onMapClick`, `onMapContextMenu`, `showLayer`, `setTiles`)
- [mapmarker.js](mapmarker) — `map.js` add-on: pin markers, icons, or your own element, with labels, popups, and dragging (`addMarker`)
- [mapcontrol.js](mapcontrol) — `map.js` add-on: scale bar, "my location", live tracking, basemap picker (list or picture cards), layer checklist, coordinates, right-click menu, and fullscreen (`addScaleBar`, `addLocateButton`, `locateUser`, `addTrackButton`, `trackUser`, `addBasemapControl`, `setBasemap`, `addLayerControl`, `addCoordinateControl`, `addContextMenu`, `addFullscreenButton`)
- [maptools.js](maptools) — `map.js` add-on: distance and area measuring tools (keyboard included), georeferenced images with rotation, PNG export (`addMeasureControl`, `addImageOverlay`, `exportMapImage`)
- [mapcluster.js](mapcluster) — `map.js` add-on: point clustering for very large point datasets (`addCluster`)
- [mapsearch.js](mapsearch) — `map.js` add-on: find places by name/address and the address at a point (Nominatim/OSM or your own provider), plus a search box (`searchPlace`, `reverseGeocode`, `addSearchControl`)
- [mapoffline.js](mapoffline) — `map.js` add-on: basemap from a single raster or vector PMTiles file, from a server or from a file on the device with no internet (`openPMTiles`)
- [mapcache.js](mapcache) — `map.js` add-on: tiles you have viewed are stored in the browser and keep showing while offline, plus area download for your own tile server (`cachedTiles`)
- [mapvector.js](mapvector) — MVT vector tiles drawn in the browser, with a replaceable style (`decodeMVT`, `renderVectorTile`, `DEFAULT_VECTOR_STYLE`)
- [mapmodel.js](mapmodel) — `map.js` add-on: a glTF/GLB 3D model at its location on the map, true to scale in meters (`addModel`)
- [mapdraw.js](mapdraw) — `map.js` add-on: draw points, lines, and polygons (keyboard included), then reshape them (move, add, delete vertices); the result is GeoJSON (`addDrawControl`, `startDrawing`, `editFeature`)
- [mapheat.js](mapheat) — `map.js` add-on: point-density heatmaps and square/hexagon grid maps colored by value, like signal coverage maps (`addHeatmap`, `addGridMap`)
- [model3d.js](model3d) — glTF/GLB 3D model viewer without Three.js (WebGL2, WebGL1 fallback): rotate/zoom, click parts, change colors, hide, position/rotate from code (`createViewer`, `loadModel`, `onModelClick`, `setPartColor`, `setPartVisible`, `setPartTransform`, `fitView`)
- [model3dtools.js](model3dtools) — `model3d.js` add-on: HTML labels pinned to the model, move/rotate/scale gizmo, glTF animation, exploded view, cross-sections, distance and angle measurement, AR inside the page (WebXR) or Scene Viewer/Quick Look, `.glb` export (`addHotspot`, `enableTransform`, `playAnimation`, `explodeModel`, `addSection`, `measureModel`, `startAR`, `addARButton`, `exportGLB`, `downloadGLB`)
- [geomeasure.js](geomeasure) — distance, length, area, point-in-area, nearest point, radius circle, conversion from a local grid (`getDistance`, `getArea`, `isInside`, `createCircle`, `createAffineTransform`, ...)
- [georoute.js](georoute) — shortest route along the lines in GeoJSON data, computed in the browser (`findRoute`)
- [url.js](url) — protocol, host, path, query string, hash, redirect
- [validate.js](validate) — input validation & formatting (username, phone number, Rupiah)
- [websocket.js](websocket) — open/close WebSocket connections
- [stp.js](stp) — send/verify/resend WhatsApp OTP
- [useragent.js](useragent) — mobile device detection
- [trace.js](trace) — track click/touch coordinates
- [image.js](image) — random colors (hex & color names)
- [loading.js](loading) — loading spinner SVG asset
- [mongo.js](mongo) — MongoDB `ObjectId` helpers (browser-only, no DB connection)

See also: [lib source code](https://github.com/crootjs/lib) and [implementation examples](https://github.com/crootjs/examples).

## Coding Conventions (Mandatory)

All code that uses CrootJS — written by humans or by AI coding agents — **must** keep HTML, CSS, and JS in separate files, and JS must be loaded as `type="module"` (except `integrity.js` for [SRI](#locking-file-contents-with-integrity-sri)). No inline `<style>`/`<script>` and no `onclick`/`style=""` attributes in HTML.

Read the full rules & rationale: **[conventions.md](../conventions)**.

Using an AI coding agent? Download [`CLAUDE.md`](https://raw.githubusercontent.com/crootjs/lib/main/CLAUDE.md) and put it in your project root — Claude Code follows these rules automatically.

## Landing Page

Building an initial landing page at alamat.github.io

Open the prompt
```txt
buatkan landing page yang responsif untuk platform digital kampus dengan menggunakan HTML, CSS dan JS ES6+ Module dilengkapi dengan meta tag untuk sosial media (termasuk sharing whatsapp yang tampil gambar, judul dan deskripsinya ketika di share)
```

Human in the loop:
1. Make sure the meta tags are present
   ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrootSS | CSS Mobile Friendly Responsive Component and Template</title>
    <link rel="stylesheet" href="croot.css">

        <meta name="description" content="CrootSS: CSS Mobile Friendly Responsive Component and Template." />
        <meta name="keywords" content="CrootSS, CSS, Template, Responsive, Template, Vanilla, html, CSS lib" />
        <meta property="og:image" content="/crootss.png" />
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:image" content="https://crootss.if.co.id/crootss.jpeg" />
        <meta property="og:url" content="https://crootss.if.co.id" />
        <meta property="og:type" content="website" />

        <!-- Twitter Meta Tags (optional) -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:image" content="https://www.do.my.id/crootss.jpeg" />
    
    </head>
    <body>
    </body>
    </html>
   ```
2. Make sure there is a robots.txt
   ```txt
   User-agent: *
   Allow: /
   Sitemap: https://alamat.github.io/sitemap.xml
   ```
3. Make sure there is a sitemap.xml
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
    <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <url>
    <loc>https://www.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>1.00</priority>
    </url>
    <url>
    <loc>https://katalog.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://penulis.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://www.bukupedia.co.id/p/layanan.html</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>

    </urlset>
   ```
4. Make sure you have uploaded the favicon.ico file first
5. Make sure you create a [404.html](../404.html) file

## Login Using WhatsAuth

The WhatsAuth API can be used to implement SSO, QR login, and Google Sign-In. Create a new repo containing:
1. index.html: the main HTML file that loads the QR and GSI JS
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>WhatsAuth | Free WhatsApp API OTP Notif Broadcast Gratis</title>
       <link href="style.css" rel="stylesheet">
   	<script src="main.js" type="module"></script>
   </head>
   <body>
    <div id="hasphonenumber" class="w-full h-screen bg-blue-100 flex items-center justify-center">
        <div class="w-96 bg-white rounded-xl">
            <p class="font-bold text-center mb-4" id="useracclog">Tap/Scan dengan <a href="./camwab.jpg" target="_blank">Camera WA</a></p>
            <div class="flex justify-center mt-2 mb-4" id="whatsauthqr">
                <img src="loading.svg">
            </div>
            <p class="font-bold text-center mb-4" id="whatsauthcounter">counter</p>
            <p class="font-bold text-center mb-4" id="logs"><a href="https://wa.my.id">WhatsAuth Free WhatsApp Notif, OTP, API Gateway Gratis</a></p>
        </div>
    </div>
   </body>
   </html>   
   ```
2. main.js: login setup using crootjs
   ```js
   import {qrController,deleteCookie,appendGoogleSignin} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/auth.js";
   import { wauthparam } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/config.js";
   
   wauthparam.auth_ws="d3NzOi8vYXBpLndhLm15LmlkL3dzL3doYXRzYXV0aC9wdWJsaWM=";
   wauthparam.keyword="aHR0cHM6Ly93YS5tZS82MjgzMTMxODk1MDAwP3RleHQ9d2g0dDVhdXRoMA==";
   wauthparam.tokencookiehourslifetime=18;
   wauthparam.redirect ="/auth"
   deleteCookie(wauthparam.tokencookiename);
   qrController(wauthparam);
   
   const url="https://asia-southeast2-awangga.cloudfunctions.net/bukupedia/auth/users";

   const client_id="239713755402-4hr2cva377m43rsqs2dk0c7f7cktfeph.apps.googleusercontent.com";

   // Call the function that appends the element
   appendGoogleSignin(client_id,url);
   ```
   Change the `wauthparam.keyword` variable to match the number registered with WhatsAuth. Use Base64 decode and encode to update the keyword string above.
   ![image](https://github.com/user-attachments/assets/8e24a1ac-7249-45d3-8823-ee7f07c82058)  

For the additional files:
1. [style.css](../style.css)
2. [loading.svg](../loading.svg)

Don't forget to add your domain in the Console under APIs & Services - Client ID for Web application  
![image](https://github.com/user-attachments/assets/12191720-6f6c-4155-bf75-d966b0f60c4c)

## Auth Repo

To authorize between the frontend and the backend, you need one additional repo named auth (set in the qr.js settings as /auth).
In the index.html file
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="index.js" type="module"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang di Naskah Bukupedia</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="scene">
        <div class="shadow"></div>
        <div class="jumper">
          <div class="spinner">
            <div class="scaler">
              <div class="loader">
                <div class="cuboid">
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
</body>
</html>
```

In the index.js file
```js
import {getCookie} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/cookie.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/api.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/url.js";

if (getCookie("login")){
    getJSON("https://asia-southeast2-awangga.cloudfunctions.net/florka/data/user",responseFunction,"login",getCookie("login"));
}else{
    redirect("/login");
}


function responseFunction(result){
    console.log(result);
    if (result.status === 200){
        redirect("/dashboard");
    }else{
        redirect("/daftar");
    }
}
```
and the [style.css](../auth/style.css) file

## Integrating WhatsAuth with JSCroot and GOCroot

[![Tutorial Web](https://img.youtube.com/vi/LDQ8Ty8B9eM/0.jpg)](https://www.youtube.com/watch?v=LDQ8Ty8B9eM)  

For your own development, see the [WebHook Deployment Guide](/webhook)
