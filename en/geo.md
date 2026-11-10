*[Bahasa Indonesia](../geo)*

# `geo.js` Module Documentation

`geo.js` is the CrootJS module for reading geospatial data. The currently supported format is **GeoJSON** ([RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)): fetch it from a URL, read it from a file the user picks, validate it, then summarize its contents (bounding box, center point, property names).

Whatever the data's source and shape, the result you receive is always the same: a `FeatureCollection` in which every feature has `properties` as an object. So the code that follows only needs to be written for one shape.

## Usage (Import)

```javascript
import { getGeoJSON, getBBox, getPropertyKeys } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geo.js";
```

## Fetching from a URL

### `getGeoJSON(target_url, responseFunction, tokenkey?, tokenvalue?)`

Fetches GeoJSON from `target_url`. The parameter order is the same as `getJSON` in [`api.js`](api/), and `responseFunction` is **always** called with `{ status, data }`:

| Event | `status` | `data` |
|---|---|---|
| Success, the content is GeoJSON | HTTP code (e.g. `200`) | `FeatureCollection` |
| The server responded, but the content is not GeoJSON | HTTP code (e.g. `200`, `404`) | `null` |
| Network failure, CORS rejected, or more than 15 seconds elapsed | `0` | `null` |

```javascript
import { getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geo.js";

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (response.status === 0) {
        console.log("Request gagal: cek koneksi, atau server tidak mengizinkan CORS.");
        return;
    }
    if (!response.data) {
        console.log("Bukan GeoJSON, status:", response.status);
        return;
    }
    response.data.features.forEach((feature) => {
        console.log(feature.geometry.type, feature.properties.Gedung);
    });
    // Polygon Rektorat
    // Point ULBI
    // Polygon Auditorium
});
```

**GitHub file page links can be used directly.** An address of the form `https://github.com/<owner>/<repo>/blob/<ref>/<path>` (the one you copy from the address bar) actually responds with an HTML page, not the file contents. `getGeoJSON` automatically rewrites it to a `raw.githubusercontent.com` address before fetching the data.

**Why not `getJSON` from `api.js`?** `getJSON` always sends a `Content-Type` header, so the browser first sends a CORS *preflight*. Static file hosts such as `raw.githubusercontent.com` reject that preflight, so `getJSON` ends with `status: 0` even though the file exists. `getGeoJSON` sends no extra headers at all — unless you fill in `tokenkey` and `tokenvalue` — so static files can be fetched directly.

With a token (for your own backend):

```javascript
import { getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geo.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js";

getGeoJSON("https://api.example.com/lokasi", tampilkan, "login", getCookie("login"));

function tampilkan(response) {
    console.log(response.status, response.data);
}
```

## Reading a local file

### `readGeoJSONFile(id, responseFunction)`

Reads the file the user picked in `<input type="file" id="...">`. The file is read directly in the browser and is not uploaded anywhere. `responseFunction` is called with a `FeatureCollection`, or `null` if no file has been picked yet, the file could not be read, or its content is not GeoJSON.

```html
<!-- index.html -->
<input id="berkas" type="file" accept=".geojson,.json">
<script type="module" src="index.js"></script>
```

```javascript
// index.js
import { readGeoJSONFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geo.js";
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

onChange("berkas", () => {
    readGeoJSONFile("berkas", (data) => {
        if (!data) {
            console.log("File itu bukan GeoJSON.");
            return;
        }
        console.log(data.features.length, "fitur");
    });
});
```

## Parsing data you already have

### `parseGeoJSON(input)`

Use this when you already have the data in hand — for example text from a `<textarea>`, or an object from another API response. `input` may be JSON text or an object produced by `JSON.parse`. Returns a `FeatureCollection`, or `null` if `input` is not GeoJSON. `getGeoJSON` and `readGeoJSONFile` use this function internally.

Accepted input shapes:

| Input | Result |
|---|---|
| `FeatureCollection` | The same `FeatureCollection` (other members such as `name` are preserved) |
| A single `Feature` | A `FeatureCollection` containing that one feature |
| A single bare geometry (`Point`, `LineString`, `Polygon`, `Multi*`, `GeometryCollection`) | A `FeatureCollection` containing one feature with `properties: {}` |
| An array of `Feature`s/geometries (the shape backends typically return from a MongoDB query) | A `FeatureCollection` containing all of them |

