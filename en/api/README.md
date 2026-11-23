# `api.js` Module Documentation

*[Bahasa Indonesia](../../api/)*

`api.js` wraps the browser's built-in Fetch API for talking to a backend: sending and fetching JSON, uploading and downloading files, and loading HTML fragments. Every JSON function can be used with a callback or with `await`, and **never throws**: network failures are also ordinary results you can inspect.

## Usage (Import)

```javascript
import { getJSON, postJSON, putJSON, deleteJSON, uploadFile, downloadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";
```

## Result Shape

`getJSON`, `postJSON`, `putJSON`, `deleteJSON`, `uploadFile`, and `downloadFile` produce an object of the same shape, passed to `responseFunction` and also used as the value of the returned Promise:

```javascript
{
  status: Number,   // HTTP status (200, 201, 400, 404, 500, ...); 0 when the request failed entirely
  data: Object,     // body parsed from JSON (null when it is not JSON); a Blob for a 2xx downloadFile
  headers: Headers, // response headers, e.g. headers.get("X-RateLimit-Remaining")
  error: String,    // null, or the kind of failure when status is 0 (see below)
  cached: Boolean   // getJSON only: true when the data came from the cache
}
```

`headers`, `error`, and `cached` exist since 0.0.29.

### When a Request Fails Entirely

`responseFunction` is **always** called, including when the request never reaches the server or the server does not answer. The result is `status: 0` (real HTTP codes are always ≥ 100), `data: null`, empty `headers`, and `error` holding the kind of failure:

| `error` | Meaning |
|---|---|
| `"timeout"` | The server did not answer within the time limit (15 seconds by default, see the `timeout` option) |
| `"offline"` | The browser is not connected to the internet |
| `"network"` | Anything else: server unreachable, DNS failure, or CORS rejected. Browsers deliberately do not let JavaScript tell these apart; the exact reason is in the console |
| `"abort"` | Cancelled through the `signal` option (since 0.0.30) |
| `"nofile"` | `uploadFile` only: no file was selected, so the request was not sent (since 0.0.30) |

A server that answers with an error status (400, 404, 500) is not a total failure: `status` holds the real code and `data` holds the server's error body. Total failures are logged with `console.warn` (except `"abort"`, which is intentional).

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";

const { status, data, error } = await getJSON("https://api.example.com/products");
if (status === 200) {
    console.log(data);
} else if (status === 0) {
    console.log(error === "offline" ? "No internet connection" : "Cannot reach the server");
} else {
    console.log("Server refused:", status, data);
}
```

## `await` and Callback Styles

Since 0.0.26 these functions return a Promise. The Promise never *rejects*, so no `try/catch` is needed. When using `await`, pass `null` as `responseFunction`:

```javascript
const { status, data } = await getJSON("https://api.example.com/products");
const result = await postJSON("https://api.example.com/orders", { id: 7 }, null);
```

The callback style still works and receives the same object:

```javascript
getJSON("https://api.example.com/products", ({ status, data }) => {
    if (status === 200) console.log(data);
});
```

## Options: headers, timeout, signal, and cache

The arguments after `responseFunction` can be the legacy token pair `tokenkey, tokenvalue` (one header), or **a single options object** (since 0.0.29):

| Option | Default | Description |
|---|---|---|
| `headers` | — | Object of extra headers, e.g. `{ Authorization: "Bearer ...", "X-Client": "web" }` |
| `timeout` | `15000` | Milliseconds before the request is cancelled (`error: "timeout"`) |
| `signal` | — | `AbortSignal` from an `AbortController`; `controller.abort()` cancels the request (`error: "abort"`). Since 0.0.30 |
| `cache` | — | `getJSON` only: `{ key, ttl }`. A successful result is stored in `localStorage` under the name `key`; for `ttl` seconds no request is made at all (`cached: true`). After that, if the server sent an `ETag`, the request carries `If-None-Match`; a `304` answer uses the stored data with the status it had when stored (`200`) and `cached: true` |

```javascript
// legacy token pair
await getJSON(url, null, "login", token);
// options object
await getJSON(url, null, { headers: { login: token }, timeout: 8000 });
```

`Content-Type: application/json` is only sent when there is a body (`postJSON`, `putJSON`, `deleteJSON`). `getJSON` without extra headers does not trigger a CORS *preflight*, so it can read JSON from static hosts such as GitHub Pages and `raw.githubusercontent.com`. Extra headers, including a token and the `If-None-Match` from the `cache` option, do trigger a preflight, so the server must allow those headers.

### Cancelling a request

Useful for search-as-you-type: the old request is cancelled as soon as the user types again, so an old result does not overwrite a newer one.

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";
import { onInput, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/element.js";

let search = null;
onInput("search", async () => {
    if (search) search.abort();
    search = new AbortController();
    const { status, data, error } = await getJSON(
        "https://api.example.com/search?q=" + encodeURIComponent(getValue("search")),
        null,
        { signal: search.signal }
    );
    if (error === "abort") return; // replaced by newer typing
    if (status === 200) console.log(data);
});
```

