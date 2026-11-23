# `loading.js` Module Documentation

*[Bahasa Indonesia](../loading)*

`loading.js` has no functions. It exports one constant, `loading`: an HTML string containing an animated spinner `<svg>` (8 colored dots rotating around the center). Put that string into any element while an asynchronous task runs, then replace it with the real content when it's done.

## Usage (Import)

```javascript
import { loading } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/loading.js";
```

## `loading`

| SVG property | Value |
|---|---|
| `id` | `loading` |
| `class` | `lds-microsoft` |
| `width` × `height` | `80px` × `80px` |
| `viewBox` | `0 0 100 100` |
| Dot colors | `#e15b64`, `#f47e60`, `#f8b26a`, `#abbd81`, `#849b87` |

The animation uses `<animateTransform>` (SMIL) inside the SVG: one full rotation every 1.5 seconds with `calcMode="spline"`, repeating indefinitely. No extra CSS or image file is needed.

```javascript
import { loading } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/loading.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.30/api.js";

setInner("product-list", loading);

const { status, data } = await getJSON("https://api.example.com/products", null);
setInner("product-list", status === 200 ? `${data.length} products` : "Failed to load data");
```

## Notes

- Because `id="loading"` is fixed in the string, showing the spinner in two places at once puts a duplicate ID on the page. Select it by the `lds-microsoft` class if you need to style or remove it.
- The 80px size is set with `width`/`height` attributes; a CSS rule on `.lds-microsoft` can override it.
- A spinner that is only an image isn't announced by screen readers. Add status text, for example in an element with `aria-live="polite"`, if users need to know data is loading.