```javascript
import { parseGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geo.js";

parseGeoJSON('{"type":"Point","coordinates":[107.575914,-6.8732098]}');
// { type: "FeatureCollection", features: [
//     { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [107.575914, -6.8732098] } }
// ] }

parseGeoJSON('{"error":"not found"}'); // null
parseGeoJSON("bukan json");            // null
```

What is guaranteed about the result:

- `feature.properties` is always an object. `properties: null` (valid in GeoJSON) is turned into `{}`, so `feature.properties.nama` never throws.
- `feature.geometry` can be `null` — GeoJSON allows features without a location. Check it before reading `feature.geometry.type`.
- Every geometry has a known `type` and `coordinates` containing numbers, with the array depth matching its type.
- The input object is not modified; the result is a new object.

Invalid items inside a `FeatureCollection` or array (for example coordinates given as the text `"107.5"` instead of a number) are **skipped**; they do not make the whole dataset fail. The indexes of skipped items are written to the console.

## Reading the data's contents

All the functions below accept the same input shapes as `parseGeoJSON` — the result of `getGeoJSON`, a single `Feature`, or a single geometry. The examples use `data` from [contoh.geojson](https://github.com/petapedia/geojson/blob/main/contoh.geojson).

### `getBBox(geojson)`

The bounding box of all the data: `[minLng, minLat, maxLng, maxLat]`. Returns `null` if the data has no coordinates at all.

```javascript
getBBox(data); // [107.5755063, -6.8739195, 107.5762898, -6.8732098]
```

### `getCenter(geojson)`

The center point of the bounding box as `[lng, lat]`, or `null` if the data has no coordinates. Handy for centering a map. This is the center of the box, not the *centroid* (center of mass) of the geometry.

```javascript
getCenter(data); // [107.57589805, -6.8735646500000005]
```

### `getPropertyKeys(geojson)`

The property names used by the features in the data, without duplicates, in order of first appearance. Useful for building a table header when not every feature has the same properties.

```javascript
getPropertyKeys(data); // ["Gedung", "Kampus"]
```

### `getCoordinates(geojson)`

Every position in the data, flattened into a single `[[lng, lat], ...]` array, regardless of geometry type.

```javascript
getCoordinates(data).length; // 11
```

### `toLatLng(position)`

Flips a single `[lng, lat]` position into `[lat, lng]`.

```javascript
toLatLng([107.575914, -6.8732098]); // [-6.8732098, 107.575914]
```

## Example: showing it on a map

To draw the data on a map, use [`map.js`](map) — CrootJS's own map module, with no external library. All `geo.js` functions are also exported from `map.js`, so a single import is enough:

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";

createMap("peta"); // the <div id="peta"> element must get a height from CSS

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (!response.data) return;
    addGeoJSON("peta", response.data);
    fitMap("peta", response.data);
});
```

Full example (URL, local file, map, and property table): [demo](https://croot.js.org/examples/geo/geojson/) · [source](https://github.com/crootjs/examples/tree/main/geo/geojson).

## Notes

- **GeoJSON coordinate order is `[longitude, latitude]`** — the reverse of what people usually write ("lat, long"). [`map.js`](map) uses the same order, so coordinates from the data can be used directly. Leaflet and Google Maps expect `[lat, lng]`; if you use either of them, flip the coordinates first with `toLatLng()`.
- `getGeoJSON` is subject to CORS. The server hosting the file must send the `Access-Control-Allow-Origin` header; otherwise the result is `status: 0`. GitHub (`raw.githubusercontent.com`), GitHub Pages, and jsDelivr send it.
- Validation only checks the shape of the data (geometry type and `coordinates` structure). This module does not check whether polygon rings are closed, or whether coordinate values make sense (for example a latitude outside -90..90).
- `getBBox` computes the minimum and maximum values as they are, so data crossing the 180° meridian (the antimeridian) produces a box that stretches around the world.
- To compute things from the data — distance, area, point in area, nearest point — see [`geomeasure.js`](geomeasure); for routes along its lines, [`georoute.js`](georoute).
- Data shown on the page comes from outside. Set property values with `textContent`/`setInnerText`, not `innerHTML`/`setInner`, so the content is not executed as HTML.
