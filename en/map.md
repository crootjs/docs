*[Bahasa Indonesia](../map)*

# `map.js` Module Documentation

`map.js` displays an interactive map and draws GeoJSON data on top of it — written from scratch, without Leaflet or any other map library. The basemap is made of raster tiles (default: OpenStreetMap), the data is drawn as SVG, and everything can be panned, zoomed, and clicked, with either a mouse or a finger.

Its CSS is *injected* automatically by the module itself (like [`toast.js`](toast)), so there is no CSS file to link. The browser downloads about 13 KB (gzip): `map.min.js` plus the [`geo.js`](geo) it uses. For comparison, Leaflet is about 46 KB (gzip) for its JS and CSS.

Icon markers, a scale bar, "my location", live tracking, coordinates, a right-click menu, fullscreen, drawing and editing geometry, address search, offline maps, 3D models on the map, measuring tools, image overlays, PNG export, point clustering, heatmaps, and routing live in separate [add-on modules](#add-on-modules), 1–8 KB each, so a page only downloads what it uses.

## Usage (Import)

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
```

All [`geo.js`](geo) functions (`getGeoJSON`, `readGeoJSONFile`, `parseGeoJSON`, `getBBox`, and others) are re-exported from `map.js` as well. A page that shows a map only needs to import from `map.js`.

## Minimal Example

The map's container element **must have a height** set in CSS. The map fills that element completely; an element with no height means a map 0 pixels tall (the module logs a warning to the console when that happens).

```html
<!-- index.html -->
<link rel="stylesheet" href="style.css">
<div id="peta" class="peta"></div>
<script type="module" src="index.js"></script>
```

```css
/* style.css */
.peta {
    height: 360px;
}
```

```javascript
// index.js
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";

createMap("peta");

getGeoJSON("https://github.com/petapedia/geojson/blob/main/contoh.geojson", (response) => {
    if (!response.data) {
        console.log("gagal membaca GeoJSON, status:", response.status);
        return;
    }
    addGeoJSON("peta", response.data); // draw the data
    fitMap("peta", response.data);     // fit the view to the data
});
```

The result: a map with two building polygons and one point; click one of them to see its `properties` in a popup.

Every `map.js` function takes an **element ID** as its first parameter, just like the [`element.js`](element/) functions. There is no map object to keep around.

## `createMap(id, options)`

Creates a map inside the element with ID `id`. Calling it again for the same ID replaces the old map.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `center` | `[118, -2.5]` (Indonesia) | View center, `[lng, lat]` |
| `zoom` | `4` | Initial zoom level |
| `minZoom` | `1` | Farthest zoom allowed |
| `maxZoom` | `19` | Closest zoom allowed |
| `tiles` | OpenStreetMap tiles | Raster tile URL pattern with `{z}`, `{x}`, `{y}` — see [URL patterns](#tile-url-patterns). `false` = no basemap |
| `attribution` | — | Attribution for your own `tiles`: text, a DOM element (for links), or an array of them when there is more than one source |
| `attributionPrefix` | `true` | `false` = no "CrootJS" link in front of the attribution |
| `maxNativeZoom` | same as `maxZoom` | Highest tile level available on the server. Above it, tiles from that level are scaled up (*overzoom*), so `maxZoom` can be higher |
| `labels` | — | URL pattern (or array of patterns) for transparent label tiles drawn on top of `tiles` — for satellite imagery + street names (*hybrid*) |
| `subdomains` | `"abc"` | Replacement for `{s}` in the URL pattern: a string or an array |
| `errorTiles` | — | URL of an image to show in place of tiles that fail to load |
| `zoomControl` | `true` | `false` = no + / − buttons |
| `scrollZoom` | `true` | `false` = the mouse wheel keeps scrolling the page instead of zooming the map |

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
```

## `addGeoJSON(id, geojson, options)`

Draws GeoJSON on the map. `geojson` can be anything [`parseGeoJSON`](geo) accepts: a `FeatureCollection`, a single `Feature`, a bare geometry, an array of these, or JSON text. All geometry types are supported (`Point`, `LineString`, `Polygon`, their `Multi` versions, and `GeometryCollection`).

Returns a `remove()` function that removes that layer again — the same pattern as `dismiss()` in [`toast.js`](toast). That function also has `remove.show()`, `remove.hide()`, `remove.setStyle(style)`, and `remove.setOrder(order)` for layers that have no name (see [Named Layers](#named-layers)).

```javascript
const hapusGedung = addGeoJSON("peta", dataGedung);
// ...
hapusGedung.hide(); // hide temporarily
hapusGedung.show();
hapusGedung();      // only this layer disappears
```

`options` (all optional):

**`style`** — how features look. Either an object, or a function `(feature) => object` to style each feature differently:

| Key | Applies to | Default |
|---|---|---|
| `stroke` | lines, polygon outlines, point outlines | blue `#2563eb` (points: white) |
| `strokeWidth` | lines, polygon outlines, point outlines | lines 3, polygons 2, points 2 |
| `strokeOpacity` | lines, polygon outlines, point outlines | 1 |
| `fill` | polygons, points | blue `#2563eb` |
| `fillOpacity` | polygons, points | polygons 0.25, points 1 |
| `radius` | points | 7 (pixels) |
| `strokeDasharray` | lines, polygon outlines, point outlines | solid line. `"6 4"` or `[6, 4]` = 6 pixels of line, 4 pixels of gap |
| `lineCap` | line ends | `"round"` (others: `"butt"`, `"square"`) |
| `lineJoin` | line corners | `"round"` (others: `"miter"`, `"bevel"`) |

```javascript
// all features red
addGeoJSON("peta", data, { style: { stroke: "#dc2626", fill: "#dc2626" } });

// color depends on a property; null = use the default style
addGeoJSON("peta", data, {
    style: (feature) => feature.properties.Gedung === "Rektorat" ? { fill: "#16a34a", stroke: "#16a34a" } : null,
});
```

Line widths, dash lengths, and point sizes stay the same on screen at any zoom level.

```javascript
// indicative route: dashed line
addGeoJSON("peta", jalurRencana, { style: { stroke: "#ea580c", strokeDasharray: [8, 6], lineCap: "butt" } });
```

**`popup`** — popup content when a feature is clicked:

| Value | Result |
|---|---|
| not set | a list of `name: value` from that feature's `properties` (features with no properties get no popup) |
| function `(feature) => text` | that text, shown as-is |
| function `(feature) => DOM element` | that element |
| function returning `null` | no popup for that feature |
| `false` | no popups at all |

```javascript
addGeoJSON("peta", data, { popup: (feature) => "Gedung " + feature.properties.Gedung });
```

Popup text is inserted as text, **not HTML** — tags inside the data or in the text you return are shown as-is and never executed. If you need links or formatting, return a DOM element:

```javascript
addGeoJSON("peta", data, {
    popup: (feature) => {
        const link = document.createElement("a");
        link.href = "/gedung?nama=" + encodeURIComponent(feature.properties.Gedung);
        link.textContent = "Detail " + feature.properties.Gedung;
        return link;
    },
});
```

**`hoverStyle`** and **`tooltip`** — feedback while the mouse cursor is over a feature (touch screens have no *hover*, so neither appears there):

- `hoverStyle` — a style object (same keys as `style`) applied on top while the cursor is over that feature.
- `tooltip` — a function `(feature) => text or DOM element` (or `null`); the result is shown in a small box that follows the cursor. The click popup still works as usual.

```javascript
addGeoJSON("peta", zona, {
    hoverStyle: { stroke: "#dc2626", strokeWidth: 4 },
    tooltip: (feature) => "Zona " + feature.properties.nomor,
});
```

**`label`** — text always shown on a feature: a property name, or a function `(feature) => text` (`null` = no label). A point's label sits at the point, a line's label at the middle of its length, and a polygon's label at its centroid. Labels that collide with other labels are hidden, then reappear when the map is zoomed and there is enough room — layers on top take priority, then the order of features in the data.

`labelOptions` (optional): `minZoom` / `maxZoom` (labels only show within this zoom range), `className` (an extra CSS class for the label element), `overlap: true` (no collision avoidance).

```javascript
addGeoJSON("peta", kontur, {
    label: (feature) => feature.properties.elevasi + " m",
    labelOptions: { minZoom: 16, className: "label-kontur" },
});
```

**`name`, `minZoom`, `maxZoom`, `order`, `visible`, `attribution`** — see [Named Layers](#named-layers).

**`renderer`** and **`simplify`** — see [Large Data](#large-data-canvas-and-simplification).

## Large Data: Canvas and Simplification

By default every shape is drawn as its own SVG element. That works well up to a few thousand shapes, but it starts to get heavy on phones once there are thousands of lines. Two `addGeoJSON` options for data like that:

| Option | Default | Description |
|---|---|---|
| `renderer` | `"svg"` | `"canvas"` = the whole layer is drawn on a single `<canvas>`, with no element per shape. Styles (including dashes), popups, `hoverStyle`, `tooltip`, labels, and `onMapClick` still work — clicks and *hover* are computed from the geometry itself |
| `simplify` | `0` | Simplification tolerance in screen pixels, e.g. `1`. Per zoom level, points that deviate less than that from a straight line are dropped (Douglas-Peucker), so when zoomed far out a line with thousands of points can be drawn with just dozens. Applies to both SVG and canvas |

```javascript
addGeoJSON("peta", jaringanFiber, {    // e.g. 5,600 lines
    name: "fiber",
    renderer: "canvas",
    simplify: 1,
    style: { stroke: "#ea580c", strokeWidth: 2 },
    tooltip: (feature) => feature.properties.kode,
});
```

Canvas layers are always **below** all SVG layers, whatever their `order` (`order` still controls the order among canvas layers). So large background layers suit canvas, while small layers that must appear on top stay in SVG.

## Named Layers

A layer given a `name` in `addGeoJSON` can be managed without redrawing it:

| Function | Result |
|---|---|
| `showLayer(id, name)` / `hideLayer(id, name)` | Shows / hides the layer. Its popup and *hover* are closed too when it is hidden |
| `setLayerStyle(id, name, style)` | Replaces the style of the whole layer; `style` is an object or a function, just like in `addGeoJSON` |
| `setLayerOrder(id, name, order)` | Stacking order: higher is on top |
| `removeLayer(id, name)` | Removes the layer |
| `getLayers(id)` | List of named layers from bottom to top: `[{ name, visible, order }]` |

Related `addGeoJSON` options:

| Option | Default | Description |
|---|---|---|
| `name` | — | Layer name. A new layer with a name already in use **replaces** that old layer — an easy way to update data |
| `minZoom`, `maxZoom` | all zooms | The layer only shows within this zoom range, e.g. a block plan that is only useful at zoom 18 and above |
| `order` | `0` | Stacking order. Layers with the same `order` are stacked in the order they were added |
| `visible` | `true` | `false` = added in a hidden state |
| `attribution` | — | This layer's data source; added to the map attribution for as long as the layer exists |

```javascript
addGeoJSON("peta", batasZona, { name: "zona", order: 1, style: { strokeDasharray: "4 4" } });
addGeoJSON("peta", denahBlok, { name: "blok", minZoom: 18 });

hideLayer("peta", "zona");
setLayerStyle("peta", "blok", (feature) => ({ fill: feature.properties.terisi ? "#16a34a" : "#9ca3af" }));
```

For a ready-made checkbox list, see `addLayerControl` in [`mapcontrol.js`](mapcontrol).

## `setTiles(id, tiles, options)`

Replaces the basemap **without recreating the map**: layers, markers, an open popup, and the view all stay where they are. The old basemap tiles are kept until the new tiles finish loading, so the map does not flash blank.

`tiles` is the same as the `tiles` option of `createMap` (no value = OpenStreetMap, `false` = no basemap). `options` takes `labels`, `maxNativeZoom`, `subdomains`, `errorTiles`, and `attribution`, the same as in `createMap`; any not given revert to their defaults. `minZoom` and `maxZoom` may also be given — for example for a basemap that must not be zoomed past level 17 — but unlike the other options, those not given **stay** as they were (see `setZoomRange` below).

```javascript
// switch to satellite imagery + labels (hybrid)
setTiles("peta", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 18,
    attribution: "Tiles © Esri",
});

setTiles("peta"); // back to OpenStreetMap
```

For a ready-made basemap picker, see `addBasemapControl` in [`mapcontrol.js`](mapcontrol).

## `setZoomRange(id, minZoom, maxZoom)`

Changes the allowed zoom range without recreating the map. A `minZoom` or `maxZoom` that is not given (`undefined`/`null`) is left unchanged. If the current zoom is outside the new range, the map is immediately zoomed to the nearest limit, and the + / − buttons adjust accordingly.

```javascript
setZoomRange("peta", null, 17); // no closer than zoom 17
setZoomRange("peta", 10);       // no farther than zoom 10, upper limit unchanged
```

## `fitMap(id, geojson, padding = 24)`

Fits the view to all of the data. `geojson` is as flexible as in `addGeoJSON`, or can be a bounding box `[minLng, minLat, maxLng, maxLat]` directly. `padding` is the empty space (in pixels) between the data and the map edge — one number for all sides, or per side `{ top, right, bottom, left }` (sides not given stay at 24), for example so the data is not covered by a panel.

```javascript
fitMap("peta", data);
fitMap("peta", [95, -11, 141, 6]);         // all of Indonesia
fitMap("peta", data, { left: 320 });       // a 300-pixel-wide panel on the left of the map
```

Per-side padding also suits a responsive "zoom to" button — panel on the left on wide screens, at the bottom on phones:

```javascript
const sempit = window.matchMedia("(max-width: 640px)").matches;
fitMap("peta", getBBox(dataLokasi), sempit ? { bottom: 260 } : { left: 340 });
```

- Data consisting of a single point is shown at zoom 17.
- Data without coordinates (or that is not GeoJSON) does not change the view.
- With a basemap, the zoom is rounded down to a whole level so tile images stay sharp, so the data may look smaller than the available space. With `tiles: false` the data is fitted exactly.
- A map whose element is still `display: none` has no size yet, so it cannot be fitted. Call `fitMap` after the element is shown.

## `setMapView(id, center, zoom)` and `getMapView(id)`

`setMapView` moves the view to `center` (`[lng, lat]`). `zoom` is optional; if not given, the current zoom level is kept.

`getMapView` returns the current view: `{ center: [lng, lat], zoom }`.

```javascript
setMapView("peta", [106.8272, -6.1754], 12); // Jakarta
setMapView("peta", [107.6191, -6.9175]);     // move to Bandung, zoom stays at 12

getMapView("peta"); // { center: [107.6191, -6.917499999999983], zoom: 12 }
```

The returned `center` may differ from what you passed in the last few digits (floating-point rounding during projection); the difference is far below one millimeter on the ground.

`zoom` is always clamped to `minZoom`..`maxZoom`. While a gesture (mouse wheel, pinch) is in progress, `zoom` can be fractional.

## `onMapClick(id, runFunction)`

`runFunction(position, feature)` is called every time the map is clicked or *tapped* (panning the map does not count as a click):

- `position` — `[lng, lat]` of the clicked point.
- `feature` — the GeoJSON feature that was clicked, or `null` if the basemap was clicked.

The most common use: picking a location for a form.

```javascript
import { createMap, addGeoJSON, onMapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { setValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/element.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

let hapusPenanda = () => {};
onMapClick("peta", (position) => {
    setValue("longitude", position[0]);
    setValue("latitude", position[1]);

    // the old marker is replaced by a new one at the clicked point
    hapusPenanda();
    hapusPenanda = addGeoJSON("peta", { type: "Point", coordinates: position });
});
```

## `onMapContextMenu(id, runFunction)`

`runFunction(position, feature, detail)` is called when the map is **right-clicked**, **long-pressed** on a touch screen (about 0.5 seconds without moving the finger), or when the **Menu**/**Shift+F10** key is pressed while the map has focus:

- `position` — `[lng, lat]` of the point. From the keyboard: the map center.
- `feature` — the GeoJSON feature at that point, or `null`.
- `detail` — `{ point, keyboard }`: `point` = `[x, y]` in pixels from the map's top-left corner; `keyboard` = `true` if opened from the keyboard.

While there is a listener, the browser's built-in menu does not appear on the map, except inside popups and controls. Returns a `stop()` function; once the last listener stops, the browser's built-in menu appears again.

For a ready-made menu complete with submenus, keyboard support, and a dark theme, use [`addContextMenu`](mapcontrol#addcontextmenuid-items-options) from `mapcontrol.js`. `onMapContextMenu` is for your own UI:

```javascript
import { createMap, onMapContextMenu, showPopup } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";

createMap("peta", { center: [107.6, -6.9], zoom: 14 });
onMapContextMenu("peta", (position) => {
    showPopup("peta", position, `${position[1].toFixed(5)}, ${position[0].toFixed(5)}`);
});
```

## `onMapMove(id, runFunction)` and `getMapBounds(id)`

`runFunction({ center, zoom })` is called every time the view changes: panned, zoomed, or when the map's size changes. While a gesture is in progress it is called on every frame. Returns a `stop()` function to stop listening.

`getMapBounds(id)` returns the part of the world currently visible as a bounding box `[minLng, minLat, maxLng, maxLat]`.

The two are commonly used together to request **only the data in the visible area** from a backend. Because `onMapMove` fires very often, wrap it with [`debounce`](debounce) so a request is sent only after the map stops moving:

```javascript
import { createMap, addGeoJSON, clearMap, onMapMove, getMapBounds, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/debounce.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 16 });

onMapMove("peta", debounce(() => {
    const bbox = getMapBounds("peta");
    getGeoJSON("https://api.example.com/lokasi?bbox=" + bbox.join(","), (response) => {
        if (!response.data) return;
        clearMap("peta");
        addGeoJSON("peta", response.data);
    });
}, 400));
```

## `mapToPoint(id, position)` and `pointToPosition(id, point)`

Converts a `[lng, lat]` position into an `[x, y]` point in pixels (measured from the map's top-left corner), and back. The result of `mapToPoint` can lie outside the map's size if the position is not currently visible.

```javascript
mapToPoint("peta", [107.575914, -6.8732098]); // e.g. [412.6, 180.3]
pointToPosition("peta", [0, 0]);              // [lng, lat] at the map's top-left corner
```

Together with `onMapMove`, these two functions are enough to build your own HTML elements that follow the map. For markers, use [`mapmarker.js`](mapmarker), which already takes care of that.

## `addMapControl(id, element, corner = "top-right")`

Places an element you made — a button, a legend, an info box — in a corner of the map: `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"`. Several controls in the same corner are stacked neatly, and clicks inside them do not pan or click the map. Returns a `remove()` function.

```javascript
const legenda = document.createElement("div");
legenda.className = "legenda"; // its look comes from your page's CSS
legenda.textContent = "Biru: gedung kampus";
addMapControl("peta", legenda, "bottom-right");
```

## `showPopup(id, position, content)` and `closePopup(id)`

Shows a popup at `position` (`[lng, lat]`) without needing a feature there. `content` is text (shown as-is, not HTML) or a DOM element. There is only one popup per map; a new popup replaces the old one.

```javascript
showPopup("peta", [107.575914, -6.8732098], "Kampus ULBI");
closePopup("peta");
```

If the popup is cut off by the map edge, the map is panned slightly so the popup is fully visible. This only applies when the `position` is currently visible; `showPopup` at a faraway place does not make the map jump there (use `setMapView` first).

## `clearMap(id)` and `removeMap(id)`

- `clearMap(id)` removes all GeoJSON layers and closes the popup. The basemap stays. Use it before drawing new data to replace old data.
- `removeMap(id)` removes the map from the element and stops all of its listeners. The element itself remains and can be used by `createMap` again.

## Built-in Interactions

| Action | Result |
|---|---|
| Drag with the mouse or one finger | pans the map |
| Mouse wheel / trackpad pinch | zooms at the cursor position |
| Two-finger pinch | zooms between the two fingers |
| Double-click | zooms in one level at the cursor position |
| Right-click / one-finger long press / Menu key | `onMapContextMenu` and `addContextMenu`, if used; otherwise, the browser's built-in menu |
| + / − buttons | zooms one level at the map center |
| Arrow keys (while the map has focus) | pans the map |
| `+` / `-` keys (while the map has focus) | zoom |
| Click / tap a feature | opens its popup |
| Cursor over a feature (mouse) | `hoverStyle` and `tooltip`, if the layer uses them |

Users who have enabled *reduce motion* on their system get zooming without animation.

## Basemaps

**OpenStreetMap (default).** Tiles are fetched from `tile.openstreetmap.org`, and the attribution "CrootJS | © OpenStreetMap contributors" is automatically shown in the bottom-right corner — the data license requires it, so do not hide it. The OpenStreetMap tile servers are free but run by volunteers and have a [usage policy](https://operations.osmfoundation.org/policies/tiles/): fine for learning and low-traffic sites. For high-traffic applications, use your own tile provider.

**Other tile providers.** Set `tiles` to their URL pattern and `attribution` to the attribution text the provider requires:

```javascript
createMap("peta", {
    tiles: "https://tiles.example.com/{z}/{x}/{y}.png",
    attribution: "© Example Maps",
});
```

**Custom tile sources.** Besides a URL pattern, `tiles` (and the entries of `labels`) can be an object `{ getTile(z, x, y) }` that returns a Promise of an image `Blob`, a URL, or `null` if that tile does not exist. This is how [`mapoffline.js`](mapoffline) displays a map from a single PMTiles file, including from a file on the device with no internet:

```javascript
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapoffline.js";

const arsip = await openPMTiles("peta-bandung.pmtiles");
createMap("peta", { tiles: arsip, maxNativeZoom: arsip.maxZoom, center: arsip.center, zoom: 13 });
```

The attribution always starts with a "CrootJS" link to this site, then the basemap source, then each data layer's `attribution` — identical sources are written only once. Its content is updated every time the basemap is replaced or a layer is added/removed. `attributionPrefix: false` in `createMap` removes the "CrootJS" link; the tile provider's attribution is still shown.

### Tile URL Patterns

| Placeholder | Replaced with |
|---|---|
| `{z}`, `{x}`, `{y}` | the tile's zoom level, column, and row |
| `{-y}` | the tile row in the TMS scheme (counted from the bottom), for servers such as GeoServer/TileCache |
| `{s}` | a subdomain, rotating through `subdomains` (default `"abc"`) to spread the load |
| `{r}` | `@2x` on retina screens, empty on regular screens |

```javascript
createMap("peta", {
    tiles: "https://{s}.tiles.example.com/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    errorTiles: "/img/tile-kosong.png", // replacement for tiles that fail to load
    attribution: "© Example Maps",
});
```

### Satellite Imagery, Overzoom, and Hybrid

Many imagery providers only have tiles up to zoom 18 over most areas. `maxNativeZoom: 18` lets the map still zoom up to `maxZoom` — level-18 tiles are scaled up instead of left blank. `labels` stacks transparent label tiles (street and place names) on top of the imagery:

```javascript
createMap("peta", {
    maxZoom: 21,
    maxNativeZoom: 18,
    tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
});
```

**No basemap.** With `tiles: false` only your data is drawn, on a plain background — no requests to a tile server at all:

```javascript
createMap("peta", { tiles: false });
```

## Add-on Modules

Features that not every map needs are split into their own modules. Import only the ones you use:

| Module | Contents |
|---|---|
| [`mapmarker.js`](mapmarker) | Pin markers, image icons, or your own elements — with labels, popups, and dragging (`addMarker`) |
| [`mapcontrol.js`](mapcontrol) | Scale bar, "my location", live tracking, basemap picker (list or image cards), layer checkbox list, cursor coordinates, right-click menu, and fullscreen (`addScaleBar`, `addLocateButton`, `locateUser`, `addTrackButton`, `trackUser`, `addBasemapControl`, `setBasemap`, `addLayerControl`, `addCoordinateControl`, `addContextMenu`, `addFullscreenButton`) |
| [`maptools.js`](maptools) | Distance and area measuring tool, georeferenced images with rotation, exporting the view to PNG (`addMeasureControl`, `measure`, `addImageOverlay`, `exportMapImage`, `downloadMapImage`) |
| [`mapcluster.js`](mapcluster) | Point clustering for very large point datasets (`addCluster`) |
| [`mapsearch.js`](mapsearch) | Find places by name/address and addresses by point (Nominatim/OSM or your own provider), plus an on-map search box (`searchPlace`, `reverseGeocode`, `addSearchControl`) |
| [`mapoffline.js`](mapoffline) | Basemap from a single raster PMTiles file — from a server, or from a file on the device with no internet (`openPMTiles`) |
| [`mapmodel.js`](mapmodel) | glTF/GLB 3D models at their location on the map, sized in meters (`addModel`) |
| [`mapdraw.js`](mapdraw) | Drawing and editing points, lines, and polygons; the result is GeoJSON (`addDrawControl`, `startDrawing`, `editFeature`) |
| [`mapheat.js`](mapheat) | Point-density heatmaps, and square/hexagon grid maps colored by value such as signal coverage maps (`addHeatmap`, `addGridMap`) |
| [`geomeasure.js`](geomeasure) | Distance, length, area, point-in-area, nearest point, radius circles |
| [`georoute.js`](georoute) | Shortest route along the lines in GeoJSON data (`findRoute`) |

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapmarker.js";
import { addScaleBar, addLocateButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcontrol.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addMarker("peta", [107.575914, -6.8732098], { label: "ULBI", popup: "Kampus ULBI" });
addScaleBar("peta");
addLocateButton("peta");
```

## Writing Your Own Add-on

`createMap` attaches a small interface to the map element, in the `crootjsMap` property. That is how `mapmarker.js` and `mapcontrol.js` work, and your own module can use the same route:

```javascript
// penanda.js - a simple add-on module: a piece of text pinned to one position
export function addText(id, position, text) {
    const map = document.getElementById(id).crootjsMap; // undefined if the map has not been created yet

    const element = document.createElement("div");
    element.className = "penanda"; // needs position: absolute from your CSS
    element.textContent = text;
    map.overlay.appendChild(element);

    const place = () => {
        const point = map.toPoint(position);
        element.style.transform = `translate(${point[0]}px, ${point[1]}px)`;
    };
    place();
    map.onMove(place); // called every time the map moves
}
```

| `crootjsMap` member | Purpose |
|---|---|
| `overlay` | Element to put your HTML elements in: above the data, below the popup, clipped at the map edge |
| `toPoint(position)` / `toPosition(point)` | `[lng, lat]` to pixels and back |
| `getView()` | `{ center, zoom }` |
| `setView(center, zoom)` | Moves the view |
| `panBy(dx, dy)` | Pans the map by a number of pixels |
| `onMove(runFunction)` | Listens for view changes; returns `stop()` |
| `onTap(element, runFunction)` | Handles taps on an element in `overlay`: the map does not treat them as map clicks (`onMapClick` is not called), while drags that start on that element still pan the map |
| `addControl(element, corner)` | Places an element in a corner of the map; returns `remove()` |
| `showPopup(position, content, offset)` / `closePopup()` | Popup; `offset` = upward distance from the position, in pixels |
| `setTiles(tiles, options)` | Same as `setTiles(id, ...)` |
| `getLayers()` / `setLayerVisible(name, visible)` | List of named layers; shows/hides one layer |
| `setZoomRange(minZoom, maxZoom)` | Same as `setZoomRange(id, ...)` |
| `root` | The map element itself (containing all layers) — e.g. for listening to `pointermove` |
| `underlay` | Element for images above the basemap and below the data (used by `addImageOverlay`) |
| `onClick(runFunction)` | Same as `onMapClick`; returns `stop()` |
| `onContextMenu(runFunction)` | Same as `onMapContextMenu`; returns `stop()` |
| `captureClick(runFunction)` | Borrows map clicks: while active, clicks and double-clicks are only passed to `runFunction(position, "click" \| "dblclick")` — no popups, no double-click zoom, no `onMapClick`. Returns `release()`. Used by the measuring tool |

**Add-on modules must not import `map.js`.** A page usually loads `map.min.js`, whereas `import "./map.js"` from another module loads a *second copy* with its own list of maps — and the maps created by the page will not be found. The interface on the element avoids that: your module works with whichever copy of `map.js` the page uses.

## Notes

- **All positions use GeoJSON order: `[longitude, latitude]`** — `center`, `position` in `onMapClick`, `showPopup`, and `getMapView`. So coordinates from GeoJSON data can be used directly without swapping.
- Within a layer, points are always drawn on top, regardless of their order in the data, so they are not covered by polygons. Layers added later sit above earlier layers, unless set otherwise with `order`.
- Thin lines have an invisible click area 20 pixels wide. A dense line layer (e.g. contours) on top of polygons can block clicks and *hover* on those polygons; put the line layer underneath with `order`.
- The map adjusts itself when its element's size changes, including when an element that was `display: none` (e.g. tab content) is shown.
- The map's default styles (buttons, popups, labels, markers) are *injected* as a `<style>` at the **start** of `<head>`, so your page's CSS overrides them without `!important` — for example `.crootjs-marker-label { color: #fff; text-shadow: 0 0 3px #000; }` for white marker labels over satellite imagery.
- A page can have several maps, each with its own element ID.
- Functions called with an ID that has not been passed to `createMap` do not throw an error; they log a warning to the console and do nothing.

### Limitations

- The projection is Web Mercator only (the one used by almost all web maps), with latitude limited to ±85.05°.
- Basemaps are raster (image) tiles only. Vector tiles are not supported.
- The map does not wrap around left-right past the 180° meridian.
- Data is drawn as SVG, one element per shape, except for `renderer: "canvas"` layers. SVG works well for hundreds up to a few thousand features; for thousands of lines use canvas (see [Large Data](#large-data-canvas-and-simplification)), and for tens of thousands of points use [`mapcluster.js`](mapcluster), which clusters them.
- Feature labels are written horizontally; line labels do not follow the direction of the line.
- Drawing and editing shapes directly on the map is in the [`mapdraw.js`](mapdraw) add-on.
