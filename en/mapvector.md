# `mapvector.js` Module Documentation

*[Bahasa Indonesia](../mapvector)*

`mapvector.js` renders **vector tiles** ([Mapbox Vector Tile](https://github.com/mapbox/vector-tile-spec), MVT) into PNG images directly in the browser, so [`map.js`](map) can display them like ordinary tiles. You usually do not need to import it yourself: [`mapoffline.js`](mapoffline) uses it automatically for vector PMTiles files. Import it directly if you want to **change the map style** or render MVT from another source.

## Usage (Import)

```javascript
import { decodeMVT, renderVectorTile, DEFAULT_VECTOR_STYLE } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/mapvector.js";
```

## Style

A style is an array of **rules** drawn in order; later rules appear on top. The default style (`DEFAULT_VECTOR_STYLE`) targets the [Protomaps Basemap](https://docs.protomaps.com/basemaps/layers) schema, both the old version (`pmap:kind`) and the new one (`kind`), with colors similar to the OpenStreetMap map. Files with another schema are drawn with a generic style: gray areas, dark lines, and labels for named points.

| Rule key | Description |
|---|---|
| `layer` | MVT layer name, e.g. `"roads"`, `"water"`, `"buildings"`. Empty = all layers |
| `type` | `"fill"` (polygons), `"line"` (lines), or `"label"` (named points) |
| `filter` | `function (properties, zoom) => boolean`; only features that pass are drawn |
| `minZoom`, `maxZoom` | Zoom range of this rule |
| `color` | CSS color of the fill, line, or text |
| `width` | Line width in pixels (for a 256 px tile), or `function (zoom) => number` |
| `casing` | Line edge color, drawn slightly wider underneath (like the edges of a road) |
| `dash` | Dash pattern, e.g. `[4, 3]` |
| `outline` | Polygon outline color |
| `size`, `bold`, `halo` | Font size (or `function (zoom)`), bold text, and label halo color |

Example: a map with more prominent highways and place names in Indonesian. The default rules are copied, then one rule is appended at the end so it is drawn on top:

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/map.js";
import { openPMTiles } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/mapoffline.js";
import { DEFAULT_VECTOR_STYLE } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/mapvector.js";

const style = [
    ...DEFAULT_VECTOR_STYLE,
    { layer: "roads", type: "line", filter: (p) => (p.kind || p["pmap:kind"]) === "highway", color: "#dc2626", width: (z) => z - 9 },
];
const archive = await openPMTiles("bandung.pmtiles", null, { style, language: "id" });
createMap("map", { tiles: archive, maxZoom: archive.maxZoom, center: archive.center, zoom: 13 });
```

## `decodeMVT(bytes)`

Parses one MVT tile (`Uint8Array`, already uncompressed) into:

```javascript
{
  layerName: {
    extent: 4096,                     // size of the tile's coordinate grid
    features: [{ type, properties, geometry }]
  }
}
```

`type`: `1` point, `2` line, `3` polygon. `geometry`: an array of lines or rings, each an array of `[x, y]` in tile coordinates (0 to `extent`).

## `renderVectorTile(layers, zoom, area, options)`

Renders the output of `decodeMVT` into a Promise of a PNG `Blob`.

- `zoom`: the zoom of the tile being displayed; used by `minZoom`, `maxZoom`, and the functions in the style.
- `area` (optional): `{ scale, dx, dy }` to render part of a tile, namely cell `[dx, dy]` of a `scale × scale` grid. Used when the zoom goes beyond the file's contents, so lines stay sharp.
- `options`: `style` (default `DEFAULT_VECTOR_STYLE`), `size` (pixels, default 512), `language`, and `background` (background color; transparent by default).

Example: MVT tiles from an ordinary vector tile server, rendered for `map.js`.

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/map.js";
import { decodeMVT, renderVectorTile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/mapvector.js";

const vector = {
    async getTile(z, x, y) {
        const response = await fetch(`https://tiles.example.com/${z}/${x}/${y}.mvt`);
        if (!response.ok) return null;
        const layers = decodeMVT(new Uint8Array(await response.arrayBuffer()));
        return renderVectorTile(layers, z, null, { language: "id" });
    },
    attribution: "© OpenStreetMap contributors",
};
createMap("map", { tiles: vector, center: [107.6, -6.9], zoom: 13 });
```

For servers that send tiles with `Content-Encoding: gzip`, the browser has already decompressed them.

## Notes

- Labels are only for points (names of cities, villages, POIs). Street names that follow a line are not drawn yet, and labels cut off by the tile edge are skipped so they do not appear half-drawn.
- Each tile is rendered in the browser when it is displayed. On older phones, a vector map takes slightly longer to appear than image tiles.
- `OffscreenCanvas` is used when available; otherwise, a regular canvas.
