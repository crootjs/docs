# `trace.js` Module Documentation

*[Bahasa Indonesia](../trace)*

`trace.js` contains one debugging helper: attach it as an event listener and it prints the clicked or touched element and its coordinates to the browser console. It only writes to the console — it doesn't store anything, doesn't send data anywhere, and returns nothing.

## Usage (Import)

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/trace.js";
```

## `tapClick(event)`

For every event it prints `Elemen yang dipicu:` ("Triggered element") followed by `event.target`, then one of the following (the log labels are in Indonesian):

| Event type | What is printed |
|---|---|
| Touch event with at least one finger on the screen (`touchstart`, `touchmove`) | `Jumlah sentuhan aktif:` (number of active touches) and `Koordinat sentuhan pertama:` (`clientX`, `clientY` of `event.touches[0]`) |
| Mouse event (`click`, `mousedown`, ...) | `Koordinat klik:` (click coordinates: `clientX`, `clientY`) |
| Anything else, e.g. `touchend` (no fingers left on the screen) | Only the target element |

Coordinates are `clientX`/`clientY`, i.e. relative to the viewport, not to the page or the element.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/trace.js";

document.addEventListener("click", tapClick);
document.addEventListener("touchstart", tapClick);
```

`touchmove` can be attached too, but it fires continuously while the finger moves and will flood the console. Remove the listeners (`removeEventListener`) when you're done debugging.
