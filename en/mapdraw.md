*[Bahasa Indonesia](../mapdraw)*

# `mapdraw.js` Module Documentation

`mapdraw.js` is an add-on module for [`map.js`](map) for **creating data** on the map, not just displaying it: draw points, lines, and polygons by clicking or tapping, then reshape them — drag vertices, add a vertex in the middle of a segment, delete vertices. The result is plain GeoJSON, ready to send to a server with [`postJSON`](api/) or to measure with [`geomeasure.js`](geomeasure).

Useful for field surveys, marking coverage areas, drawing routes, or lot boundaries. Works with mouse and touch screens.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addDrawControl, startDrawing, editFeature } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapdraw.js";
```

The map must already have been created with `createMap`.

## `addDrawControl(id, options)`

The quickest way: ready-made buttons in a corner of the map, along with a layer that displays the results.

| Button | Function |
|---|---|
| Point | Click the map to place a point. The tool stays active for the next point |
| Line | Click the points of the line; double-click or **Selesai** ("Done") to finish |
| Area | Click the boundary points; click the first point, double-click, or **Selesai** to close |
| Edit | Click a feature, then drag its handles (see [`editFeature`](#editfeatureid-feature-options)) |
| Delete | Click a feature to delete it |

The panel below the buttons shows instructions and the **Selesai** ("Done"), **Hapus titik** ("Remove point"), and **Batal** ("Cancel") buttons — required for touch screens, which have no double-click. Esc cancels.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `data` | — | Initial GeoJSON that can be edited and deleted |
| `tools` | all | List of buttons: `["point", "line", "polygon", "edit", "delete"]` |
| `properties` | `{}` | Properties for new features: an object, or `function (type) => object` |
| `corner` | `"top-left"` | Map corner |
| `onChange` | — | `function (featureCollection)` whenever the data changes: added, edited, or deleted |

Returns `{ getData(), setData(geojson), clear(), remove() }`. `getData()` returns a copy of the FeatureCollection.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addDrawControl } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapdraw.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/element.js";

createMap("peta", { center: [107.6, -6.9], zoom: 16 });
const gambar = addDrawControl("peta", {
    properties: (type) => ({ jenis: type, dibuat: new Date().toISOString() }),
});

onClick("simpan", async () => {
    const { status } = await postJSON("https://api.example.com/survei", gambar.getData(), null);
    console.log(status === 200 ? "Tersimpan" : "Gagal: " + status);
});
```

## `startDrawing(id, type, responseFunction, options)`

Draws **one** geometry, for your own custom interface. `type`: `"point"`, `"line"`, or `"polygon"` (or their GeoJSON names: `"Point"`, `"LineString"`, `"Polygon"`).

| Action | Result |
|---|---|
| Click / tap the map | Adds a point. A point (`"point"`) finishes immediately |
| Click the polygon's first point | Closes the polygon |
| Double-click, or Enter | Finish |
| Backspace | Removes the last point |
| Esc | Cancel |

While drawing, map clicks do not open popups and are not passed on to `onMapClick`; panning the map still works.

`responseFunction(feature)` is called once: with the resulting GeoJSON Feature, or `null` if cancelled. Coordinates are rounded to 7 decimal places (about 1 cm), and polygons are always closed (last point = first point).

`options` (all optional):

| Option | Description |
|---|---|
| `properties` | Properties of the resulting Feature: an object, or `function (type) => object` |
| `onChange` | `function (feature)` whenever a point is added or removed — `null` while there are not yet enough points |

Returns `{ finish(), undo(), stop() }` for your own Done, Remove point, and Cancel buttons.

```javascript
import { getArea } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/geomeasure.js";

onClick("gambar-kavling", () => {
    startDrawing("peta", "polygon", (feature) => {
        if (!feature) return; // cancelled
        setInnerText("luas", Math.round(getArea(feature)) + " m²");
    });
});
```

## `editFeature(id, feature, options)`

Shows handles for reshaping a geometry:

| Handle | Action |
|---|---|
| White circle at each vertex | Drag to move the vertex |
| Small orange circle at the middle of a segment | Drag to add a vertex there |
| Double-click a vertex (mouse), or long-press for 0.5 seconds (touch screen) | Deletes the vertex — lines need at least 2 vertices, areas 3 |

`feature` may be a Feature or just a geometry: `Point`, `LineString`, `Polygon`, or their `Multi` versions, including polygons with holes. The original data is not modified. Dragging a handle does not pan the map.

`options.onChange(feature)` is called after each drag, vertex addition, or vertex deletion, in the same shape as the input (a Feature stays a Feature, properties included).

Returns `{ getFeature(), stop() }`. Only one `editFeature` is active per map; calling it again stops the previous one.

```javascript
const editor = editFeature("peta", batasKavling, {
    onChange: (feature) => postJSON("https://api.example.com/kavling/7", feature, null),
});
onClick("selesai", () => editor.stop());
```

## Styling

Everything can be overridden from the page's CSS without `!important`.

| Class | Element |
|---|---|
| `svg.crootjs-draw` | Drawing layers (one for the drawing in progress, one for the `addDrawControl` results, one for the edit handles) |
| `.crootjs-draw-shape`, `.crootjs-draw-line` | Area/line; line without fill |
| `.crootjs-draw-preview` | Dashed guide line to the cursor position |
| `.crootjs-draw-editing` | The shape being edited |
| `circle.crootjs-draw-point` | Points from `addDrawControl` |
| `circle.crootjs-draw-vertex`, `-vertex-first` | Vertex; the polygon's first vertex (click to close) |
| `circle.crootjs-draw-midpoint` | Segment midpoint |
| `.crootjs-map-draw`, `.crootjs-map-draw-tool`, `.crootjs-map-draw-panel`, `.crootjs-map-draw-actions` | Control box, tool buttons (the active one has `aria-pressed="true"`), instruction panel, and its action buttons |

On touch screens the handles are automatically larger.

## Notes

- Drawings pan and zoom along with the map. The layers are SVG above the `addGeoJSON` data, so they are not yet included by `exportMapImage`.
- To display finalized data with styles, popups, and labels, pass the result to [`addGeoJSON`](map#addgeojsonid-geojson-options). `mapdraw.js` is for creating and editing data.
- The [`maptools.js`](maptools) measuring tools and `startDrawing` both "borrow" map clicks; only one is active at a time.
