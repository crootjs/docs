# Dokumentasi Modul `table.js`

*[English](en/table)*

`table.js` menampilkan data sebagai `<table>` sungguhan dengan **urut per kolom, pencarian, dan halaman**. Ini pengganti ringan jQuery DataTables: tanpa jQuery, tanpa CSS tambahan dari CDN lain, dan cukup satu file modul.

- Isi sel selalu dimasukkan sebagai **teks** (atau sebagai elemen yang Anda buat sendiri), tidak pernah sebagai HTML, jadi data dari server tidak bisa menyisipkan skrip.
- Urutan memakai `Intl.Collator` bahasa Indonesia dengan urutan alami: angka diurutkan sebagai angka, "item 2" sebelum "item 10", dan huruf besar/kecil dianggap sama.
- Aksesibel: judul kolom berupa tombol dengan `aria-sort`, kolom cari punya `<label>`, navigasi halaman berupa tombol dalam `<nav>`, dan keterangan "Menampilkan 1–10 dari 57" berada di `role="status"` sehingga dibacakan pembaca layar setiap kali berubah.
- Di ponsel, tabel yang lebar digulir mendatar di dalam wadahnya, bukan seluruh halaman.

## Cara Penggunaan (Import)

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/table.js";
```

## `createTable(id, options)`

Membuat tabel di dalam elemen `id`. Isi elemen itu diganti. Mengembalikan objek kendali (lihat [Nilai Kembali](#nilai-kembali)), atau `null` kalau elemennya tidak ada.

```html
<div id="proyek"></div>
```

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/table.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

const tabel = createTable("proyek", {
    caption: "Daftar proyek",
    columns: [
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Proyek" },
        { key: "anggota", label: "Anggota", className: "angka" },
        { key: "mulai", label: "Mulai", format: v => new Date(v).toLocaleDateString("id-ID") },
    ],
    sort: { key: "kode", dir: "asc" },
});

const { status, data } = await getJSON("https://api.example.com/proyek", null);
if (status === 200) tabel.setRows(data);
```

```css
/* style.css halaman: kelas kolom dipasang di <th> dan <td> kolom itu. */
.angka { text-align: right; }
```

## Opsi

Semua opsional kecuali `columns`.

