# `mapcache.js` Module Documentation

*[Bahasa Indonesia](../mapcache)*

`mapcache.js` is an add-on module for [`map.js`](map) that stores **every base map tile that has been viewed** in the browser's Cache Storage. When the signal drops, or the tile server does not respond, that area is still displayed from the stored tiles. Suited to field staff who open the map at the office and then head out to an area with no signal.

Unlike [`mapoffline.js`](mapoffline), there is no PMTiles file to prepare: an ordinary OpenStreetMap map works as is, and only the areas that have actually been opened are stored.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/map.js";
import { cachedTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/mapcache.js";

createMap("map", { tiles: cachedTiles(), center: [107.6, -6.9], zoom: 14 });
```

The OpenStreetMap attribution is still added automatically.

## `cachedTiles(template, options)`

Creates a cached tile source, for the `tiles` option of [`createMap`](map#createmapid-options) or [`setTiles`](map#settilesid-tiles-options).

`template`: a tile URL pattern, like the `tiles` option of `createMap` (`{z}`, `{x}`, `{y}`, `{s}`, `{-y}`). Default: OpenStreetMap. The tile server must allow CORS; OpenStreetMap and Esri do.

| Option | Default | Description |
|---|---|---|
| `name` | `"crootjs-tiles"` | Cache name. Use a different one for each base map |
| `maxAge` | `7` | Days before a tile is considered stale and fetched again while online. For the OpenStreetMap servers, do not go below 7, per their [usage policy](https://operations.osmfoundation.org/policies/tiles/) |
| `maxTiles` | `5000` | Maximum number of tiles stored; the oldest are discarded. An OSM tile is typically a few tens of KB |
| `subdomains` | `["a", "b", "c"]` | Same as the `createMap` option |
| `attribution` | — | Base map attribution (text or element). For the default template, the OpenStreetMap attribution is added by `map.js` |

How a tile is fetched:

1. A stored tile that is not older than `maxAge` is used directly, without a request.
2. Otherwise the tile is fetched from the server and then stored.
3. If the server is unreachable or the browser is offline, the old tile is still used even if it is past `maxAge`.

The result is an object with extra functions:

| Function | Description |
|---|---|
| `count()` | Promise of the number of stored tiles |
| `clear()` | Deletes all tiles in this cache |
| `downloadArea(bounds, minZoom, maxZoom, onProgress)` | Downloads all tiles in an area in advance (see below) |

```javascript
const tiles = cachedTiles();
createMap("map", { tiles, center: [107.6, -6.9], zoom: 14 });

console.log(await tiles.count(), "tiles stored");
```

### `downloadArea(bounds, minZoom, maxZoom, onProgress)`

Downloads the tiles in `bounds` `[minLng, minLat, maxLng, maxLat]` from `minZoom` to `maxZoom` before you set out, so the whole area is available without having to open it piece by piece. At most 10,000 tiles per call. `onProgress(done, total)` is called each time a tile finishes. Returns a Promise of `{ total, saved, failed, error }`.

**Only for your own tile server or a provider that allows it.** The OpenStreetMap policy forbids bulk downloading from `tile.openstreetmap.org`, so the default template is refused (`error` holds the reason, and no request is made).

```javascript
import { getMapBounds } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/map.js";
import { onClick, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/element.js";

const tiles = cachedTiles("https://tiles.example.com/{z}/{x}/{y}.png", { name: "agency-map", attribution: "© Public Works Agency" });
createMap("map", { tiles, center: [107.6, -6.9], zoom: 14 });

onClick("save-area", async () => {
    const result = await tiles.downloadArea(getMapBounds("map"), 12, 17, (done, total) => {
        setInnerText("status", `${done} / ${total} tiles`);
    });
    setInnerText("status", result.error || `${result.saved} tiles stored, ${result.failed} failed`);
});
```

## Notes

- This module only guarantees the tiles. Your own page, CSS, and JS must still be loadable without internet: from the browser cache, a WebView app, or your own *service worker*/PWA. No service worker is provided here, because its file has to live on your own site's domain, not be imported from jsDelivr.
- Cache Storage only exists on `https` and `localhost` pages. Elsewhere, tiles load normally without being stored, with a warning in the console.
- The browser may clear the cache when the device is nearly out of storage. `navigator.storage.persist()` asks the browser not to clear it.
- Tiles are stored per URL, so with varying `{s}` values a tile only counts as the same tile if its subdomain is the same. For OpenStreetMap (no `{s}`) this is not an issue.
