# `url.js` Module Documentation

*[Bahasa Indonesia](../url)*

`url.js` contains short functions for reading parts of the current page's URL (protocol, host, path, query string, hash), changing the query string and hash, navigating to another page, and listening for hash changes. They all read or change `window.location`, so they only run in a browser.

## Usage (Import)

```javascript
import { getQueryString, getHash, setHash, onHashChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/url.js";
```

## Summary

Example values in this table are for the URL `https://example.com:8080/class/lesson/ch1.html?user=102#exercise`.

| Function | Result / effect |
|---|---|
| `getProtocol()` | `"https"` |
| `getHost()` | `"example.com:8080"` |
| `fullPath()` | `"/class/lesson/ch1.html"` |
| `folderPath()` | `"/class/lesson/"` |
| `getPath()` | `"class/lesson/ch1.html"` |
| `getQueryString()` | Proxy: `getQueryString().user` → `"102"` |
| `getHash()` | `"exercise"` |
| `setQueryString(key, value)` | Changes the query string; the page reloads |
| `setHash(hashvalue)` | Changes the hash, without reloading |
| `redirect(URL)` | Navigates away; the Back button can't return to the current page |
| `onHashChange(runFunctionEvent)` | Calls a function every time the hash changes |

## `getProtocol()`

Returns the page's protocol without the colon, e.g. `"https"`, `"http"`, or `"file"`.

## `getHost()`

Returns the host name plus the port when the port is written in the URL, e.g. `"example.com"` or `"localhost:8080"`.

## `fullPath()`

Returns the URL path (`window.location.pathname`), starting with `/`, without the query string and hash. For example `"/class/lesson/ch1.html"`.

## `folderPath()`

Returns the path without the file name at its end, e.g. `"/class/lesson/ch1.html"` becomes `"/class/lesson/"`.

The last segment of the path is treated as a file name when it contains a dot (`.`):

| Path | Result |
|---|---|
| `/class/lesson/ch1.html` | `/class/lesson/` |
| `/js/app.min.js` | `/js/` |
| `/class/lesson/` | `/class/lesson/` (unchanged) |
| `/class/lesson` | `/class/lesson` (no dot, not treated as a file) |
| `/v1.2/page` | `/v1.2/page` (the dot is only in a folder name) |

Before 0.0.30, `/js/app.min.js` was unchanged and `/v1.2/page` became `/`.

## `getPath()`

Same as `fullPath()` without the leading `/`, e.g. `"class/lesson/ch1.html"`. On the root page the result is `""`.

## `getQueryString()`

Returns a Proxy over a `URLSearchParams` of the current query string, so parameters are read like object properties. Values are always strings, or `null` when the parameter is absent.

```javascript
import { getQueryString } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/url.js";

// URL: https://example.com/product.html?id=102&tab=reviews
const query = getQueryString();
const id = Number(query.id);  // 102
const tab = query.tab;        // "reviews"
const page = query.page;      // null
```

The Proxy is read-only in practice. Every property name is passed to `searchParams.get()`, so `URLSearchParams` methods such as `has()` or `forEach()` can't be used through it, and writing a property does not change the URL. Its contents also don't follow later URL changes; call `getQueryString()` again.

## `setQueryString(key, value)`

Sets or replaces one query string parameter, keeps the others, and writes the result to `window.location.search`. As a result the browser **reloads the page** with the new URL and adds a history entry. To change the URL without a reload, use `history.replaceState` or `history.pushState` directly.

```javascript
import { setQueryString } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/url.js";

setQueryString("category", "books"); // ...?category=books, page reloads
```

## `getHash()`

Returns the URL hash without the `#`, e.g. `"exercise"`. When the URL has no hash, the result is `""`.

## `setHash(hashvalue)`

Changes the URL hash to `hashvalue` (without `#`). The page does not reload. The browser adds a history entry, scrolls to the element whose `id` equals `hashvalue` if there is one, and fires a `hashchange` event when the value differs from the previous hash.

## `redirect(URL)`

Navigates to `URL` (absolute or relative) with `window.location.replace`. The current page is **replaced** in the history, not added, so the Back button does not return to it. Useful after logging out or after a form is submitted. For a normal link that can be undone with Back, use `window.location.href = URL`.

`URL` is not validated. Don't pass a value from the query string or user input straight into `redirect` without checking its destination, so your page can't be used to send people to another site.

```javascript
import { redirect } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/url.js";
import { deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/cookie.js";

deleteCookie("token");
redirect("/login.html");
```

## `onHashChange(runFunctionEvent)`

Registers `runFunctionEvent(event)` for the `hashchange` event on `window`. `event` is a `HashChangeEvent` with `oldURL` and `newURL`. The function is not called when the page first loads, only when the hash changes.

There is no way to remove this listener, and each call to `onHashChange` adds another one, so call it once.

```javascript
import { getHash, onHashChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/url.js";
import { renderHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

function showPage() {
    renderHTML("content", `pages/${getHash() || "home"}.html`);
}

showPage();                // hash when the page opens
onHashChange(showPage);    // later hashes
```
