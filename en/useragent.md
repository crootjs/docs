# `useragent.js` Module Documentation

*[Bahasa Indonesia](../useragent)*

`useragent.js` contains one function that guesses whether the page is opened on a mobile device, by matching `navigator.userAgent` against a regex. No third-party library is involved.

## Usage (Import)

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/useragent.js";
```

## `isMobile()`

Returns `true` if `navigator.userAgent` contains any of `Android`, `webOS`, `iPhone`, `iPad`, `iPod`, `BlackBerry`, `IEMobile`, or `Opera Mini` (case-insensitive), and `false` otherwise. Takes no parameters.

```javascript
import { isMobile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/useragent.js";
import { show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.42/element.js";

if (isMobile()) {
    show("open-app-button");
    hide("desktop-download-button");
}
```

## Notes

- iPads running iPadOS 13 or later use a desktop Safari (Mac) user agent by default, so `isMobile()` returns `false` on them.
- The user agent can be changed by the user or by browser extensions. Use the result only to adjust the interface, not for security. For layout, a CSS media query is usually the better tool.
