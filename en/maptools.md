*[Bahasa Indonesia](../maptools)*

# `maptools.js` Module Documentation

`maptools.js` is an add-on module for [`map.js`](map) with tools for technical and survey maps: **distance and area measurement**, **georeferenced images** (for example a master plan or a scanned floor plan, which can be rotated), and **exporting the map view to PNG** for reports. It is kept separate from `map.js` so pages that don't use it don't have to download it (about 5 KB gzip, plus [`geomeasure.js`](geomeasure) for the distance and area calculations).

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addMeasureControl, measure, addImageOverlay, exportMapImage, downloadMapImage } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/maptools.js";
```

The map must already have been created with `createMap`.

## `addMeasureControl(id, options)`

Adds two buttons — **measure distance** and **measure area** — along with a result box. After clicking a button, click points on the map; the result updates with every point. Finish with a double-click, Enter, or the **Selesai** ("Done") button (required on touch screens, which have no double-click). **Hapus titik** ("Remove point", or Backspace) removes the last point; **Tutup** ("Close", or Esc) clears the measurement.

While measuring, map clicks do not open popups and are not passed on to `onMapClick`, and double-clicks do not zoom.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `corner` | `"top-left"` | Map corner |
| `onResult` | — | Function `(result)` called every time a measurement finishes; `result` is the same as in `measure` |

Returns a `remove()` function.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addMeasureControl("peta", {
    onResult: (result) => console.log(result.text), // "886 m" or "19,64 ha · keliling 1,77 km"
});
```

## `measure(id, type, responseFunction, options)`

A measuring tool without buttons, for your own custom interface. `type` is `"distance"` (distance along the points) or `"area"` (area of the polygon formed by those points). It is used on the map the same way as `addMeasureControl`.

`responseFunction` (optional) is called once when the measurement finishes, with:

| Key | Content |
|---|---|
| `type` | `"distance"` or `"area"` |
| `feature` | The measured GeoJSON `LineString` or `Polygon` Feature — can be saved directly or drawn with `addGeoJSON` |
| `length` | Length (distance), or perimeter (area), in meters |
| `area` | Area in square meters (`0` for distance) |
| `text` | Display-ready text, for example `"1,25 km"` or `"850 m² · keliling 120 m"` ("keliling" = perimeter) |

…or `null` if the measurement was cancelled (Esc, `stop()`, or another measurement was started).

`options.onChange` (optional) is called with the same content every time a point is added or removed.

Returns `{ finish(), undo(), stop() }`. The measured shape stays drawn after finishing, until `stop()` is called or a new measurement starts.

```javascript
const pengukur = measure("peta", "distance", (result) => {
    if (!result) return; // cancelled
    setValue("panjang-fiber", Math.round(result.length));
});
// ...
pengukur.stop();
```

`formatLength(meters)` and `formatArea(squareMeters)` — which are used for `text` — are exported too: `formatLength(12345)` → `"12,35 km"`, `formatArea(24500)` → `"2,45 ha"`.

## `addImageOverlay(id, url, options)`

Places an image (PNG, JPG, SVG) on the map: above the basemap, below the data. The image pans and zooms along with the map. Its position is set by one of:

| Option | Description |
|---|---|
| `bounds` + `rotation` | `[minLng, minLat, maxLng, maxLat]`, plus `rotation` in degrees (clockwise, rotating around the image center). Suitable when the image is already roughly north-up |
| `corners` | The image's `[topLeft, topRight, bottomLeft]`, each `[lng, lat]`. These three points determine rotation, scale, and skew all at once |

Other options: `opacity` (0–1, default 1), `alt`, and `crossOrigin: true` (see PNG export below).

Returns `{ setCorners(corners), setBounds(bounds, rotation), setOpacity(opacity), remove() }` — for example for a transparency slider.

```javascript
const masterPlan = addImageOverlay("peta", "img/master-plan.png", {
    bounds: [107.5735, -6.8760, 107.5785, -6.8712],
    rotation: 12,
    opacity: 0.7,
});
masterPlan.setOpacity(0.4);
```

**From control points.** If what you know is a few points on the image (pixels) along with their lng/lat, build the transformation with [`createAffineTransform`](geomeasure#createaffinetransformfrom-to) and then compute the three corners:

```javascript
import { createAffineTransform } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geomeasure.js";

// A 2400 x 1600 pixel image; three points recognized on both the image and the map.
const piksel = [[310, 220], [2105, 260], [400, 1390]];
const lokasi = [[107.57402, -6.87188], [107.57791, -6.87201], [107.57417, -6.87458]];
const pikselKeLokasi = createAffineTransform(piksel, lokasi);

addImageOverlay("peta", "img/denah.png", {
    corners: [pikselKeLokasi([0, 0]), pikselKeLokasi([2400, 0]), pikselKeLokasi([0, 1600])],
});
```

**PDF.** Browsers cannot place a PDF directly as an image. Convert the page to PNG first — with any PDF application, or in the browser with pdf.js — then place the PNG.

## `exportMapImage(id, responseFunction, options)` and `downloadMapImage(id, filename, responseFunction, options)`

`exportMapImage` turns the current map view into a PNG image. `responseFunction(blob, info)` is called once: `blob` contains the PNG (or `null` on failure), and `info` = `{ width, height, missingImages }` — `missingImages` is the number of images that had to be skipped.

`downloadMapImage` does the same and then immediately downloads it as a file (default `"peta.png"`).

```javascript
downloadMapImage("peta", "lokasi-proyek.png");

exportMapImage("peta", (blob, info) => {
    if (!blob) return;
    if (info.missingImages > 0) console.log(info.missingImages, "images not included (server without CORS)");
    // for example, send it to the server as a report attachment
});
```

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `scale` | `devicePixelRatio` | Resolution multiplier. `2` = an image twice as sharp (and larger) |
| `attribution` | `true` | `false` = no attribution text. The OpenStreetMap license requires attribution on published images |

**Included**: the basemap, overlay images, all GeoJSON layers (SVG and canvas), feature labels, markers (default pin, image icon, or custom element) with their labels, [`mapcluster.js`](mapcluster) bubbles, [`mapheat.js`](mapheat) heatmaps and grid maps, the location marker, measuring tool results, the scale bar, and attribution.
**Not included**: popups, and control buttons and panels.

Labels and HTML elements are drawn from the **browser's computed CSS**, so labels with a box background look the same as on screen: `background-color`, `border`, `border-radius`, `padding`, alignment, multi-line text (`white-space: pre`), `opacity`, and `::before`/`::after` content (for example a 📷 icon). `text-shadow` becomes a halo around the text; if its color is too similar to the text color (for example white text with a white shadow), the halo is replaced with a contrasting color so it stays legible. Not yet drawn: `box-shadow`, gradient or image backgrounds, and elements rotated with `transform`.

Browsers only allow images from other domains into a PNG if the server permits **CORS**. OpenStreetMap and Esri tiles permit it. Tiles from servers that don't are skipped (counted in `missingImages`) — the rest is still produced. For overlay images from another domain, pass `crossOrigin: true` to `addImageOverlay`, and the server must send CORS headers.

## Notes

- The measuring tools and `exportMapImage` use the `crootjsMap` interface from a `map.js` of the same version. Import all map modules from the same version tag.
- Distance and area are computed on a spherical Earth as in [`geomeasure.js`](geomeasure) — the results match Turf.js, and are accurate enough for planning (cable length, zone area), not for official land boundary surveys.
- Only one measurement runs at a time per map; starting a new one cancels the old one.
