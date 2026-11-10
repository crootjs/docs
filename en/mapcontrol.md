*[Bahasa Indonesia](../mapcontrol)*

# `mapcontrol.js` Module Documentation

`mapcontrol.js` is an add-on module for [`map.js`](map) containing the controls most often requested for a map: a **scale bar**, **my location**, **live tracking** (continuously following the location), a **basemap picker** (a list or picture cards), a **layer checklist**, **cursor coordinates**, a **right-click menu**, and **fullscreen**. It is kept separate from `map.js` so that pages that don't use it don't have to download it (about 8 KB gzipped).

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addScaleBar, addLocateButton, locateUser, addTrackButton, trackUser, addBasemapControl, setBasemap, addLayerControl, addCoordinateControl, addContextMenu, addFullscreenButton } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcontrol.js";
```

The map must already have been created with `createMap`.

## `addScaleBar(id, corner = "bottom-left")`

Shows a scale bar — for example "50 m" or "2 km" — that updates as the map is zoomed or panned. `corner` may be `"bottom-left"` (default), `"bottom-right"`, `"top-left"`, or `"top-right"`.

Returns a `remove()` function to take it off again.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });
addScaleBar("peta");
```

The bar length is computed for the latitude at the center of the map. In the Web Mercator projection the scale varies with latitude, so at the same zoom a "5 km" bar in Norway is as long on screen as a "10 km" bar at the equator.

## `addLocateButton(id, responseFunction, corner = "top-left")`

Adds a "my location" button to the map (default: below the zoom buttons). When clicked, the button runs `locateUser` below. `responseFunction` is optional and receives the same result.

Returns a `remove()` function to take the button off.

```javascript
addLocateButton("peta");
```

## `locateUser(id, responseFunction)`

Asks the browser for the device's location (once), then:

1. marks it on the map with a blue dot and an accuracy circle,
2. moves the view there — a map that is zoomed far out is brought in to zoom 16, a map that is already closer keeps its zoom,
3. calls `responseFunction` (optional) with the result.

| Event | What `responseFunction` receives |
|---|---|
| Location obtained | `{ position: [lng, lat], accuracy }` — `accuracy` in meters |
| Permission denied, device not supported, or 15 seconds elapsed | `null` |

```javascript
import { locateUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcontrol.js";
import { getDistance } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/geomeasure.js";

const kampus = [107.575914, -6.8732098];

locateUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Lokasi tidak didapat. Pastikan izin lokasi diberikan.");
        return;
    }
    const jarak = getDistance(lokasi.position, kampus);
    console.log(`Kamu ${Math.round(jarak)} m dari kampus (ketelitian ${Math.round(lokasi.accuracy)} m).`);
});
```

The circle around the blue dot shows the accuracy: the actual location is somewhere inside that circle. Its size is in meters, so it grows as the map is zoomed in; the blue dot itself stays the same size.

A map has only one location marker. Subsequent calls move the same marker.

## `trackUser(id, responseFunction, options)`

*Live tracking*: follows the device's location **continuously**. The difference from `locateUser`, which gets the location once: here the location marker on the map moves every time the browser reports a new position, until you stop it.

Returns a `stop()` function to stop tracking.

`responseFunction` (optional) is called on **every** update with:

| Field | Description |
|---|---|
| `position` | `[lng, lat]` |
| `accuracy` | Accuracy, in meters |
| `speed` | Speed in meters per second, or `null` if the device does not report it |
| `heading` | Direction of travel in degrees from north, or `null` if the device does not report it |
| `timestamp` | Time of the reading, in milliseconds |

If location permission is denied or the device does not support it, `responseFunction` is called **once** with `null` and tracking stops on its own. Temporary disruptions such as a lost signal do not stop tracking; the browser retries.

