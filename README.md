# Dokumentasi Human in The Loop

Dokumentasi Pemakaian CrootJS dengna AI Companion dan Human in the loop.

## Landing Page

Pembuatan landing page awal pada alamat.github.io

Buka prompt
```txt
buatkan landing page yang responsif untuk platform digital kampus dengan menggunakan HTML, CSS dan JS ES6+ Module dilengkapi dengan meta tag untuk sosial media (termasuk sharing whatsapp yang tampil gambar, judul dan deskripsinya ketika di share)
```

Human in the loop:
1. Pastikan terdapat meta tag
   ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrootSS | CSS Mobile Friendly Responsive Component and Template</title>
    <link rel="stylesheet" href="croot.css">

        <meta name="description" content="CrootSS: CSS Mobile Friendly Responsive Component and Template." />
        <meta name="keywords" content="CrootSS, CSS, Template, Responsive, Template, Vanilla, html, CSS lib" />
        <meta property="og:image" content="/crootss.png" />
        <!-- Meta Tags untuk Open Graph -->
        <meta property="og:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:image" content="https://crootss.if.co.id/crootss.jpeg" />
        <meta property="og:url" content="https://crootss.if.co.id" />
        <meta property="og:type" content="website" />

        <!-- Meta Tags untuk Twitter (opsional) -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:image" content="https://www.do.my.id/crootss.jpeg" />
    
    </head>
    <body>
    </body>
    </html>
   ```
2. Pastikan terdapat robots.txt
   ```txt
   User-agent: *
   Allow: /
   Sitemap: https://alamat.github.io/sitemap.xml
   ```
3. Pastikan terdapat sitemap.xml
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
    <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <url>
    <loc>https://www.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>1.00</priority>
    </url>
    <url>
    <loc>https://katalog.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://penulis.bukupedia.co.id/</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>
    <url>
    <loc>https://www.bukupedia.co.id/p/layanan.html</loc>
    <lastmod>2022-10-18T09:47:19+00:00</lastmod>
    <priority>0.80</priority>
    </url>

    </urlset>
   ```
4. Pastikan terlebih dahulu anda mengunggah file favicon.ico
5. Pastikan anda membuat file [404.html](404.html)

## Login Menggunakan WhatsAuth

API whatsauth dapat digunakan untuk pengembangan implementasi SSO, login menggunakan QR dan Google SignIn. Buat repo baru yang berisi:
1. index.html : File html utama yang memanggil js qr dan gsi
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>WhatsAuth | Free WhatsApp API OTP Notif Broadcast Gratis</title>
       <link href="style.css" rel="stylesheet">
   	<script src="main.js" type="module"></script>
   </head>
   <body>
    <div id="hasphonenumber" class="w-full h-screen bg-blue-100 flex items-center justify-center">
        <div class="w-96 bg-white rounded-xl">
            <p class="font-bold text-center mb-4" id="useracclog">Tap/Scan dengan <a href="./camwab.jpg" target="_blank">Camera WA</a></p>
            <div class="flex justify-center mt-2 mb-4" id="whatsauthqr">
                <img src="loading.svg">
            </div>
            <p class="font-bold text-center mb-4" id="whatsauthcounter">counter</p>
            <p class="font-bold text-center mb-4" id="logs"><a href="https://wa.my.id">WhatsAuth Free WhatsApp Notif, OTP, API Gateway Gratis</a></p>
        </div>
    </div>
   </body>
   </html>   
   ```
2. main.js : pengaturan login menggunakan crootjs
   ```js
   import {qrController,deleteCookie,appendGoogleSignin} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.3/auth.js";
   import { wauthparam } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.3/config.js";
   
   wauthparam.auth_ws="d3NzOi8vYXBpLndhLm15LmlkL3dzL3doYXRzYXV0aC9wdWJsaWM=";
   wauthparam.keyword="aHR0cHM6Ly93YS5tZS82MjgzMTMxODk1MDAwP3RleHQ9d2g0dDVhdXRoMA==";
   wauthparam.tokencookiehourslifetime=18;
   wauthparam.redirect ="/auth"
   deleteCookie(wauthparam.tokencookiename);
   qrController(wauthparam);
   
   const url="https://asia-southeast2-awangga.cloudfunctions.net/bukupedia/auth/users";

   const client_id="239713755402-4hr2cva377m43rsqs2dk0c7f7cktfeph.apps.googleusercontent.com";

   // Panggil fungsi untuk menambahkan elemen
   appendGoogleSignin(client_id,url);
   ```
   Ubah variabel `wauthparam.keyword` disesuaikan dengan nomor yang di daftarkan di WhatsAuth. Gunakan Base64 Decode dan Encode dengan melakukan update dari string keyword diatas untuk di update.
   ![image](https://github.com/user-attachments/assets/8e24a1ac-7249-45d3-8823-ee7f07c82058)  

Untuk file-file tambahan:
1. [style.css](style.css)
2. [loading.svg](loading.svg)

Jangan lupa untuk menambahkan domainnya di Console APIs&Services - Client ID for Web application  
![image](https://github.com/user-attachments/assets/12191720-6f6c-4155-bf75-d966b0f60c4c)

## Repo Auth

Untuk melakukan otorisasi antara frontend dan backend maka diperlukan satu repo tambahan bernama auth(ada di settingan qr.js yaitu /auth).
Pada file index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="index.js" type="module"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang di Naskah Bukupedia</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="scene">
        <div class="shadow"></div>
        <div class="jumper">
          <div class="spinner">
            <div class="scaler">
              <div class="loader">
                <div class="cuboid">
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                  <div class="cuboid__side"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
</body>
</html>
```

Pada file index.js
```js
import {getCookie} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.2/cookie.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.2/api.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.2/url.js";

if (getCookie("login")){
    getJSON("https://asia-southeast2-awangga.cloudfunctions.net/florka/data/user","login",getCookie("login"),responseFunction);
}else{
    redirect("/login");
}


function responseFunction(result){
    console.log(result);
    if (result.status === 200){
        redirect("/dashboard");
    }else{
        redirect("/daftar");
    }
}
```
dan file [style.css](./auth/style.css)

## Integrasi WhatsAuth dengan JSCroot dan GOCroot

[![Tutorial Web](https://img.youtube.com/vi/LDQ8Ty8B9eM/0.jpg)](https://www.youtube.com/watch?v=LDQ8Ty8B9eM)  

Untuk pengembangan sendiri. Silahkan buka [Panduan Deployment WebHook](/webhook)

