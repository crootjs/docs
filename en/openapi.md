# API Documentation with `openapi.js`

*[Bahasa Indonesia](../openapi)*

`openapi.js` shows API documentation from an OpenAPI 3.0 or 3.1 file (`openapi.yaml` or `openapi.json`), a hand-written replacement for Swagger UI. Every operation shows its parameters, body, responses, and schemas, together with **CrootJS code** to call it (`getJSON`, `postJSON`, `putJSON`, `deleteJSON`, `uploadFile` from [api.js](api/)). Operations can also be tried right from the page.

It is about 11 KB gzipped. Swagger UI is about 464 KB gzipped (JS and CSS). The YAML parser (`yaml.js`, about 3 KB) and the Markdown renderer for descriptions ([markdown.js](markdown), about 6 KB) are only downloaded when needed.

## Usage (Import)

```javascript
import { renderOpenAPI, loadOpenAPI, openAPIExample } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/openapi.js";
import { parseYAML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/yaml.js";
```

## A documentation page on GitHub Pages

Four files in one folder, for example `docs-api/` in your backend's GitHub Pages repo:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notes API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/croot.min.css">
  <link rel="stylesheet" href="style.css">
  <script type="module" src="index.js"></script>
</head>
<body>
  <main>
    <div id="docs"></div>
  </main>
</body>
</html>
```

```javascript
// index.js
import { renderOpenAPI } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/openapi.min.js";

renderOpenAPI("docs", "./openapi.yaml", {
    texts: { tryIt: "Try it", send: "Send", snippet: "CrootJS code", copy: "Copy" }
});
```

```css
/* style.css */
main { max-width: 64rem; margin: 0 auto; padding: 1rem; }
```

The fourth file is `openapi.yaml` (see the next section). The page looks fine without croot.css too; with croot.css its colors follow the theme and dark mode. The interface texts default to Indonesian; `texts` replaces them (the full list is `TEXTS` at the top of `openapi.js`).

## Writing `openapi.yaml`

You can write the spec by hand, generate it from backend code (many frameworks have a generator), or ask an AI to write it from a list of endpoints. To make the page useful:

- **Fill in `servers`** with the backend URL. With more than one (e.g. production and development), readers can choose.
- **Give every operation an `operationId`, a `summary`, and `tags`.** Tags group operations. The `operationId` becomes the link address (`#listNotes`), so an operation can be linked directly.
- **Put schemas in `components.schemas`** and refer to them with `$ref` instead of repeating them.
- **Add `example` values** to schemas or media types. Without them, examples are generated from type and format (`"string"`, `0`, `"user@example.com"` for `format: email`): the right shape, but not very meaningful.
- **Declare login in `components.securitySchemes`** (`bearer` or `apiKey`). The page then offers a token field for "Try it", and the CrootJS code sends that header too.
- **Descriptions may be Markdown** (`description`). Raw HTML in them is shown as text, never run.

```yaml
openapi: 3.0.3
info:
  title: Notes API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /notes:
    get:
      tags: [notes]
      operationId: listNotes
      summary: List notes
      responses:
        "200":
          description: All notes
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Note"
components:
  schemas:
    Note:
      type: object
      required: [title]
      properties:
        id: { type: string, readOnly: true, example: 64f1a2b3c4d5e6f708192a3b }
        title: { type: string, example: Buy groceries }
        done: { type: boolean, example: false }
```

Swagger 2.0 (`swagger: "2.0"`) is not supported. Convert it to OpenAPI 3 first, for example at converter.swagger.io.

## CrootJS code for every operation

Every operation shows code ready to copy into a frontend:

| Operation | Code |
|---|---|
| `GET` | `getJSON(url, responseFunction)` |
| `POST`, `PUT` with a JSON body | `postJSON(url, body, responseFunction)` / `putJSON(...)` |
| `DELETE` | `deleteJSON(url, body, responseFunction)` (`undefined` without a body) |
| `POST`, `PUT` with `multipart/form-data` | `uploadFile(url, "file", responseFunction, { field })` |
| `PATCH`, other methods, non-JSON bodies | plain `fetch`, with a comment saying why |

Path parameters become variables (`${id}`), query parameters are joined with `URLSearchParams`, and bearer/apiKey login is sent through the `{ headers }` option. When `openapi.js` is loaded from jsDelivr, the `api.js` import in that code uses the same version and suffix (`.min.js`).

## "Try it" and CORS

The **Send** button sends a real request from the browser to the server in `servers`, then shows the status, time, headers, and body of the answer. A token you type is kept in the page's memory only, not in localStorage.

