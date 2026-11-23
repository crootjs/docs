# `markdown.js` Module Documentation

*[Bahasa Indonesia](../markdown)*

`markdown.js` converts Markdown text to HTML in the browser: READMEs, notes, comments, or page content stored as `.md` files. The parser is written from scratch (no marked, markdown-it, or other library), one file with no dependencies.

The module is **safe by design**, so its output can go straight into `innerHTML` even when the Markdown was written by users:

- **All raw HTML in the input is escaped.** `<script>`, `<img onerror=...>`, `<iframe>`, HTML comments, and every other tag show up as text. There is no option to allow HTML.
- **Link and image URLs may only be** `http:`, `https:`, `mailto:`, `tel:`, relative URLs (`/a`, `../a.md`, `?q=1`, `//host/a`), and `#section` anchors. `javascript:`, `data:`, `vbscript:`, `file:`, and any other scheme are rejected, including mixed case (`JaVaScRiPt:`), leading spaces and control characters, tabs or newlines in the middle (`java	script:`), and entities (`&#106;avascript:`, `javascript&colon;`). The URL is checked after being cleaned the same way the browser reads it.
- A link with a forbidden URL shows only its text; an image with a forbidden URL shows only its alt text.
- Every attribute value (`href`, `src`, `alt`, `title`, `class`, `id`) is escaped.

Processing time is linear in the input length: the parser scans character by character instead of relying on regexes that can backtrack excessively. 50,000 `*`, `[`, `<` characters or other malicious patterns finish in tens of milliseconds.

## Usage (Import)

```javascript
import { markdownToHTML, renderMarkdown, getMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/markdown.js";
```

## `markdownToHTML(markdown, options)`

Converts Markdown text to an HTML string. A non-string `markdown` is converted with `String()`; `null`/`undefined` become `""`.

```javascript
import { markdownToHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/markdown.js";

const html = markdownToHTML("# Hello\n\nThis is **bold** and a [link](https://croot.js.org).");
// <h1>Hello</h1>
// <p>This is <strong>bold</strong> and a <a href="https://croot.js.org">link</a>.</p>
```

## `renderMarkdown(id, markdown, options)`

Fills the element with that `id` with the result of `markdownToHTML` and returns the HTML string. If the element does not exist, a warning is logged to the console and the HTML is still returned.

```html
<label for="post">Post</label>
<textarea id="post"></textarea>
<div id="preview"></div>
```

```javascript
import { renderMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/markdown.js";
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/debounce.js";

const post = document.getElementById("post");
post.addEventListener("input", debounce(() => {
    renderMarkdown("preview", post.value, { linkTarget: "_blank" });
}, 200));
```

## `getMarkdown(url, responseFunction, options)`

Fetches a `.md` file from `url` with `fetch` and converts it to HTML. The result `{ status, data, markdown, error }` is passed to `responseFunction` (may be `null`) and is also the value of the returned Promise. The Promise **never rejects**.

| Field | Content |
|---|---|
| `status` | HTTP status, or `0` when the network failed |
| `data` | The converted HTML for a 2xx status, otherwise `""` |
| `markdown` | The original Markdown text for a 2xx status, otherwise `""` |
| `error` | `null`, or when status is `0`: `"timeout"`, `"abort"`, `"offline"`, `"network"` |

```javascript
import { getMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/markdown.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/element.js";

const { status, data } = await getMarkdown("docs/guide.md", null, { headingIds: true });
if (status === 200) setInner("content", data);
else setInner("content", "<p>The guide could not be loaded.</p>");
```

Callback style works too, like `getMarkdown` in the old JSCroot:

```javascript
getMarkdown("README.md", ({ status, data }) => {
    if (status === 200) setInner("content", data);
});
```

Besides the `markdownToHTML` options, `options` accepts `timeout` (milliseconds, default 15000) and `signal` (an `AbortSignal` from an `AbortController`; cancels the request with `error: "abort"`). A server on another domain must allow CORS for the `.md` file (GitHub Pages and `raw.githubusercontent.com` do).

## Options

All optional, the same for all three functions.

| Option | Description |
|---|---|
| `headingIds` | `true`: every heading gets a slug `id` for `#anchor` links. "Getting Started!" → `id="getting-started"`; duplicate headings → `getting-started-1`, `getting-started-2`. Non-Latin letters are kept. Default `false` |
| `idPrefix` | Prefix for heading ids, e.g. `"md-"` → `id="md-getting-started"`. Recommended for user-written Markdown so the ids do not clash with other ids on the page (or overwrite global variables through *DOM clobbering*) |
| `linkTarget` | `target` attribute for `http(s)` and `//host` links, e.g. `"_blank"`. With `"_blank"`, `rel="noopener noreferrer"` is added automatically |
| `linkRel` | `rel` attribute for `http(s)` and `//host` links, e.g. `"nofollow ugc"` for user content |

