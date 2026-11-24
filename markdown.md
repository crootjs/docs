# Dokumentasi Modul `markdown.js`

*[English](en/markdown)*

`markdown.js` mengubah teks Markdown menjadi HTML di browser: README, catatan, komentar, atau isi halaman yang disimpan sebagai file `.md`. Pengurainya ditulis sendiri (tanpa marked, markdown-it, atau library lain), satu file tanpa dependensi.

Modul ini **aman sejak rancangan**, jadi hasilnya boleh langsung dipasang ke `innerHTML` walaupun Markdown-nya ditulis pengguna:

- **Semua HTML mentah di masukan di-escape.** `<script>`, `<img onerror=...>`, `<iframe>`, komentar HTML, dan tag lain tampil sebagai teks. Tidak ada opsi untuk mengizinkan HTML.
- **URL tautan dan gambar hanya** `http:`, `https:`, `mailto:`, `tel:`, URL relatif (`/a`, `../a.md`, `?q=1`, `//host/a`), dan anchor `#bagian`. `javascript:`, `data:`, `vbscript:`, `file:`, dan skema lain ditolak, termasuk variasi huruf besar (`JaVaScRiPt:`), spasi dan karakter kontrol di depan, tab atau baris baru di tengah (`java	script:`), dan entitas (`&#106;avascript:`, `javascript&colon;`). URL diperiksa setelah dibersihkan dengan cara yang sama seperti browser membacanya.
- Tautan dengan URL terlarang hanya menampilkan teksnya; gambar dengan URL terlarang hanya menampilkan teks alt-nya.
- Semua nilai atribut (`href`, `src`, `alt`, `title`, `class`, `id`) di-escape.

Waktu prosesnya linear terhadap panjang masukan: pengurainya memindai karakter demi karakter, bukan memakai regex yang bisa *backtracking* berlebihan. 50.000 karakter `*`, `[`, `<`, atau pola jahat lain selesai dalam puluhan milidetik.

## Cara Penggunaan (Import)

```javascript
import { markdownToHTML, renderMarkdown, getMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/markdown.js";
```

## `markdownToHTML(markdown, options)`

Mengubah teks Markdown menjadi string HTML. `markdown` yang bukan string diubah dengan `String()`; `null`/`undefined` menjadi `""`.

```javascript
import { markdownToHTML } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/markdown.js";

const html = markdownToHTML("# Halo\n\nIni **tebal** dan [tautan](https://croot.js.org).");
// <h1>Halo</h1>
// <p>Ini <strong>tebal</strong> dan <a href="https://croot.js.org">tautan</a>.</p>
```

## `renderMarkdown(id, markdown, options)`

Mengisi elemen dengan `id` tersebut dengan hasil `markdownToHTML`, lalu mengembalikan string HTML-nya. Kalau elemennya tidak ada, muncul peringatan di console dan HTML tetap dikembalikan.

```html
<label for="tulisan">Tulisan</label>
<textarea id="tulisan"></textarea>
<div id="pratinjau"></div>
```

```javascript
import { renderMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/markdown.js";
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/debounce.js";

const tulisan = document.getElementById("tulisan");
tulisan.addEventListener("input", debounce(() => {
    renderMarkdown("pratinjau", tulisan.value, { linkTarget: "_blank" });
}, 200));
```

## `getMarkdown(url, responseFunction, options)`

Mengambil file `.md` dari `url` dengan `fetch`, lalu mengubahnya menjadi HTML. Hasilnya `{ status, data, markdown, error }` dikirim ke `responseFunction` (boleh `null`) dan juga menjadi isi Promise yang dikembalikan. Promise-nya **tidak pernah reject**.

| Field | Isi |
|---|---|
| `status` | Status HTTP, atau `0` kalau jaringan gagal |
| `data` | HTML hasil konversi kalau status 2xx, selain itu `""` |
| `markdown` | Teks Markdown aslinya kalau status 2xx, selain itu `""` |
| `error` | `null`, atau saat status `0`: `"timeout"`, `"abort"`, `"offline"`, `"network"` |

