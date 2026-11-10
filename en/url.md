*[Bahasa Indonesia](../url)*

# url.js Module Documentation
# url.js

Since       : v1.0.0  
Environment : Browser Only  
Dependency  : window, URLSearchParams  

## 1. Overview

The `url.js` module is part of a lightweight JavaScript library (CrootJS) designed specifically to simplify URL-related operations in a client-side environment.

- **Module purpose**: Provides a set of utility functions (*helper functions*) that wrap built-in browser objects to manipulate, read, and change the behavior of the URL or the browser history, without having to write the same object configuration by hand over and over.
- **Dependency on window.location**: This module strictly wraps and modifies properties of the global `window.location` and `window` objects (including the `eventListener` interface). 
- **Execution environment (browser-only)**: Because it relies exclusively on the availability of the `window` object (which represents the web browser *tab* window), this module **can only run inside a browser environment** and is not supported on the server side.

## Function Summary

| Function | Type | Side Effect |
|----------|------|--------------|
| getProtocol | Read | - |
| getHost | Read | - |
| fullPath | Read | - |
| folderPath | Read | - |
| getPath | Read | - |
| getQueryString | Read | - |
| setQueryString | Write | Reload |
| getHash | Read | - |
| setHash | Write | Add History |
| redirect | Navigation | Replace History |
| onHashChange | Event | Register Listener |

## 2. Function Specifications

### getProtocol()

**Description:**  
Returns the network protocol (scheme) of the current URL, without the trailing colon (`:`).

**Parameters:**  
None.

**Return Value:**  
`String` - The protocol, such as `"http"` or `"https"`.

**Internals:**  
Calls `window.location.protocol`, which by default returns the value with a trailing colon (e.g. `"https:"`), then slices it with `.slice(0, -1)` to remove that last character.

**Usage Example:**  
```javascript
import { getProtocol } from './url.js';
console.log(getProtocol()); // Output: "https"
```

**Important Notes / Side Effects:**  
This function is safe to use because it only reads (*read-only*) and does not change the page state.

---

### getHost()

**Description:**  
Returns the host name together with the port (if explicit) of the current URL.

**Parameters:**  
None.

**Return Value:**  
`String` - Example: `"www.example.com"` or `"localhost:8080"`.

**Internals:**  
Directly returns the value of `window.location.host`.

**Usage Example:**  
```javascript
import { getHost } from './url.js';
console.log(getHost()); // Output: "localhost:3000"
```

**Important Notes / Side Effects:**  
Safe to use because the operation is *read-only*.

---

### fullPath()

**Description:**  
Gets the entire *pathname* string, i.e. the relative path of the URL, starting after the domain (host) and ending just before the *query string* (`?`) or *hash* (`#`).

**Parameters:**  
None.

**Return Value:**  
`String` - The *pathname*, starting with a slash `/`. Example: `"/folder/halaman.html"`.

**Internals:**  
Returns the value of `window.location.pathname`.

**Usage Example:**  
```javascript
import { fullPath } from './url.js';
console.log(fullPath()); // Output: "/kelas/materi/pendahuluan.php"
```

**Important Notes / Side Effects:**  
Safe to use (*read-only*).

---

### folderPath()

**Description:**  
Gets the *pathname* (like `fullPath()`) but removes the file name and its extension, so only the folder/directory path remains.

**Parameters:**  
None.

**Return Value:**  
`String` - The directory path only, e.g. `"/materi/"`. Returns the whole `pathname` string if the URL does not point to a file with an extension.

**Internals:**  
The function splits `window.location.pathname` on the extension character (`.`). If there is at least one split (indicating a file with an extension), it identifies the extension (the last dotted part of the array) and splits the path string on `/` to get the full file name. The detected file name and extension are then removed from the base string being returned using `.replace()`.

**Usage Example:**  
```javascript
import { folderPath } from './url.js';
// If the current URL is: https://api.example.com/assets/img/logo.png
console.log(folderPath()); // Output: "/assets/img/"
```

