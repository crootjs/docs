*[Bahasa Indonesia](../mapsearch)*

# `mapsearch.js` Module Documentation

`mapsearch.js` is an add-on module for [`map.js`](map) for **finding places by name or address** (geocoding), **finding the address of a point** (reverse geocoding), and a ready-to-use **search box** on the map. Its size is about 3 KB gzip.

By default it uses OpenStreetMap's [Nominatim](https://nominatim.org). The public server is free but run by volunteers, with a [usage policy](https://operations.osmfoundation.org/policies/nominatim/):

- at most **1 request per second** — this module adds the delay automatically;
- **no automatic searching on every keystroke** — the search box only searches when Enter or the search button is pressed;
- results must carry **OpenStreetMap attribution** — the search box shows it below the results.

For apps with many users, run your own Nominatim (the `url` option) or use another provider (the `provider` option).

## Usage (Import)

```javascript
import { createMap } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/map.js";
import { searchPlace, reverseGeocode, addSearchControl } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/mapsearch.js";
```

## `addSearchControl(id, options)`

A search box in a corner of the map. Type and press Enter (or the search button); pick a result by clicking, or with the up/down arrows and Enter. The map moves to that place — the whole area if the result is a region — and places a red marker.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `placeholder` | `"Cari tempat atau alamat"` ("Search for a place or address") | Hint text in the box |
| `corner` | `"top-right"` | Map corner |
| `marker` | `true` | `false` = no red marker |
| `maxZoom` | `17` | Closest zoom when moving to a result |
| `onSelect` | — | `function (result)` when a result is selected |
| `limit`, `countryCodes`, `language`, `viewbox`, `url`, `provider` | | Same as [`searchPlace`](#searchplacequery-responsefunction-options) |

Returns `{ search(text), clear(), remove() }` — `search` runs a search from code.

```javascript
createMap("peta", { center: [107.6, -6.9], zoom: 12 });
addSearchControl("peta", {
    countryCodes: "id",
    onSelect: (result) => setInnerText("lokasi", result.name),
});
```

## `searchPlace(query, responseFunction, options)`

Finds places from text: a place name, address, or street name. `responseFunction(results)` is called once, and the function also returns a Promise of `results`:

- an array of results (empty if nothing matches), or
- `null` if the request failed (network, server refused).

A single result:

| Key | Contents |
|---|---|
| `name` | Full name of the place |
| `position` | `[lng, lat]` |
| `bbox` | `[minLng, minLat, maxLng, maxLat]` the place's area, or `null` |
| `type` | Its type, e.g. `"amenity:university"` |
| `address` | Address details from Nominatim (`road`, `city`, `postcode`, ...), or `null` |
| `raw` | Original data from the provider |

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `limit` | `5` | Number of results |
| `countryCodes` | — | Restrict countries, e.g. `"id"` or `"id,my"` |
| `language` | browser language | Language of place names, e.g. `"id"` |
| `viewbox` | — | `[minLng, minLat, maxLng, maxLat]` to prefer results in that area |
| `url` | OSM public server | Address of your own Nominatim server |
| `provider` | — | `function (query, options) => Promise<results>` for another provider; results must be shaped like the table above |

```javascript
const hasil = await searchPlace("Jalan Asia Afrika Bandung", null, { countryCodes: "id" });
if (hasil && hasil.length) setMapView("peta", hasil[0].position, 17);
```

## `reverseGeocode(position, responseFunction, options)`

The address at point `[lng, lat]`. `responseFunction(result)` receives a single result shaped the same as above, or `null` if there is no address there or the request failed. Also returns a Promise.

`options`: `zoom` (address detail 3–18, default 18 = building level), `language`, `url`, `provider` (`function (position, options) => Promise<result>`).

```javascript
onMapClick("peta", async (position) => {
    const alamat = await reverseGeocode(position);
    showPopup("peta", position, alamat ? alamat.name : "Alamat tidak ditemukan");
});
```

## Styling

| Class | Element |
|---|---|
| `.crootjs-map-search` | The search box |
| `.crootjs-map-search-button` | The search button |
| `.crootjs-map-search-results` | Result list (`role="listbox"`); the highlighted result has `[aria-selected="true"]` |
| `.crootjs-map-search-type` | Place type below the name |
| `.crootjs-map-search-credit` | OpenStreetMap attribution |
| `.crootjs-map-search-pin` | Red marker at the selected place |
