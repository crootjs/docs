*[Bahasa Indonesia](../geomeasure)*

# `geomeasure.js` Module Documentation

`geomeasure.js` contains the calculations most often needed for geospatial data: distance, length, area, point-in-area, nearest point, radius circles, and transformation from local coordinate systems. They are all pure functions — no map, no DOM required — so they can be used with or without [`map.js`](map).

Positions are always `[lng, lat]` as in GeoJSON, and results are always in **meters** (or square meters).

## Usage (Import)

```javascript
import { getDistance, getArea, isInside, createAffineTransform } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geomeasure.js";
```

Functions that accept `geojson` are as flexible as [`parseGeoJSON`](geo): a `FeatureCollection`, a single `Feature`, a single bare geometry, an array of them, or JSON text. The examples below use `data` from [contoh.geojson](https://github.com/petapedia/geojson/blob/main/contoh.geojson).

## `getDistance(from, to)`

The distance between two positions, following the curvature of the Earth.

```javascript
getDistance([106.8272, -6.1754], [107.6191, -6.9175]); // 120258.27... (Monas to Bandung's town square, about 120 km)
```

## `getLength(geojson)`

The length of all lines in the data. For polygons, the perimeter is counted (including hole edges). Points have no length.

```javascript
getLength({ type: "LineString", coordinates: [[107.60, -6.90], [107.61, -6.90], [107.61, -6.91]] }); // 2215.84...
getLength(data.features[0]); // 110.70... (perimeter of the Rektorat building)
```

## `getArea(geojson)`

The area of all polygons in the data, in square meters. Holes are subtracted. Points and lines have no area.

```javascript
getArea(data.features[0]); // 710.28... (Rektorat building)
getArea(data);             // 1980.88... (both buildings)
```

## `isInside(position, geojson)` and `getFeaturesAt(position, geojson)`

`isInside` answers `true`/`false`: whether the position lies inside any polygon in the data. `getFeaturesAt` returns the polygon features that contain it (an empty array if none), to find out *which polygon*.

```javascript
isInside([107.5761, -6.8735], data); // true
isInside([107.5759, -6.8736], data); // false (between the two buildings)

getFeaturesAt([107.5761, -6.8735], data).map((feature) => feature.properties.Gedung); // ["Auditorium"]
```

A point that falls inside a polygon's hole counts as outside that polygon.

## `getNearest(position, geojson)`

The point feature (`Point`/`MultiPoint`) closest to the position. Returns `{ feature, distance }`, or `null` if the data has no point features. Lines and polygons are not compared.

```javascript
const terdekat = getNearest([107.5761, -6.8735], data);
terdekat.feature.properties.Gedung; // "ULBI"
terdekat.distance;                  // 38.24...
```

## `createCircle(center, radius, steps = 64)`

Creates a circle-shaped polygon Feature centered at `center` with a radius of `radius` meters. GeoJSON has no notion of circles, so the result is a polygon with `steps` sides.

```javascript
const radiusPresensi = createCircle([107.575914, -6.8732098], 100); // 100 m circle
```

## `createAffineTransform(from, to)`

Creates an *affine* transformation (translate, rotate, scale, skew) from pairs of control points: the *i*-th point in `from` pairs with the *i*-th point in `to`, each `[x, y]`. Its purpose is converting local-system coordinates — a CAD grid, a building floor plan, the pixels of a scanned image — into `[lng, lat]`, and back.

It requires at least **3 non-collinear pairs**. More than 3 are fitted by least squares, so extra control points average out measurement errors.

Returns a function `transform([x, y])`, or `null` if there are too few control points, the counts don't match, or they are collinear. The function also has:

| Member | Content |
|---|---|
| `transform.inverse([x, y])` | The reverse direction: from the `to` system to the `from` system |
| `transform.error` | The mean (RMS) residual of the control points after transformation, in `to` units. For `[lng, lat]`, 0.00001° ≈ 1.1 m. A large value means a control point was mistyped |

```javascript
// Three survey markers with known project grid coordinates (meters) and lng/lat.
const grid = [[1000, 2000], [1500, 2000], [1000, 2400]];
const wgs84 = [[107.57520, -6.87410], [107.57974, -6.87407], [107.57517, -6.87048]];
const gridToWgs = createAffineTransform(grid, wgs84);

gridToWgs([1250, 2200]);                 // [lng, lat] of that grid point
gridToWgs.inverse([107.5775, -6.8723]);  // grid [x, y] from lng/lat
```

Converting an entire GeoJSON dataset from a CAD grid is just a matter of mapping each of its coordinates with `gridToWgs`. To place a floor plan image using control points, see `addImageOverlay` in [`maptools.js`](maptools).

An affine transform on `[lng, lat]` is accurate enough for district-sized areas (a few kilometers). For much larger regions, or data in an official projection such as UTM/TM-3, use the projection's formulas.

## Example: Location-Based Attendance

The most common combination: draw the radius, get the user's location, then check whether they are inside it.

```javascript
import { createMap, addGeoJSON, fitMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/map.js";
import { locateUser } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/mapcontrol.js";
import { createCircle, isInside, getDistance } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/geomeasure.js";

const kampus = [107.575914, -6.8732098];
const area = createCircle(kampus, 100);

createMap("peta");
addGeoJSON("peta", area);
fitMap("peta", area);

locateUser("peta", (lokasi) => {
    if (!lokasi) {
        console.log("Lokasi tidak didapat.");
        return;
    }
    if (isInside(lokasi.position, area)) {
        console.log("Di dalam area presensi.");
    } else {
        console.log(`Di luar area, ${Math.round(getDistance(lokasi.position, kampus))} m dari kampus.`);
    }
});
```

For areas that are not circular, replace `area` with the campus boundary polygon from your GeoJSON data; `isInside` works the same way.

## Notes

- All calculations treat the Earth as a sphere with a mean radius of 6,371,008.8 m — the same value Turf.js uses, so the numbers match Turf. The real Earth is slightly flattened, so results can be off by a few tenths of a percent from precise geodetic measurements. For distances and areas in everyday applications this is more than enough; for land boundaries or legal purposes, use proper surveying instruments.
- Device location has limited accuracy (see `accuracy` in [`mapcontrol.js`](mapcontrol)). For decisions like attendance, allow some tolerance: a point 5 m outside the boundary with 30 m accuracy is not necessarily truly outside.
- Data crossing the 180° meridian (antimeridian) is not handled specially.
- For routes along roads (not straight lines), see [`georoute.js`](georoute).
