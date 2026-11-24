# `mapoffline.js` Module Documentation

*[Bahasa Indonesia](../mapoffline)*

`mapoffline.js` is an add-on module for [`map.js`](map) that displays a base map from **a single [PMTiles](https://docs.protomaps.com/pmtiles/) file** — a single-file format for map tiles. That file can be:

- placed on an ordinary server (S3, Cloudflare R2, nginx) without a tile server: the browser reads only the pieces it needs via HTTP Range; or
- picked from the device with `<input type="file">` — the map then runs **with no internet at all**, ideal for surveys in areas without signal.

PMTiles version 3 containing **raster** tiles (PNG, JPEG, WebP, AVIF) or, since 0.0.30, **vector** tiles (MVT). Vector tiles are drawn in the browser by [`mapvector.js`](mapvector): the file is much smaller for the same area, and the map stays sharp above the file's highest zoom.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/mapoffline.js";
```

## `openPMTiles(source, responseFunction, options)`

Opens a PMTiles file. `source`: a URL, or a `File`/`Blob`.

`responseFunction(archive, error)` is called once; the function also returns a Promise of `archive`. On failure (not PMTiles, a different version, unsupported compression, server refused), `archive` = `null` and `error` holds the reason.

`options` (optional, only affects vector tiles):

| Option | Default | Description |
|---|---|---|
| `language` | — | Language code for place names, e.g. `"id"`: uses `name:id` if present in the data, otherwise `name` |
| `style` | default style | Your own style rules (see [`mapvector.js`](mapvector)) |
| `tileSize` | `512` | Image resolution of each tile in pixels; 512 is sharp on retina screens |
| `overzoom` | `4` | How many levels above the file's highest zoom are still drawn |

`archive` can be used directly as the `tiles` option in [`createMap`](map#createmapid-options) or [`setTiles`](map#settilesid-tiles-options):

| Key | Contents |
|---|---|
| `getTile(z, x, y)` | Promise of the tile image `Blob`, or `null` if the file has no tile there |
| `minZoom`, `maxZoom` | Zoom range. For vector tiles `maxZoom` already includes `overzoom` |
| `fileMaxZoom` | Highest zoom present in the file |
| `bounds` | `[minLng, minLat, maxLng, maxLat]` the file's coverage |
| `center`, `centerZoom` | Center point and zoom suggested by the file |
| `tileType` | `"image/png"`, `"image/jpeg"`, `"image/webp"`, `"image/avif"`, or `"mvt"` (vector) |
| `metadata`, `attribution` | JSON metadata inside the file, and its attribution as text (HTML tags stripped) if any |

Since 0.0.30 `map.js` applies `archive.attribution` itself when the `attribution` option is not set.

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

### Vector tiles

```javascript
const arsip = await openPMTiles("https://contoh.id/peta/bandung-vektor.pmtiles", null, { language: "id" });
createMap("peta", {
    tiles: arsip,
    maxZoom: arsip.maxZoom, // a file up to z15 stays sharp up to z19
    center: arsip.center,
    zoom: arsip.centerZoom,
});
```

The default style targets the [Protomaps Basemap](https://docs.protomaps.com/basemaps/layers) schema, used by files from `pmtiles extract` of the Protomaps world map. Files with other schemas still display, with a generic style (gray areas, lines, point labels). For your own colors, see [`mapvector.js`](mapvector).

### Without internet

```html
<input type="file" id="berkas" accept=".pmtiles">
<div id="peta" class="peta"></div>
```

```javascript
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/element.js";
import { setTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/map.js";

createMap("peta", { tiles: false, center: [107.6, -6.9], zoom: 12 });
onChange("berkas", async () => {
    const arsip = await openPMTiles(document.getElementById("berkas").files[0]);
    if (arsip) setTiles("peta", arsip, { maxNativeZoom: arsip.maxZoom });
});
```

A file from `<input type="file">` is read directly from the device, so once the page is open the map keeps working even if the signal drops. To make the page itself open without internet too, install a *service worker* or save the page as a PWA.

## Creating PMTiles files

- [`pmtiles extract`](https://docs.protomaps.com/pmtiles/cli) cuts a single city or province out of the Protomaps vector world map (`pmtiles extract https://build.protomaps.com/<date>.pmtiles bandung.pmtiles --bbox=107.5,-7.0,107.75,-6.8`). For reference, the official example of Florence up to zoom 15 is 6.6 MB.
- [`pmtiles convert`](https://docs.protomaps.com/pmtiles/cli) converts an MBTiles file (raster or vector) into PMTiles.
- Tiles downloaded with tools such as QGIS ("Generate XYZ tiles" to MBTiles) can be converted the same way.
- Make sure the source tiles' license allows storing them for offline use.

## Notes

- Supported compression: none and gzip (the `pmtiles` default). Brotli and zstd are not yet supported.
- Vector tiles are drawn in the browser every time a tile is displayed. Labels are only for points (place names, POIs), do not follow road lines, and labels cut off by a tile edge are not drawn.
- The server must allow the `Range` header and, for other domains, CORS. Servers that ignore `Range`, or serve it incorrectly, still work: the whole file is downloaded once and then read from memory (with a console warning).
- **GitHub Pages** is one that gets it wrong: `.pmtiles` files are gzip-compressed and the range is cut from the compressed bytes, so the pieces are corrupt. There the file is downloaded whole — fine for small files like the example (about 700 KB), but put large files on Cloudflare R2, S3, or your own server.
- Tiles are displayed via *object URLs* that are released again when a tile leaves the screen, so memory does not keep growing.
