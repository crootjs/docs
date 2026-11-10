*[Bahasa Indonesia](../../api/)*

## 1. API (`api.js`)

The `api.js` module provides *wrapper* functions on top of the browser's built-in **Fetch API** to make HTTP communication with a backend easier. Each function uses a **callback** pattern — you supply a function that is called when the response is received from the server, together with the HTTP status code. The JSON functions can also be `await`ed (see [`await` Style](#await-style)).

### Common Response Pattern

All JSON functions in this module (`getJSON`, `postJSON`, `deleteJSON`, `putJSON`) return the response to the callback function as an object with a consistent format:

```javascript
{
  status: Number,  // HTTP status code (200, 201, 400, 404, 500, etc.)
  data: Object     // Response body parsed from JSON
}
```

#### Handling Network Failures/Timeouts

`responseFunction` is **always** called, including when the request fails entirely (not only when the server responds with an error status such as 404/500). If the network fails (offline, DNS failure, CORS rejected) or the server does not respond at all within 15 seconds (the request is aborted automatically by a timeout), `responseFunction` is called with:

```javascript
{ status: 0, data: null }
```

`status: 0` is not a real HTTP code (real HTTP codes are always >= 100) — so it is safe to use as a marker for "request failed entirely", distinct from server error statuses such as 404/500, which still carry `data` from the server's response body.

```javascript
getJSON("https://api.example.com/data", (res) => {
    if (res.status === 0) {
        console.log("Request gagal — cek koneksi internet atau server sedang down");
    } else if (res.status >= 400) {
        console.log("Server merespons dengan error:", res.status, res.data);
    } else {
        console.log("Berhasil:", res.data);
    }
});
```

### `await` Style

Since version 0.0.26, `getJSON`, `postJSON`, `putJSON`, and `deleteJSON` also **return a Promise** containing the same `{ status, data }` object. The callback still runs as usual; if you use `await`, pass `null` as `responseFunction`:

```javascript
import { getJSON, postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js";
import { getCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js";

const { status, data } = await getJSON("https://api.example.com/produk");
if (status === 200) console.log(data);

// the token still goes in the last two arguments
const hasil = await postJSON("https://api.example.com/pesanan", { id: 7 }, null, "login", getCookie("login"));
```

The Promise never *rejects*, so there is no need for `try/catch`: check `status` as usual (`0` = network failure or timeout).

### 1.1 `getJSON()`

Performs an **HTTP GET** request to the given URL and returns the response in JSON format to the callback function.

#### Signature