```javascript
import { getMarkdown } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/markdown.js";
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.41/element.js";

const { status, data } = await getMarkdown("docs/panduan.md", null, { headingIds: true });
if (status === 200) setInner("isi", data);
else setInner("isi", "<p>Panduan tidak bisa dimuat.</p>");
```

Gaya callback juga bisa, seperti `getMarkdown` di JSCroot lama:

```javascript
getMarkdown("README.md", ({ status, data }) => {
    if (status === 200) setInner("isi", data);
});
```

Selain opsi `markdownToHTML`, `options` menerima `timeout` (milidetik, bawaan 15000) dan `signal` (`AbortSignal` dari `AbortController`; membatalkan request dengan `error: "abort"`). Server file `.md` di domain lain harus mengizinkan CORS (GitHub Pages dan `raw.githubusercontent.com` mengizinkan).

## Opsi

Semua opsional, sama untuk ketiga fungsi.

| Opsi | Keterangan |
|---|---|
| `headingIds` | `true`: setiap judul diberi `id` slug untuk tautan `#anchor`. "Cara Pakai!" → `id="cara-pakai"`; judul kembar → `cara-pakai-1`, `cara-pakai-2`. Huruf non-Latin dipertahankan. Bawaan `false` |
| `idPrefix` | Awalan `id` judul, misalnya `"md-"` → `id="md-cara-pakai"`. Disarankan untuk Markdown dari pengguna, supaya `id`-nya tidak bentrok dengan `id` lain di halaman (atau menimpa variabel global lewat *DOM clobbering*) |
| `linkTarget` | Atribut `target` untuk tautan `http(s)` dan `//host`, misalnya `"_blank"`. Dengan `"_blank"`, `rel="noopener noreferrer"` ditambahkan otomatis |
| `linkRel` | Atribut `rel` untuk tautan `http(s)` dan `//host`, misalnya `"nofollow ugc"` untuk konten pengguna |

Tautan relatif, `#anchor`, `mailto:`, dan `tel:` tidak diberi `target`/`rel`.

## Sintaks yang Didukung

| Sintaks | Contoh | HTML |
|---|---|---|
| Judul ATX | `# Judul` sampai `###### Judul`, `## Judul ##` | `<h1>`–`<h6>` |
| Judul setext | `Judul` lalu `===` atau `---` di baris berikutnya | `<h1>`, `<h2>` |
| Paragraf | baris berurutan, dipisah baris kosong | `<p>` |
| Baris baru keras | dua spasi atau `\` di akhir baris | `<br>` |
| Tebal | `**teks**`, `__teks__` | `<strong>` |
| Miring | `*teks*`, `_teks_` (tidak di tengah kata: `snake_case` tetap) | `<em>` |
| Coret (GFM) | `~~teks~~` | `<del>` |
| Kode inline | `` `kode` ``; dua backtick kalau isinya memuat backtick | `<code>` |
| Blok kode berpagar | ` ```js ` … ` ``` ` atau `~~~` | `<pre><code class="language-js">` |
| Blok kode indentasi | 4 spasi (atau tab) di depan | `<pre><code>` |
| Kutipan | `> teks`, bertingkat `>> teks`, baris lanjutan tanpa `>` | `<blockquote>` |
| Daftar tidak berurut | `-`, `*`, atau `+` | `<ul>` |
| Daftar berurut | `1.` atau `1)`; angka awal selain 1 → `start` | `<ol>` |
| Daftar bertingkat | butir dimasukkan sejajar teks butir induknya | `<ul>`/`<ol>` di dalam `<li>` |
| Daftar tugas (GFM) | `- [ ] belum`, `- [x] sudah` | `<li class="task-list-item"><input type="checkbox" disabled>` |
| Garis horizontal | `---`, `***`, `___` (boleh berspasi) | `<hr>` |
| Tautan | `[teks](url)`, `[teks](url "judul")`, `[teks](<url dengan spasi>)` | `<a href>` |
| Autolink | `<https://contoh.id>`, `<nama@contoh.id>` | `<a href>` |
| Gambar | `![alt](gambar.png "judul")`, gambar di dalam tautan | `<img src alt>` |
| Tabel (GFM) | baris `\| a \| b \|` lalu `\|:--\|--:\|`; `:-:` di tengah | `<table>`, `<th align>`/`<td align>` |
| Escape backslash | `\*`, `\#`, `\[`, `\|` di sel tabel | karakternya sendiri |
| Entitas HTML | `&copy;`, `&#65;`, `&#x42;` | karakternya |

