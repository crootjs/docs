# App Components (`ui.css`), Themes (`themes.css`), and Page Patterns

*[Bahasa Indonesia](../ui)*

[croot.css](css) makes plain HTML look finished. For application pages (dashboards, back offices, long forms) there are two extra files that are **optional** and separate, so ordinary pages don't download them:

- `ui.css` (about 3 KB gzipped): an app shell with a sidebar, breadcrumb, tabs, menus, popovers, accordion, skeleton, summary numbers, avatar, switch, steps, button group, empty state, toolbar, description list, and footer. All built on native HTML (`<details>`, `popover`, ARIA roles); only tabs need JavaScript (`tabs.js`, about 0.6 KB gzipped).
- `themes.css` (about 1.2 KB gzipped): four themes with character, each in light and dark, without web fonts.

Instead of starting from a blank page (and ending up with the typical AI look), copy one of the [page patterns](https://croot.js.org/examples/pola/): an app with a sidebar, login, list and detail, a multi-step form, settings, empty state and 404, and a landing page. See also [No "AI look"](../conventions#5-no-ai-look).

## Usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/croot.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/ui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/themes.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/icons.min.css">
<link rel="stylesheet" href="style.css">
```

Load only what you need. `ui.css` uses the `croot.ui` layer (after all croot.css layers) and `themes.css` uses `croot.themes`, so your page CSS still wins without `!important`.

## Themes

Choose a theme with an attribute on `<html>`:

```html
<html lang="en" data-croot-theme="kampus">
```

| Theme | Character | Good for |
|---|---|---|
| `kampus` | Navy and copper-amber, serif headings, 4px corners | Universities, schools, institutions |
| `kertas` | Warm paper and brown ink, serif type, square corners | Documents, archives, long reading |
| `kontras` | Black and white with a thick yellow focus ring, 112.5% type, underlined links | Public services, accessibility |
| `niaga` | Teal and brick, narrow headings, 3px corners, denser spacing | Point of sale, warehouses, office apps |

Without `data-croot-theme` the default croot.css look (green) is used. Every theme has a dark version that follows the system, and `data-theme="light"` / `"dark"` still forces it as in croot.css. Every text/background pair meets WCAG AA contrast (at least 4.5:1), including text on the accent and status colors used by buttons and [toast.js](toast).

Themes only change the `--croot-*` variables (plus `--croot-heading-font` for headings), so your own theme is just the same variables:

```css
:root[data-croot-theme="village"] {
    --croot-accent: #7c2d12;
    --croot-heading-font: Georgia, serif;
}
```

## App shell

```html
<div class="app">
  <header class="app-header">
    <button type="button" class="button secondary app-toggle" popovertarget="main-menu">Menu</button>
    <nav class="breadcrumb" aria-label="Location">
      <ol><li><a href="/">Home</a></li><li><span aria-current="page">Overview</span></li></ol>
    </nav>
  </header>
  <nav class="app-sidebar" id="main-menu" popover aria-label="Main menu">
    <ul>
      <li><a href="/" aria-current="page"><span class="icon icon-home" aria-hidden="true"></span> Overview</a></li>
      <li><a href="/items">Items</a></li>
    </ul>
    <h2>Reports</h2>
    <ul><li><a href="/reports">Monthly report</a></li></ul>
  </nav>
  <main class="app-main">...</main>
</div>
```

On wide screens (from 60rem) the sidebar is always shown as the left column and the `.app-toggle` button is hidden. On phones the sidebar becomes a drawer (`popover`) opened by that button and closed with Escape or a tap outside, without JavaScript. The active link is marked with `aria-current="page"` (a bar, a tint, and bold text, not color alone).

## Components

| Component | HTML |
|---|---|
| Breadcrumb | `<nav class="breadcrumb" aria-label="Location"><ol><li><a>…</a></li><li><span aria-current="page">…</span></li></ol></nav>` |
| Tabs | `<div role="tablist" id="t" aria-label="…">` with `<button type="button" role="tab" id="…" aria-controls="p1" aria-selected="true">`, then `<div role="tabpanel" id="p1" aria-labelledby="…">` (other panels `hidden`), and `initTabs("t")` |
| Menu | `<details class="menu"><summary>Account</summary><ul><li><a>…</a></li><li><hr></li><li><button class="danger">Sign out</button></li></ul></details>`; `.end` aligns the panel right. Or `<div popover class="menu">` opened with `popovertarget` (closes itself on Escape and outside clicks) |
| Toggletip | `<button popovertarget="info" aria-label="Explanation">?</button><div id="info" popover class="tooltip">…</div>`: opens with keyboard and touch |
| Actions | `<div class="actions">` with buttons, right-aligned, for dialog and form footers |
| Accordion | `<div class="accordion"><details name="faq"><summary>…</summary>…</details>…</div>`; the same `name` keeps only one open |
| Skeleton | `<span class="skeleton" aria-hidden="true"></span>` inside a container with `aria-busy="true"`; still when the user prefers reduced motion |
| Summary numbers | `<section class="stats" aria-label="Summary"><div class="stat"><p class="stat-label">Sales</p><p class="stat-value">Rp4,320,000</p><p class="stat-change up">Up 6% from yesterday</p></div></section>`; the direction must be in the text (`up`/`down` only add an arrow and color) |
| Status badge | `<span class="badge success">Paid</span>`, also `warning`, `danger`, `info` |
| Avatar | `<span class="avatar" aria-hidden="true">DW</span>`, or with an `<img>` inside |
| Switch | `<label><input type="checkbox" role="switch" name="notify"> Email notifications</label>`; still a normal checkbox |
| Steps | `<ol class="steps" aria-label="Form steps"><li>Personal data</li><li aria-current="step">Address</li><li>Files</li></ol>`; earlier steps are marked done automatically |
| Button group | `<div class="button-group" role="group" aria-label="View">` with buttons; the chosen one has `aria-pressed="true"` |
| Empty state | `<div class="empty"><span class="icon icon-folder" aria-hidden="true"></span><h2>No transactions yet</h2><p>…</p><p class="cluster"><a class="button">…</a></p></div>` |
| Toolbar | `<div class="toolbar"><h2>Items</h2><div><a class="button">Add</a></div></div>` |
| Wide table | `<div class="table-wrap" role="region" aria-label="Item list" tabindex="0"><table>…</table></div>` |
| Description list | `<dl class="meta"><div><dt>Number</dt><dd>TRX-0412</dd></div>…</dl>`; two columns when its container is wide enough |
| Footer | `<footer class="site-footer"><p>…</p><ul><li><a>…</a></li></ul></footer>` |

Dialogs (`<dialog>`) are already styled by croot.css; put their buttons in `<div class="actions">`.

## `tabs.js`

```javascript
import { initTabs } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/tabs.min.js";

const tabs = initTabs("detail-tabs");
tabs.select(2); // switch to the third tab from code
```

### `initTabs(id)`

Activates the tabs inside the `role="tablist"` element with ID `id`, following the ARIA pattern: only the active tab is in the Tab order, left/right arrows switch tabs and show the panel right away (reversed on right-to-left pages), Home/End go to the first/last tab. The starting tab is the one with `aria-selected="true"`, or the first. `aria-selected`, `tabindex`, and the panels' `hidden` are kept in sync; panels without a focusable element get `tabindex="0"`.

Returns `{ select(index), remove() }`, or `null` (with a console warning) when the element is missing. `select()` ignores an out-of-range index; `remove()` detaches the keyboard and click listeners. Horizontal tabs only.

## Page patterns

| Pattern | Contents |
|---|---|
| [Gallery](https://croot.js.org/examples/pola/) | All patterns, with a theme picker and light/dark mode |
| [App](https://croot.js.org/examples/pola/aplikasi/) | Shell with sidebar, summary numbers, a chart ([chart.js](chart)), and a table ([table.js](table)) |
| [Login](https://croot.js.org/examples/pola/login/) | [form.js](form) validation, show-password button |
| [List and detail](https://croot.js.org/examples/pola/daftar-detail/) | Table, description list, tabs, delete dialog |
| [Form](https://croot.js.org/examples/pola/formulir/) | Steps, fieldsets, switches, file upload |
| [Settings](https://croot.js.org/examples/pola/pengaturan/) | Accordion, switches, theme choice |
| [Empty and 404](https://croot.js.org/examples/pola/kosong-404/) | Empty state and a not-found page |
| [Landing](https://croot.js.org/examples/pola/landing/) | A landing page without gradients, identical feature cards, or marketing copy |

Every pattern uses labelled sample data, pinned imports, and `<link rel="modulepreload">`. The patterns read the theme chosen in the gallery through `../tema.js`; remove that import when you copy one pattern into your project. The pattern pages are in Indonesian.
