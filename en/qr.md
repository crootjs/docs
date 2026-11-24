# `qr.js` Module Documentation

*[Bahasa Indonesia](../qr)*

`qr.js` creates QR codes as SVG, written from scratch with no other library (about 6 KB minified, 3 KB gzipped). Any text (URLs, non-Latin script, emoji) is encoded as UTF-8 bytes, and the QR size (version 1–40) is picked automatically: the smallest one that fits. The result is one `<svg>` element with a single `<path>`, so it stays sharp at any size and is light to print.

## Usage (Import)

```javascript
import { renderQR, qrSVG, qrMatrix } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/qr.js";
```

## Example

```html
<div id="qr" class="qr"></div>
```

```css
.qr svg { width: 12rem; }
```

```javascript
import { renderQR } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/qr.min.js";

renderQR("qr", "https://croot.js.org", { label: "QR code for croot.js.org" });
```

The on-screen size is set with CSS (`width` on the `svg`); the SVG itself has no fixed size.

## Functions

### `renderQR(id, text, options?)`

Replaces the content of the element with that `id` with the QR code and returns its `<svg>` element.

### `qrSVG(text, options?)`

Returns the QR code as SVG text, for example to save it as a file:

```javascript
const blob = new Blob([qrSVG(address)], { type: "image/svg+xml" });
```

### `qrMatrix(text, options?)`

Returns the module matrix without margin: an array of rows, each an array of `true` (dark) / `false` (light). Useful for drawing it yourself, for example onto a `<canvas>`.

## Options

| Option | Default | Description |
|---|---|---|
| `ecc` | `"M"` | Error correction level: `"L"` (about 7% of the code may be damaged), `"M"` (15%), `"Q"` (25%), `"H"` (30%). Higher levels survive scribbles or a logo in the middle, but make the code denser. |
| `margin` | `4` | Quiet zone around the code, in modules. The standard asks for 4; some scanners fail when it is narrower. (`qrSVG`/`renderQR` only.) |
| `color` | `"#000"` | Color of the dark modules. |
| `background` | `"#fff"` | Background color; `"transparent"` for none. Scanners need high contrast, and inverted codes (light on dark) are not read by every scanner, so keep black on white even in dark mode. |
| `label` | the QR text | `aria-label` for screen readers. Use a short description when the content is long or meaningless when read aloud. |

## Limits

- Text too long for one code (over 2953 UTF-8 bytes at level `"L"`, 1273 bytes at `"H"`) throws a `RangeError`. An `ecc` other than L/M/Q/H also throws a `RangeError`.
- Byte mode only: text made only of digits or capital letters is not packed into numeric/alphanumeric mode, so the code can be one or two versions larger than the minimum. Every scanner still reads it.
- No QR reader/scanner; this module only creates codes.

The output is tested to be identical to another encoder (python-qrcode) on sample sizes from version 1 to 40, at all four correction levels.
