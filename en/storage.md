# `storage.js` Module Documentation

*[Bahasa Indonesia](../storage)*

`storage.js` saves, reads, and deletes data in the browser's `localStorage` and `sessionStorage`. Unlike the built-in API, values are `JSON.stringify`/`JSON.parse`d automatically (so objects and arrays can be stored directly), and `localStorage` data can be given an expiry in days, hours, or seconds.

## Usage (Import)

```javascript
import { setLocal, getLocal, deleteLocal } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.32/storage.js";
```

## `setLocal(key, value)`

Saves `value` to `localStorage` with no expiry: it stays until it is deleted or the site data is cleared. `value` can be anything that converts to JSON (string, number, boolean, `null`, object, array).

Returns `true` when saved, `false` when storage is blocked or full.

```javascript
setLocal("prefs", { theme: "dark", fontSize: 16 });
```

## `setLocalWithExpireDay(key, value, exdays)`

## `setLocalWithExpireHour(key, value, exhour)`

## `setLocalWithExpireSecond(key, value, exsecs)`

Same as `setLocal`, with an expiry of `exdays` days, `exhour` hours, or `exsecs` seconds from now. After that, `getLocal` returns `null` and removes the key from storage. Expired data is not removed until it is read.

```javascript
setLocalWithExpireHour("articleDraft", { title: "Flooding in Dayeuhkolot" }, 2); // valid for 2 hours
```

## `getLocal(key)`

Reads a value from `localStorage`, already parsed from JSON. Returns `null` when the key does not exist, has expired, is not JSON, or storage is blocked.

```javascript
const prefs = getLocal("prefs"); // { theme: "dark", fontSize: 16 } or null
```

`getLocal` is only for keys written through this module. A value written with plain `localStorage.setItem` gives `null` (if it is not JSON) or `undefined`.

## `deleteLocal(key)`

Removes the key from `localStorage`. Returns nothing.

## `setSession(key, value)`

## `getSession(key)`

## `deleteSession(key)`

Same as `setLocal`, `getLocal`, and `deleteLocal`, but for `sessionStorage`: the data is gone when the tab is closed. There are no expiry variants.

```javascript
setSession("formStep", 2);
const step = getSession("formStep"); // 2
```

## Notes

- **Blocked** storage (some private modes, strict privacy settings, or third-party iframes) or **full** storage: since 0.0.29 this module does not throw. `getLocal`/`getSession` return `null`, `setLocal*`/`setSession` return `false`, `deleteLocal`/`deleteSession` do nothing, and a warning is logged once per storage type. The page keeps working; the data just is not saved.
- Values go through `JSON.stringify`: a `Date` becomes a string, and `undefined`, functions, `Map`, and `Set` are not stored intact.
- `localStorage` and `sessionStorage` are separate per origin (protocol + domain + port).
- The browser can still delete this data at any time (full storage, private mode, or the user clearing site data). Don't make it the only place important data lives.
- Data that must be sent to the server with every request belongs in a cookie ([`cookie.js`](cookie)); `localStorage`/`sessionStorage` can only be read by JavaScript.
