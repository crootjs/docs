*[Bahasa Indonesia](../mapoffline)*

# `mapoffline.js` Module Documentation

`mapoffline.js` is an add-on module for [`map.js`](map) that displays a base map from **a single [PMTiles](https://docs.protomaps.com/pmtiles/) file** — a single-file format for map tiles. That file can be:

- placed on an ordinary server (S3, Cloudflare R2, nginx) without a tile server: the browser reads only the pieces it needs via HTTP Range; or
- picked from the device with `<input type="file">` — the map then runs **with no internet at all**, ideal for surveys in areas without signal.

Only PMTiles version 3 containing **raster** tiles (PNG, JPEG, WebP, AVIF). Vector tiles (MVT) are not yet supported. Its size is about 2 KB gzip.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapoffline.js";
```

## `openPMTiles(source, responseFunction)`

Opens a PMTiles file. `source`: a URL, or a `File`/`Blob`.

`responseFunction(archive, error)` is called once; the function also returns a Promise of `archive`. On failure (not PMTiles, a different version, vector tiles, unsupported compression, server refused), `archive` = `null` and `error` holds the reason.

`archive` can be used directly as the `tiles` option in [`createMap`](map#createmapid-options) or [`setTiles`](map#settilesid-tiles-options):

| Key | Contents |
|---|---|
| `getTile(z, x, y)` | Promise of the tile image `Blob`, or `null` if the file has no tile there |
| `minZoom`, `maxZoom` | Zoom range present in the file |
| `bounds` | `[minLng, minLat, maxLng, maxLat]` the file's coverage |
| `center`, `centerZoom` | Center point and zoom suggested by the file |
| `tileType` | `"image/png"`, `"image/jpeg"`, `"image/webp"`, or `"image/avif"` |
| `metadata`, `attribution` | JSON metadata inside the file, and its attribution if any |

```javascript
const arsip = await openPMTiles("https://contoh.id/peta/bandung.pmtiles");
createMap("peta", {
    tiles: arsip,
    maxNativeZoom: arsip.maxZoom, // above this, the last tiles are scaled up
    maxZoom: arsip.maxZoom + 2,
    center: arsip.center,
    zoom: arsip.centerZoom,
    attribution: arsip.attribution || "© OpenStreetMap contributors",
});
```

### Without internet

```html
<input type="file" id="berkas" accept=".pmtiles">
<div id="peta" class="peta"></div>
```

```javascript
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";
import { setTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";

createMap("peta", { tiles: false, center: [107.6, -6.9], zoom: 12 });
onChange("berkas", async () => {
    const arsip = await openPMTiles(document.getElementById("berkas").files[0]);
    if (arsip) setTiles("peta", arsip, { maxNativeZoom: arsip.maxZoom });
});
```

A file from `<input type="file">` is read directly from the device, so once the page is open the map keeps working even if the signal drops. To make the page itself open without internet too, install a *service worker* or save the page as a PWA.

## Creating PMTiles files

- [`pmtiles convert`](https://docs.protomaps.com/pmtiles/cli) converts a raster MBTiles file into PMTiles.
- Tiles downloaded with tools such as QGIS ("Generate XYZ tiles" to MBTiles) can be converted the same way.
- Make sure the source tiles' license allows storing them for offline use.

## Notes

- Supported directory compression: none and gzip (the `pmtiles` default). Brotli and zstd are not yet supported.
- The server must allow the `Range` header and, for other domains, CORS. Servers that ignore `Range`, or serve it incorrectly, still work: the whole file is downloaded once and then read from memory (with a console warning).
- **GitHub Pages** is one that gets it wrong: `.pmtiles` files are gzip-compressed and the range is cut from the compressed bytes, so the pieces are corrupt. There the file is downloaded whole — fine for small files like the example (about 700 KB), but put large files on Cloudflare R2, S3, or your own server.
- Tiles are displayed via *object URLs* that are released again when a tile leaves the screen, so memory does not keep growing.
