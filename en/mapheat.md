*[Bahasa Indonesia](../mapheat)*

# `mapheat.js` Module Documentation

`mapheat.js` is an add-on module for [`map.js`](map) that draws point data as a **heatmap** (a smooth density gradient) or a **grid map** (square/hexagon cells colored by their average value, like the nPerf signal coverage map). Both are drawn on a single canvas above the basemap and below the data layers, so they stay lightweight even for tens of thousands of points: in testing, 50,000 points were redrawn in about 15–25 ms.

It is separate from `map.js` so that pages that don't use it don't have to download it (about 6 KB gzip, plus [`geo.js`](geo) for reading GeoJSON).

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { addHeatmap, addGridMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapheat.js";
```

The map must already have been created with `createMap`.

**Data** for both functions can be:

- any GeoJSON accepted by [`parseGeoJSON`](geo) — only `Point` and `MultiPoint` features are used, other features are skipped; or
- an array of `[lng, lat]`, or `[lng, lat, value]` — more economical for large data from your own server.

## `addHeatmap(id, data, options)`

Draws point density as a color gradient: blue where it is sparse, red where it is densest. Each point "heats up" its surroundings, fully at the point itself and fading out completely at a distance of `radius`.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `weight` | `1` | Weight of each point: a property name, or `function(feature) => number`. For array data: the third element if present. Points with a weight of 0, a negative weight, or a non-numeric weight are skipped |
| `radius` | `30` | Influence distance of each point, in screen pixels. Stays the same at every zoom |
| `radiusMeters` | — | Influence distance in meters (replaces `radius`): grows as you zoom in, suitable when "heat" means a distance on the ground |
| `max` | automatic | The density treated as hottest. Default: the highest density currently on screen, like the Google Maps heatmap. Set a fixed number so colors can be compared across places and over time |
| `scale` | `"linear"` | `"linear"`, `"sqrt"`, or `"log"`: how density is mapped to color. `"sqrt"`/`"log"` bring out sparse areas when the data is piled up at just a few points |
| `gradient` | blue → red | `{ position 0..1: color }`, for example `{ 0.4: "blue", 0.7: "lime", 1: "red" }` |
| `opacity` | `0.8` | Opacity of the whole layer (0–1) |
| `legend` | `false` | `true`, or `{ title, corner, low, high }`: a gradient legend in a corner of the map (defaults: `"bottom-right"`, text `"Kepadatan"`, `"Rendah"`, `"Tinggi"` — Indonesian for "Density", "Low", "High") |

Returns `{ setData(data), setOptions(options), show(), hide(), remove() }`.

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 13 });

// Outage reports from customers; weight = number of complaints at that location.
const heat = addHeatmap("peta", laporan, {
    weight: "keluhan",
    radius: 35,
    legend: { title: "Keluhan pelanggan" },
});

heat.setOptions({ scale: "sqrt" }); // bring out areas with few complaints
heat.setData(laporanBaru);          // replace the data without recreating the layer
```

## `addGridMap(id, data, options)`

Groups points into square or hexagon cells, then colors each cell by the combined value of the points inside it — for example the average RSRP from a drive test, like the nPerf coverage map. Click a cell to see its value.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `value` | — | Value of each point: a property name, or `function(feature) => number`. For array data: the third element. Points without a numeric value are skipped. Without `value`, cells are computed from the number of points |
| `aggregate` | `"mean"` | How values in one cell are combined: `"mean"`, `"max"`, `"min"`, `"sum"`, or `"count"`. Without `value`, always `"count"` |
| `shape` | `"square"` | `"square"` or `"hex"` (hexagon) |
| `cellSize` | `32` | Cell width in screen pixels. Cells are regrouped at each zoom level, so their on-screen size stays fixed: zoomed out, one cell covers a wider area |
| `cellMeters` | — | Cell width in meters (replaces `cellSize`, minimum 2): cells stay fixed on the ground and grow as you zoom in, like a coverage map. The meter calculation uses the data's average latitude |
| `breaks` | automatic | `[{ value, color, label }]`: cells with a value `>= value` use that `color`; cells below the first break use the first color. `label` is optional, for the legend |
| `colors` | red → green | Colors for automatic breaks, from low to high values. Default is 5 red–yellow–green colors, suited to values where higher is better (signal, speed) |
| `opacity` | `0.7` | Layer opacity (0–1) |
| `stroke` | — | Cell outline color. Default is no outline |
| `popup` | value + number of points | `function(cell) => text or element` when a cell is clicked; `false` = no popup |
| `onClick` | — | `function(cell)` called when a cell is clicked |
| `legend` | `false` | `true`, or `{ title, corner }`: a color legend in a corner of the map (default `"bottom-right"`) |

Without `breaks`, the range of cell values is divided evenly across `colors`. Automatic breaks are computed from the cells at the zoom level currently shown, so with `cellSize` the legend can change as you zoom. Set your own `breaks` so the colors stay fixed and comparable, for example standard RSRP thresholds.

The `cell` received by `popup` and `onClick`:

| Key | Contents |
|---|---|
| `value` | The cell's value according to `aggregate` |
| `count` | Number of points in the cell |
| `mean`, `min`, `max`, `sum` | Summary of its points' values |
| `center` | `[lng, lat]` center point of the cell |
| `color`, `label` | The cell's color and its legend label |

Returns `{ setData(data), setOptions(options), show(), hide(), remove(), cellAt(position) }`. `cellAt([lng, lat])` gives the `cell` at that point at the zoom level currently shown, or `null` if there is no cell there or the layer is hidden. Use it for an [`addContextMenu`](mapcontrol#addcontextmenuid-items-options) right-click menu, or to show a cell's value in your own panel.

```javascript
// Drive test results: each point has an rsrp property (dBm).
addGridMap("peta", driveTest, {
    value: "rsrp",
    shape: "hex",
    cellMeters: 100,
    breaks: [
        { value: -140, color: "#d7191c", label: "Sangat lemah (< -110)" },
        { value: -110, color: "#fdae61", label: "Lemah" },
        { value: -100, color: "#ffffbf", label: "Sedang" },
        { value: -90, color: "#a6d96a", label: "Baik" },
        { value: -80, color: "#1a9641", label: "Sangat baik (≥ -80)" },
    ],
    legend: { title: "RSRP (dBm)" },
    popup: (cell) => `RSRP rata-rata ${cell.value.toFixed(1)} dBm dari ${cell.count} pengukuran`,
});
```

Array data can be used directly too — its third element becomes the value:

```javascript
addGridMap("peta", [[107.601, -6.902, -87], [107.603, -6.901, -95] /* ... */], { legend: true });
```

## Styling

The legend uses the following classes, which can be overridden from the page's CSS without `!important`:

| Class | Element |
|---|---|
| `.crootjs-heat-legend` | Legend box |
| `.crootjs-heat-legend-title` | Legend title |
| `.crootjs-heat-legend-row`, `.crootjs-heat-legend-swatch` | Color row and its color swatch (`addGridMap`) |
| `.crootjs-heat-legend-bar`, `.crootjs-heat-legend-ends` | Gradient bar and the "Rendah"/"Tinggi" ("Low"/"High") text (`addHeatmap`) |
| `canvas.crootjs-heat-canvas` | The layer's canvas |

## Notes

- While the map is being panned or zoomed, the existing image just moves and scales along with it; as soon as the map pauses briefly (about 0.1 seconds), the layer is redrawn precisely. During zoom, the gradient may look blurry for a moment — that is normal.
- Heatmaps and grid maps are always below `addGeoJSON` layers and markers. Clicking an `addGeoJSON` feature opens that feature's popup, not the popup of the cell underneath.
- Included in exports by [`exportMapImage`](maptools#exportmapimageid-responsefunction-options-and-downloadmapimageid-filename-responsefunction-options) in `maptools.js`. The legend is not, because map controls are not exported.
- Very large data (hundreds of thousands of points) still works, but send it as a `[lng, lat, value]` array instead of GeoJSON to save memory and parse faster.
- A heatmap shows **density** (where there are many points). To show a **value** at a place (for example signal strength), use `addGridMap` with `value` — a heatmap weighted by signal value would be misleading, because places with many measurements look "hot" even when the signal is weak.
