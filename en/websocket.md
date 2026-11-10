*[Bahasa Indonesia](../websocket)*

# `websocket.js` Documentation & Usage Guide

This module makes it easier to connect and communicate bidirectionally between a web application (*client*) and a server using the WebSocket protocol. 

Below is a detailed explanation of each function, along with step-by-step instructions on how to use it:

---

## 1. Setup: Importing the Module
The first step before using the functions below is to import them into your main JavaScript file.

```javascript
import { 
  openWebSocketSetId, 
  connectws,
  sendMessagetoWebSocket, 
  closeWebSocket 
} from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/websocket.js";
```
## 2. Opening a Connection & Receiving Messages

To open a connection, this module uses two interconnected functions: `openWebSocketSetId` and `connectws`.

### Function Reference:

* **`openWebSocketSetId(id, url_ws, onMessage?)`**: The main function for opening a connection. It checks browser support, then calls `connectws()`. It returns a **Promise** that resolves with the `WebSocket` object as soon as the connection is open (WebSocket connections are always asynchronous, so it cannot be returned directly/synchronously).
  * **`id`** *(String/Number)*: The user's unique identifier, sent when connecting.
  * **`url_ws`** *(String)*: The WebSocket endpoint URL, which **must** be Base64-encoded.
  * **`onMessage`** *(Function, optional)*: Callback invoked for every incoming message, receiving the message data (`onMessage(pesan)`). If omitted, the module automatically calls `window.catcher(pesan)` if you have defined it (see option B below) — for compatibility with older code.
* **`connectws(id, url_ws, onMessage?)`**: The behind-the-scenes *Promise* function that decodes the URL (`atob()`) and opens the connection. Its parameters are the same as `openWebSocketSetId`.

### Usage:

**Option A — Explicit callback (recommended):**

```javascript
// A. Prepare the connection data
const idPengguna = "User_714240001";
const urlServer = btoa("wss://contoh-server-websocket.com"); // Must be Base64-encoded

// B. Open the connection and receive messages via the callback
openWebSocketSetId(idPengguna, urlServer, (pesanMasuk) => {
    console.log("Pesan baru dari server: ", pesanMasuk);
    // Write your logic here (e.g. display it in the HTML)
}).then((koneksiWs) => {
    // koneksiWs is only available after this Promise resolves —
    // store it for later use with sendMessagetoWebSocket/closeWebSocket
    window.koneksiWs = koneksiWs;
});
```

**Option B — Global `window.catcher` (legacy style, still supported):**

```javascript
// A. Create a message catcher for messages from the server
window.catcher = function(pesanMasuk) {
    console.log("Pesan baru dari server: ", pesanMasuk);
};

// B. Prepare the connection data
const idPengguna = "User_714240001";
const urlServer = btoa("wss://contoh-server-websocket.com"); // Must be Base64-encoded

// C. Open the connection — without a 3rd argument, window.catcher is used automatically
openWebSocketSetId(idPengguna, urlServer).then((koneksiWs) => {
    window.koneksiWs = koneksiWs;
});
```
## 3. Sending Messages to the Server

Once the connection has been opened, you can send data using the `sendMessagetoWebSocket` function.

### Function Reference:

* **`sendMessagetoWebSocket(msg, wsocket)`**: Sends data to the server, making sure the current connection state is `OPEN`.
  * **`msg`** *(String/Object)*: The message or data to send.
  * **`wsocket`** *(WebSocket Object)*: The variable holding the connection obtained from `openWebSocketSetId`.

### Usage:

Make sure to allow a short delay (or put it inside a button *event listener*) so the connection is actually open before the message is sent.

```javascript
// Example: send a message after a 2-second delay
setTimeout(() => {
    let pesanSaya = "Halo, ini pesan dari Front-End!";

    // Send the message using the connection stored in step 2 (window.koneksiWs)
    sendMessagetoWebSocket(pesanSaya, window.koneksiWs);

}, 2000);
```
## 4. Closing the Connection

When the user's session is over (for example on *Log Out* or when navigating to another page), make a habit of closing the communication channel to avoid memory leaks.

### Function Reference:

* **`closeWebSocket(wsocket)`**: Checks whether the connection variable has a value, then safely closes that WebSocket channel.
  * **`wsocket`** *(WebSocket Object)*: The variable holding the currently active connection.

### Usage:

Call this function inside a specific *event*, for example when a "Tutup Koneksi" ("Close Connection") button is clicked.

```javascript
// Example when placed inside a button handler function
function akhiriSesi() {
    closeWebSocket(window.koneksiWs);
    console.log("Koneksi berhasil diputus.");
}
```
