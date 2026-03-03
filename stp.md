Modul **`stp.js`** menyediakan kumpulan fungsi asinkron untuk mengelola alur otentikasi pengguna, meliputi pengiriman, verifikasi, dan pengiriman ulang kode STP. Modul ini secara otomatis memvalidasi format **nomor telepon** sebelum melakukan permintaan HTTP POST ke *endpoint* otentikasi eksternal.

---

# Dokumentasi `stp.js`

Modul ini mengekspor tiga fungsi utama untuk berinteraksi dengan API otentikasi. Semua fungsi bergantung pada fungsi validasi internal untuk memastikan integritas data sebelum mengirimkan permintaan jaringan.

## Fungsi Internal

### `validatePhoneNumber(phoneNumber)`

Fungsi privat yang digunakan untuk memvalidasi format nomor telepon sebelum eksekusi fungsi utama.

* **Aturan Validasi**: Nomor telepon harus diawali dengan angka **62** dan diikuti oleh **9 hingga 15 digit** angka.
* **Error**: Akan melemparkan `Error` jika parameter kosong atau format tidak sesuai dengan *regex* (`/^62\d{9,15}$/`).

## Fungsi Ekspor (API)

### 1. `sendSTP(phoneNumber, captchaToken)`

Mengirimkan permintaan untuk mengirim kode otentikasi ke nomor telepon pengguna.

* **Parameter**:
* **`phoneNumber`** (*String*): Nomor telepon tujuan (wajib menggunakan format **62**).
* **`captchaToken`** (*String*): Token CAPTCHA untuk memvalidasi sesi.


* **Proses**: Melakukan permintaan **HTTP POST** ke `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/login` dengan *payload* JSON berisi `phonenumber` dan `captcha`.
* **Return**: Mengembalikan objek **JSON** dari respons server.
* **Error Handling**: Melemparkan *error* **"Failed to send STP"** jika respons jaringan gagal.

### 2. `verifySTP(phoneNumber, password)`

Memverifikasi kode STP atau kata sandi yang dimasukkan oleh pengguna.

* **Parameter**:
* **`phoneNumber`** (*String*): Nomor telepon pengguna (wajib menggunakan format **62**).
* **`password`** (*String*): Kode STP atau kata sandi yang akan diverifikasi.


* **Proses**: Melakukan permintaan **HTTP POST** ke `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/verify` dengan *payload* JSON berisi `phonenumber` dan `password`.
* **Return**: Mengembalikan objek **JSON** dari respons server yang berisi status verifikasi.
* **Error Handling**: Melemparkan *error* **"Failed to verify STP"** jika respons jaringan gagal.

### 3. resendSTP(phoneNumber)

Meminta pengiriman ulang kode STP ke nomor telepon pengguna jika kode sebelumnya tidak diterima atau kedaluwarsa.

* *Parameter*:
* *phoneNumber* (String): Nomor telepon tujuan (wajib menggunakan format *62*).


* *Proses: Melakukan permintaan **HTTP POST* ke https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/resend dengan payload JSON berisi phonenumber.
* *Return: Mengembalikan objek **JSON* dari respons server.
* *Error Handling: Melemparkan *error *"Failed to resend STP"* jika respons jaringan gagal.