| Opsi | Keterangan |
|---|---|
| `columns` | Array definisi kolom, lihat [Kolom](#kolom) |
| `rows` | Array baris (objek) untuk mode lokal. Bisa juga diisi belakangan dengan `setRows` |
| `source` | Fungsi untuk [mode server](#mode-server). Kalau diisi, `rows` tidak dipakai |
| `pageSize` | Jumlah baris per halaman. Bawaan `10`. `0` = semua baris di satu halaman, tanpa navigasi |
| `pageSizes` | Pilihan ukuran halaman untuk `<select>` "Baris per halaman". Bawaan `[10, 25, 50, 100]`; `[]` menyembunyikan pilihannya |
| `search` | `false` untuk menyembunyikan kolom cari. Bawaan tampil |
| `sort` | Urutan awal: `{ key, dir }`, `dir` `"asc"` atau `"desc"` |
| `caption` | Judul tabel (`<caption>`), juga dipakai sebagai nama wilayah gulir untuk pembaca layar |
| `label` | Nama wilayah gulir kalau tidak ada `caption`. Bawaan `"Tabel"` |
| `tableClass` | Kelas untuk `<table>`, misalnya `"table is-fullwidth is-striped"` kalau halaman memakai Bulma |
| `texts` | Mengganti teks bawaan, lihat [Teks](#teks) |

### Kolom

| Properti | Keterangan |
|---|---|
| `key` | Nama properti di baris. Dipakai untuk isi, urutan, dan pencarian. Kolom tanpa `key` (misalnya kolom tombol aksi) tidak bisa diurut dan tidak ikut dicari |
| `label` | Judul kolom. Bawaan sama dengan `key` |
| `format` | `(nilai, baris) => teks atau Node`. Teks dimasukkan sebagai teks; `Node` (misalnya `<button>` yang Anda buat dengan `document.createElement`) dimasukkan apa adanya. Tanpa `format`, nilainya ditampilkan sebagai teks |
| `sortable` | `false` supaya kolom ini tidak bisa diurut |
| `className` | Kelas untuk `<th>` dan setiap `<td>` kolom ini |

Urutan dan pencarian memakai **nilai asli** `baris[key]`, bukan hasil `format`. Jadi simpan tanggal dalam bentuk ISO (`"2026-03-14"`) atau angka, lalu tampilkan versi yang mudah dibaca lewat `format`. Nilai kosong (`null`, `undefined`, `""`) selalu di akhir, baik urut naik maupun turun. Pencarian tidak peka huruf besar/kecil dan hanya melihat nilai berupa teks atau angka.

Contoh kolom tombol:

```javascript
{
    label: "Aksi",
    format: (_, baris) => {
        const tombol = document.createElement("button");
        tombol.type = "button";
        tombol.textContent = "Hapus";
        tombol.setAttribute("aria-label", `Hapus ${baris.nama}`);
        tombol.addEventListener("click", () => hapusProyek(baris.kode));
        return tombol;
    },
}
```

Klik judul kolom mengurutkan naik; klik lagi mengurutkan turun. Mengurutkan, mencari, atau mengganti ukuran halaman kembali ke halaman 1.

## Nilai Kembali

| Anggota | Keterangan |
|---|---|
| `setRows(rows)` | Mode lokal: mengganti semua baris, misalnya setelah data diambil ulang. Urutan dan kata pencarian tetap; halaman disesuaikan kalau sekarang lebih sedikit. Mengembalikan Promise yang selesai setelah tabel dirender |
| `refresh()` | Merender ulang; di mode server mengambil ulang halaman yang sedang tampil. Mengembalikan Promise yang selesai setelah tabel dirender |
| `ready` | Promise render pertama (di mode server: setelah halaman pertama diterima) |
| `getState()` | `{ page, pageSize, sort, query, total }`. `page` mulai dari 1, `total` jumlah baris yang cocok dengan pencarian |
| `remove()` | Menghapus tabel dari halaman |

## Mode Server

Untuk tabel besar, jangan unduh semua data. Isi `source` dengan fungsi yang menerima `{ page, pageSize, sort, query }` dan mengembalikan (atau me-resolve) `{ rows, total }`: baris halaman itu saja dan jumlah semua baris yang cocok. Penyaringan dan pengurutan dikerjakan server.

```javascript
import { createTable } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/table.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

createTable("proyek", {
    columns: [{ key: "kode", label: "Kode" }, { key: "nama", label: "Proyek" }],
    source: async ({ page, pageSize, sort, query }) => {
        const params = new URLSearchParams({ page, limit: pageSize, q: query });
        if (sort) params.set("sort", (sort.dir === "desc" ? "-" : "") + sort.key);
        const { status, data } = await getJSON(`https://api.example.com/proyek?${params}`, null);
        return status === 200 ? { rows: data.items, total: data.total } : null;
    },
});
```

- `sort` berisi `{ key, dir }` atau `null`; `query` sudah dipangkas spasinya.
- Kembalikan `null` kalau gagal; tabel menampilkan "Data gagal dimuat." Fungsi ini jangan sampai *reject* (`getJSON` memang tidak pernah *reject*).
- Pencarian menunggu 300 ms setelah pengguna berhenti mengetik, supaya tidak ada satu request per huruf.
- Jawaban yang datang terlambat (pengguna sudah pindah halaman) dibuang. Selama memuat, `<table>` diberi `aria-busy="true"`.
- Nama parameter URL (`page`, `limit`, `q`, `sort`) di contoh hanya contoh; sesuaikan dengan API Anda.

## Teks

Teks bawaan berbahasa Indonesia. Ganti sebagian atau semuanya lewat `texts`:

| Kunci | Bawaan |
|---|---|
| `search` | `"Cari"` |
| `pageSize` | `"Baris per halaman"` |
| `pages` | `"Halaman tabel"` (nama `<nav>`) |
| `previous`, `next` | `"Sebelumnya"`, `"Berikutnya"` |
| `page` | `n => "Halaman " + n` (nama tombol nomor halaman untuk pembaca layar) |
| `info` | `(from, to, total, all) => "Menampilkan 1–10 dari 57"`, ditambah `" (disaring dari 120)"` kalau pencarian menyaring. `all` adalah `null` di mode server |
| `empty` | `"Belum ada data."` |
| `noMatch` | `"Tidak ada data yang cocok dengan pencarian."` |
| `error` | `"Data gagal dimuat."` (mode server) |

## Tampilan

`table.js` menyuntik gaya bawaan kecil (kelas `crootjs-table-*`) di awal `<head>`, jadi CSS halaman Anda selalu menang. Warnanya mengikuti variabel [croot.css](css) (`--croot-border`, `--croot-muted`) dan tetap rapi tanpa croot.css. Tombol halaman yang tidak aktif diberi kelas `secondary`, yang di croot.css berarti tombol bergaris. Struktur yang dibuat:

```html
<div class="crootjs-table">
  <div class="crootjs-table-tools">
    <div class="crootjs-table-search"><label>Cari</label><input type="search"></div>
    <div class="crootjs-table-size"><label>Baris per halaman</label><select>…</select></div>
  </div>
  <div class="crootjs-table-scroll" role="region" tabindex="0">
    <table><caption>…</caption><thead>…</thead><tbody>…</tbody></table>
  </div>
  <div class="crootjs-table-footer">
    <p class="crootjs-table-info" role="status">Menampilkan 1–10 dari 57</p>
    <nav class="crootjs-table-pages" aria-label="Halaman tabel">…</nav>
  </div>
</div>
```

## Pindah dari jQuery DataTables

| DataTables | `table.js` |
|---|---|
| Isi `<tbody>` dengan `innerHTML`, lalu `$("#t").DataTable()` | `createTable("wadah", { columns, rows })` |
| `.destroy()` lalu buat ulang setelah data berubah | `tabel.setRows(dataBaru)` |
| `columns[].render` yang mengembalikan HTML | `columns[].format` yang mengembalikan teks atau Node |
| `serverSide: true` dengan `ajax` | `source: async ({ page, pageSize, sort, query }) => ({ rows, total })` |
| `responsive: true` | Tabel digulir mendatar di wadahnya |

Contoh lengkap: [croot.js.org/examples/element/table/](https://croot.js.org/examples/element/table/).
