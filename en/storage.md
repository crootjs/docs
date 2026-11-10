*[Bahasa Indonesia](../storage)*

# `storage.js` Module Documentation

`storage.js` is a CrootJS module for saving, reading, and deleting data in the browser's `localStorage` and `sessionStorage`. Unlike the built-in `localStorage`/`sessionStorage`, this module automatically performs `JSON.stringify`/`JSON.parse` (so you can store objects/arrays directly, not just strings), and its `localStorage` functions support optional expiry (days/hours/seconds) — something the built-in `localStorage` does not have.

## Usage (Import)

```javascript
import { setLocal, getLocal, deleteLocal } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/storage.js";
```

## localStorage

### `setLocal(key, value)`
Saves data to `localStorage` with no expiry (it stays until it is deleted manually or the browser's storage is cleared). `value` can be a string, number, boolean, object, or array.

```javascript
setLocal("prefs", { theme: "dark", fontSize: 16 });
```

### `setLocalWithExpireDay(key, value, exdays)` / `setLocalWithExpireHour(key, value, exhour)` / `setLocalWithExpireSecond(key, value, exsecs)`
Saves data to `localStorage` with a validity period. Once that time has passed, `getLocal` automatically treats it as missing (and immediately removes it from storage).

```javascript
setLocalWithExpireHour("draftArtikel", { judul: "..." }, 2); // valid for 2 hours
```

### `getLocal(key)`
Reads data from `localStorage`. Returns `null` if the key does not exist, has expired, or its data is corrupt.

```javascript
const prefs = getLocal("prefs"); // { theme: "dark", fontSize: 16 } or null
```

### `deleteLocal(key)`
Deletes data from `localStorage`.

## sessionStorage

Same as above, but for `sessionStorage` (cleared automatically when the tab is closed) and without the expiry option (not relevant, because the browser already clears `sessionStorage` automatically):

- `setSession(key, value)`
- `getSession(key)`
- `deleteSession(key)`

```javascript
setSession("langkahForm", 2);
const langkah = getSession("langkahForm"); // 2
```

## Notes

- `localStorage` and `sessionStorage` are per-origin (domain) and cannot be accessed across domains.
- Data stored with this module (including data without expiry via `setLocal`) can still be deleted by the browser at any time (private/incognito mode, full storage, or the user clearing site data) — do not make it the only source of important data.
- If you need a cookie (sent to the server via an HTTP header), use [`cookie.js`](cookie), not this module — `localStorage`/`sessionStorage` can only be accessed from JavaScript and are not sent to the backend automatically.
