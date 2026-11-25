# `validate.js` Module Documentation

*[Bahasa Indonesia](../validate)*

`validate.js` cleans up the contents of an `<input>` as the user types: it changes letter case, strips characters that aren't allowed, converts local phone numbers to the `62` format, and formats numbers as Rupiah. The functions don't reject input and don't show error messages — `input.value` is simply overwritten with the cleaned result. For form validation with a per-field error message, use [`form.js`](../form).

Every function takes an **input element** (not an ID) and returns nothing. That makes them a good fit for `onInput` from [`element.js`](element/), which calls the function with `event.target`.

## Usage (Import)

```javascript
import { validateUserName, validateHouseNumber, validatePhoneNumber, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/validate.js";
```

## `validateUserName(input)`

In order: converts to lowercase, removes all whitespace, then removes every character other than `a-z`, `0-9`, `_`, and `-`.

| Typed | Result |
|---|---|
| `Budi Santoso` | `budisantoso` |
| `user.name@01` | `username01` |
| `Andi_Pratama-2` | `andi_pratama-2` |

## `validateHouseNumber(input)`

Converts to uppercase, then removes every character other than `A-Z` and `0-9` — including spaces, `_`, `-`, `/`, and dots.

| Typed | Result |
|---|---|
| `12a` | `12A` |
| `Blok C-7` | `BLOKC7` |
| `No. 5/B` | `NO5B` |

## `validatePhoneNumber(input)`

Removes every non-digit character. If the result is longer than one digit and starts with `0`, that `0` is replaced with `62`.

| Typed | Result |
|---|---|
| `0812-3456-7890` | `6281234567890` |
| `+62 812 3456 7890` | `6281234567890` |
| `0` | `0` (a single digit is left as is) |

This function does not check the length of the number. The internal check in [`stp.js`](stp) that requires `62` followed by 9–15 digits is a different function and is not exported.

## `formatRupiah(input)`

Removes every character other than digits and commas, then shows the result with a `Rp. ` prefix and dots as thousands separators. The comma is the decimal separator; digits after it are not formatted.

The unformatted value (digits and comma only) is stored as a string in the input element's `data-value` attribute.

| Typed | `input.value` | `data-value` |
|---|---|---|
| `1500000` | `Rp. 1.500.000` | `1500000` |
| `2500,50` | `Rp. 2.500,50` | `2500,50` |

The `Rp. ` prefix is stripped again on the next call, so it is safe to attach to the `input` event. To calculate with the value, convert `data-value` to a number; if it contains a comma, replace it with a dot before `Number()`.

## Example

```html
<label for="uname">Username</label>
<input type="text" id="uname">

<label for="telepon">WhatsApp number</label>
<input type="tel" id="telepon">

<label for="harga">Price</label>
<input type="text" id="harga" inputmode="numeric">

<script type="module" src="script.js"></script>
```

```javascript
// script.js
import { validateUserName, validatePhoneNumber, formatRupiah } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/validate.js";
import { onInput } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.43/element.js";

onInput("uname", validateUserName);
onInput("telepon", validatePhoneNumber);
onInput("harga", (input) => {
    formatRupiah(input);
    const price = Number(input.getAttribute("data-value").replace(",", "."));
    console.log(price); // 1500000 for "Rp. 1.500.000"
});
```

## Notes

- Because `input.value` is overwritten, the text cursor usually jumps to the end of the input whenever the value changes.
- Cleaning input in the browser is a convenience for the user. The backend must still validate the data it receives.
