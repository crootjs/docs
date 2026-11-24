# `table.js` Module Documentation

*[Bahasa Indonesia](../table)*

`table.js` shows data as a real `<table>` with **per-column sorting, search, and pagination**. It is a lightweight replacement for jQuery DataTables: no jQuery, no extra CSS from another CDN, just one module file.

- Cell content is always inserted as **text** (or as an element you build yourself), never as HTML, so data from a server cannot inject scripts.
- Sorting uses an Indonesian `Intl.Collator` with natural order: numbers sort as numbers, "item 2" comes before "item 10", and upper/lower case are treated the same.
- Accessible: column headers are buttons with `aria-sort`, the search box has a `<label>`, page navigation is buttons inside a `<nav>`, and the "Menampilkan 1–10 dari 57" summary sits in a `role="status"` element, so screen readers announce it whenever it changes.
- On phones, a wide table scrolls horizontally inside its container, not the whole page.

## Usage (Import)

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.38/table.js";
```

## `createTable(id, options)`

Creates the table inside element `id`, replacing its content. Returns a control object (see [Return Value](#return-value)), or `null` if the element does not exist.

```html
<div id="projects"></div>
```

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.38/table.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.38/api.js";

const table = createTable("projects", {
    caption: "Projects",
    columns: [
        { key: "code", label: "Code" },
        { key: "name", label: "Project" },
        { key: "members", label: "Members", className: "number" },
        { key: "start", label: "Start", format: v => new Date(v).toLocaleDateString("en-GB") },
    ],
    sort: { key: "code", dir: "asc" },
});

const { status, data } = await getJSON("https://api.example.com/projects", null);
if (status === 200) table.setRows(data);
```

```css
/* page style.css: the column class is set on that column's <th> and <td>. */
.number { text-align: right; }
```

## Options

All optional except `columns`.

