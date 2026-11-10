*[Bahasa Indonesia](../mapmarker)*

# `mapmarker.js` Module Documentation

`mapmarker.js` is an add-on module for [`map.js`](map): markers shaped as a pin, an image icon, or your own HTML element — with a label, a popup, and optional dragging. This module is separate from `map.js` so pages that don't need markers don't have to download it (about 2 KB gzip).

Points in GeoJSON data are already drawn by `addGeoJSON` as small circles. `addMarker` is for when you need more than that: a prominent pin, your own icon, a name label, or a marker the user drags to pick a location.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapmarker.js";
```

The map must be created with `createMap` before `addMarker` is called.

## `addMarker(id, position, options)`

Places a marker at `position` (`[lng, lat]`) on the map with ID `id`. Without `options`, the result is a red pin.

```javascript
createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

addMarker("peta", [107.575914, -6.8732098]);
addMarker("peta", [107.5757, -6.8738], { label: "Rektorat", popup: "Gedung Rektorat" });
```

`options` (all optional):

| Option | Description |
|---|---|
| `color` | Color of the default pin (any CSS value). Default: red |
| `icon` | Image URL to use instead of the pin |
| `size` | `[width, height]` of the `icon` image in pixels. Default: `[32, 32]` |
| `element` | Your own DOM element to use instead of the pin/icon |
| `anchor` | The part of the marker that sits on its position: `"bottom"` (default — bottom center, suits pins), `"center"` (suits round icons), `"top"`, `"left"`, `"right"`, `"top-left"`, `"top-right"`, `"bottom-left"`, or `"bottom-right"` |
| `offset` | `[dx, dy]` — additional shift in pixels from the anchor point (positive `dy` = downward). Default: `[0, 0]` |
| `label` | Text always shown below the marker |
| `title` | Tooltip text shown when the cursor is over the marker |
| `popup` | Text or DOM element shown when the marker is clicked |
| `onClick` | Function `(position)` called when the marker is clicked |
| `draggable` | `true` = the marker can be dragged with a mouse or finger |
| `onDragEnd` | Function `(position)` called after the marker has been dragged |

The return value is a controller object for that marker:

| Method | Purpose |
|---|---|
| `getPosition()` | The marker's current position, `[lng, lat]` |
| `setPosition(position)` | Moves the marker |
| `remove()` | Removes the marker from the map |

## Custom Icons and Elements

```javascript
// image icon, centered on its position
addMarker("peta", [107.5757, -6.8738], { icon: "kampus.png", size: [28, 28], anchor: "center" });

// your own element: its appearance comes entirely from your page's CSS
const lencana = document.createElement("span");
lencana.className = "lencana";
lencana.textContent = "12";
addMarker("peta", [107.5762, -6.8734], { element: lencana, anchor: "center" });
```

## Anchor and Offset

`anchor` determines which part of the marker sits exactly on its position, and `offset` shifts it slightly from there. For example, a pole number label placed to the right of its point, 6 pixels away:

```javascript
const nomor = document.createElement("span");
nomor.className = "nomor-tiang"; // its appearance comes from your page's CSS
nomor.textContent = "T-12";
addMarker("peta", [107.5757, -6.8738], { element: nomor, anchor: "left", offset: [6, 0] });
```

A marker's popup always appears above the marker's top edge, whatever its anchor.

## Draggable Markers

The most common use: the user drags the pin to the exact location, and its coordinates go into a form.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addMarker } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapmarker.js";
import { setValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

createMap("peta", { center: [107.5759, -6.8736], zoom: 17 });

addMarker("peta", [107.5759, -6.8736], {
    draggable: true,
    title: "Geser ke lokasi yang tepat",
    onDragEnd: (position) => {
        setValue("longitude", position[0]);
        setValue("latitude", position[1]);
    },
});
```

To move a marker from code — for example to the point clicked on the map — use `setPosition`:

```javascript
import { onMapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";

const pin = addMarker("peta", [107.5759, -6.8736]);
onMapClick("peta", (position) => pin.setPosition(position));
```

## Behavior

- **A click on a marker belongs to the marker.** The marker's `onClick` and `popup` run; the map's `onMapClick` is not called, and double-clicking a marker does not zoom the map.
- **Dragging a marker that is not `draggable` pans the map.** So a map full of markers stays easy to pan even when a finger lands on a marker.
- Markers move with the map as it pans and zooms, but their on-screen size stays the same.
- Markers with a `popup`, `onClick`, or `draggable` can be reached with the Tab key and activated with Enter.
- `popup` and `label` text is inserted as text, not HTML. For formatted content, pass a DOM element as `popup`.
- Markers disappear along with the map when it is removed (`removeMap`) or recreated (`createMap` with the same ID).

## Notes

- `clearMap` only removes GeoJSON layers; markers are not removed. Remove a marker with its own `remove()`.
- Each marker is one HTML element. For hundreds of markers this is comfortable; for thousands of points, draw them as GeoJSON data with `addGeoJSON` (lighter), and use markers only for the ones that need to stand out.
