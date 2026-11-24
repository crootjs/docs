# Dokumentasi Modul `debounce.js`

*[English](en/debounce)*

`debounce.js` berisi dua function pembungkus untuk membatasi seberapa sering sebuah function dijalankan, berguna untuk event yang terpicu sangat sering seperti mengetik, scroll, resize, atau mousemove.

## Cara Penggunaan (Import)

```javascript
import { debounce, throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/debounce.js";
```

## `debounce(fn, delay)`

Mengembalikan function baru yang menunda `fn` sampai tidak ada panggilan lagi selama `delay` milidetik. Setiap panggilan baru mengulang hitungan dari awal, jadi `fn` hanya jalan sekali setelah pemicunya berhenti, dengan argumen dari panggilan terakhir.

Contoh umumnya pencarian saat mengetik: request dikirim setelah pengguna berhenti mengetik, bukan di setiap ketikan.

```javascript
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/debounce.js";
import { onInput } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/api.js";

const cariProduk = debounce(async (input) => {
    const { status, data } = await getJSON(`https://api.example.com/produk?q=${encodeURIComponent(input.value)}`);
    if (status === 200) console.log(data);
}, 400);

onInput("kotakPencarian", cariProduk); // onInput memberi elemen input ke callback
```

## `throttle(fn, delay)`

Mengembalikan function baru yang menjalankan `fn` paling sering sekali setiap `delay` milidetik. Panggilan pertama langsung jalan; panggilan yang datang selama masa tunggu digabung, dan yang terakhir dijalankan begitu masa tunggu habis, jadi nilai terbaru tidak hilang.

Contoh umumnya event `scroll`, `resize`, dan `mousemove`.

```javascript
import { throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/debounce.js";

window.addEventListener("scroll", throttle(() => {
    console.log("posisi scroll:", window.scrollY);
}, 200));
```

## Catatan

- Panggil `debounce(...)`/`throttle(...)` sekali, lalu daftarkan hasilnya sebagai listener seperti contoh di atas. Memanggilnya di dalam handler membuat pembungkus baru di setiap event sehingga tidak membatasi apa-apa.
- `this` dan semua argumen diteruskan ke `fn`. Nilai kembalian `fn` tidak diteruskan: function hasil pembungkus selalu mengembalikan `undefined`.
- Tidak ada cara membatalkan panggilan yang sedang ditunda.
