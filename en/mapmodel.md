*[Bahasa Indonesia](../mapmodel)*

# `mapmodel.js` Module Documentation

`mapmodel.js` is an add-on module for [`map.js`](map) that places **glTF/GLB 3D models at their location on the map** — e.g. a BTS tower at its real coordinates — sized to real-world meters, viewed at an angle from the south.

The CrootJS map is viewed straight down from above, so each model is drawn on its own WebGL canvas (via [`model3d.js`](model3d)) and then pinned to its point. When the map is zoomed, its size changes accordingly. This module is about 2 KB gzip, plus the `model3d.js` it imports.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addModel, setPartColor, highlightPart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapmodel.js";
```

`mapmodel.js` **re-exports every function of [`model3d.js`](model3d)**. For models on the map, import those functions (`setPartColor`, `highlightPart`, `setPartTransform`, ...) from `mapmodel.js`, not from a separate `model3d.js` import: a module imported from another URL (for example `model3d.min.js`) is another copy with its own list of viewers, so it does not know the `viewerId` of a model on the map.

## `addModel(id, position, source, options)`

Places a model at `position` `[lng, lat]`. `source`: a `.glb`/`.gltf` URL, File/Blob, or ArrayBuffer — same as [`loadModel`](model3d#loadmodelid-source-responsefunction).

**The model's origin (0, 0, 0)** — in glTF usually the center of the model's base — lands exactly on `position`. The model's axes follow glTF: +Y up, **−Z facing north**, +X east.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `heading` | `0` | Model rotation clockwise from north, in degrees. For a BTS: the facing direction of the first sector |
| `pitch` | `50` | Viewing angle above the horizon, in degrees (`90` = straight down from above) |
| `scale` | `1` | Meters per model unit. glTF uses meters; set more than 1 to enlarge a small model so it is visible |
| `minZoom` | `13` | Below this zoom the model is hidden (too small to see) |
| `onClick` | — | `function (hit)` when the model is clicked; `hit` is the same as in [`onModelClick`](model3d#onmodelclickid-runfunction) |
| `responseFunction` | — | `function (info, error)` after the model is loaded, same as `loadModel` |

Returns:

| Member | Purpose |
|---|---|
| `setPosition([lng, lat])`, `setHeading(derajat)` | Moves or rotates the model |
| `viewerId` | Its viewer ID, for other `model3d.js` functions — e.g. `setPartColor(model.viewerId, "Antena_1", "red")` |
| `loaded` | Promise of the `loadModel` result |
| `remove()` | Removes the model and its WebGL context |

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 18 });

const bts = addModel("peta", [107.6, -6.9], "models/bts.glb", {
    heading: 30,
    onClick: (hit) => setInnerText("info", hit.path.join(" › ")),
});
await bts.loaded;
setPartColor(bts.viewerId, "Antena_1", "#f59e0b"); // highlight sector 1
```

## Notes

- **It is true to scale.** A 30 m tower at zoom 18 is only about 50 pixels. Use `scale` to exaggerate the size if the goal is a visual marker rather than the real size.
- **Each model uses one WebGL context**, and browsers limit how many there can be (usually 8–16 per page). For many locations, show a model only for the selected one, and use ordinary markers for the rest.
- The model canvas does not capture clicks and drags, so the map can still be panned from on top of the model. Clicks are checked separately against the model's shape.
- Models are always above the map's data layers and are not included in [`exportMapImage`](maptools).
- `mapmodel.js` imports `model3d.js` itself. If the page also needs a regular 3D viewer, create it with `createViewer` imported from `mapmodel.js` so that `model3d.js` is not downloaded twice.
