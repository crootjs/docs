# `image.js` Module Documentation

*[Bahasa Indonesia](../image)*

Despite its name, `image.js` doesn't process images. It contains two functions for picking a random color, for example for an initials avatar background or a category marker.

## Usage (Import)

```javascript
import { getRandomColor, getRandomColorName } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/image.js";
```

## `getRandomColor()`

Returns a 6-digit uppercase hex color string, for example `"#7A2B9C"`. Each digit is picked with `Math.random()`, so a color too light or too dark for the text on top of it can come up.

```javascript
import { getRandomColor } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/image.js";

document.getElementById("avatar").style.backgroundColor = getRandomColor();
```

## `getRandomColorName()`

Returns one random Tailwind CSS palette color name, **without** a prefix or shade. The list (22 names):

`yellow`, `violet`, `green`, `red`, `rose`, `pink`, `fuchsia`, `purple`, `indigo`, `blue`, `sky`, `cyan`, `teal`, `emerald`, `lime`, `amber`, `orange`, `stone`, `neutral`, `zinc`, `gray`, `slate`

Some of these names (e.g. `sky`, `emerald`, `zinc`) are not standard CSS color names, so don't use them directly as a `color` or `background-color` value. Build a Tailwind class name instead:

```javascript
import { getRandomColorName } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/image.js";

const color = getRandomColorName();
document.getElementById("category-label").classList.add(`bg-${color}-500`, "text-white");
```

A built Tailwind setup only generates classes written out in full in the source code, so classes assembled at runtime like this need to be added to the safelist.
