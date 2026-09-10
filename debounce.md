# Dokumentasi Modul `debounce.js`

`debounce.js` berisi dua fungsi pembungkus (*higher-order function*) untuk membatasi seberapa sering sebuah function boleh dijalankan — berguna untuk event yang terpicu sangat sering seperti mengetik, scroll, resize, atau mousemove.

## Cara Penggunaan (Import)

```javascript
import { debounce, throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/debounce.js";
```

## `debounce(fn, delay)`

Menunda eksekusi `fn` sampai user **berhenti** memicu selama `delay` milidetik. Kalau dipanggil lagi sebelum waktu itu habis, hitungan mundur diulang dari awal. Hasilnya: `fn` cuma jalan **sekali**, setelah user selesai (bukan di tengah-tengah).

**Kegunaan paling umum**: search-as-you-type — supaya tidak kirim request ke server di setiap ketikan, cuma setelah user berhenti mengetik.

```javascript
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/debounce.js";
import { onInput, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/api.js";

const cariProduk = debounce(() => {
    const kata = getValue("kotakPencarian");
    getJSON(`https://api.example.com/produk?q=${kata}`, (res) => {
        console.log(res.data);
    });
}, 400); // tunggu 400ms setelah user berhenti mengetik

onInput("kotakPencarian", cariProduk);
```

## `throttle(fn, delay)`

Membatasi `fn` supaya berjalan **maksimal sekali** setiap `delay` milidetik, walau dipicu berkali-kali lebih sering dari itu. Beda dengan `debounce`, panggilan pertama langsung jalan (*leading call*), dan kalau ada pemicu baru selama periode tunggu, panggilan **terakhir** tetap dijalankan setelah `delay` selesai (*trailing call*) — jadi data terbaru tidak pernah hilang.

**Kegunaan paling umum**: event `scroll`/`resize`/`mousemove` yang bisa terpicu puluhan kali per detik.

```javascript
import { throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.8/debounce.js";

window.addEventListener("scroll", throttle(() => {
    console.log("posisi scroll:", window.scrollY);
}, 200)); // paling sering jalan tiap 200ms
```

## Catatan

- Kedua fungsi mengembalikan function baru yang sudah dibungkus — panggil `debounce(fn, delay)`/`throttle(fn, delay)` **sekali** di luar handler, lalu daftarkan hasilnya sebagai listener (seperti contoh di atas). Jangan panggil `debounce(...)`/`throttle(...)` di dalam handler itu sendiri, karena itu akan membuat wrapper baru setiap kali dan menghilangkan efeknya.
- `this` dan semua argumen pemanggilan asli tetap diteruskan ke `fn`.
