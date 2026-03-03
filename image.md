# Manual Penggunaan Fungsi image

## Pendahuluan
File ini berisi fungsi JavaScript yang digunakan untuk menghasilkan nilai warna secara acak. Fungsi-fungsi ini sangat berguna ketika Anda membutuhkan warna dinamis untuk elemen antarmuka (UI), seperti warna latar belakang (_background_), teks, atau _placeholder_ gambar.

---

## Fungsi dan Cara Penggunaannya

### 1. `getRandomColor()`
**Deskripsi:**
Mengembalikan kode warna Hexadecimal acak yang terdiri dari 6 karakter (contoh: `#3E2F1B` atau `#FF5733`).

**Cara penggunaan:**

```javascript
let hexColor = getRandomColor();
console.log(hexColor); // Contoh Output: "#7A2B9C" (nilai akan berubah-ubah)
```

---

### 2. `getRandomColorName()`
**Deskripsi:**
Mengembalikan nama warna secara acak dari daftar yang sudah disediakan di dalam sistem (seperti `yellow`, `blue`, `slate`, `emerald`, dsb.). Fungsi ini sangat cocok digabungkan dengan framework CSS seperti Tailwind.

**Cara penggunaan:**
```javascript
let colorName = getRandomColorName();
console.log(colorName); // Contoh Output: "emerald" (nilai akan berubah-ubah)
```

---

## Penutup
Fungsi-fungsi ini sangat praktis untuk memberikan variasi visual secara instan pada aplikasi web Anda. Pastikan untuk memanggil fungsinya di saat yang tepat agar tampilan UI menjadi lebih menarik.
