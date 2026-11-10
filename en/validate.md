*[Bahasa Indonesia](../validate)*

# `validate.js` Module Documentation
`validate.js` in the croot.js library works as an input transformer. Unlike ordinary validation, which only shows error messages, this module actively manipulates user input so it matches the database's format standards (such as forcing lowercase, removing spaces, or formatting currency).

# Usage (Import)
Import the functions from the jsDelivr CDN into your JavaScript file of type `module`.

```javascript
import { validateUserName, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/validate.js";

// the functions are imported as a module, so they are attached with addEventListener, not an oninput attribute
document.getElementById("uname").addEventListener("input", (event) => validateUserName(event.target));
document.getElementById("harga").addEventListener("input", (event) => formatRupiah(event.target));
```

# Function List
### `validateUserName(input)`
This function makes sure usernames are uniform and free of odd characters.
* **Action**: Converts to lowercase, removes spaces, and allows only letters, digits, `_`, and `-`.
* **Use**: Essential for profile URLs or login systems, so there are no duplicates caused by differences in capitalization.

### `validatePhoneNumber(input)`
This function automatically converts local phone numbers to the international format.
* **Action**: Removes all non-digit characters. If the user types `0812...`, it is automatically changed to `62812...`.
* **Use**: Standardizes data for WhatsApp API or SMS Gateway integrations.

### `formatRupiah(input)`
The most complex function in this module, used to format numbers as Rupiah currency in real time.
* **Key Feature**: Adds `Rp.` and thousands separators (dots).
* Stores the raw value (without dots/Rp) in the data-value attribute so it is easy to use in calculations.

# Implementation Example
Here is how to apply it to HTML elements using an Event Listener:

### HTML

 ```html
<label for="uname">Username:</label>
<input type="text" id="uname">

<label for="harga">Harga Barang:</label>
<input type="text" id="harga">
```
### JavaScript

```javascript
import { validateUserName, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/validate.js";

// the functions are imported as a module, so they are attached with addEventListener, not an oninput attribute
document.getElementById("uname").addEventListener("input", (event) => validateUserName(event.target));
document.getElementById("harga").addEventListener("input", (event) => formatRupiah(event.target));
```

# Conclusion
The `validate.js` module in croot.js is not just a data checker; it is a Data Sanitization tool. This makes the application more secure against injection attacks and ensures the data in the database is always consistent.
