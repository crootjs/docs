# `croot.css` Documentation

*[Bahasa Indonesia](../css)*

`croot.css` is the CrootJS CSS framework: **one file, no JavaScript, no web fonts or images**, about 2 KB gzipped. Plain HTML (headings, paragraphs, links, forms, buttons, tables, dialogs) looks finished without any classes. A few classes cover common layouts and components.

It follows the same principles as the CrootJS JS modules: small and frugal (no fonts or icons to download, dark backgrounds in dark mode), easy to override, and accessible (keyboard focus is always visible, reduced-motion settings are respected).

## Usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/croot.min.css">
<link rel="stylesheet" href="style.css">
```

`croot.min.css` is minified automatically by jsDelivr. Put your page CSS **after** it, although the order doesn't actually matter: every `croot.css` rule lives in `@layer croot`, and unlayered CSS always beats layers, so you can override anything without `!important`.

Full showcase of every element and component: [croot.js.org/examples/css](https://croot.js.org/examples/css/). For application pages there are optional extras, [`ui.css` and `themes.css`](ui), and copy-ready [page patterns](https://croot.js.org/examples/pola/).

## Without Classes

These elements are styled as soon as the file loads:

| Element | Look |
|---|---|
| `body`, headings, paragraphs, lists | System font, comfortable line height, theme colors |
| `a` | Accent color, slightly offset underline |
| `code`, `pre`, `kbd` | Monospace font; `pre` scrolls sideways when long |
| `table` | Full width, lines between rows |
| `blockquote`, `hr`, `details`/`summary` | Tidy lines and spacing |
| `label`, `input`, `select`, `textarea` | Full width, bold label above |
| `label` wrapping a checkbox/radio | Inline with its input |
| `fieldset`, `legend` | Bordered box with a title |
| `[aria-invalid="true"]` | Red border (set automatically by [`form.js`](form)) |
| `button` | Primary button in the accent color, at least 40 px tall for touch |
| `dialog` | Centered box with a dimmed backdrop |
| `progress`, checkbox, radio, range | Accent color |
| Keyboard focus (`:focus-visible`) | Blue ring that is always visible |

## Buttons

```html
<button>Save</button>
<button class="secondary">Cancel</button>
<button class="danger">Delete</button>
<button class="ghost">More</button>
<a class="button" href="/signup">Sign up</a>
```

`.button` makes a link look like a button. `disabled` buttons (or `.button[aria-disabled="true"]`) are faded.

## Layout

| Class | Purpose |
|---|---|
| `.container` | Centered, max 72rem wide, 16 px side padding |
| `.stack` | Children stacked vertically with equal gaps |
| `.cluster` | Children in a row that wraps when it doesn't fit (buttons, tags) |
| `.grid` | As many auto-fitting columns as fit, each at least 16rem |
| `.center`, `.muted`, `.visually-hidden` | Centered text, muted color, hidden but still read by screen readers |

Gaps and column widths are set per element with variables:

```css
.product-list { --croot-min: 12rem; --croot-gap: 2rem; }
```

`--croot-gap` and `--croot-min` are not inherited, so a `.grid` or `.stack` inside that element keeps its own default spacing.

## Components

```html
<article class="card">
  <h3>Title <span class="badge">new</span></h3>
  <p>Card content.</p>
</article>

<div class="alert">Information.</div>
<div class="alert success">Saved.</div>
<div class="alert warning">Quota almost used up.</div>
<div class="alert danger">Sending failed.</div>

<header class="container nav">
  <strong>Site Name</strong>
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</header>
```

## Icons

A small icon set in a separate file, `icons.css` (about 2 KB gzipped), replacing Boxicons or Font Awesome for dashboards. Pages without icons only need `croot.css`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/croot.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/icons.min.css">

<button><span class="icon icon-download" aria-hidden="true"></span> Download</button>

<button class="secondary">
  <span class="icon icon-search" aria-hidden="true"></span>
  <span class="visually-hidden">Search</span>
</button>
```

- Each icon is an empty element with the classes `icon` and `icon-<name>`. Icons are decoration, so add `aria-hidden="true"` and make sure the button still has text, `.visually-hidden` text if needed.
- The color follows the text color (`currentColor`) and the size is `1em`. Change it with `font-size`, or `width`/`height` in your CSS.
- The icons are drawn for CrootJS on a 24x24 grid with 2 px strokes, as data-URI SVGs used as `mask-image`. So there is no extra request per icon, and they work from jsDelivr (an SVG `<use href>` to another domain is blocked by browsers).
- The rules live in `@layer croot.icons`, so your page CSS still wins. `icons.css` also works without `croot.css`.

| Group | Names (`icon-...`) |
|---|---|
| Navigation | `menu`, `close`, `search`, `home`, `dashboard`, `more`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right` |
| Actions | `plus`, `minus`, `edit`, `trash`, `download`, `upload`, `copy`, `link`, `refresh`, `filter`, `sort`, `login`, `logout`, `settings` |
| Status | `check`, `warning`, `info`, `bell`, `star`, `eye`, `eye-off`, `lock`, `unlock` |
| Things | `user`, `users`, `calendar`, `clock`, `mail`, `phone`, `pin`, `map`, `file`, `folder`, `chart`, `table` |

Gallery of all icons: [croot.js.org/examples/css/#ikon](https://croot.js.org/examples/css/#ikon).

## Theme

Colors, corners, spacing and fonts are variables on `:root`. Change them in your page CSS:

```css
:root {
    --croot-accent: #7c3aed;     /* main color */
    --croot-accent-text: #fff;   /* text on the main color */
    --croot-radius: 4px;
    --croot-font: "Inter", system-ui, sans-serif;
}
```

| Variable | Meaning |
|---|---|
| `--croot-bg`, `--croot-surface` | Page background, and card/input background |
| `--croot-text`, `--croot-muted`, `--croot-border` | Text, muted text, lines |
| `--croot-accent`, `--croot-accent-text` | Main color and the text on it |
| `--croot-danger`, `--croot-warning`, `--croot-success`, `--croot-info`, `--croot-focus` | Status colors and the focus ring |
| `--croot-radius`, `--croot-space`, `--croot-max` | Corner radius, base spacing, `.container` width |
| `--croot-font`, `--croot-mono` | Text and code fonts |

**Dark mode** follows the device setting. To force it, set `data-theme="light"` or `data-theme="dark"` on `<html>`, for example from a theme button:

```javascript
document.documentElement.dataset.theme = "dark";   // dark
delete document.documentElement.dataset.theme;      // follow the device
```

## Notes

- Needs a browser that supports `@layer`, `:has()`, `color-mix()` and `@property` (Chrome/Edge 111+, Firefox 128+, Safari 16.4+). Older browsers still show a readable page, with some styling missing.
- The styles are deliberately few. For a custom look, write it in your page's `style.css`; your rules always win.