Relative links, `#anchors`, `mailto:`, and `tel:` get no `target`/`rel`.

## Supported Syntax

| Syntax | Example | HTML |
|---|---|---|
| ATX heading | `# Heading` to `###### Heading`, `## Heading ##` | `<h1>`–`<h6>` |
| Setext heading | `Heading` followed by `===` or `---` on the next line | `<h1>`, `<h2>` |
| Paragraph | consecutive lines, separated by a blank line | `<p>` |
| Hard line break | two spaces or `\` at the end of a line | `<br>` |
| Bold | `**text**`, `__text__` | `<strong>` |
| Italic | `*text*`, `_text_` (not inside words: `snake_case` stays) | `<em>` |
| Strikethrough (GFM) | `~~text~~` | `<del>` |
| Inline code | `` `code` ``; two backticks when the content contains a backtick | `<code>` |
| Fenced code block | ` ```js ` … ` ``` ` or `~~~` | `<pre><code class="language-js">` |
| Indented code block | 4 spaces (or a tab) in front | `<pre><code>` |
| Blockquote | `> text`, nested `>> text`, continuation lines without `>` | `<blockquote>` |
| Bullet list | `-`, `*`, or `+` | `<ul>` |
| Ordered list | `1.` or `1)`; a start number other than 1 → `start` | `<ol>` |
| Nested list | items indented to line up with the parent item's text | `<ul>`/`<ol>` inside `<li>` |
| Task list (GFM) | `- [ ] todo`, `- [x] done` | `<li class="task-list-item"><input type="checkbox" disabled>` |
| Thematic break | `---`, `***`, `___` (spaces allowed) | `<hr>` |
| Link | `[text](url)`, `[text](url "title")`, `[text](<url with spaces>)` | `<a href>` |
| Autolink | `<https://example.com>`, `<name@example.com>` | `<a href>` |
| Image | `![alt](image.png "title")`, image inside a link | `<img src alt>` |
| Table (GFM) | row `\| a \| b \|` then `\|:--\|--:\|`; `:-:` centred | `<table>`, `<th align>`/`<td align>` |
| Backslash escape | `\*`, `\#`, `\[`, `\|` in table cells | the character itself |
| HTML entities | `&copy;`, `&#65;`, `&#x42;` | the character |

Table column alignment uses the `align` attribute, not `style`, so it keeps working on pages whose Content-Security-Policy forbids inline styles. The module injects no CSS; the output looks right with [croot.css](css) out of the box, or style it yourself. croot.css honors the `align` attribute since 0.0.33. If you use other CSS that sets `text-align` on `th`/`td`, the attribute loses, so add:

```css
:is(th, td)[align="center"] { text-align: center; }
:is(th, td)[align="right"] { text-align: right; }
```

For wide tables on phones, wrap the preview in `overflow-x: auto`.

## Not Supported

This module supports the common subset of CommonMark/GFM, not the whole specification. **Not** supported:

- **Raw HTML** (block or inline): always shown as text. This is deliberate.
- **Reference links**: `[text][ref]`, `[ref]`, and `[ref]: https://...` definitions are shown as plain text.
- **Autolinks without angle brackets** (GFM extension): `https://example.com` or `www.example.com` in running text do not become links; write `<https://example.com>`.
- **Single-tilde strikethrough** (`~text~`): only `~~text~~`.
- **Footnotes, definition lists, math, `:emoji:` codes, headings with `{#id}` attributes**, and other extensions beyond CommonMark/GFM.
- **Named entities** are passed through to the browser as-is; inside URLs and `title`, only about 30 common ones (`&amp;`, `&lt;`, `&nbsp;`, `&copy;`, `&mdash;`, …) are translated.
- **Tabs** are only expanded at the start of a line (to multiples of 4 columns); a tab after a list marker (`-<tab>text`) is not recognised as a list.
- Blockquote/list nesting is limited to **32 levels**; deeper markers are read as plain text. A table stops after 100,000 padding cells. Both keep malicious input from exhausting memory.
- Some CommonMark edge cases are handled more simply, such as "lazy" continuation lines (paragraph continuation without indentation) inside lists and blockquotes that contain code blocks, and tab indentation inside nested containers.

## Security Notes

- The HTML produced by this module is safe to put into `innerHTML` without an extra sanitizer, because no tag or attribute from the input is passed through.
- Images from `http(s)` are still downloaded by the reader's browser, so the image server's owner can see the reader's IP address and reading time. If that matters (e.g. email or private messages), proxy or filter images on the server.
- `linkRel: "nofollow ugc"` is recommended for user comments so spam links gain no SEO value.
- Still validate and store the original Markdown on the server; conversion in the browser is only for display.
