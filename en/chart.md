# `chart.js` Module Documentation

*[Bahasa Indonesia](../chart)*

`chart.js` draws **bar**, **line**, and **donut** charts as SVG, written from scratch with no other library and no dependencies. Note: despite the file name `chart.js`, this module is **not Chart.js** and its API is not compatible with Chart.js.

Included:

- Axes with a "nice" scale (round numbers: multiples of 1, 2, 2.5, or 5) and Indonesian number formatting (`1.234,5`; axes above 10,000 are shortened to `25 rb`), replaceable with your own function.
- Width follows the container; colors come from CSS variables that follow croot.css dark mode.
- Accessible: SVG `role="img"` with a title and description, a data table hidden on screen but read by screen readers, a legend, and a tooltip when the pointer is over the chart **and** when the chart is focused with the keyboard.

## Usage (Import)

```javascript
import { createChart, niceScale } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/chart.js";
```

## Minimal Example

```html
<h2>Sign-ups per month</h2>
<div id="chart"></div>
<script type="module" src="chart-page.js"></script>
```

```javascript
// chart-page.js
import { createChart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/chart.js";

const chart = createChart("chart", {
    type: "bar",
    title: "Sign-ups per month",
    labels: ["Jan", "Feb", "Mar", "Apr"],
    series: [
        { name: "Bachelor", values: [120, 135, 160, 150] },
        { name: "Diploma", values: [80, 95, 90, 110] }
    ]
});
```

## `createChart(id, config)`

Creates a chart inside element `id` (usually an empty `<div>`). If that element already holds a chart, the old one is removed first. Returns `{ element, update(changes), remove() }`, or `null` (with a console warning) if the element does not exist.

| Option | Description |
|---|---|
| `type` | `"bar"` (default), `"line"`, or `"donut"` |
| `labels` | Array of labels, one per bar/point/slice |
| `series` | Array of `{ name, values }`. `values` lines up with `labels`; `null` means no data (bar not drawn, line broken, table shows "–"). Donut uses only the first series |
| `title` | Chart name for screen readers (SVG `<title>` and table caption). Not displayed; write the visible heading in your page, e.g. an `<h2>` |
| `description` | Description for screen readers. If omitted, one is generated (type, number of labels and series, axis range or donut percentages, how to read values with the arrow keys) |
| `stacked` | `true` to stack the bars of several series instead of placing them side by side. `"bar"` only |
| `format` | Function `number => text` for the tooltip, table, axis, and donut total. Defaults to `Intl.NumberFormat("id-ID")` |
| `colors` | Array of CSS colors replacing the built-in palette, used in order per series (donut: per slice) |
| `height` | Chart height in pixels. Default `300` |

### `update(changes)`

Replaces some options and redraws in the same container and SVG, e.g. new data from a server:

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";

const { status, data } = await getJSON("https://api.example.com/stats", null);
if (status === 200) chart.update({ labels: data.months, series: data.series });
```

`changes` can hold any option from the table above, e.g. `chart.update({ stacked: true })` or `chart.update({ type: "line" })`.

### `remove()`

Removes the chart with its legend, table, and size observer. The container element stays.

## Chart Types

- **Bar** (`"bar"`): vertical, always starting at zero so lengths are honest; negative values go below the zero line. Several series sit side by side per label, or stack with `stacked: true`. Bars are at most 24 px wide.
- **Line** (`"line"`): one or more series. The value axis follows the data range (not forced to start at zero). Dots are drawn when labels are far enough apart; on highlight a vertical guide line and each series' dot appear.
- **Donut** (`"donut"`): parts of a whole, with the total in the middle and percentages in the legend. Negative or missing values count as zero. If there are more slices than colors (8, or the length of `colors`), the first slices are shown up to one less than the number of colors and the rest are merged into a single "Lainnya" (Other) slice, because repeated colors make two slices look the same; sort your data first if you want the small ones merged.

A bar or line chart with more series than colors throws an `Error`. Merge series, split into several charts, or pass a longer `colors` option.

## Size Follows the Container

The chart width always equals its container's width. `chart.js` watches the container with `ResizeObserver` and redraws the SVG in real pixels whenever the width changes. This was chosen over a scaled `viewBox` because with `viewBox` the text shrinks on phones, whereas redrawing keeps text at 12 px and adapts the number of axis labels to the width (labels that do not fit are skipped). The height is fixed, from the `height` option.

A hidden container (`display: none`, width 0) is drawn once it becomes visible.

## Colors and Appearance

The built-in palette has eight colors, used in order (never repeated), through CSS variables `--croot-chart-1` to `--croot-chart-8` on the `.crootjs-chart` element. Every color is at least 3:1 against croot.css backgrounds (`--croot-surface` and `--croot-bg`) in both light and dark mode, and the order was chosen so neighboring colors stay distinguishable for color-blind readers. Dark mode follows croot.css: the device setting, or `data-theme="dark"` / `"light"` on `<html>`.

Replacing the palette from your page CSS (applies to both modes unless you write your own dark-mode rule):

```css
.crootjs-chart {
    --croot-chart-1: #1d4ed8;
    --croot-chart-2: #b45309;
}
```

Or per chart with the `colors: ["#1d4ed8", "#b45309"]` option.

Text, gridlines, gaps between segments, and the tooltip use croot.css variables (`--croot-text`, `--croot-muted`, `--croot-border`, `--croot-surface`, `--croot-focus`, `--croot-font`) with fallback values, so it works without croot.css. The 2 px gap between stacked segments and donut slices is `--croot-surface`, so place the chart on that background (e.g. inside a `.card`).

The default styles are injected at the start of `<head>`, so your page CSS wins without `!important`. Classes you can override: `.crootjs-chart`, `.crootjs-chart-legend`, `.crootjs-chart-tooltip`, `.crootjs-chart-text`, `.crootjs-chart-grid`.

## Accessibility

- The SVG has `role="img"` with `aria-labelledby` pointing to `<title>` (from `title`) and `aria-describedby` pointing to `<desc>` (from `description` or the generated summary).
- A full data table (`<table>` with `<caption>` and `<th scope>`) is in the page, hidden on screen but read by screen readers. Donut adds a percentage column.
- The chart can be focused with Tab (one tab stop per chart, not one per bar). On focus the tooltip appears on the first point; left/right (or up/down) arrows move between points, Home/End jump to the ends, Esc closes the tooltip. The tooltip content is also announced through an `aria-live` region.
- Pointer (mouse) and touch show the same tooltip. The hover area spans a whole label, not just the bar.
- A legend is shown for two or more series (and always for donut), so series identity never relies on color alone. A single series gets no legend because the heading on the page already names it.

## `niceScale(min, max, maxTicks = 5)`

The scale function used by the axes, exported for your own use (e.g. a hand-made chart). Returns `{ min, max, step, ticks }` with round numbers covering `min..max` and at most about `maxTicks + 1` lines.

```javascript
niceScale(0, 980);        // { min: 0, max: 1000, step: 200, ticks: [0, 200, 400, 600, 800, 1000] }
niceScale(24.3, 31.8, 4); // { min: 24, max: 32, step: 2, ticks: [24, 26, 28, 30, 32] }
```

## Notes

- Built-in module text: "Total" in the donut center, "Lainnya" for the merged slice, and table column headers ("Label", "%"); the generated description and the fallback title ("Grafik batang") are in Indonesian; set `title` and `description` for other languages.
- No animation, no second axis, no zoom. For two measures on different scales, make two charts.
- Example: [croot.js.org/examples/element/chart/](https://croot.js.org/examples/element/chart/).
