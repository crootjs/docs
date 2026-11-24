# Dokumentasi Modul `element.js`

*[English](../en/element/)*

`element.js` berisi function pendek untuk pekerjaan DOM sehari-hari berdasarkan ID elemen: memasang event, membaca dan mengisi nilai form, mengubah isi dan class elemen, memuat potongan HTML dari file lain, dan memuat file JS/CSS eksternal. Sebagian besar function memanggil `document.getElementById(id)` lalu melakukan satu hal.

## Cara Penggunaan (Import)

```javascript
import { onClick, getValue, setInner, serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";
```

Kecuali disebut lain, function di halaman ini melempar `TypeError` kalau tidak ada elemen dengan ID tersebut.

| Kelompok | Function |
|---|---|
| Elemen | [`container`](#containerid) |
| Event | [`onClick`](#onclickid-actionfunctionname), [`onClicks`](#onclicksclassname-actionfunctionname), [`onChange`](#onchangeid-actionfunctionname), [`onChanges`](#onchangesclassname-actionfunctionname), [`onInput`](#oninputid-actionfunctionname), [`onInputs`](#oninputsclassname-actionfunctionname), [`runAfterDOM`](#runafterdomrunfunctionevent), [`runAfterAll`](#runafterallrunfunctionevent) |
| Form | [`getValue`](#getvalueid), [`setValue`](#setvalueid-valuecontent), [`getAttributeValue`](#getattributevalueid-attribute), [`getValueRadio`](#getvalueradioname), [`getValueSelect`, `getTextSelect`](#getvalueselectid-gettextselectid), [`serializeForm`](#serializeformid), [`fillForm`](#fillformid-data), [`getFileSize`](#getfilesizeid), [`textFocus`, `textBlur`](#textfocusid-textblurid), [`disableInput`, `enableInput`](#disableinputid-enableinputid) |
| Isi elemen | [`setInner`](#setinnerid-content), [`setInnerText`](#setinnertextid-content), [`addInner`](#addinnerid-content), [`addChild`](#addchildid-tag-classvalue-content) |
| Class dan tampilan | [`addClassValue`](#addclassvalueid-classvalue), [`setClassValue`](#setclassvalueel-classvalue), [`show`, `hide`](#showid-hideid) |
| Memuat HTML | [`renderHTML`](#renderhtmlid-urlhtml-callback-errorcallback), [`replaceTag`](#replacetagid-urlhtml-callback) |
| Memuat JS/CSS | [`addJS`, `addCSS`](#addjssrc-addcsshref), [`addJSInHead`, `addCSSInHead`](#addjsinheadsrc-addcssinheadhref), [`isJSLoaded`, `isCSSLoaded`](#isjsloadedsrc-iscssloadedhref) |

## `container(id)`

Mengembalikan elemen dengan ID `id`, sama dengan `document.getElementById(id)`. Hasilnya `null` kalau tidak ada. Berguna untuk hal yang tidak punya function sendiri di modul ini, misalnya `container("menu").classList.remove("terbuka")`.

## `onClick(id, actionFunctionName)`

Memasang listener `click` pada elemen `id` dengan `addEventListener`. Setiap kali diklik, `actionFunctionName(target)` dipanggil dengan `event.target`, yaitu elemen yang benar-benar diklik. Kalau tombolnya berisi elemen lain (misalnya ikon `<i>`), `target` bisa berupa elemen anak itu, bukan tombolnya.

Kalau elemen tidak ditemukan, muncul peringatan di console dan tidak ada error. Memanggil `onClick` lagi untuk ID yang sama menambah listener baru, bukan mengganti yang lama.

```html
<button id="tombolSimpan" type="button">Simpan</button>
<p id="status"></p>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { onClick, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";

onClick("tombolSimpan", () => {
    setInnerText("status", "Tersimpan");
});
```

## `onClicks(className, actionFunctionName)`

Seperti `onClick`, untuk semua elemen dengan class `className`. Handler dipasang lewat properti `onclick`, jadi menimpa handler `onclick` sebelumnya di elemen itu. Hanya elemen yang sudah ada saat function ini dipanggil yang kena; elemen yang ditambahkan belakangan perlu dipasang ulang.

```javascript
onClicks("tombol-hapus", (tombol) => {
    console.log("hapus item", tombol.dataset.id);
});
```

## `onChange(id, actionFunctionName)`

Memasang handler `change` pada elemen `id` lewat properti `onchange` (menimpa handler sebelumnya). `actionFunctionName(target)` menerima elemen yang berubah. Event `change` terpicu saat pilihan `<select>`, checkbox, atau radio berubah, dan pada input teks saat nilainya diubah lalu fokus pindah.

```javascript
onChange("pilihKelas", (select) => {
    console.log("Terpilih:", select.value);
});
```

## `onChanges(className, actionFunctionName)`

Seperti `onChange`, untuk semua elemen dengan class `className` yang sudah ada saat dipanggil.

## `onInput(id, actionFunctionName)`

Memasang handler `input` pada elemen `id` lewat properti `oninput` (menimpa handler sebelumnya). Terpicu di setiap perubahan nilai, termasuk setiap ketikan. `actionFunctionName(target)` menerima **elemennya**, bukan event, jadi nilainya ada di `target.value`.

```html
<label for="nama">Nama</label>
<input id="nama" type="text">
<p id="pratinjau"></p>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { onInput, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";

onInput("nama", (input) => {
    setInnerText("pratinjau", input.value);
});
```

Untuk pencarian yang mengirim request saat mengetik, bungkus handler-nya dengan [`debounce`](../debounce).

## `onInputs(className, actionFunctionName)`

Seperti `onInput`, untuk semua elemen dengan class `className` yang sudah ada saat dipanggil.

## `runAfterDOM(runFunctionEvent)`

Memanggil `runFunctionEvent(event)` saat event `DOMContentLoaded`, yaitu setelah HTML selesai di-parse. Script `type="module"` sudah dijalankan setelah HTML di-parse, jadi di kode module biasa function ini tidak wajib. Kalau dipanggil setelah `DOMContentLoaded` lewat (misalnya di dalam callback atau setelah `await`), function-nya tidak pernah dipanggil.

## `runAfterAll(runFunctionEvent)`

Memanggil `runFunctionEvent(event)` saat event `load`, yaitu setelah semua gambar, stylesheet, dan iframe selesai dimuat. Sama seperti `runAfterDOM`, tidak dipanggil kalau event-nya sudah lewat.

## `getValue(id)`

Mengembalikan `value` elemen `id` (input, textarea, select). Hasilnya selalu string, jadi ubah dulu dengan `Number()` untuk angka.

```javascript
const umur = Number(getValue("umur"));
const nama = getValue("nama").trim();
```

Untuk `<select>` biasa, `getValue` memberi `value` dari pilihan yang terpilih.

## `setValue(id, valuecontent)`

Mengisi `value` elemen `id` dengan `valuecontent` dan mengembalikan nilai itu.

```javascript
setValue("nama", "Sari");
```

## `getAttributeValue(id, attribute)`

Mengembalikan nilai atribut `attribute` dari elemen `id`, atau `null` kalau atributnya tidak ada.

```javascript
const idProduk = getAttributeValue("kartuProduk", "data-id");
```

## `getValueRadio(name)`

Mengembalikan `value` radio yang terpilih di antara semua elemen dengan `name` yang sama, atau `undefined` kalau belum ada yang dipilih. Parameternya atribut `name`, bukan ID. Sebelum 0.0.30 function ini juga menulis `Selected Value: ...` ke console untuk setiap radio.

```javascript
const ukuran = getValueRadio("ukuran"); // "M", atau undefined
```

## `getValueSelect(id)`, `getTextSelect(id)`

Mengembalikan `value` dan teks pilihan yang terpilih di `<select>` dengan ID `id` (kalau tidak ada elemen dengan ID itu, dicari lewat atribut `name`), atau `""` kalau belum ada yang dipilih. Sebelum 0.0.30 keduanya selalu melempar `TypeError`; pakai versi 0.0.30 ke atas.

```javascript
const nilai = getValueSelect("pilihKota"); // misalnya "bdg"
const teks = getTextSelect("pilihKota");   // misalnya "Bandung"
```

## `serializeForm(id)`

Mengambil semua field yang punya atribut `name` di dalam form (text, email, checkbox, radio yang terpilih, select) dan mengembalikannya sebagai satu object `{nama: nilai}` — jadi tidak perlu memanggil `getValue()` satu per satu sebelum kirim ke server. Field yang `disabled` dan `<input type="file">` otomatis dilewati (file dikirim dengan [`uploadFile`](../api/#uploadfile) dari `api.js`, bukan JSON biasa).

| Field | Nilai |
|---|---|
| Checkbox tunggal | `true` / `false` |
| Beberapa checkbox dengan `name` sama (sejak 0.0.30) | Array `value` yang dicentang, misalnya `["baca", "lari"]` |
| Radio | `value` yang terpilih (tidak ada kalau belum dipilih) |
| `<select multiple>` (sejak 0.0.30) | Array `value` yang dipilih |
| Lainnya | `value` berupa teks |

**Contoh Penggunaan:**

```html
<form id="formDaftar">
  <input type="text" name="nama">
  <input type="email" name="email">
  <input type="checkbox" name="setuju">
</form>
```

```javascript
import { serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.js";

const data = serializeForm("formDaftar");
// { nama: "...", email: "...", setuju: true/false }

postJSON("https://api.example.com/daftar", data, (res) => {
    console.log(res);
});
```

Untuk validasi dengan pesan di bawah field sebelum dikirim, lihat [`form.js`](../form).

## `fillForm(id, data)`

Kebalikan `serializeForm` (sejak 0.0.30): mengisi field form dari sebuah object, misalnya data dari server untuk form edit. Bentuk nilainya sama dengan hasil `serializeForm`, jadi `fillForm(id, serializeForm(id))` tidak mengubah apa-apa. Hanya field yang namanya ada di `data` yang diubah; `<input type="file">` dilewati; `null`/`undefined` mengosongkan field. Kalau form tidak ditemukan, muncul peringatan di console dan tidak ada error.

```javascript
import { fillForm, serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";
import { getJSON, putJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.js";

const { status, data } = await getJSON("https://api.example.com/profil/7");
if (status === 200) fillForm("formProfil", data); // { nama: "Sari", hobi: ["baca"], setuju: true }

// setelah diubah pengguna:
await putJSON("https://api.example.com/profil/7", serializeForm("formProfil"), null);
```

## `getFileSize(id)`

Mengembalikan ukuran file pertama yang dipilih di `<input type="file">` `id`, dalam KB (byte ÷ 1024, tidak dibulatkan). Melempar `TypeError` kalau belum ada file yang dipilih.

```javascript
onChange("berkas", () => {
    if (getFileSize("berkas") > 2048) console.log("Maksimal 2 MB");
});
```

## `textFocus(id)`, `textBlur(id)`

Memindahkan fokus keyboard ke elemen `id` (`focus()`), atau melepas fokus darinya (`blur()`).

## `disableInput(id)`, `enableInput(id)`

Mengatur `disabled` elemen `id` menjadi `true` atau `false`. Berlaku untuk input, button, select, dan textarea. Field yang `disabled` tidak ikut di hasil `serializeForm`.

```javascript
disableInput("tombolKirim"); // cegah klik dua kali selama request berjalan
```

## `setInner(id, content)`

Mengganti isi elemen `id` dengan `content` lewat `innerHTML`, jadi tag HTML di `content` ikut dirender. Jangan masukkan teks dari pengguna atau server tanpa di-*escape* — itu membuka celah XSS. Untuk teks biasa pakai `setInnerText`.

```javascript
const daftar = ["Apel", "Jeruk"].map((buah) => `<li>${buah}</li>`).join("");
setInner("daftarBuah", daftar);
```

## `setInnerText(id, content)`

Mengganti isi elemen `id` dengan `content` sebagai teks (`innerText`). Tag HTML ditampilkan apa adanya, jadi aman untuk teks dari pengguna.

## `addInner(id, content)`

Menambahkan `content` di akhir isi elemen `id` (`innerHTML += content`). Seluruh isi elemen dibuat ulang, jadi listener yang dipasang pada elemen anaknya hilang dan nilai input di dalamnya kembali ke awal. Peringatan XSS di `setInner` juga berlaku.

## `addChild(id, tag, classvalue, content)`

Membuat elemen `<tag>` baru, memberinya class dari `classvalue` (beberapa class dipisah spasi; isi `""` kalau tidak ada), mengisi `innerHTML`-nya dengan `content`, lalu menambahkannya sebagai anak terakhir elemen `id`. Tidak mengembalikan elemen baru itu.

```javascript
addChild("daftarTugas", "li", "tugas selesai", "Kirim laporan");
// <li class="tugas selesai">Kirim laporan</li>
```

## `addClassValue(id, classValue)`

Menambahkan satu class ke elemen `id`. Spasi di awal dan akhir dibuang; class dengan spasi di tengah (`"a b"`) membuat browser melempar `DOMException`. Modul ini tidak punya function untuk menghapus class; pakai `container(id).classList.remove(...)`.

## `setClassValue(el, classvalue)`

Menambahkan satu class ke **elemen** `el` (objek elemen, bukan ID). Tidak melakukan apa-apa kalau `classvalue` kosong. Dipakai `addChild` untuk memasang class.

## `show(id)`, `hide(id)`

`hide` mengatur `style.display = "none"`; `show` mengatur `style.display = "block"`. Karena `show` selalu memakai `block`, elemen yang seharusnya `flex`, `grid`, atau `inline` berubah tata letaknya. Untuk elemen seperti itu, tambah/hapus class yang menyembunyikannya, atau pakai atribut `hidden`.

## `renderHTML(id, urlHTML, callback, errorCallback)`

Mengambil file HTML dari `urlHTML` dengan `fetch`, lalu memasang isinya ke elemen `id` lewat `innerHTML`. Berguna untuk memecah halaman menjadi potongan (header, menu, isi) atau membuat SPA sederhana.

| Parameter | Keterangan |
|---|---|
| `id` | ID elemen tujuan |
| `urlHTML` | URL atau path file HTML |
| `callback` | Opsional. Dipanggil tanpa argumen setelah isi terpasang |
| `errorCallback` | Opsional. Dipanggil dengan sebuah `Error` kalau elemen tidak ditemukan, server membalas status non-2xx (misal 404), jaringan gagal, atau request timeout (15 detik). Saat gagal, isi elemen tidak diubah dan `callback` tidak dipanggil |

Error juga selalu ditulis ke console. `<script>` di dalam HTML yang dimuat tidak dijalankan (begitulah `innerHTML` bekerja), jadi pasang listener untuk isi baru di `callback`.

```html
<nav id="menu"></nav>
<main id="konten"></main>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { renderHTML, onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";

renderHTML("menu", "bagian/menu.html");
renderHTML("konten", "bagian/beranda.html", () => {
    onClick("tombolMulai", () => console.log("mulai"));
}, (error) => {
    console.log("Gagal memuat beranda:", error.message);
});
```

## `replaceTag(id, urlHTML, callback)`

Seperti `renderHTML`, tapi elemen `id` itu sendiri **diganti** dengan elemen pertama dari HTML yang dimuat (bukan diisi). Elemen lain sesudah elemen pertama di file itu diabaikan. `callback` dipanggil tanpa argumen setelahnya, juga ketika file tidak berisi elemen apa pun.

Tidak ada `errorCallback`: elemen yang tidak ditemukan, status non-2xx, jaringan gagal, dan timeout (15 detik) hanya ditulis ke console, dan `callback` tidak dipanggil.

```javascript
replaceTag("footer", "bagian/footer.html");
```

## `addJS(src)`, `addCSS(href)`

Memuat file JS atau CSS eksternal ke `<head>` kalau belum ada di halaman. Keduanya `async`; tunggu dengan `await` sebelum memakai isi file itu. Pengecekan "sudah ada" memakai [`isJSLoaded`/`isCSSLoaded`](#isjsloadedsrc-iscssloadedhref), dan kalau sudah ada, Promise langsung selesai walaupun file itu masih dalam proses dimuat. Kalau file gagal dimuat, Promise ditolak dengan `Error`.

Script dimuat sebagai script klasik (bukan `type="module"`), jadi cocok untuk library pihak ketiga yang memasang variabel global.

```javascript
import { addJS, addCSS } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";

await addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.min.css");
await addJS("https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.min.js");
Swal.fire("Tersimpan");
```

## `addJSInHead(src)`, `addCSSInHead(href)`

Versi `addJS`/`addCSS` tanpa pengecekan: selalu menambah `<script src>` atau `<link rel="stylesheet">` baru ke `<head>`. Mengembalikan Promise yang selesai saat file termuat dan ditolak dengan `Error` kalau gagal.

## `isJSLoaded(src)`, `isCSSLoaded(href)`

Mengembalikan `true` kalau ada `<script>` (atau `<link rel="stylesheet">`) di halaman yang URL lengkapnya **mengandung** `src` (atau `href`). Karena yang dicek potongan teks, `isJSLoaded("app.js")` juga `true` untuk `vendor-app.js`; pakai potongan URL yang cukup panjang.

---

Kontributor halaman ini sebelumnya: Al Yasmin Assa'diyah (714240014), Affifah Putri Deza, Muhammad Rashid Al Savero (714240006).