Because the request comes from the documentation page (e.g. `https://account.github.io`), the server must allow that origin with `Access-Control-Allow-Origin`. Otherwise the browser blocks it and the page shows a message about CORS. Turn it off with `tryIt: false` if the server should not be called from the documentation page.

## Functions

### `renderOpenAPI(id, source, options?)`

Replaces the content of the element with that `id` with the API documentation. `source` is the URL of a spec file (JSON or YAML) or an already-parsed spec object.

| Option | Default | Description |
|---|---|---|
| `tryIt` | `true` | Show the "Try it" form in every operation |
| `snippets` | `true` | Show CrootJS code in every operation |
| `server` | — | Base URL replacing `servers` in the spec, e.g. a local server during development |
| `expand` | `false` | Open all operations from the start |
| `timeout` | `15000` | Time limit (ms) for loading the spec and for "Try it" |
| `texts` | Indonesian texts | Interface texts, e.g. `{ send: "Send", tryIt: "Try it" }`. The full list is at the top of `openapi.js` (`TEXTS`); some are functions, e.g. `status: (status, ms) => ...` |
| `onError` | — | `onError(result)` when the spec fails to load; `result` is the same as from `loadOpenAPI` |

Returns a Promise of `{ spec, element, remove() }`, or `null` when the element is missing or the spec fails to load (the message is shown inside the element). The Promise never rejects. `remove()` aborts "Try it" requests still running and removes the view.

The field above the list filters operations by path, summary, or `operationId`. An operation's content is only built when it is first opened, so large specs still appear quickly. Opening an operation updates the address (`#operationId`), and loading the page with that address opens the operation.

### `loadOpenAPI(source, options?)`

Fetches and checks a spec without showing it. The Promise holds `{ spec, error, message }` and never rejects. `error` is `null`, or `"network"`, `"timeout"`, `"http"`, `"parse"`, `"swagger2"`, `"version"`, with a `message` you can show. Options: `texts`, `timeout`.

```javascript
const { spec, error, message } = await loadOpenAPI("./openapi.yaml");
if (error) console.warn(message);
else console.log(Object.keys(spec.paths));
```

### `openAPIExample(schema, spec?, direction?)`

Builds a sample value for a schema: its `example`, `default`, or first `enum` value when present, otherwise one built from type and format. `$ref` is looked up in `spec`. `direction` `"response"` (default) skips `readOnly` properties; `"request"` skips `writeOnly` ones.

```javascript
openAPIExample({ $ref: "#/components/schemas/Note" }, spec, "request"); // { title: "Buy groceries", done: false }
```

## What is supported

- OpenAPI 3.0 and 3.1, JSON or YAML.
- Local `$ref` (`#/components/...`), including schemas that refer to themselves (shown as `↻ Name`). `allOf` is merged; `oneOf` and `anyOf` are shown as alternatives.
- Login: HTTP bearer, OAuth2 and OpenID Connect (sent as bearer), apiKey in a header or the query string.

Not supported yet: `$ref` to other files (shown as "`$ref` not found"), `servers` per path or per operation, `webhooks` (3.1), HTTP basic login, and apiKey in a cookie. An operation with several tags appears only under its first tag.

## `yaml.js`: `parseYAML(text)`

The small YAML parser used by `openapi.js`, also usable on its own for configuration files. Turns YAML text into a JavaScript value, or throws a `SyntaxError` with the line number (also in `error.line`).

```javascript
import { parseYAML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/yaml.min.js";

parseYAML("name: Sari\nhobbies: [reading, running]"); // { name: "Sari", hobbies: ["reading", "running"] }
```

Supported: block mappings and sequences, plain and quoted scalars, `|` and `>` block scalars, `[...]` and `{...}` flow collections, comments, a single document, `&a` anchors and `*a` aliases, and the core tags like `!!str`. Rejected with a clear message: `<<` merge keys, other tags, `?` complex keys, more than one document, duplicate keys, and tabs as indentation.

## Coming from Swagger UI

Replace the swagger-ui-dist `<script>` and `<link>` tags with one `openapi.js` import, and the `SwaggerUIBundle({ url, dom_id })` call with `renderOpenAPI(id, url)`. Your `openapi.yaml` stays the same.

## For AI

Ask the AI (Claude, ChatGPT, and the like) to read https://croot.js.org/llms.txt first. Example prompts:

- "Write an `openapi.yaml` (OpenAPI 3.0) for these backend endpoints, with `operationId`, `tags`, `example` values, and a bearer `securitySchemes`."
- "Build an API documentation page with CrootJS `renderOpenAPI` for this `openapi.yaml`, following the CrootJS conventions."
- "From this `openapi.yaml`, write frontend functions with CrootJS `api.js` for every `operationId`."

A complete live example: [examples/api/openapi](https://croot.js.org/examples/api/openapi/).
