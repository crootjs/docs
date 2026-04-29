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

