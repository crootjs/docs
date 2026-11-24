# Dokumentasi Modul `image.js`

*[English](en/image)*

Walau bernama `image.js`, modul ini tidak mengolah gambar. Isinya dua fungsi untuk memilih warna secara acak, misalnya untuk latar avatar inisial atau penanda kategori.

## Cara Penggunaan (Import)

```javascript
import { getRandomColor, getRandomColorName } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/image.js";
```

## `getRandomColor()`

Mengembalikan string warna hex 6 digit dengan huruf besar, misalnya `"#7A2B9C"`. Setiap digit dipilih acak dengan `Math.random()`, jadi warna yang terlalu terang atau terlalu gelap untuk teks di atasnya bisa saja muncul.

```javascript
import { getRandomColor } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/image.js";

document.getElementById("avatar").style.backgroundColor = getRandomColor();
```

## `getRandomColorName()`

Mengembalikan satu nama warna palet Tailwind CSS secara acak, **tanpa** awalan dan tanpa tingkat warna. Daftarnya (22 nama):

`yellow`, `violet`, `green`, `red`, `rose`, `pink`, `fuchsia`, `purple`, `indigo`, `blue`, `sky`, `cyan`, `teal`, `emerald`, `lime`, `amber`, `orange`, `stone`, `neutral`, `zinc`, `gray`, `slate`

Beberapa nama ini (misalnya `sky`, `emerald`, `zinc`) bukan nama warna CSS standar, jadi jangan dipakai langsung sebagai nilai `color` atau `background-color`. Rangkai menjadi nama class Tailwind:

```javascript
import { getRandomColorName } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.36/image.js";

const warna = getRandomColorName();
document.getElementById("label-kategori").classList.add(`bg-${warna}-500`, "text-white");
```

Tailwind yang di-build hanya membuat class yang tertulis utuh di source code, sehingga class yang dirangkai saat runtime seperti di atas perlu dimasukkan ke safelist.
