# Dokumentasi Modul `trace.js`

*[English](en/trace)*

`trace.js` berisi satu fungsi bantu debugging: pasang sebagai event listener, dan fungsi itu mencetak elemen yang diklik atau disentuh beserta koordinatnya ke console browser. Fungsi ini hanya menulis ke console — tidak menyimpan, tidak mengirim data ke mana pun, dan tidak mengembalikan nilai.

## Cara Penggunaan (Import)

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/trace.js";
```

## `tapClick(event)`

Untuk setiap event, fungsi ini mencetak `Elemen yang dipicu:` diikuti `event.target`, lalu salah satu dari:

| Jenis event | Yang dicetak |
|---|---|
| Event sentuh dengan minimal satu jari di layar (`touchstart`, `touchmove`) | `Jumlah sentuhan aktif:` dan `Koordinat sentuhan pertama:` (`clientX`, `clientY` dari `event.touches[0]`) |
| Event mouse (`click`, `mousedown`, ...) | `Koordinat klik:` (`clientX`, `clientY`) |
| Lainnya, misalnya `touchend` (tidak ada jari tersisa di layar) | Hanya elemen target |

Koordinat adalah `clientX`/`clientY`, yaitu relatif terhadap viewport, bukan terhadap halaman atau elemen.

```javascript
import { tapClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/trace.js";

document.addEventListener("click", tapClick);
document.addEventListener("touchstart", tapClick);
```

`touchmove` juga bisa dipasang, tetapi event itu terpicu terus-menerus selama jari bergerak dan akan memenuhi console. Lepas listener-nya (`removeEventListener`) setelah selesai debugging.
