# `router.js` Module Documentation

*[Bahasa Indonesia](../router)*

`router.js` handles pages in a single-page application (SPA) such as a dashboard: each address maps to a function or an HTML fragment, the container's content changes without reloading the page, and the address can still be bookmarked and used with the browser's back button.

- **Hash mode** (default): addresses look like `index.html#/students/7`. Works on any static host, including GitHub Pages, without server configuration.
- **History mode**: addresses look like `/app/students/7`, through `history.pushState`. Cleaner, but the server must send `index.html` for every path under `base` (GitHub Pages cannot without a 404.html trick, so use hash mode there).

After each page change, keyboard focus moves to the new content's heading and the heading is announced to screen readers; the matching menu link gets `aria-current="page"`.

## Usage (Import)

```javascript
import { startRouter } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/router.js";
```

## `startRouter(routes, options)`

Installs the router and shows the route for the current URL (on the next microtask, so handlers may use the returned `router` object).

```html
<nav class="nav" aria-label="Main menu">
  <ul>
    <li><a href="#/">Home</a></li>
    <li><a href="#/students">Students</a></li>
  </ul>
</nav>
<main id="content"></main>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { startRouter } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/router.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

const router = startRouter({
    "/": "pages/home.html",
    "/students": {
        html: "pages/students.html",
        run: ({ query }) => showList(query.get("q")),
    },
    "/students/:id": async ({ params, signal }) => {
        const { status, data, error } = await getJSON(`https://api.example.com/students/${encodeURIComponent(params.id)}`, null, { signal });
        if (error === "abort") return;          // the user has already moved on
        const heading = document.createElement("h1");
        heading.textContent = status === 200 ? data.name : "Student not found";
        return heading;
    },
}, {
    outlet: "content",
    notFound: () => "<h1>Page not found</h1>",
});
```

### `routes`

An object `{ pattern: view }`.

A **pattern** starts with `/`. A `:name` segment is a parameter (`/students/:id` matches `/students/2301001`, `params.id = "2301001"`, already decoded). A trailing slash is ignored. Routes with fewer parameters are tried first, so `/students/new` wins over `/students/:id` regardless of the order they are written in. The query string is not matched; it is available as `ctx.query`.

A **view** is one of:

| Form | What happens |
|---|---|
| `function (ctx)` | Called, may be `async`. If it returns a string, that string is set as HTML in `outlet`; if it returns a `Node` (an element or a `DocumentFragment`), the node replaces `outlet`'s content. If it returns nothing, the handler is assumed to have written the DOM itself |
| `"pages/x.html"` | The HTML fragment is downloaded and placed in `outlet` |
| `{ html, run }` | Both optional: the HTML fragment is placed first, then `run(ctx)` is called (may be `async`) to fill it in or attach events |

HTML strings are set with `innerHTML`: data from users or the URL (including `params`) must be escaped or set through `textContent`. `<script>` inside an HTML fragment does not run; put that code in `run`. Relative fragment URLs are resolved against this page (hash mode) or against `base` (history mode), not against the route path.

### `ctx`

| Property | Contents |
|---|---|
| `path` | The route path, e.g. `"/students/7"` |
| `params` | Parameters from the pattern, e.g. `{ id: "7" }`; `{}` for `notFound` |
| `query` | `URLSearchParams` of the query string: `query.get("q")`, `query.getAll("tag")` |
| `pattern` | The matching pattern, or `null` for `notFound` |
| `signal` | An `AbortSignal` aborted as soon as the user navigates again. Pass it to `getJSON(url, null, { signal })` or `fetch` |

### Racing async handlers

If the user navigates again before a handler finishes, the old handler's `signal` is aborted and its result is ignored: its return value is not placed, `run` is not called, and focus is not moved. A handler that writes the DOM itself after an `await` should check `signal.aborted` first, because the router cannot prevent that write.

### `options`

All optional.

| Option | Description |
|---|---|
| `mode` | `"hash"` (default) or `"history"` |
| `base` | History mode only: the app's base path, e.g. `"/app"`. Paths outside `base` do not belong to the router |
| `outlet` | ID of the content container. Without it, handlers write the DOM themselves |
| `notFound` | A view (same forms as a route) for paths that match nothing. Without it, `outlet` is emptied |
| `links` | CSS selector of links that get `aria-current="page"` when their path equals the current route (query ignored). Default `"nav a[href]"` |
| `focus` | `false` to neither move focus nor announce, or a CSS selector of the element to focus. Default: the first `<h1>` in `outlet`, or `outlet` itself |
| `onError` | `(error, ctx) => {}` when a handler throws or an HTML fragment fails to download. Default `console.error` |

### Return value

| Member | Description |
|---|---|
| `navigate(path, { replace })` | Go to `path` (may include a query, `"/students?q=sari"`). `replace: true` replaces the current history entry, so the back button does not return to it. Returns a Promise that settles after the handler finishes (never rejects) |
| `href(path)` | The `href` for a link to `path` in the active mode: `"#/students/7"` or `"/app/students/7"` |
| `current()` | The current route `{ path, params, query, pattern }`, or `null` before the first route is shown |
| `stop()` | Removes all event listeners, aborts the running handler, and removes the announcement region |

## Links

- **Hash mode**: write ordinary links, `<a href="#/students">`. A hash that does not start with `/`, such as a `#content` skip link, is not a route and is left to the browser.
- **History mode**: links like `<a href="/app/students">` on the same page are intercepted and handled by the router without a reload. Not intercepted: links to other sites or to paths outside `base`, `target="_blank"` (or any target other than `_self`), `download`, clicks with Ctrl/Cmd/Shift/Alt or the middle button, `#section` links on the same page, and clicks already `preventDefault()`-ed. Build `href`s with `router.href(...)` so `base` is always right.

In history mode, CSS, JS, and image paths in `index.html` must be absolute (`/app/style.css`), because the page can be opened directly at `/app/students/7`.

## Accessibility

- When the page first opens, focus is not moved (screen readers already read the page from the top).
- After every navigation: the page scrolls to the top (except for back/forward; also with `focus: false`), focus moves to the heading (adding `tabindex="-1"` when needed), and the heading text (or `document.title`) is announced through a visually hidden `<div role="status" class="crootjs-router-status">`.
- Update `document.title` in your handlers so the tab title and browser history match.
- The focused heading may show a focus ring; remove it from your page CSS, e.g. `main h1:focus { outline: none; }`, since a heading is not a control.

## Relation to other modules

- `onHashChange` from [`url.js`](url) is enough for one or two simple hashes. `router.js` adds patterns with parameters, query strings, a fallback route, cancellation of stale handlers, and accessibility.
- `router.js` does not import [`element.js`](element/): `renderHTML` writes `innerHTML` itself with no `AbortSignal`, so a late result could not be ignored. The router downloads fragments with its own `fetch` so it stays a single standalone file.

Full example: [dashboard with router](https://croot.js.org/examples/element/router/).