**Important Notes / Side Effects:**  
Safe to use (*read-only*). The internal logic does not cut anything when the URL is in *REST API* style and does not end with a file extension.

---

### getPath()

**Description:**  
Returns the URL *pathname* string like `fullPath()`, but without the leading slash (`/`).

**Parameters:**  
None.

**Return Value:**  
`String` - The path without the `/` prefix. For example: `"admin/dashboard"`.

**Internals:**  
Calls `window.location.pathname.substring(1)` to slice the string starting at index 1.

**Usage Example:**  
```javascript
import { getPath } from './url.js';
console.log(getPath()); // Output: "katalog/produk/123"
```

**Important Notes / Side Effects:**  
Safe to use (*read-only*).

---

### getQueryString()

**Description:**  
Returns a smart *Proxy object* that lets you access *query parameters* (the URL parameters after the `?` sign) dynamically, like a normal JavaScript object (*Object Notation*).

**Parameters:**  
None.

**Return Value:**  
`Proxy Object` - A proxy over a `URLSearchParams` instance.

**Internals:**  
The function initializes `new URLSearchParams(window.location.search)` and wraps it in a global `Proxy` object. The interceptor (via the `get` handler) translates property access back into the underlying call (`searchParams.get(prop)`). This mechanism enables *dot notation* for reading parameters.

**Usage Example:**  
```javascript
import { getQueryString } from './url.js';
// Suppose the URL is: https://example.com/page?user=102&status=active
const qs = getQueryString();
console.log(qs.user);   // Output: "102"
console.log(qs.status); // Output: "active"
```

**Important Notes / Side Effects:**  
Safe (*read-only*). Setting properties on this object does not actually update the URL *query* in the browser (it only performs static GET calls).

---

### setQueryString(key, value)

**Description:**  
Modifies the current *query parameters* of the active tab's URL by setting or overwriting a key/value pair, then applies it to the browser. 

**Parameters:**  
- `key` (*String*): The name of the URL parameter.
- `value` (*String* | *Number* | *Boolean*): The value of that parameter.

**Return Value:**  
None (`undefined`).

**Internals:**  
Represents the existing query string with `URLSearchParams`, calls `params.set(key, value)`, then explicitly writes the result back to `window.location.search = params`.

**Usage Example:**  
```javascript
import { setQueryString } from './url.js';
setQueryString("filter", "terbaru");
// Adds/changes the URL to ...?filter=terbaru and then refreshes the page.
```

**Important Notes / Side Effects:**  
**WARNING**: This method is *destructive* to the browser *lifecycle*. Modifying `window.location.search` natively **forces the browser to reload the page (Trigger Page Reload)**. The browser records the page entry in its *history*.

---

### getHash()

**Description:**  
Gets the fragment (*hash*) of the URL (the value after the `#` sign), without the `#` itself.

**Parameters:**  
None.

**Return Value:**  
`String` - The plain hash text or value.

**Internals:**  
Reads `window.location.hash`, then cuts it with `.substring(1)` so the character at index 0 (the `#` sign) is dropped from the result.

**Usage Example:**  
```javascript
import { getHash } from './url.js';
// Assume the URL is: https://example.com/artikel#referensi
console.log(getHash()); // Output: "referensi"
```

**Important Notes / Side Effects:**  
Safe to use (*read-only*). If the URL hash is empty, this returns an empty string.

---

### setHash(hashvalue)

**Description:**  
Sets or overwrites the local fragment identifier (*hash fragment*) of the URL currently loaded in the browser window.

**Parameters:**  
- `hashvalue` (*String*): The identifier text to set as the hash at the end of the URI.

**Return Value:**  
None (`undefined`).

**Internals:**  
Performs a direct assignment to the global `window.location.hash = hashvalue`.

**Usage Example:**  
```javascript
import { setHash } from './url.js';
setHash("bab-2"); // Appends #bab-2 to the end of the URL
```