```javascript
import { createMap, addGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { trackUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcontrol.js";

createMap("peta");

// Travel trail: each new position is appended to a line that is redrawn.
const jejak = [];
let hapusJejak = () => {};

const stop = trackUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Pelacakan tidak bisa dijalankan. Pastikan izin lokasi diberikan.");
        return;
    }
    jejak.push(lokasi.position);
    if (jejak.length > 1) {
        hapusJejak();
        hapusJejak = addGeoJSON("peta", { type: "LineString", coordinates: jejak }, { popup: false });
    }
});

// later, to stop:
// stop();
```

**The map pans along** so the location stays centered. The first update brings a map that is still zoomed far out in to zoom 16; after that, the user's chosen zoom is kept. As soon as the user pans the map themselves, the map stops following — the marker is still updated — so the map doesn't jump back while the user is looking at another place.

If the map must not move at all, turn this off with `options`:

```javascript
trackUser("peta", tampilkan, { follow: false });
```

## `addTrackButton(id, responseFunction, options, corner = "top-left")`

Adds a live tracking button to the map. The first click starts `trackUser`, the next click stops it; the button is blue while tracking is running. `responseFunction` and `options` are passed through to `trackUser`.

Returns a `remove()` function that stops tracking and takes the button off.

```javascript
addTrackButton("peta");
```

## `addBasemapControl(id, basemaps, options)`

