# Dokumentasi Modul `chart.js`

*[English](en/chart)*

`chart.js` menggambar grafik **batang**, **garis**, dan **donat** sebagai SVG, ditulis sendiri tanpa library lain dan tanpa dependensi. Catatan: meski nama filenya `chart.js`, modul ini **bukan Chart.js** dan API-nya tidak kompatibel dengan Chart.js.

Yang sudah termasuk:

- Sumbu dengan skala "nice" (angka bulat: kelipatan 1, 2, 2,5, atau 5) dan format angka bahasa Indonesia (`1.234,5`, sumbu di atas 10.000 diringkas jadi `25 rb`), bisa diganti fungsi sendiri.
- Lebar mengikuti wadah, warna dari variabel CSS yang ikut mode gelap croot.css.
- Aksesibel: SVG `role="img"` dengan judul dan deskripsi, tabel data yang tersembunyi di layar tetapi dibaca pembaca layar, legenda, dan tooltip saat penunjuk di atas grafik **maupun** saat grafik difokus dengan keyboard.

## Cara Penggunaan (Import)

```javascript
import { createChart, niceScale } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/chart.js";
```

## Contoh Minimal

```html
<h2>Pendaftar per bulan</h2>
<div id="grafik"></div>
<script type="module" src="grafik.js"></script>
```

```javascript
// grafik.js
import { createChart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/chart.js";

const grafik = createChart("grafik", {
    type: "bar",
    title: "Pendaftar per bulan",
    labels: ["Jan", "Feb", "Mar", "Apr"],
    series: [
        { name: "Sarjana", values: [120, 135, 160, 150] },
        { name: "Diploma", values: [80, 95, 90, 110] }
    ]
});
```

## `createChart(id, config)`

Membuat grafik di dalam elemen `id` (biasanya `<div>` kosong). Kalau elemen itu sudah berisi grafik, grafik lama dihapus dulu. Mengembalikan `{ element, update(changes), remove() }`, atau `null` (dengan peringatan di console) kalau elemennya tidak ada.

| Opsi | Keterangan |
|---|---|
| `type` | `"bar"` (bawaan), `"line"`, atau `"donut"` |
| `labels` | Array label, satu per batang/titik/irisan |
| `series` | Array `{ name, values }`. `values` sejajar dengan `labels`; `null` berarti tidak ada data (batang tidak digambar, garis terputus, tabel berisi "–"). Donat hanya memakai seri pertama |
| `title` | Nama grafik untuk pembaca layar (`<title>` SVG dan judul tabel). Tidak ditampilkan; tulis judul yang terlihat di halaman sendiri, misalnya `<h2>` |
| `description` | Deskripsi untuk pembaca layar. Kalau tidak diisi, dibuat otomatis (jenis, jumlah label dan seri, rentang sumbu atau persentase donat, cara membaca dengan panah) |
| `stacked` | `true` supaya batang beberapa seri bertumpuk, bukan berdampingan. Hanya untuk `"bar"` |
| `format` | Fungsi `angka => teks` untuk tooltip, tabel, sumbu, dan total donat. Bawaan `Intl.NumberFormat("id-ID")` |
| `colors` | Array warna CSS pengganti palet bawaan, dipakai berurutan per seri (donat: per irisan) |
| `height` | Tinggi grafik dalam piksel. Bawaan `300` |

### `update(changes)`

Mengganti sebagian opsi lalu menggambar ulang di wadah dan SVG yang sama, misalnya data baru dari server:

```javascript
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

const { status, data } = await getJSON("https://api.example.com/statistik", null);
if (status === 200) grafik.update({ labels: data.bulan, series: data.seri });
```

`changes` bisa berisi opsi apa pun dari tabel di atas, misalnya `grafik.update({ stacked: true })` atau `grafik.update({ type: "line" })`.

### `remove()`

Menghapus grafik beserta legenda, tabel, dan pemantau ukurannya. Elemen wadah tetap ada.

## Jenis Grafik

- **Batang** (`"bar"`): vertikal, selalu mulai dari nol supaya panjangnya jujur; nilai negatif turun di bawah garis nol. Beberapa seri berdampingan per label, atau bertumpuk dengan `stacked: true`. Lebar batang paling banyak 24 px.
- **Garis** (`"line"`): satu atau beberapa seri. Sumbu nilai mengikuti rentang data (tidak dipaksa mulai dari nol). Titik digambar kalau jarak antarlabel cukup lebar; saat disorot muncul garis bantu vertikal dan titik setiap seri.
- **Donat** (`"donut"`): bagian dari keseluruhan, dengan total di tengah dan persentase di legenda. Nilai negatif atau kosong dihitung nol. Kalau irisan lebih banyak dari jumlah warna (8, atau panjang `colors`), irisan pertama tampil sebanyak jumlah warna dikurangi satu dan sisanya digabung jadi satu irisan "Lainnya", karena warna yang diulang membuat dua irisan tampak sama; urutkan data Anda dulu kalau ingin yang kecil-kecil yang digabung.

