*[Bahasa Indonesia](../georoute)*

# `georoute.js` Module Documentation

`georoute.js` finds the **shortest route along the lines in your own GeoJSON data** — roads, alleys, campus paths, building corridors. The route is computed in the browser: no routing service is called, no API key is needed, and it keeps working offline as long as the data is already loaded.

This module is pure computation. It doesn't need a map; the result is plain GeoJSON that can be drawn with [`map.js`](map) or used as-is to get the travel distance.

## Usage (Import)

```javascript
import { findRoute } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/georoute.js";
```

All [`geomeasure.js`](geomeasure) functions (`getDistance`, `getLength`, `isInside`, and the rest) are also exported from `georoute.js`, so a page that computes routes only needs to import from here.

## `findRoute(from, to, geojson, options)`

Finds the shortest route from `from` to `to` (both `[lng, lat]`) along the `LineString` and `MultiLineString` geometries in `geojson`. Points and polygons in the data are ignored.

Returns a `Feature` with a `LineString` geometry and `properties.distance` holding the route length in meters — or `null` if the data has no lines, or the two points are not connected.

```javascript
const jalan = {
    type: "FeatureCollection",
    features: [
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[107.60, -6.90], [107.61, -6.90]] } },
        { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[107.61, -6.90], [107.61, -6.91]] } },
    ],
};

const rute = findRoute([107.604, -6.898], [107.612, -6.907], jalan);

rute.properties.distance;  // 1440.70... (meters)
rute.geometry.coordinates; // [[107.604, -6.9], [107.61, -6.9], [107.61, -6.907]]
```

In that example neither point lies exactly on a road. **`from` and `to` can be anywhere**: each is snapped to the nearest point on the nearest line, and the route starts and ends at those snapped points. So click coordinates or the user's location can be used directly.

## Drawing the Route on the Map

Since the result is a plain Feature, `addGeoJSON` can draw it directly:

```javascript
import { createMap, addGeoJSON, fitMap, getGeoJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { findRoute } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/georoute.js";

createMap("peta");

getGeoJSON("jalan.geojson", (response) => {
    if (!response.data) return;

    const rute = findRoute([107.575914, -6.8732098], [107.5772, -6.8752], response.data);
    if (!rute) {
        console.log("Kedua titik tidak terhubung.");
        return;
    }
    addGeoJSON("peta", rute, { style: { stroke: "#2563eb", strokeWidth: 5 } });
    fitMap("peta", rute);
    console.log(`Panjang rute: ${Math.round(rute.properties.distance)} m`);
});
```

A complete example with draggable A and B pins: [demo](https://croot.js.org/examples/geo/route/) · [source](https://github.com/crootjs/examples/tree/main/geo/route).

## Data Requirement: Lines Must Meet at the Same Coordinate

Two lines are considered connected **only if they share the same coordinate** — at their ends or in the middle of a line. This is how OpenStreetMap road data is structured: every intersection is a single point shared by the roads that meet there.

As a result:

- Two lines that merely **cross** without a shared point are not connected. This is intentional: a flyover and the road beneath it also cross on the map, yet you cannot pass from one to the other.
- Two lines whose ends are merely **close together** (common in hand-drawn data) are not connected.

For the second case there is the `precision` option: the number of decimal places used when comparing coordinates. The smaller the value, the more loosely two points are considered equal.

| `precision` | Points are considered equal if they are roughly within |
|---|---|
| `6` (default) | 11 cm |
| `5` | 1 m |
| `4` | 11 m |

```javascript
findRoute(from, to, jalanGambarTangan, { precision: 5 });
```

If `findRoute` returns `null` even though the lines look connected on the map, this is almost always the cause. The cleanest fix is still to correct the data: when drawing, make sure lines that meet really share a single point.

## Notes

- **All lines are treated as two-way**, and what is searched for is the **shortest distance** — not the fastest time. One-way streets, turn restrictions, and speeds are not taken into account. This module suits pedestrian paths, campus areas, or your own networks; it is not a replacement for vehicle navigation.
- `properties.distance` is the length along the lines, from the starting snapped point to the ending snapped point. The distance from the `from`/`to` you provided to their snapped points is not included; compute it with [`getDistance`](geomeasure) if needed (for example to tell the user "your point is 300 m from the nearest road").
- The network is rebuilt on every call. In testing, a road extract with 252 segments was computed in a few milliseconds and a network of 22,500 intersections in about 0.1 seconds on a laptop; phones are slower. For city-scale data, crop the data to the area you need.
- If you use OpenStreetMap data, include its attribution ("© OpenStreetMap contributors"); its license requires this for the data too, not only for map images.