Perataan kolom tabel memakai atribut `align`, bukan `style`, supaya tetap jalan di halaman dengan Content-Security-Policy yang melarang gaya inline. Modul ini tidak menyuntik CSS; hasilnya langsung rapi dengan [croot.css](css), atau beri gaya sendiri. croot.css sejak 0.0.33 menghormati atribut `align`. Kalau Anda memakai CSS lain yang mengatur `text-align` pada `th`/`td`, atribut itu kalah, jadi tambahkan:

```css
:is(th, td)[align="center"] { text-align: center; }
:is(th, td)[align="right"] { text-align: right; }
```

Untuk tabel lebar di ponsel, bungkus pratinjau dengan `overflow-x: auto`.

## Yang Tidak Didukung

Modul ini mendukung subset CommonMark/GFM yang umum, bukan seluruh spesifikasi. Yang **tidak** didukung:

- **HTML mentah** (blok maupun inline): selalu tampil sebagai teks. Ini disengaja.
- **Tautan referensi**: `[teks][ref]`, `[ref]`, dan definisi `[ref]: https://...` tampil apa adanya sebagai teks.
- **Autolink tanpa kurung sudut** (ekstensi GFM): `https://contoh.id` atau `www.contoh.id` di tengah teks tidak otomatis menjadi tautan; tulis `<https://contoh.id>`.
- **Coret dengan satu tilde** (`~teks~`): hanya `~~teks~~`.
- **Catatan kaki, daftar definisi, matematika, emoji `:kode:`, judul dengan atribut `{#id}`**, dan ekstensi lain di luar CommonMark/GFM.
- **Entitas bernama** hanya diteruskan ke browser apa adanya; di dalam URL dan `title`, hanya sekitar 30 yang umum (`&amp;`, `&lt;`, `&nbsp;`, `&copy;`, `&mdash;`, …) yang diterjemahkan.
- **Tab** hanya dihitung di awal baris (kelipatan 4 kolom); tab sesudah penanda daftar (`-<tab>teks`) tidak dikenali sebagai daftar.
- Sarang kutipan/daftar dibatasi **32 tingkat**; penanda yang lebih dalam dibaca sebagai teks biasa. Tabel berhenti setelah 100.000 sel kosong pelengkap. Keduanya mencegah masukan jahat menghabiskan memori.
- Beberapa kasus tepi CommonMark diperlakukan lebih sederhana, misalnya baris "malas" (lanjutan paragraf tanpa lekukan) di dalam daftar dan kutipan yang berisi blok kode, serta lekukan tab di dalam kontainer bertingkat.

## Catatan Keamanan

- HTML hasil modul ini aman dipasang ke `innerHTML` tanpa *sanitizer* tambahan, karena tidak ada tag atau atribut dari masukan yang diteruskan.
- Gambar dari `http(s)` tetap diunduh browser pembaca, jadi pemilik server gambar bisa melihat IP dan waktu baca. Kalau ini penting (misalnya surel atau pesan pribadi), proses atau saring gambar di server.
- `linkRel: "nofollow ugc"` disarankan untuk komentar pengguna supaya tautan spam tidak mendapat nilai SEO.
- Tetap validasi dan simpan Markdown asli di server; konversi di browser hanya untuk tampilan.
