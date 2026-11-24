# From JSCroot to CrootJS

*[Bahasa Indonesia](../migrasi)*

CrootJS is the successor of **JSCroot**. The modules come from the same code (`jscroot/lib`) and continue in `crootjs/lib`. The old sites (jscroot.github.io and the jscroot repos) now redirect to croot.js.org. The old `.js` files on jsDelivr are still there and unchanged, so projects that still use JSCroot do not suddenly break. They just won't get fixes any more.

## Steps

1. Change the import URLs. CrootJS restarted its version numbers at `0.0.x`, so `crootjs/lib@0.0.41` is **newer** than `jscroot/lib@0.2.8`.

   ```javascript
   // before
   import { getJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/api.js";
   // after
   import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/api.min.js";
   ```

   Always pin a version (`@0.0.33`). URLs without one (`jscroot/lib/api.js`, used in some old examples) can change at any time. Use `.min.js` in production.
2. If your code comes from JSCroot **0.2.0 or older**, adjust the argument order and replace removed functions (tables below).
3. Test the page, including with the server down or the network off: network failures behave differently now (see the last section).

Code written for JSCroot 0.2.1–0.2.8 usually works right after step 1: every function in 0.2.8 still exists in CrootJS with the same argument order. Some only gained optional parameters at the end.

## `api.js` argument order (JSCroot 0.2.0 and older)

Since JSCroot 0.2.1 the callback comes before the token:

| JSCroot ≤ 0.2.0 | CrootJS |
|---|---|
| `getJSON(url, tokenkey, tokenvalue, fn)` | `getJSON(url, fn, tokenkey, tokenvalue)` |
| `postJSON(url, tokenkey, tokenvalue, data, fn)` | `postJSON(url, data, fn, tokenkey, tokenvalue)` |
| `putJSON(url, tokenkey, tokenvalue, data, fn)` | `putJSON(url, data, fn, tokenkey, tokenvalue)` |
| `deleteJSON(url, tokenkey, tokenvalue, data, fn)` | `deleteJSON(url, data, fn, tokenkey, tokenvalue)` |

`fn` still receives `{ status, data }`.

## Removed functions and their replacements

| JSCroot | Last in | Replacement in CrootJS |
|---|---|---|
| `get(url, fn)` (`fn` receives the JSON itself) | 0.2.0 | `getJSON(url, result => fn(result.data))` |
| `getWithHeader(url, key, value, fn)` | 0.2.0 | `getJSON(url, result => fn(result.data), key, value)` |
| `postWithBearer(url, token, data, fn)` | 0.2.0 | `postJSON(url, data, result => fn(result.data), "Authorization", "Bearer " + token)` |
| `addCSSIn(href, id)` | 0.1.3 | `addCSSInHead(href)`, or `addCSS(href)` (never loads twice). A stylesheet does not need to sit inside a particular element. |
| `addScriptInBody(src)` | 0.1.3 | `addJSInHead(src)` or `addJS(src)`. Both return a Promise that settles when the script has loaded. |
| `addScriptInHead(src)` | 0.1.4 | `addJSInHead(src)` (new name, same behavior) |

All replacements are in [api.js](api/) and [element.js](element/).

## Changed behavior

- **Network failures are no longer silent.** In JSCroot a failed request was only logged to the console and the callback was never called, so the page waited forever. In CrootJS the callback is **always** called: a server that is down, no internet, or a timeout gives `status: 0` with `error` = `"offline"`, `"network"`, or `"timeout"`. Handle `status === 0`, for example with a "check your connection" message. These functions also return a Promise that never rejects, so they work with `await`.
- **Responses that are not JSON** no longer throw in the console. `data` is `null` and `status` is still the server's code.
- `openWebSocketSetId(id, url, onMessage?)` and `connectws(id, url, onMessage?)` gained an optional `onMessage` parameter. `openWebSocketSetId` is Promise-based, so it does not return a `WebSocket` directly.
- `insertHTML(url, id, fn, errorFn?)` and `renderHTML(id, url, callback?, errorCallback?)` gained an optional error callback.

## New since JSCroot

Beyond the old modules, CrootJS adds, among others: maps without Leaflet ([map.js](map) and its add-ons), a 3D viewer without Three.js ([model3d.js](model3d)), form validation ([form.js](form)), file upload/download with progress ([api.js](api/)), QR codes ([qr.js](qr)), notifications ([toast.js](toast)), and a small CSS framework ([croot.css](css)). The full list is on the [docs home page](./), and the changes per version are in the [CHANGELOG](https://github.com/crootjs/lib/blob/main/CHANGELOG.md).

The coding rules are also stricter: HTML, CSS, and JS in separate files, no `onclick` or `style=""` ([conventions](../conventions)).