| Option | Description |
|---|---|
| `columns` | Array of column definitions, see [Columns](#columns) |
| `rows` | Array of row objects for local mode. Can also be filled later with `setRows` |
| `source` | Function for [server mode](#server-mode). When set, `rows` is not used |
| `pageSize` | Rows per page. Default `10`. `0` = all rows on one page, no navigation |
| `pageSizes` | Choices for the "rows per page" `<select>`. Default `[10, 25, 50, 100]`; `[]` hides the choice |
| `search` | `false` hides the search box. Shown by default |
| `sort` | Initial order: `{ key, dir }`, `dir` is `"asc"` or `"desc"` |
| `caption` | Table title (`<caption>`), also used as the name of the scroll region for screen readers |
| `label` | Name of the scroll region when there is no `caption`. Default `"Tabel"` |
| `tableClass` | Class for the `<table>`, e.g. `"table is-fullwidth is-striped"` if the page uses Bulma |
| `texts` | Replaces the built-in texts, see [Texts](#texts) |

### Columns

| Property | Description |
|---|---|
| `key` | Property name in the row. Used for content, sorting, and search. A column without `key` (such as an action-button column) cannot be sorted and is not searched |
| `label` | Column header. Defaults to `key` |
| `format` | `(value, row) => text or Node`. Text is inserted as text; a `Node` (for example a `<button>` you build with `document.createElement`) is inserted as is. Without `format`, the value is shown as text |
| `sortable` | `false` makes this column not sortable |
| `className` | Class for this column's `<th>` and every `<td>` |

Sorting and search use the **raw value** `row[key]`, not the `format` output. So store dates as ISO (`"2026-03-14"`) or numbers and show a readable version through `format`. Empty values (`null`, `undefined`, `""`) always go last, ascending or descending. Search is case-insensitive and only looks at text or number values.

An action-button column:

```javascript
{
    label: "Actions",
    format: (_, row) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Delete";
        button.setAttribute("aria-label", `Delete ${row.name}`);
        button.addEventListener("click", () => deleteProject(row.code));
        return button;
    },
}
```

Clicking a column header sorts ascending; clicking again sorts descending. Sorting, searching, or changing the page size returns to page 1.

## Return Value

| Member | Description |
|---|---|
| `setRows(rows)` | Local mode: replaces all rows, e.g. after fetching again. Sort order and search text are kept; the page is adjusted if there are now fewer pages. Returns a Promise that settles once the table is rendered |
| `refresh()` | Renders again; in server mode it fetches the current page again. Returns a Promise that settles once the table is rendered |
| `ready` | Promise of the first render (in server mode: once the first page has arrived) |
| `getState()` | `{ page, pageSize, sort, query, total }`. `page` starts at 1, `total` is the number of rows matching the search |
| `remove()` | Removes the table from the page |

## Server Mode

For large tables, don't download everything. Set `source` to a function that receives `{ page, pageSize, sort, query }` and returns (or resolves to) `{ rows, total }`: just that page's rows and the number of all matching rows. Filtering and sorting happen on the server.

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.38/table.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.38/api.js";

createTable("projects", {
    columns: [{ key: "code", label: "Code" }, { key: "name", label: "Project" }],
    source: async ({ page, pageSize, sort, query }) => {
        const params = new URLSearchParams({ page, limit: pageSize, q: query });
        if (sort) params.set("sort", (sort.dir === "desc" ? "-" : "") + sort.key);
        const { status, data } = await getJSON(`https://api.example.com/projects?${params}`, null);
        return status === 200 ? { rows: data.items, total: data.total } : null;
    },
});
```

- `sort` is `{ key, dir }` or `null`; `query` is already trimmed.
- Return `null` on failure; the table shows "Data gagal dimuat." (override with `texts.error`). The function must not reject (`getJSON` never rejects).
- Search waits 300 ms after the user stops typing, so there is not one request per keystroke.
- Late responses (the user has already moved to another page) are discarded. While loading, the `<table>` has `aria-busy="true"`.
- The URL parameter names in the example (`page`, `limit`, `q`, `sort`) are only an example; match your API.

## Texts

The built-in texts are Indonesian. Replace some or all of them with `texts`, for example for an English page:

```javascript
createTable("projects", {
    columns,
    rows,
    texts: {
        search: "Search",
        pageSize: "Rows per page",
        pages: "Table pages",
        previous: "Previous",
        next: "Next",
        page: n => `Page ${n}`,
        info: (from, to, total, all) => `Showing ${from}–${to} of ${total}` + (all !== null && all !== total ? ` (filtered from ${all})` : ""),
        empty: "No data yet.",
        noMatch: "No rows match the search.",
        error: "Could not load data.",
    },
});
```

| Key | Default |
|---|---|
| `search` | `"Cari"` |
| `pageSize` | `"Baris per halaman"` |
| `pages` | `"Halaman tabel"` (name of the `<nav>`) |
| `previous`, `next` | `"Sebelumnya"`, `"Berikutnya"` |
| `page` | `n => "Halaman " + n` (name of each page-number button for screen readers) |
| `info` | `(from, to, total, all) => "Menampilkan 1–10 dari 57"`, plus `" (disaring dari 120)"` when the search filters rows. `all` is `null` in server mode |
| `empty` | `"Belum ada data."` |
| `noMatch` | `"Tidak ada data yang cocok dengan pencarian."` |
| `error` | `"Data gagal dimuat."` (server mode) |

## Appearance

`table.js` injects a small default style (classes `crootjs-table-*`) at the start of `<head>`, so your page CSS always wins. Its colours follow the [croot.css](../css) variables (`--croot-border`, `--croot-muted`) and it still looks tidy without croot.css. Inactive page buttons get the `secondary` class, which croot.css renders as an outlined button. The generated structure:

```html
<div class="crootjs-table">
  <div class="crootjs-table-tools">
    <div class="crootjs-table-search"><label>Cari</label><input type="search"></div>
    <div class="crootjs-table-size"><label>Baris per halaman</label><select>…</select></div>
  </div>
  <div class="crootjs-table-scroll" role="region" tabindex="0">
    <table><caption>…</caption><thead>…</thead><tbody>…</tbody></table>
  </div>
  <div class="crootjs-table-footer">
    <p class="crootjs-table-info" role="status">Menampilkan 1–10 dari 57</p>
    <nav class="crootjs-table-pages" aria-label="Halaman tabel">…</nav>
  </div>
</div>
```

## Moving from jQuery DataTables

| DataTables | `table.js` |
|---|---|
| Fill `<tbody>` with `innerHTML`, then `$("#t").DataTable()` | `createTable("container", { columns, rows })` |
| `.destroy()` and rebuild after the data changes | `table.setRows(newData)` |
| `columns[].render` returning HTML | `columns[].format` returning text or a Node |
| `serverSide: true` with `ajax` | `source: async ({ page, pageSize, sort, query }) => ({ rows, total })` |
| `responsive: true` | The table scrolls horizontally inside its container |

Full example: [croot.js.org/examples/element/table/](https://croot.js.org/examples/element/table/).
