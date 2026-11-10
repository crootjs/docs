*[Bahasa Indonesia](../useragent)*

# `useragent.js` Module Documentation

`useragent.js` is a small CrootJS module for detecting whether a visitor is accessing the page from a mobile device, based on the browser's built-in `navigator.userAgent`. The module does **not** use any third-party library (not UAParser.js or similar) — it is just a single regex function.

## Usage (Import)

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/useragent.js";
```

## Function List

### `isMobile()`

Returns `true` if `navigator.userAgent` matches a common mobile device pattern (Android, webOS, iPhone, iPad, iPod, BlackBerry, IEMobile, Opera Mini), and `false` otherwise.

**Parameters:** None.

**Return Value:** `Boolean`.

**Usage Example:**

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/useragent.js";

if (isMobile()) {
    console.log("Accessed from a mobile device");
} else {
    console.log("Accessed from a desktop");
}
```

**Example: showing different buttons on mobile**

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/useragent.js";
import { show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

if (isMobile()) {
    show("tombol-buka-app");
    hide("tombol-download-desktop");
}
```

## Notes

- Detection based on `navigator.userAgent` may not be 100% accurate (the user agent can be spoofed/changed by the user or by browser extensions), so do not rely on it for security purposes — it is suitable only for display adjustments (progressive enhancement).
