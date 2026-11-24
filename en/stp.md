# `stp.js` Module Documentation

*[Bahasa Indonesia](../stp)*

`stp.js` contains three functions for a phone-number login flow: request an STP code to be sent to the user's number, verify it, and request it again. Each function sends a JSON `POST` to an endpoint that is **hard-coded in the module** and cannot be changed:

| Function | Endpoint | Body |
|---|---|---|
| `sendSTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/login` | `{ phonenumber, captcha }` |
| `verifySTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/verify` | `{ phonenumber, password }` |
| `resendSTP` | `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/resend` | `{ phonenumber }` |

So this module is only useful for applications that use that backend. For your own backend, use [`postJSON`](api/) from `api.js`.

## Usage (Import)

```javascript
import { sendSTP, verifySTP, resendSTP } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/stp.js";
```

## Shared Behavior

All three functions are `async` and return a Promise of the response body parsed from JSON. The Promise **rejects** (unlike `api.js`, which never throws) in these cases:

| Case | Error |
|---|---|
| `phoneNumber` is empty | `Phone number is required` |
| `phoneNumber` doesn't match `/^62\d{9,15}$/` (starts with `62`, then 9–15 digits, no spaces or `+`) | `Invalid phone number format. It should start with 62 and followed by 9 to 15 digits.` |
| HTTP status is not 2xx | `Failed to send STP` / `Failed to verify STP` / `Failed to resend STP`; the server's response body is not passed on |
| Network failure | `TypeError` from `fetch` |

The number check happens before the request is sent. To turn `08...` input into `628...` as the user types, use `validatePhoneNumber` from [`validate.js`](validate).

## `sendSTP(phoneNumber, captchaToken)`

Requests a code to be sent to `phoneNumber`. `captchaToken` is a CAPTCHA token checked by the backend; the module does not create it.

## `verifySTP(phoneNumber, password)`

Sends the code the user entered (`password`) for verification. The response content is entirely up to the backend.

## `resendSTP(phoneNumber)`

Requests the code to be sent to `phoneNumber` again.

## Example

```javascript
import { sendSTP, verifySTP } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/stp.js";
import { getValue, onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.39/element.js";

onClick("send-code", async () => {
    try {
        await sendSTP(getValue("phone"), getValue("captcha-token"));
        console.log("Code sent");
    } catch (err) {
        console.error(err.message);
    }
});

onClick("verify", async () => {
    try {
        const result = await verifySTP(getValue("phone"), getValue("code"));
        console.log(result);
    } catch (err) {
        console.error(err.message);
    }
});
```