```javascript
getJSON(target_url, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | Target URL of the HTTP GET request |
| `responseFunction` | `function` | ✅ | Callback function that receives the `{ status, data }` object |
| `tokenkey` | `string` | ❌ | Header name for authentication (e.g. `"Authorization"`, `"token"`, `"Login"`) |
| `tokenvalue` | `string` | ❌ | Authentication token value (e.g. `"Bearer eyJhbGci..."`) |

#### Return Value

`Promise<{ status, data }>` — the same result that is passed to `responseFunction`. This Promise never *rejects*; network failures are also returned as `{ status: 0, data: null }`. `responseFunction` may be `null` if you use `await` (see [`await` Style](#await-style)).

#### Usage Examples

**Without a Token (Public API):**

```javascript
import { getJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

// Fetch data from a public API
getJSON(
  'https://api.example.com/users',
  function(response) {
    console.log('Status:', response.status); // 200
    console.log('Data:', response.data);     // [{id: 1, name: "Andi"}, ...]

    if (response.status === 200) {
      // Process the data successfully
      response.data.forEach(user => {
        console.log(user.name);
      });
    }
  }
);
```

**With an Authentication Token:**

```javascript
import { getJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js';

// Get the token from a cookie
const token = getCookie('user_token');

// Request to an API that requires authentication
getJSON(
  'https://api.example.com/profile',
  function(response) {
    if (response.status === 200) {
      document.getElementById('nama').innerText = response.data.name;
      document.getElementById('email').innerText = response.data.email;
    } else if (response.status === 401) {
      console.log('Token tidak valid, silakan login ulang.');
    }
  },
  'Authorization',
  'Bearer ' + token
);
```

---

### 1.2 `postJSON()`

Performs an **HTTP POST** request to the given URL, sending data in JSON format in the request body. Used to **create new data** on the server (Create).

#### Signature

```javascript
postJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | Target URL of the HTTP POST request |
| `datajson` | `object` | ✅ | JavaScript object to be sent as the JSON body |
| `responseFunction` | `function` | ✅ | Callback function that receives the `{ status, data }` object |
| `tokenkey` | `string` | ❌ | Header name for authentication |
| `tokenvalue` | `string` | ❌ | Authentication token value |

#### Return Value

`Promise<{ status, data }>` — the same result that is passed to `responseFunction`. This Promise never *rejects*; network failures are also returned as `{ status: 0, data: null }`. `responseFunction` may be `null` if you use `await` (see [`await` Style](#await-style)).

#### Usage Examples

**Creating New Data (Without a Token):**

```javascript
import { postJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

// Data to be sent to the server
const dataMahasiswa = {
  nama: 'Budi Santoso',
  nim: '1234567890',
  jurusan: 'Teknik Informatika'
};

postJSON(
  'https://api.example.com/mahasiswa',
  dataMahasiswa,
  function(response) {
    if (response.status === 201) {
      console.log('Mahasiswa berhasil ditambahkan!');
      console.log('ID baru:', response.data.id);
    } else if (response.status === 400) {
      console.log('Validasi gagal:', response.data.message);
    }
  }
);
```

**With an Authentication Token:**

```javascript
import { postJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js';

const token = getCookie('user_token');

const dataPeminjaman = {
  ruangan_id: 'R-101',
  tanggal: '2026-03-15',
  jam_mulai: '08:00',
  jam_selesai: '10:00',
  keperluan: 'Rapat organisasi'
};

postJSON(
  'https://api.example.com/peminjaman',
  dataPeminjaman,
  function(response) {
    if (response.status === 201) {
      alert('Peminjaman berhasil diajukan!');
    } else {
      alert('Gagal: ' + response.data.message);
    }
  },
  'Login',
  token
);
```

---

### 1.3 `deleteJSON()`

Performs an **HTTP DELETE** request to the given URL, sending identifying data in JSON format in the request body. Used to **delete data** on the server (Delete).

#### Signature

```javascript
deleteJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | Target URL of the HTTP DELETE request |
| `datajson` | `object` | ✅ | JavaScript object containing the identifying data of the item to delete |
| `responseFunction` | `function` | ✅ | Callback function that receives the `{ status, data }` object |
| `tokenkey` | `string` | ❌ | Header name for authentication |
| `tokenvalue` | `string` | ❌ | Authentication token value |

#### Return Value

`Promise<{ status, data }>` — the same result that is passed to `responseFunction`. This Promise never *rejects*; network failures are also returned as `{ status: 0, data: null }`. `responseFunction` may be `null` if you use `await` (see [`await` Style](#await-style)).

#### Usage Examples

**Deleting Data with Confirmation:**

```javascript
import { deleteJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js';

const token = getCookie('user_token');

function hapusMahasiswa(mahasiswaId) {
  // Confirm before deleting
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    return;
  }

  const dataHapus = {
    id: mahasiswaId
  };

  deleteJSON(
    'https://api.example.com/mahasiswa',
    dataHapus,
    function(response) {
      if (response.status === 200) {
        alert('Data berhasil dihapus!');
        // Refresh the table view
        location.reload();
      } else if (response.status === 404) {
        alert('Data tidak ditemukan.');
      } else if (response.status === 403) {
        alert('Anda tidak memiliki izin untuk menghapus data ini.');
      }
    },
    'Login',
    token
  );
}
```
## 1.4 `putJSON`

Sends a **PUT** request with a JSON body to the specified URL and passes the response (status + parsed data) to a callback function.

```javascript
putJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The endpoint URL to send the PUT request to |
| `datajson` | `object` | ✅ | The JavaScript object to be sent as the JSON body |
| `responseFunction` | `function` | ✅ | Callback receiving `{ status, data }` from the response |
| `tokenkey` | `string` | ❌ | Header key name for authorization token (e.g. `"Authorization"`) |
| `tokenvalue` | `string` | ❌ | Header value for the token (e.g. `"Bearer abc123"`) |

**Response Callback Shape**

```javascript
responseFunction({ status: number, data: object })
```

**Example**

```javascript
import { putJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

const payload = { name: "Alice", age: 30 };

putJSON(
  "https://api.example.com/users/1",
  payload,
  ({ status, data }) => {
    console.log("Status:", status); // e.g. 200
    console.log("Data:", data);     // parsed JSON response
  },
  "Authorization",
  "Bearer my-secret-token"
);
```

---

## 1.5  `insertHTML`

Fetches raw HTML from a URL and **injects it into a DOM element** by its `id`, then runs a callback function after rendering.

```javascript
insertHTML(target_url, id, runFunction, errorFunction?)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The URL to fetch HTML content from |
| `id` | `string` | ✅ | The `id` of the DOM element where the HTML will be injected |
| `runFunction` | `function` | ✅ | Callback executed after the HTML has been inserted |
| `errorFunction` | `function` | ❌ | Called with an `Error` if the element doesn't exist, the server replies with a non-2xx status, the network fails, or the request times out (15s). On failure the element's content is left unchanged and `runFunction` is not called. |

**Example**

```javascript
import { insertHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

insertHTML(
  "https://example.com/partials/navbar.html",
  "navbar-container",
  () => {
    console.log("Navbar has been loaded and rendered!");
    // Initialize dropdown menus, event listeners, etc.
  }
);
```
---

## 1.6 `getDomHTML`

Fetches HTML from a URL and returns it as a **parsed DOM object** via a callback, allowing you to query and manipulate elements programmatically before rendering.

```javascript
getDomHTML(target_url, domFunction)
```

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target_url` | `string` | ✅ | The URL to fetch HTML content from |
| `domFunction` | `function` | ✅ | Callback receiving the parsed `Document` object |

**Example**

```javascript
import { getDomHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

getDomHTML(
  "https://example.com/partials/card.html",
  (htmlDom) => {
    const title = htmlDom.querySelector(".card-title");
    console.log("Card title:", title?.textContent);

    // You can then append or modify elements before inserting into the page
    document.getElementById("content").appendChild(
      document.importNode(htmlDom.body, true)
    );
  }
);
```


## Usage Examples

### Updating a resource with authentication

```javascript
import { putJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

putJSON(
  "/api/products/42",
  { price: 99.99, stock: 150 },
  ({ status, data }) => {
    if (status === 200) {
      alert("Product updated successfully!");
    } else {
      console.error("Update failed:", data);
    }
  },
  "x-api-key",
  "your-api-key-here"
);
```

### Loading a page section dynamically

```javascript
import { insertHTML } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js';

document.addEventListener("DOMContentLoaded", () => {
  insertHTML("/components/footer.html", "footer", () => {
    console.log("Footer loaded.");
  });
});
```

---

 File Upload Documentation - api.js

This documentation describes the file upload functions available in `api.js`,
which use `fetch()` and `FormData`.

---

# 📌 FAILURE BEHAVIOR

The full source code is in [`api.js`](https://github.com/crootjs/lib/blob/main/api.js) — deliberately not copied here so it doesn't go stale when the code changes.

All upload functions **always** call `responseFunction`, including when the request fails, and automatically abort the request after 15 seconds if the server does not respond:

| Function | Success | Body is not JSON | Network failure / timeout |
|---|---|---|---|
| `postFile`, `postFileWithHeader` | parsed JSON body | `null` | `null` |
| `postFileJSON` | `{ status, data }` | `{ status, data: null }` | `{ status: 0, data: null }` |

---

# 📌 FUNCTION DESCRIPTIONS

## 1️⃣ postFile()

Used to upload a file without additional headers.

### Parameters:
- `target_url` → backend endpoint
- `id` → id of the file input in the HTML
- `formdataname` → name of the file field on the backend
- `responseFunction` → callback that receives the response

### Usage example:

```javascript
postFile(
    "https://example.com/upload",
    "fileInput",
    "file",
    function(response){
        console.log(response);
    }
);
```

---

## 2️⃣ postFileWithHeader()

Used to upload a file with a header (usually an authentication token).

### Additional parameters:
- `tokenkey` → example: "Authorization"
- `tokenvalue` → example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

### Usage example:

```javascript
postFileWithHeader(
    "https://example.com/upload",
    "Authorization",
    "Bearer TOKEN_KAMU",
    "fileInput",
    "file",
    function(response){
        console.log(response);
    }
);
```

---

## 3️⃣ postFileJSON()

Used to upload a file and return:
- HTTP Status Code
- JSON data

### Example response handler:

```javascript
function responseHandler(response) {
    console.log("HTTP Status:", response.status);
    console.log("Response Data:", response.data);
}
```

---

# ⚠️ IMPORTANT NOTES

- Make sure `formdataname` matches the field name on the backend.
- The HTML input must have `type="file"`.
- Don't set `Content-Type` manually when using `FormData`.

Example HTML:

```html
<input type="file" id="fileInput">
```
