*[Bahasa Indonesia](../mapcluster)*

# `mapcluster.js` Module Documentation

`mapcluster.js` is an add-on module for [`map.js`](map) that keeps **very large point datasets** lightweight on the map. Points that are close together on screen are merged into a single numbered bubble; as the map zooms in, the bubbles split into smaller groups, and eventually into individual points.

Without clustering, 20,000 points means 20,000 elements on the page and a map that is sluggish to pan. With this module the number of elements is determined by the screen size, not the amount of data: in testing with 100,000 points, there were never more than about 180 elements on screen.

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addCluster } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcluster.js";
```

The map must already have been created with `createMap`.

## `addCluster(id, geojson, options)`

Draws the point features (`Point` and `MultiPoint`) in `geojson` as clusters. `geojson` may be anything accepted by [`parseGeoJSON`](geo). Non-point features are skipped — draw lines and polygons with `addGeoJSON` from `map.js`.

Returns a `remove()` function that removes everything from the map.

```javascript
import { createMap, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { addCluster } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapcluster.js";

createMap("peta");

getGeoJSON("https://api.example.com/sekolah.geojson", (response) => {
    if (!response.data) return;
    addCluster("peta", response.data);
    fitMap("peta", response.data);
});
```

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `radius` | `60` | Clustering distance in pixels: points within one cell of this width are merged. The larger it is, the fewer bubbles on screen |
| `color` | blue | Color of bubbles and points (any CSS value) |
| `popup` | list of `properties` | Function `(feature) => text or DOM element` for the popup content of an individual point; returning `null` = no popup for that point. `false` = no popups at all |
| `onClick` | — | Function `(feature)` called when an individual point is clicked |

```javascript
addCluster("peta", data, {
    radius: 80,
    color: "#dc2626",
    popup: (feature) => feature.properties.nama,
});
```

## What Happens on Click

- **Bubble** — the map zooms to the center of that cluster, just enough for the cluster to split into several parts.
- **Bubble that cannot be split** — if all its members are at exactly the same position (or only separate beyond the map's maximum zoom), no zoom can separate them. Instead, a popup appears showing the count and details of the first five points.
- **Individual point** — a popup appears with its `properties` (or the content from the `popup` option), and `onClick` is called.

Clicking a bubble or point does not call the map's `onMapClick`. Dragging while pressing on a bubble still pans the map.

Large numbers in bubbles are abbreviated: `1,2rb` for 1,234, `15rb` for 15,400, `2,3jt` for 2,300,000 (Indonesian abbreviations for thousand and million). The bubble size also grows at 100 and 1,000 points.

## How It Works

At each zoom level, the world is divided into cells `radius` pixels wide. All points in one cell become one cluster, and its bubble is drawn at the centroid (average position) of its members — not at the center of the cell — so its placement follows the data.

That means a single pass over all points per zoom level, without comparing points pairwise. A level's clusters are only computed when that level is first needed, and are then cached.

In testing on a laptop with 100,000 points: initial setup took about 30 milliseconds, the first visit to a new zoom level under 10 milliseconds, and panning stayed at 60 frames per second. Phones are slower, but the pattern is the same.

## Notes

- Because the division is grid-based, two points that are close together but fall into adjacent cells are not merged, so two bubbles sometimes appear fairly close. That is the price of its speed; increase `radius` if you want fewer bubbles.
- The cluster layout changes per zoom level, so a bubble's number is not always equal to the sum of the bubbles it splits into at the next level (points at a cell edge can switch clusters). The overall total always stays the same.
- `clearMap` does not remove clusters; use the `remove()` returned by `addCluster`. To replace the data, call `remove()` and then `addCluster` again.
- The data still has to be fully downloaded and parsed by the browser. For hundreds of thousands of points, the size of the GeoJSON file itself (tens of megabytes) is usually the bottleneck, not the clustering. If your data is that large, have the backend send only the points in the visible area (see `onMapMove` and `getMapBounds` in [`map.js`](map)).
- The bubble appearance can be changed from your page's CSS via the `crootjs-cluster` (bubble) and `crootjs-cluster-point` (individual point) classes.

A complete example with 1,000 to 100,000 points: [demo](https://croot.js.org/examples/geo/cluster/) · [source](https://github.com/crootjs/examples/tree/main/geo/cluster).
