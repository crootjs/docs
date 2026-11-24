# `websocket.js` Module Documentation

*[Bahasa Indonesia](../websocket)*

`websocket.js` opens a WebSocket connection that sends an ID as soon as it connects, passes every incoming message to a callback, and provides small functions to send messages and close the connection. It suits servers that expect the client's first message to be the user's identity.

Things to know before using this module:

- The server URL **must** be Base64-encoded (`btoa("wss://...")`); the module decodes it with `atob()`.
- The module logs to the console: `connected and set id`, `socket error rejected`, `connection closed`, and `incoming message` for **every** incoming message.
- There is no automatic reconnect. When the connection drops, only the `connection closed` log appears.

## Usage (Import)

```javascript
import { openWebSocketSetId, connectws, sendMessagetoWebSocket, closeWebSocket } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/websocket.js";
```

## `openWebSocketSetId(id, url_ws, onMessage)`

Checks that the browser supports WebSocket, then calls `connectws`. Returns a Promise that resolves with the `WebSocket` object once the connection is open and `id` has been sent.

If the browser doesn't support WebSocket, it calls `alert("Please Update Your browser to the latest version.")` and returns a Promise that rejects with `Error("WebSocket not supported")`.

| Parameter | Description |
|---|---|
| `id` | Sent as is with `send()` as the first message after the connection opens |
| `url_ws` | The WebSocket URL, Base64-encoded |
| `onMessage` | Optional. `function (data)` called with `event.data` for every incoming message. If omitted, the module calls `window.catcher(data)` if that function exists (legacy style); if neither exists, messages are ignored |

```javascript
import { openWebSocketSetId, sendMessagetoWebSocket, closeWebSocket } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/websocket.js";
import { onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/element.js";

const ws = await openWebSocketSetId("user-714240001", btoa("wss://chat.example.com/ws"), (data) => {
    const message = JSON.parse(data);
    console.log(message.from, message.text);
});

sendMessagetoWebSocket(JSON.stringify({ text: "Hello" }), ws);
onClick("logout", () => closeWebSocket(ws));
```

The Promise rejects (with the WebSocket `error` event) if the connection fails to open. Errors that happen after the connection is open are not reported to your code.

## `connectws(id, url_ws, onMessage)`

The function `openWebSocketSetId` uses to open the connection. Same parameters and return value, but without the browser support check (and without the `alert`). Use `openWebSocketSetId` unless you already know the browser supports WebSocket.

## `sendMessagetoWebSocket(msg, wsocket)`

Calls `wsocket.send(msg)` if `wsocket.readyState` is `OPEN`. If the connection isn't open yet or is already closed, the message is **dropped with no error and no log**.

`msg` is sent as is. Plain objects are not serialized (they would be sent as `"[object Object]"`), so convert them with `JSON.stringify()` first.

## `closeWebSocket(wsocket)`

Closes the connection with `wsocket.close()`. The function only skips the value `0`; if `wsocket` is `undefined` or `null`, it throws a `TypeError`.