### Caching with ETag

Example: the latest release version from the GitHub API, stored for 1 hour. After an hour GitHub answers `304` if there is no new release, and a `304` answer does not count against the quota of 60 requests per hour.

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";
import { setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/element.js";

const { status, data, headers, error } = await getJSON(
    "https://api.github.com/repos/crootjs/lib/releases/latest",
    null,
    { timeout: 8000, cache: { key: "crootjs-release", ttl: 3600 } }
);
if (status === 200) setInnerText("version", data.tag_name);
else if (status === 403) setInnerText("version", "Quota exhausted, try again at " + new Date(headers.get("X-RateLimit-Reset") * 1000).toLocaleTimeString());
else if (error === "offline") setInnerText("version", "No internet connection");
```

## `getJSON`, `postJSON`, `putJSON`, `deleteJSON`

```javascript
getJSON(url, responseFunction, tokenkey?, tokenvalue?)          // or (url, responseFunction, options)
postJSON(url, data, responseFunction, tokenkey?, tokenvalue?)   // or (url, data, responseFunction, options)
putJSON(url, data, responseFunction, tokenkey?, tokenvalue?)
deleteJSON(url, data, responseFunction, tokenkey?, tokenvalue?)
```

Note the order: `responseFunction` is **not** the last argument, and for `postJSON`/`putJSON`/`deleteJSON` it comes after `data`.

| Parameter | Description |
|---|---|
| `url` | Target address |
| `data` | Object sent as the JSON body (`postJSON`, `putJSON`, `deleteJSON`). For `deleteJSON` without a body, pass `undefined` |
| `responseFunction` | `function (result)`, or `null` when using `await` |
| `tokenkey`, `tokenvalue` | Name and value of one token header, e.g. `"Authorization"`, `"Bearer eyJ..."` |
| `options` | Replaces `tokenkey, tokenvalue`: `{ headers, timeout, signal, cache }` (see [Options](#options-headers-timeout-signal-and-cache)) |

```javascript
import { getJSON, postJSON, putJSON, deleteJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/cookie.js";

const auth = { headers: { login: getCookie("login") } };

const list = await getJSON("https://api.example.com/products", null, auth);
const created = await postJSON("https://api.example.com/products", { name: "Coffee", price: 25000 }, null, auth);
await putJSON("https://api.example.com/products/7", { price: 27000 }, null, auth);
await deleteJSON("https://api.example.com/products/7", undefined, null, auth);
```

## `uploadFile`

Uploads files as `multipart/form-data` and reports progress (since 0.0.30). The result has the same shape as `getJSON`: `data` is the server's JSON response body.

```javascript
uploadFile(url, source, responseFunction, options)
```

`source` can be:

- the id of an `<input type="file">`, in which case all selected files are sent (inputs with `multiple` are fine);
- a `File` or `Blob`, such as a camera capture or canvas output;
- a `FileList` or an array of `File`;
- a ready-made `FormData`.

| Option | Default | Description |
|---|---|---|
| `field` | `"file"` | Name of the file field in the form; match it to what the backend reads |
| `data` | — | Object of extra fields, e.g. `{ title: "ID card photo" }`. Object values are sent as JSON |
| `method` | `"POST"` | |
| `headers` | — | Extra headers (token). Do not set `Content-Type`; the browser sets it together with the *boundary* |
| `timeout` | `15000` | Milliseconds **without progress** before cancelling. The countdown restarts whenever data is sent, so a large file on a slow network can still finish |
| `signal` | — | `AbortSignal` for cancelling, e.g. from a Cancel button |
| `onProgress` | — | `function (fraction, sent, total)` while uploading; `fraction` goes from 0 to 1 |

```html
<label for="document">ID card photo</label>
<input type="file" id="document" accept="image/*">
<progress id="progress" max="1" value="0"></progress>
<button type="button" id="upload">Upload</button>
<button type="button" id="cancel">Cancel</button>
```

```javascript
import { uploadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/element.js";

let upload = null;
onClick("upload", async () => {
    upload = new AbortController();
    const { status, data, error } = await uploadFile("https://api.example.com/idcard", "document", null, {
        field: "photo",
        data: { nik: "3273..." },
        headers: { login: "your-token" },
        signal: upload.signal,
        onProgress: (fraction) => { document.getElementById("progress").value = fraction; },
    });
    if (status === 200) console.log("Saved:", data);
    else if (error === "nofile") console.log("Select a file first");
    else if (error !== "abort") console.log("Failed:", status, error);
});
onClick("cancel", () => upload && upload.abort());
```

`uploadFile` uses `XMLHttpRequest`, because `fetch()` cannot yet report upload progress.

## `downloadFile`

Downloads a file (since 0.0.30). For a 2xx status, `data` holds a `Blob`; for any other status, `data` holds the server's error body parsed from JSON (or `null`).

```javascript
downloadFile(url, responseFunction, options)
```

Its options are `headers`, `timeout`, `signal` (same as `getJSON`), plus `fileName`: when set, a 2xx file is saved by the browser right away under that name.

```javascript
import { downloadFile } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";

// saved right away
const { status, data } = await downloadFile("https://api.example.com/reports/7.pdf", null, {
    headers: { login: "your-token" },
    fileName: "report-7.pdf",
});
if (status !== 200) console.log("Failed:", status, data);

// or used on the page without saving
const image = await downloadFile("https://api.example.com/photos/7");
if (image.status === 200) document.getElementById("photo").src = URL.createObjectURL(image.data);
```

## `insertHTML`

```javascript
insertHTML(url, id, runFunction, errorFunction?)
```

Fetches HTML from `url`, sets it as the content of element `id`, then calls `runFunction()`. `errorFunction` (optional) is called with an `Error` if the element does not exist, the server answers with a non-2xx status, the network fails, or the request exceeds 15 seconds. On failure, the element's content is left unchanged and `runFunction` is not called.

```javascript
import { insertHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";

insertHTML("./sections/navbar.html", "navbar", () => {
    console.log("Navbar loaded");
}, (error) => {
    console.log("Navbar failed to load:", error.message);
});
```

`renderHTML(id, url, callback?, errorCallback?)` in [`element.js`](../element/) does the same with a different argument order. Both insert the HTML through `innerHTML`, so any `<script>` inside it is not executed.

## `getDomHTML`

```javascript
getDomHTML(url, domFunction)
```

Fetches HTML from `url` and passes it to `domFunction(htmlDom)` as a parsed `Document`, so it can be read or modified before being inserted. The response status is not checked: a 404/500 error page is passed as a `Document` too. Only when the network fails or 15 seconds pass is `domFunction` not called (the reason is in the console).

```javascript
import { getDomHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.33/api.js";

getDomHTML("./sections/card.html", (htmlDom) => {
    const title = htmlDom.querySelector(".title");
    console.log(title ? title.textContent : "no title");
});
```

## Legacy File Functions

These functions remain so that existing code does not break, with the same result shape as before. For new code, use [`uploadFile`](#uploadfile) and [`downloadFile`](#downloadfile), which have a uniform result, can be `await`ed, and take options.

| Function | Result passed to `responseFunction` | On network failure / 15 seconds |
|---|---|---|
| `postFile(url, id, formdataname, responseFunction)` | JSON response body (or `null` if it is not JSON) | `null` |
| `postFileWithHeader(url, tokenkey, tokenvalue, id, formdataname, responseFunction)` | Same as `postFile`, plus one token header | `null` |
| `postFileJSON(url, tokenkey, tokenvalue, id, formdataname, responseFunction)` | `{ status, data }` | `{ status: 0, data: null }` |
| `getFileWithHeader(url, tokenkey, tokenvalue, responseFunction, fileName)` | Status 200: the file is downloaded right away as `fileName`, and `responseFunction` is not called. Otherwise: the error body (or `null`) | `{ status: 0 }` |
| `getFileBytesWithHeader(url, tokenkey, tokenvalue, responseFunction)` | Status 200: an `ArrayBuffer` of the file contents. Otherwise: the error body (or `null`) | `{ status: 0 }` |

`id` is the id of an `<input type="file">`; only its first file is sent. `formdataname` must match the field name the backend reads.

## Notes

- Full source code: [`api.js`](https://github.com/crootjs/lib/blob/main/api.js).
- Every request in this module is cancelled after 15 seconds without an answer unless the option is changed (`uploadFile`: 15 seconds without progress).
- Tokens in `localStorage` or in cookies readable by JavaScript are vulnerable to theft through XSS. If your backend supports it, use an `HttpOnly` cookie.
