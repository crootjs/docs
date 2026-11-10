*[Bahasa Indonesia](../stp)*

The **`stp.js`** module provides a set of asynchronous functions for managing the user authentication flow, covering sending, verifying, and resending STP codes. The module automatically validates the **phone number** format before making an HTTP POST request to the external authentication *endpoint*.

---

# `stp.js` Documentation

This module exports three main functions for interacting with the authentication API. All functions rely on an internal validation function to ensure data integrity before sending network requests.

## Usage (Import)

```javascript
import { sendSTP, verifySTP, resendSTP } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/stp.js";
```

## Internal Function

### `validatePhoneNumber(phoneNumber)`

A private function used to validate the phone number format before the main functions run.

* **Validation Rule**: The phone number must start with **62** followed by **9 to 15 digits**.
* **Error**: Throws an `Error` if the parameter is empty or the format does not match the *regex* (`/^62\d{9,15}$/`).

## Exported Functions (API)

### 1. `sendSTP(phoneNumber, captchaToken)`

Sends a request to deliver an authentication code to the user's phone number.

* **Parameters**:
* **`phoneNumber`** (*String*): The destination phone number (must use the **62** format).
* **`captchaToken`** (*String*): A CAPTCHA token for validating the session.


* **Process**: Makes an **HTTP POST** request to `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/login` with a JSON *payload* containing `phonenumber` and `captcha`.
* **Return**: Returns the **JSON** object from the server response.
* **Error Handling**: Throws the *error* **"Failed to send STP"** if the network response fails.

### 2. `verifySTP(phoneNumber, password)`

Verifies the STP code or password entered by the user.

* **Parameters**:
* **`phoneNumber`** (*String*): The user's phone number (must use the **62** format).
* **`password`** (*String*): The STP code or password to verify.


* **Process**: Makes an **HTTP POST** request to `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/verify` with a JSON *payload* containing `phonenumber` and `password`.
* **Return**: Returns the **JSON** object from the server response, which contains the verification status.
* **Error Handling**: Throws the *error* **"Failed to verify STP"** if the network response fails.

### 3. resendSTP(phoneNumber)

Requests that the STP code be resent to the user's phone number if the previous code was not received or has expired.

* **Parameters**:
* **`phoneNumber`** (*String*): The destination phone number (must use the **62** format).


* **Process**: Makes an **HTTP POST** request to `https://asia-southeast2-awangga.cloudfunctions.net/domyid/auth/resend` with a JSON *payload* containing `phonenumber`.
* **Return**: Returns the **JSON** object from the server response.
* **Error Handling**: Throws the *error* **"Failed to resend STP"** if the network response fails.

### Conclusion
CrootJS takes a modular approach: you only need to import the functions you actually use, keeping your application's bundle size small and optimal. By moving boilerplate logic into utility functions such as api.js, element.js, and validate.js, your main code becomes much cleaner, easier to read, and easier to maintain.