**Important Notes / Side Effects:**  
Changing the browser hash **does NOT reload the page (No Reload)** (unless handled manually by a router); instead, it only tells the page to scroll to the matching anchored element, and this action records a new step in the browser history (*adds a new history entry*).

---

### redirect(URL)

**Description:**  
Forces navigation to the requested destination URL, moving the user to that location.

**Parameters:**  
- `URL` (*String*): The full destination string; it can be an absolute URL with a domain (e.g. `"https://google.com"`) or a relative path (e.g. `"/dashboard"`).

**Return Value:**  
None (`undefined`).

**Internals:**  
The function calls the browser's built-in method `window.location.replace(URL)`.

**Usage Example:**  
```javascript
import { redirect } from './url.js';
redirect("https://www.google.com");
```

**Important Notes / Side Effects:**  
Unlike a regular assignment such as (`window.location.href = ...`), the *replace* call navigates **without adding to the browser history stack (Does NOT push into history stack)**. As a result, after it runs, the user cannot use the browser's "*Back Button*" to return to the page they were on before the redirect (back navigation is disabled). 

---

### onHashChange(callback)

**Description:**  
This asynchronous registration utility listens for changes to the browser's *hash fragment* and automatically runs a *callback function* whenever the value changes.

**Parameters:**  
- `runFunctionEvent` (*Function*): The function (*callback*) that will be executed in the future every time the hash changes. The function receives a single argument containing the original *event* metadata.

**Return Value:**  
None (`undefined`).

**Internals:**  
Registers a browser event listener via `window.addEventListener('hashchange', ...)` and attaches the given function to it, passing the *Event* metadata to the function.

**Usage Example:**  
```javascript
import { onHashChange } from './url.js';
onHashChange((event) => {
    console.log("Hash URL berubah. Cek tab yang terbuka!");
    console.log(event);
});
```

**Important Notes / Side Effects:**  
Calling it repeatedly can register multiple copies of the function, stacking up listeners on the `window` object. Attached listeners keep listening (*listen*) for the lifetime of the browsing session, or at least until a full reload (*reload*) destroys every listener instance. An essential feature in *Single Page Application* (SPA) architecture.

## Security

- redirect() does not validate external URLs
- Query input is not sanitized internally
- Validation is entirely the developer's responsibility

## 3. Side Effects & Special Behavior

- **Functions that cause a reload (*page refresh*)**:
  - `setQueryString(key, value)` (a reload is forced because the page's base parameters change).
  - `redirect(URL)` (the browser downloads and renders the replacement target page).
- **Functions that change the *History***:
  - `setHash(hashvalue)` by default adds a history entry to the browser (virtual *pushState*/back behavior).
  - The exception is `redirect(URL)`, which replaces the page in history instead of adding a new entry, so the browser's "*Back*" feature is skipped and does not work.
- **Functions that only read values (*Read-Only*)**:
  Safe to use at any time with no risk of load-cycle anomalies: `getProtocol`, `getHost`, `fullPath`, `folderPath`, `getPath`, `getQueryString`, and `getHash`. These functions cause no modification side effects on the user's web page.

---

## 4. Limitations

- **Cannot be used in Node.js**: Node.js is isolated and server-based, so it does not provide or understand the global `window` hierarchy, let alone expose browser interface properties such as `location` and the parameter modifications built on it.
- **Not *Server-Side Rendering* (SSR) compatible**: Most modern reactive *frameworks* that build *Isomorphic* applications (*Next.js/Nuxt.js*, when `url.js` utilities are initialized early) will run into errors because the object reference is undefined on the server ("`window is not defined`"). Therefore the utility module must be placed inside a *browser lifecycle hook* such as `useEffect`.
- **Depends entirely on the window object**: The functions are bound to the global `window` interface and provide no way to point them at a custom configuration object (no specific *Inversion of Control* or special mock-up), so they must rely entirely on the real browser to supply properties such as `location.host, location.pathname, location.protocol` as well as DOM event interception such as *Event Listener* integration.

## Version

v1.0.0
- Initial release
- Basic URL utilities
- Hash listener support
