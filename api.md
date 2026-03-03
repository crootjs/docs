## 1. API (`api.js`)

Modul `api.js` menyediakan fungsi-fungsi *wrapper* di atas **Fetch API** bawaan browser untuk mempermudah komunikasi HTTP dengan backend. Setiap fungsi menggunakan pola **callback** — Anda menyediakan sebuah fungsi yang akan dipanggil saat respons diterima dari server, beserta informasi HTTP status code.

### Pola Umum Response

Semua fungsi JSON pada modul ini (`getJSON`, `postJSON`, `deleteJSON`, `putJSON`) mengembalikan respons ke callback function dengan format objek yang konsisten:

```javascript
{
  status: Number,  // HTTP status code (200, 201, 400, 404, 500, dst.)
  data: Object     // Body respons yang sudah di-parse dari JSON
}
```

### 1.1 `getJSON()`

Melakukan **HTTP GET** request ke URL yang ditentukan dan mengembalikan respons dalam format JSON ke callback function.

#### Signature

```javascript
getJSON(target_url, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP GET request |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi (misal: `"Authorization"`, `"token"`, `"Login"`) |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi (misal: `"Bearer eyJhbGci..."`) |

#### Return Value

`void` — Hasil dikirim melalui `responseFunction` secara asinkron.

#### Contoh Penggunaan

**Tanpa Token (Public API):**

```javascript
import { getJSON } from './lib/api.js';

// Ambil data dari API publik
getJSON(
  'https://api.example.com/users',
  function(response) {
    console.log('Status:', response.status); // 200
    console.log('Data:', response.data);     // [{id: 1, name: "Andi"}, ...]

    if (response.status === 200) {
      // Proses data berhasil
      response.data.forEach(user => {
        console.log(user.name);
      });
    }
  }
);
```

**Dengan Token Autentikasi:**

```javascript
import { getJSON } from './lib/api.js';
import { getCookie } from './lib/cookie.js';

// Ambil token dari cookie
const token = getCookie('user_token');

// Request ke API yang membutuhkan autentikasi
getJSON(
  'https://api.example.com/profile',
  function(response) {
    if (response.status === 200) {
      document.getElementById('nama').innerText = response.data.name;
      document.getElementById('email').innerText = response.data.email;
    } else if (response.status === 401) {
      console.log('Token tidak valid, silakan login ulang.');
    }
  },
  'Authorization',
  'Bearer ' + token
);
```

---

### 1.2 `postJSON()`

Melakukan **HTTP POST** request ke URL yang ditentukan dengan mengirimkan data dalam format JSON pada body request. Digunakan untuk **membuat data baru** di server (Create).

#### Signature

```javascript
postJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP POST request |
| `datajson` | `object` | ✅ | Objek JavaScript yang akan dikirim sebagai body JSON |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi |

#### Return Value

`void` — Hasil dikirim melalui `responseFunction` secara asinkron.

#### Contoh Penggunaan

**Membuat Data Baru (Tanpa Token):**

```javascript
import { postJSON } from './lib/api.js';

// Data yang akan dikirim ke server
const dataMahasiswa = {
  nama: 'Budi Santoso',
  nim: '1234567890',
  jurusan: 'Teknik Informatika'
};

postJSON(
  'https://api.example.com/mahasiswa',
  dataMahasiswa,
  function(response) {
    if (response.status === 201) {
      console.log('Mahasiswa berhasil ditambahkan!');
      console.log('ID baru:', response.data.id);
    } else if (response.status === 400) {
      console.log('Validasi gagal:', response.data.message);
    }
  }
);
```

**Dengan Token Autentikasi:**

```javascript
import { postJSON } from './lib/api.js';
import { getCookie } from './lib/cookie.js';

const token = getCookie('user_token');

const dataPeminjaman = {
  ruangan_id: 'R-101',
  tanggal: '2026-03-15',
  jam_mulai: '08:00',
  jam_selesai: '10:00',
  keperluan: 'Rapat organisasi'
};

postJSON(
  'https://api.example.com/peminjaman',
  dataPeminjaman,
  function(response) {
    if (response.status === 201) {
      alert('Peminjaman berhasil diajukan!');
    } else {
      alert('Gagal: ' + response.data.message);
    }
  },
  'Login',
  token
);
```

---

### 1.3 `deleteJSON()`

Melakukan **HTTP DELETE** request ke URL yang ditentukan dengan mengirimkan data identifikasi dalam format JSON pada body request. Digunakan untuk **menghapus data** di server (Delete).

#### Signature

```javascript
deleteJSON(target_url, datajson, responseFunction, tokenkey?, tokenvalue?)
```

#### Parameter

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|:-----:|-----------|
| `target_url` | `string` | ✅ | URL tujuan HTTP DELETE request |
| `datajson` | `object` | ✅ | Objek JavaScript berisi data identifikasi item yang akan dihapus |
| `responseFunction` | `function` | ✅ | Callback function yang menerima objek `{ status, data }` |
| `tokenkey` | `string` | ❌ | Nama header untuk autentikasi |
| `tokenvalue` | `string` | ❌ | Nilai token autentikasi |

#### Return Value

`void` — Hasil dikirim melalui `responseFunction` secara asinkron.

#### Contoh Penggunaan

**Menghapus Data dengan Konfirmasi:**

```javascript
import { deleteJSON } from './lib/api.js';
import { getCookie } from './lib/cookie.js';

const token = getCookie('user_token');

function hapusMahasiswa(mahasiswaId) {
  // Konfirmasi sebelum menghapus
  if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    return;
  }

  const dataHapus = {
    id: mahasiswaId
  };

  deleteJSON(
    'https://api.example.com/mahasiswa',
    dataHapus,
    function(response) {
      if (response.status === 200) {
        alert('Data berhasil dihapus!');
        // Refresh tampilan tabel
        location.reload();
      } else if (response.status === 404) {
        alert('Data tidak ditemukan.');
      } else if (response.status === 403) {
        alert('Anda tidak memiliki izin untuk menghapus data ini.');
      }
    },
    'Login',
    token
  );
}
```

---