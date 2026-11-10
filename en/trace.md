*[Bahasa Indonesia](../trace)*

# `trace.js` Module Documentation
The `trace.js` module in the croot.js library is used to trace, or *track*, the interactions a user performs on a web page. Its main job is to detect which element the user clicked or touched. It also records the on-screen position as (X, Y) coordinates of a mouse click, or of a finger touch on a mobile device screen.

## Usage (Import)
Import the function from `trace.js` via the jsDelivr CDN. Make sure it is called inside an HTML *script* of type `module`.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/trace.js";
```

## Function List
### `tapClick(event)`
This function detects mouse interactions in the form of a click, or a *touch* on a touchscreen. When the user interacts, the function logs the following data to the browser console:
* **Target Element**: Shows the HTML element being clicked or touched.
* **Touch Event**: When used through a touchscreen, shows the number of touches and the coordinates of the first touch.
* **Mouse Event**: When clicked with a *mouse* on a PC/laptop, shows the cursor's `clientX` and `clientY` coordinates.

## Implementation Example
To use the `tapClick` function, attach it with an `EventListener` for the *events* you want to track, such as `click`, `touchstart`, or `touchmove`.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/trace.js";

// Track click interactions (mouse)
document.addEventListener('click', tapClick);

// Track touch interactions on the screen (touchscreen)
document.addEventListener('touchstart', tapClick);
document.addEventListener('touchmove', tapClick);
```

## Source Code Reference
To see how it is implemented, follow this link:
[trace.js source code on jsDelivr](https://www.jsdelivr.com/package/gh/crootjs/lib?tab=files)