Grafik batang atau garis dengan seri lebih banyak dari jumlah warna melempar `Error`. Gabungkan seri, pecah jadi beberapa grafik, atau beri opsi `colors` yang lebih panjang.

## Ukuran Mengikuti Wadah

Lebar grafik selalu sama dengan lebar wadahnya. `chart.js` memantau wadah dengan `ResizeObserver` dan menggambar ulang SVG dalam piksel sebenarnya setiap kali lebarnya berubah. Cara ini dipilih daripada `viewBox` yang diskalakan karena dengan `viewBox` teks ikut mengecil di ponsel, sedangkan dengan menggambar ulang teks tetap 12 px dan jumlah label sumbu menyesuaikan lebar (label yang tidak muat dilewati). Tingginya tetap, dari opsi `height`.

Wadah yang tersembunyi (`display: none`, lebar 0) baru digambar ketika tampil.

## Warna dan Tampilan

Palet bawaan delapan warna, dipakai berurutan (tidak pernah diulang), lewat variabel CSS `--croot-chart-1` sampai `--croot-chart-8` di elemen `.crootjs-chart`. Semua warna paling sedikit 3:1 terhadap latar croot.css (`--croot-surface` dan `--croot-bg`) di mode terang maupun gelap, dan urutannya dipilih supaya warna yang bersebelahan tetap terbedakan bagi penderita buta warna. Mode gelap mengikuti croot.css: pengaturan perangkat, atau `data-theme="dark"` / `"light"` di `<html>`.

Mengganti palet dari CSS halaman (berlaku di kedua mode kecuali Anda menulis aturan mode gelap sendiri):

```css
.crootjs-chart {
    --croot-chart-1: #1d4ed8;
    --croot-chart-2: #b45309;
}
```

Atau per grafik lewat opsi `colors: ["#1d4ed8", "#b45309"]`.

Teks, garis bantu, celah antarsegmen, dan tooltip memakai variabel croot.css (`--croot-text`, `--croot-muted`, `--croot-border`, `--croot-surface`, `--croot-focus`, `--croot-font`) dengan nilai cadangan, jadi tetap jalan tanpa croot.css. Celah 2 px antara segmen bertumpuk dan irisan donat berwarna `--croot-surface`, jadi letakkan grafik di atas latar itu (misalnya di dalam `.card`).

Gaya bawaan disuntikkan di awal `<head>`, jadi CSS halaman Anda menang tanpa `!important`. Kelas yang bisa ditimpa: `.crootjs-chart`, `.crootjs-chart-legend`, `.crootjs-chart-tooltip`, `.crootjs-chart-text`, `.crootjs-chart-grid`.

## Aksesibilitas

- SVG berperan `role="img"` dengan `aria-labelledby` ke `<title>` (dari `title`) dan `aria-describedby` ke `<desc>` (dari `description` atau ringkasan otomatis).
- Tabel data lengkap (`<table>` dengan `<caption>` dan `<th scope>`) ada di halaman, tersembunyi di layar tetapi dibaca pembaca layar. Donat menambah kolom persentase.
- Grafik bisa difokus dengan Tab (satu tab stop per grafik, bukan satu per batang). Saat difokus, tooltip muncul di titik pertama; panah kiri/kanan (atau atas/bawah) pindah titik, Home/End ke ujung, Esc menutup tooltip. Isi tooltip juga diumumkan lewat wilayah `aria-live`.
- Penunjuk (mouse) dan sentuhan memunculkan tooltip yang sama. Area sorotnya selebar satu label penuh, bukan hanya batangnya.
- Legenda tampil untuk dua seri atau lebih (dan selalu untuk donat), jadi identitas seri tidak hanya dari warna. Satu seri tidak diberi legenda karena judul di halaman sudah menyebutnya.

## `niceScale(min, max, maxTicks = 5)`

Fungsi skala yang dipakai sumbu, diekspor untuk dipakai sendiri (misalnya grafik buatan sendiri). Mengembalikan `{ min, max, step, ticks }` dengan angka bulat yang mencakup `min..max` dan paling banyak sekitar `maxTicks + 1` garis.

```javascript
niceScale(0, 980);       // { min: 0, max: 1000, step: 200, ticks: [0, 200, 400, 600, 800, 1000] }
niceScale(24.3, 31.8, 4); // { min: 24, max: 32, step: 2, ticks: [24, 26, 28, 30, 32] }
```

## Catatan

- Teks bawaan modul: "Total" di tengah donat, "Lainnya" untuk irisan gabungan, dan judul kolom tabel ("Label", "%"); deskripsi otomatis dan judul cadangan ("Grafik batang") berbahasa Indonesia; isi `title` dan `description` untuk bahasa lain.
- Tanpa animasi, tanpa sumbu kedua, tanpa zoom. Untuk dua ukuran berbeda skala, buat dua grafik.
- Contoh: [croot.js.org/examples/element/chart/](https://croot.js.org/examples/element/chart/).
