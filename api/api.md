### Menggunakan NPM

```bash
npm install crootjs
```

### Menggunakan CDN (jsDelivr)

```html
<script src="https://cdn.jsdelivr.net/npm/crootjs"></script>
```

---

# 📌 Available Methods

---

## 🔹 get(url)

Digunakan untuk mengambil data dari server menggunakan metode HTTP GET.

### Parameters

| Name | Type   | Description |
|------|--------|------------|
| url  | string | Endpoint API tujuan |

### Example

```js
import { get } from "crootjs/api";

get("/users")
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error);
  });
```

### Using async/await

```js
try {
  const data = await get("/users");
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### Returns

`Promise` → Response dalam format JSON.

---

## 🔹 post(url, data)

Digunakan untuk mengirim data ke server menggunakan metode HTTP POST.

### Parameters

| Name | Type   | Description |
|------|--------|------------|
| url  | string | Endpoint API tujuan |
| data | object | Data yang akan dikirim ke server |

### Example

```js
import { post } from "crootjs/api";

post("/users", {
  name: "John Doe",
  email: "john@example.com"
})
.then(response => {
  console.log(response);
})
.catch(error => {
  console.error(error);
});
```

### Using async/await

```js
try {
  const result = await post("/users", {
    name: "John Doe"
  });
  console.log(result);
} catch (error) {
  console.error(error);
}
```

### Returns

`Promise` → Response dalam format JSON.

---

# ⚠️ Error Handling

Disarankan selalu menangani error menggunakan:

- `.catch()`
- atau `try/catch` pada async function

Contoh:

```js
try {
  const users = await get("/users");
  console.log(users);
} catch (err) {
  console.error("Terjadi kesalahan saat request:", err);
}
```

---

# 📁 File Upload Methods

CrootJS menyediakan fungsi untuk mengupload file menggunakan metode HTTP POST.

---

## 🔹 postFile(target_url, id, formdataname, responseFunction)

Digunakan untuk mengupload file tanpa header tambahan.

### Parameters

| Name | Type | Description |
|------|------|------------|
| target_url | string | Endpoint tujuan upload |
| id | string | ID dari input file di HTML |
| formdataname | string | Nama field file yang digunakan di backend |
| responseFunction | function | Callback function untuk menangani response |

### Example

HTML:

```html
<input type="file" id="fileInput">
```

JavaScript:

```js
import { postFile } from "crootjs/api";

postFile(
  "https://api.example.com/upload",
  "fileInput",
  "file",
  function(response) {
    console.log(response);
  }
);
```

---

## 🔹 postFileWithHeader(target_url, tokenkey, tokenvalue, id, formdataname, responseFunction)

Digunakan untuk upload file dengan header tambahan seperti Authorization token.

### Parameters

| Name | Type | Description |
|------|------|------------|
| target_url | string | Endpoint tujuan upload |
| tokenkey | string | Nama header (contoh: Authorization) |
| tokenvalue | string | Nilai header |
| id | string | ID input file |
| formdataname | string | Nama field file di backend |
| responseFunction | function | Callback untuk menangani response |

### Example

```js
import { postFileWithHeader } from "crootjs/api";

postFileWithHeader(
  "https://api.example.com/upload",
  "Authorization",
  "Bearer your_token_here",
  "fileInput",
  "file",
  function(response) {
    console.log(response);
  }
);
```

---

## 🔹 postFileJSON(target_url, tokenkey, tokenvalue, id, formdataname, responseFunction)

Digunakan untuk upload file dan mengembalikan response dalam format status dan data JSON.

### Parameters

| Name | Type | Description |
|------|------|------------|
| target_url | string | Endpoint tujuan upload |
| tokenkey | string | Nama header |
| tokenvalue | string | Nilai header |
| id | string | ID input file |
| formdataname | string | Nama field file |
| responseFunction | function | Callback function |

### Example

```js
import { postFileJSON } from "crootjs/api";

postFileJSON(
  "https://api.example.com/upload",
  "Authorization",
  "Bearer your_token_here",
  "fileInput",
  "file",
  function(response) {
    console.log("HTTP Status:", response.status);
    console.log("Response Data:", response.data);
  }
);
```

### Response Format

```js
{
  status: 200,
  data: { ...JSON response... }
}
```

---

# ⚠️ Important Notes

- Pastikan elemen input file memiliki ID yang sesuai.
- `formdataname` harus sama dengan nama field yang dibaca di backend.
- Error akan ditampilkan di console jika request gagal.