Adds a basemap picker to the map. Choosing one calls [`setTiles`](map#settilesid-tiles-options) — layers, markers, popups, and the view stay in place. There are two styles:

- **`"list"`** (default): a panel of radio buttons.
- **`"cards"`**: a single picture card showing the currently active basemap, like the Google Maps layer picker. Hovering over it (or clicking/tapping it) turns it into a grid of cards for all options; the active card has an accent-colored border.

`basemaps` is an array of `{ name, tiles, labels, maxNativeZoom, subdomains, errorTiles, attribution, minZoom, maxZoom, thumbnail }`; all keys except `name` and `thumbnail` are the same as the `setTiles` options. With `maxZoom`, each basemap can have its own zoom limit; the map is zoomed out immediately if it is currently closer than the selected basemap's limit.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `style` | `"list"` | `"list"` or `"cards"` |
| `selected` | `0` | Index or `name` of the basemap applied right away |
| `title` | `"Peta dasar"` | Title of the panel or grid (`""` = no title) |
| `corner` | `"top-right"` | Map corner. The card grid opens from the same corner |
| `onChange` | — | Function `(basemap)` called after the basemap is changed, including via `setBasemap` |
| `collapsed` | `false` | `"list"` only: `true` = the panel is tucked behind a layers icon button, opened and closed by clicking |
| `trigger` | automatic | `"cards"` only: `"hover"` (the grid opens on hover) or `"click"`. Defaults to `"hover"` on devices with a mouse and `"click"` on touch screens |
| `columns` | `3` | `"cards"` only: number of grid columns. On screens 640 px wide or less, at most 2 |
| `thumbnailCenter` | map center | `"cards"` only: the `[lng, lat]` point shown in the card images |
| `thumbnailZoom` | map zoom | `"cards"` only: zoom of the card images |

Returns a `remove()` function to take the control off; the last selected basemap stays applied.

```javascript
addBasemapControl("peta", [
    { name: "Jalan" }, // no tiles = OpenStreetMap
    {
        name: "Satelit",
        tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxNativeZoom: 18,
        attribution: "Tiles © Esri",
    },
    {
        name: "Hybrid",
        tiles: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        labels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        maxNativeZoom: 18,
        attribution: "Tiles © Esri",
    },
]);
```

### Card style

```javascript
addBasemapControl("peta", basemaps, {
    style: "cards",
    thumbnailCenter: [125.8959, -9.014],
    thumbnailZoom: 14,
    selected: "Hybrid",
    onChange: (basemap) => console.log("Peta dasar:", basemap.name),
});
```

**Card images.** Set `thumbnail` to an image URL if you want your own image. Without `thumbnail`, the image is a single tile from that basemap itself: the tile containing `thumbnailCenter` at `thumbnailZoom`, using the same URL pattern as the map (`{z}`, `{x}`, `{y}`, `{-y}`, `{s}`, `{r}`, and `maxNativeZoom` are respected). If the basemap has `labels`, the label tile is stacked on top of the base image — the Hybrid card shows the imagery along with its labels. `thumbnailCenter` and `thumbnailZoom` default to the map's center and zoom at the moment the control is added, so add the control after the map has been pointed at the work area, or set both.

**Opening and closing.** The grid closes when you click outside it, when Esc is pressed, after a card is chosen, or (with `"hover"`) when the cursor leaves it. With `"hover"`, the toggle card can still be clicked, so keyboard users can still open it.

**Accessibility.** The toggle card is a `<button>` with `aria-haspopup` and `aria-expanded`; each option card is a `<button aria-pressed>`. When the grid is opened by click or keyboard, focus moves to the active card; when it closes, focus returns to the toggle card.

**Styling.** Card colors follow `prefers-color-scheme` (light/dark). The accent color and card width can be changed via the CSS variables `--crootjs-map-accent` and `--crootjs-map-card-width`, and every class can be overridden from the page's CSS without `!important`:

```css
#peta {
    --crootjs-map-accent: #16a34a;     /* accent color */
    --crootjs-map-card-width: 104px;   /* card width, default 92px; the grid adjusts accordingly */
}
.crootjs-map-card-thumb { width: 84px; height: 84px; }   /* image size, default 72px */
```

The default width of 92 px fits a single-word name as long as "OpenStreetMap", even when bold on the active card. Longer names wrap to the next line between words; a word is only broken if it doesn't fit on a full line (with a hyphen in browsers that support `hyphens`).

| Class | Element |
|---|---|
| `.crootjs-map-cards` | Control wrapper |
| `.crootjs-map-cards-toggle` | Toggle card (active basemap) |
| `.crootjs-map-cards-grid` | Options grid |
| `.crootjs-map-cards-title` | Grid title |
| `.crootjs-map-card` | Each card, including the toggle card; the active one is `[aria-pressed="true"]` |
| `.crootjs-map-card-thumb`, `.crootjs-map-card-name` | Image and name inside the card |

## `setBasemap(id, name)`

Changes the basemap from code through the `addBasemapControl` picker most recently added to that map, so its radio button or card switches too and `onChange` is called as well. `name` is the basemap's `name` or index. Returns `true` on success, `false` if the map has no picker yet or no basemap with that name exists.

```javascript
setBasemap("peta", "Satelit");
```

To change the basemap without a picker, use [`setTiles`](map#settilesid-tiles-options) from `map.js`.

## `addLayerControl(id, layers, options)`

Adds a checklist to show/hide named layers (the `name` option in [`addGeoJSON`](map#named-layers)). Checking a box only changes visibility — the layer is not redrawn, and popups open on other layers stay open.

`layers` is an array of names, or an array of `{ name, label }` if the text in the list differs from the name. `null` = all named layers that already exist when this function is called, from bottom to top.

`options` (all optional): `title` (default `"Lapisan"`), `corner` (default `"top-right"`), `collapsed`, and `onChange` — a function `(name, visible)` called every time a checkbox is changed.

Returns a `remove()` function to take the panel off.

```javascript
addGeoJSON("peta", jalurFiber, { name: "fiber" });
addGeoJSON("peta", batasZona, { name: "zona" });

addLayerControl("peta", [
    { name: "fiber", label: "Jalur fiber" },
    { name: "zona", label: "Batas zona" },
]);
```

## `addCoordinateControl(id, options)`

Shows the coordinates under the mouse cursor. Clicking (or tapping) the map **holds** the coordinates of that point and shows a copy button next to them. Touch screens have no cursor, so only the tapped coordinates are shown.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `format` | `"lat, lng"` | Function `(position) => text` whose result is shown and copied. This is the hook for local coordinate systems |
| `precision` | `6` | Decimal places for the default format (6 ≈ 10 cm) |
| `corner` | `"bottom-left"` | Map corner |
| `onClick` | — | Function `(position, text)` called when coordinates are held |

Returns a `remove()` function.

The default format is ordered **lat, lng** (`-6.873600, 107.575900`) — the order accepted by the Google Maps search box and most GPS devices — even though `position` remains `[lng, lat]`.

The copy button uses the Clipboard API, which is only available on HTTPS pages (or `localhost`). On a plain `http://` page the text is selected instead, so just press Ctrl+C.

**Local grid (CAD).** With [`createAffineTransform`](geomeasure#createaffinetransformfrom-to) from `geomeasure.js`, coordinates can be shown in a project grid. For example, with three control points whose grid coordinates and lng/lat are known:

```javascript
import { createAffineTransform } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/geomeasure.js";

const grid = [[1000, 2000], [1500, 2000], [1000, 2400]];                  // meters, CAD grid
const wgs84 = [[107.57520, -6.87410], [107.57974, -6.87407], [107.57517, -6.87048]];
const gridToWgs = createAffineTransform(grid, wgs84);

addCoordinateControl("peta", {
    format: (position) => {
        const [x, y] = gridToWgs.inverse(position);
        return `X ${x.toFixed(2)}  Y ${y.toFixed(2)}`;
    },
});
```

## `addContextMenu(id, items, options)`

A right-click menu on the map, like in Google Maps or QGIS. It appears when:

- the map is **right-clicked** with a mouse;
- the map is **long-pressed** on a touch screen (about 0.5 seconds without moving the finger) — including on iPhone, which has no right-click;
- the **Menu** key or **Shift+F10** is pressed while the map has focus. The menu appears in the center of the map and its first item is focused immediately.

While a context menu is active, the browser's built-in menu ("Save image", "Inspect", ...) does not appear on the map, except inside popups and controls, so their text can still be copied.

`items` may be an array of items, or a **function `(position, feature) => array of items`** that is called every time the menu opens:

- `position` — `[lng, lat]` of the right-clicked point.
- `feature` — the GeoJSON feature (`addGeoJSON`) at that point, or `null` if the basemap was clicked.

With a function, the menu contents can differ for empty map and for a feature. An empty array means the menu does not appear.

An item is an object:

| Key | Description |
|---|---|
| `label` | Item text |
| `onClick` | Function `(position, feature)` called when the item is chosen. The menu closes first |
| `icon` | Optional: short text or an emoji, an `<svg ...>` string, or a DOM element (e.g. a Lucide icon) |
| `disabled` | `true` = shown grayed out and cannot be chosen |
| `danger` | `true` = shown in red, for actions such as delete |
| `title` | Optional: *tooltip* text |
| `items` | Array of items: this item becomes a **submenu**. The submenu opens when the cursor hovers over it, when clicked, or with the right arrow key |

Besides objects, an item may also be:

| Item | Result |
|---|---|
| `"-"` | Separator line. Separators at the start, at the end, or consecutive ones are removed automatically |
| `false`, `null`, `undefined` | Skipped, so a conditional item can simply be written `feature && { ... }` |
| `"coordinates"` | Shows the coordinates of that point (`lat, lng`); choosing it copies them to the clipboard |
| `"center"` | "Pusatkan di sini" (Center here) |
| `"zoom-in"` | "Perbesar di sini" (Zoom in here) — one level, centered on that point |
| `"zoom-out"` | "Perkecil" (Zoom out) — one level |

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `precision` | `6` | Decimal places for the `"coordinates"` item |
| `format` | `"lat, lng"` | Function `(position) => text` for the `"coordinates"` item, same as in `addCoordinateControl` |
| `onOpen` | — | Function `(position, feature)` called every time the menu opens |

Returns `{ close(), remove() }`. `remove()` removes the context menu, and the browser's built-in menu appears again.

```javascript
import { createMap, addGeoJSON, setMapView } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addContextMenu } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcontrol.js";

createMap("peta", { center: [107.6, -6.9], zoom: 14 });
addGeoJSON("peta", dataBTS, { name: "bts" });

addContextMenu("peta", (position, feature) => [
    "coordinates",
    "center",
    "-",
    feature && { label: "Detail " + feature.properties.nama, onClick: () => bukaDetail(feature) },
    feature && { label: "Hapus BTS", danger: true, onClick: () => hapusBTS(feature) },
    "-",
    { label: "Tambah di sini", items: [
        { label: "Titik ukur", onClick: (position) => tambahTitikUkur(position) },
        { label: "BTS baru", onClick: (position) => tambahBTS(position) },
    ] },
    "zoom-in",
    "zoom-out",
]);
```

**`addGridMap` cells.** Heatmap cells are not GeoJSON features, so their `feature` is `null`. Get the cell with `cellAt(position)` from [`mapheat.js`](mapheat#addgridmapid-data-options):

```javascript
const cakupan = addGridMap("peta", hasilUkur, { value: "rsrp", shape: "hex", cellMeters: 100 });

addContextMenu("peta", (position, feature) => {
    const petak = feature ? null : cakupan.cellAt(position);
    return [
        "coordinates",
        petak && { label: `RSRP ${petak.value.toFixed(1)} dBm (${petak.count} titik)`, disabled: true },
        petak && { label: "Lihat pengukuran di petak ini", onClick: () => tampilkanPengukuran(petak) },
    ];
});
```

The menu closes when an item is chosen, when Esc or Tab is pressed, when the user clicks outside the menu, and when the map is panned or zoomed. Inside the menu, the up/down arrows, Home, and End move focus; Enter or Space chooses; the right/left arrows open/close a submenu. It flips to the left or upward if it doesn't fit on screen.

Only one context menu is open on a page at a time. If `addContextMenu` is called twice for the same map, both open a menu and the last one is what shows, so a single call with a function that builds all the items is enough.

Its appearance can be overridden from the page's CSS without `!important`. The dark theme follows `prefers-color-scheme`, and on touch screens the items are taller so they are easy to *tap*.

| Class | Element |
|---|---|
| `.crootjs-map-menu` | The menu box, and also each submenu (`role="menu"`, placed in `<body>`) |
| `.crootjs-map-menu-item` | Each item (`<button role="menuitem">`) |
| `.crootjs-map-menu-danger` | Items with `danger: true` |
| `.crootjs-map-menu-icon`, `.crootjs-map-menu-label`, `.crootjs-map-menu-arrow` | Icon, text, and the submenu `›` marker inside an item |
| `.crootjs-map-menu-separator` | Separator line |

For a menu of your own, use [`onMapContextMenu`](map#onmapcontextmenuid-runfunction) from `map.js`. That function gives you only the point, the feature, and its position, with no menu UI.

## `addFullscreenButton(id, corner = "top-left")`

Adds a fullscreen button: the map fills the whole screen; click again (or press Esc) to go back. Browsers without the Fullscreen API for elements — Safari on iPhone — get an emulation: the map fills the browser window. The map size adjusts itself in both directions.

Returns a `remove()` function, which also exits fullscreen.

```javascript
addFullscreenButton("peta");
```

## Notes

- **Location is only available on HTTPS pages** (or `localhost` during development). On a plain `http://` page the browser refuses without asking the user, and the result is `null`.
- The user must approve the browser's location permission request. If they have denied it before, the browser does not ask again until the permission is changed in the site settings.
- Accuracy depends on the device: a phone with GPS can be within a few meters, a laptop guessing from Wi-Fi can be off by hundreds of meters. Always check `accuracy` before using the position for decisions such as attendance.
- `locateUser` gets the location once; `trackUser` follows it continuously. Both use the same location marker.
- Continuous tracking drains the battery, especially with GPS. Stop it with `stop()` as soon as it is no longer needed.
- Tracking only runs while the page is open. Browsers slow down or stop location updates when the tab is in the background or the phone screen is off, so this is not for recording a trip with the screen off.
- How often new positions arrive is determined by the device and browser, not by this module.
- For your own controls (buttons, legends), use [`addMapControl`](map) from `map.js`.
- `addLayerControl` reads each checkbox's initial state from its layer. If a layer is hidden via `hideLayer` after the panel is created, its checkbox does not change.
