*[Bahasa Indonesia](../)*

# Human in The Loop Documentation

[← croot.js.org](https://croot.js.org/) · [lib](https://croot.js.org/lib/) · [examples](https://croot.js.org/examples/)

Documentation for using CrootJS with an AI Companion and a human in the loop.

## Module Reference

Per-module documentation for `crootjs/lib`:

- [api.js](api/) — `getJSON`, `postJSON`, `putJSON`, `deleteJSON`, file upload
- [element.js](element/) — `onClick`, `setInner`, `getValue`, and other DOM helpers
- [cookie.js](cookie) — set/get/delete cookies
- [storage.js](storage) — set/get/delete data in localStorage & sessionStorage (with an optional expiry)
- [debounce.js](debounce) — `debounce`/`throttle` to limit how often a function runs (search-as-you-type, scroll, etc.)
- [toast.js](toast) — lightweight notifications with no external dependency (`toast`, `toastSuccess`, `toastError`, `toastWarning`, `toastInfo`)
- [geo.js](geo) — read GeoJSON geospatial data from a URL or a local file (`getGeoJSON`, `readGeoJSONFile`, `parseGeoJSON`), plus bounding box, center point, and property list
- [map.js](map) — interactive maps with no external library: tile basemaps (OpenStreetMap), GeoJSON drawing, popups, coordinate clicks, right-click, named layers, labels, hover, basemap switching, canvas renderer (`createMap`, `addGeoJSON`, `fitMap`, `onMapClick`, `onMapContextMenu`, `showLayer`, `setTiles`)
- [mapmarker.js](mapmarker) — `map.js` add-on: pin markers, icons, or your own element, with labels, popups, and dragging (`addMarker`)
- [mapcontrol.js](mapcontrol) — `map.js` add-on: scale bar, "my location", live tracking, basemap picker (list or picture cards), layer checklist, coordinates, right-click menu, and fullscreen (`addScaleBar`, `addLocateButton`, `locateUser`, `addTrackButton`, `trackUser`, `addBasemapControl`, `setBasemap`, `addLayerControl`, `addCoordinateControl`, `addContextMenu`, `addFullscreenButton`)
- [maptools.js](maptools) — `map.js` add-on: distance and area measuring tools, georeferenced images with rotation, PNG export (`addMeasureControl`, `addImageOverlay`, `exportMapImage`)
- [mapcluster.js](mapcluster) — `map.js` add-on: point clustering for very large point datasets (`addCluster`)
- [mapdraw.js](mapdraw) — `map.js` add-on: draw points, lines, and polygons, then reshape them (move, add, delete vertices); the result is GeoJSON (`addDrawControl`, `startDrawing`, `editFeature`)
- [mapheat.js](mapheat) — `map.js` add-on: point-density heatmaps and square/hexagon grid maps colored by value, like signal coverage maps (`addHeatmap`, `addGridMap`)
- [model3d.js](model3d) — glTF/GLB 3D model viewer without Three.js (WebGL2, WebGL1 fallback): rotate/zoom, click parts, change colors, hide, position/rotate from code (`createViewer`, `loadModel`, `onModelClick`, `setPartColor`, `setPartVisible`, `setPartTransform`, `fitView`)
- [model3dtools.js](model3dtools) — `model3d.js` add-on: HTML labels pinned to the model, move/rotate/scale gizmo, glTF animation, exploded view, cross-sections, `.glb` export (`addHotspot`, `enableTransform`, `playAnimation`, `explodeModel`, `addSection`, `exportGLB`, `downloadGLB`)
- [geomeasure.js](geomeasure) — distance, length, area, point-in-area, nearest point, radius circle, conversion from a local grid (`getDistance`, `getArea`, `isInside`, `createCircle`, `createAffineTransform`, ...)
- [georoute.js](georoute) — shortest route along the lines in GeoJSON data, computed in the browser (`findRoute`)
- [url.js](url) — protocol, host, path, query string, hash, redirect
- [validate.js](validate) — input validation & formatting (username, phone number, Rupiah)
- [websocket.js](websocket) — open/close WebSocket connections
- [stp.js](stp) — send/verify/resend WhatsApp OTP
- [useragent.js](useragent) — mobile device detection
- [trace.js](trace) — track click/touch coordinates
- [image.js](image) — random colors (hex & color names)
- [loading.js](loading) — loading spinner SVG asset
- [mongo.js](../mongo.js) — MongoDB `ObjectId` helpers (browser-only, no DB connection)

See also: [lib source code](https://github.com/crootjs/lib) and [implementation examples](https://github.com/crootjs/examples).

## Coding Conventions (Mandatory)

All code that uses CrootJS — written by humans or by AI coding agents — **must** keep HTML, CSS, and JS in separate files, and JS must be loaded as `type="module"`. No inline `<style>`/`<script>` and no `onclick`/`style=""` attributes in HTML.

Read the full rules & rationale: **[conventions.md](../conventions)**.

Using an AI coding agent? Download [`CLAUDE.md`](https://raw.githubusercontent.com/crootjs/lib/main/CLAUDE.md) and put it in your project root — Claude Code follows these rules automatically.

## Landing Page

Building an initial landing page at alamat.github.io

Open the prompt
```txt
buatkan landing page yang responsif untuk platform digital kampus dengan menggunakan HTML, CSS dan JS ES6+ Module dilengkapi dengan meta tag untuk sosial media (termasuk sharing whatsapp yang tampil gambar, judul dan deskripsinya ketika di share)
```

Human in the loop:
1. Make sure the meta tags are present
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
        <!-- Open Graph Meta Tags -->
        <meta property="og:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta property="og:image" content="https://crootss.if.co.id/crootss.jpeg" />
        <meta property="og:url" content="https://crootss.if.co.id" />
        <meta property="og:type" content="website" />

        <!-- Twitter Meta Tags (optional) -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CrootSS: CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:description" content="CSS Mobile Friendly Responsive Component and Template" />
        <meta name="twitter:image" content="https://www.do.my.id/crootss.jpeg" />
    
    </head>
    <body>
    </body>
    </html>
   ```
2. Make sure there is a robots.txt
   ```txt
   User-agent: *
   Allow: /
   Sitemap: https://alamat.github.io/sitemap.xml
   ```
3. Make sure there is a sitemap.xml
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
4. Make sure you have uploaded the favicon.ico file first
5. Make sure you create a [404.html](../404.html) file

## Login Using WhatsAuth

The WhatsAuth API can be used to implement SSO, QR login, and Google Sign-In. Create a new repo containing:
1. index.html: the main HTML file that loads the QR and GSI JS
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
2. main.js: login setup using crootjs
   ```js
   import {qrController,deleteCookie,appendGoogleSignin} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/auth.js";
   import { wauthparam } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/config.js";
   
   wauthparam.auth_ws="d3NzOi8vYXBpLndhLm15LmlkL3dzL3doYXRzYXV0aC9wdWJsaWM=";
   wauthparam.keyword="aHR0cHM6Ly93YS5tZS82MjgzMTMxODk1MDAwP3RleHQ9d2g0dDVhdXRoMA==";
   wauthparam.tokencookiehourslifetime=18;
   wauthparam.redirect ="/auth"
   deleteCookie(wauthparam.tokencookiename);
   qrController(wauthparam);
   
   const url="https://asia-southeast2-awangga.cloudfunctions.net/bukupedia/auth/users";

   const client_id="239713755402-4hr2cva377m43rsqs2dk0c7f7cktfeph.apps.googleusercontent.com";

   // Call the function that appends the element
   appendGoogleSignin(client_id,url);
   ```
   Change the `wauthparam.keyword` variable to match the number registered with WhatsAuth. Use Base64 decode and encode to update the keyword string above.
   ![image](https://github.com/user-attachments/assets/8e24a1ac-7249-45d3-8823-ee7f07c82058)  

For the additional files:
1. [style.css](../style.css)
2. [loading.svg](../loading.svg)

Don't forget to add your domain in the Console under APIs & Services - Client ID for Web application  
![image](https://github.com/user-attachments/assets/12191720-6f6c-4155-bf75-d966b0f60c4c)

## Auth Repo

To authorize between the frontend and the backend, you need one additional repo named auth (set in the qr.js settings as /auth).
In the index.html file
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

In the index.js file
```js
import {getCookie} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js";
import {getJSON} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js";
import {redirect} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/url.js";

if (getCookie("login")){
    getJSON("https://asia-southeast2-awangga.cloudfunctions.net/florka/data/user",responseFunction,"login",getCookie("login"));
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
and the [style.css](../auth/style.css) file

## Integrating WhatsAuth with JSCroot and GOCroot

[![Tutorial Web](https://img.youtube.com/vi/LDQ8Ty8B9eM/0.jpg)](https://www.youtube.com/watch?v=LDQ8Ty8B9eM)  

For your own development, see the [WebHook Deployment Guide](/webhook)
