# `form.js` Module Documentation

*[Bahasa Indonesia](../form)*

`form.js` validates forms and shows the error message **below each invalid field**, instead of the browser's built-in bubbles, which disappear on their own and look different in every browser. The rules come from ordinary HTML attributes (`required`, `type="email"`, `minlength`, `maxlength`, `min`, `max`, `pattern`, `step`), plus your own per-field rules when needed. The default messages are in Indonesian and can be replaced.

The messages are also read by screen readers: an invalid field gets `aria-invalid="true"`, its message is linked through `aria-describedby`, and focus moves to the first invalid field.

## Usage (Import)

```javascript
import { handleForm, validateForm, clearFormErrors } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/form.js";
```

## `handleForm(id, onSubmit, options)`

The quickest way. Handles the submit of form `id`: the page does not reload, the form is validated, and `onSubmit(data, event)` is called only when everything is valid. `data` comes from [`serializeForm`](element/#serializeformid). After the first submit attempt, each field is re-checked as soon as it changes, so its message disappears as soon as it is fixed.

```html
<form id="signup">
  <label for="name">Name</label>
  <input id="name" name="name" required minlength="3">

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <label for="password">Password</label>
  <input id="password" name="password" type="password" required minlength="8">

  <label for="confirm">Repeat password</label>
  <input id="confirm" name="confirm" type="password" required>

  <label for="phone">Phone number</label>
  <input id="phone" name="phone" required pattern="62[0-9]{9,13}" title="Start with 62, e.g. 6281234567890.">

  <button type="submit">Sign up</button>
</form>
```

```javascript
import { handleForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/form.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/api.js";

handleForm("signup", async (data) => {
    const { status } = await postJSON("https://api.example.com/signup", data, null);
    console.log(status === 200 ? "Signed up" : "Failed: " + status);
}, {
    rules: {
        confirm: (value, all) => value !== all.password ? "Passwords do not match." : null,
    },
    messages: {
        email: { valueMissing: "Email is required to receive the activation link." },
    },
});
```

Returns `{ validate(), clear(), remove() }`. `remove()` detaches the submit handling and removes any messages on display.

The browser's built-in messages are turned off with `novalidate` while `handleForm` is active.

## `validateForm(id, options)`

Checks the form once, for example before moving to the next step of a multi-step form. Messages are shown or removed, and it returns `true` when everything is valid.

```javascript
import { validateForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/form.js";
import { onClick, show, hide } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/element.js";

onClick("next", () => {
    if (!validateForm("step-1")) return;
    hide("step-1");
    show("step-2");
});
```

## `clearFormErrors(id)`

Removes all validation messages in the form, for example after the form has been reset.

## Options

`options` is the same for `handleForm` and `validateForm`. All of them are optional.

| Option | Description |
|---|---|
| `rules` | `{ fieldName: (value, allValues) => "message" \| null }`. Extra rules; they run before the HTML attribute rules. `value` and `allValues` come from `serializeForm` |
| `messages` | Replaces the default messages: `{ fieldName: "message" }` for every kind of error on that field, or `{ fieldName: { valueMissing: "...", tooShort: "..." } }` per kind |
| `focus` | `false` to keep focus from moving to the invalid field. Default `true` |

## Default Messages

The default messages are in Indonesian; the English meaning is given for reference.

| Kind | Attribute | Message | Meaning |
|---|---|---|---|
| `valueMissing` | `required` | Wajib diisi. | Required. |
| `typeMismatch` | `type="email"` / `type="url"` / others | Format email tidak valid. / Format URL tidak valid. / Format tidak valid. | Invalid email format. / Invalid URL format. / Invalid format. |
| `tooShort` | `minlength` | Minimal *n* karakter. | At least *n* characters. |
| `tooLong` | `maxlength` | Maksimal *n* karakter. | At most *n* characters. |
| `rangeUnderflow` | `min` | Minimal *n*. | At least *n*. |
| `rangeOverflow` | `max` | Maksimal *n*. | At most *n*. |
| `stepMismatch` | `step` | Nilainya tidak sesuai kelipatan yang diizinkan. | The value is not an allowed multiple. |
| `badInput` | `type="number"` | Isi dengan angka. | Enter a number. |
| `patternMismatch` | `pattern` | The field's `title` attribute, or "Format tidak sesuai." | Format does not match. |

`minlength` and `maxlength` are also checked for values set from code (for example with [`fillForm`](element/#fillformid-data)); the browser itself only checks them for what the user types.

## Message Placement and Appearance

- Ordinary field: right after the field, or after the `<label>` if the field is wrapped in a label.
- Group of radio buttons or checkboxes sharing the same `name`: at the end of the `<fieldset>` that wraps them.
- The message is a red `<p class="crootjs-field-error">`. It can be overridden from the page's CSS, for example `.crootjs-field-error { color: #9f1239; }`, and invalid fields can be styled through `[aria-invalid="true"]`.

## Notes

- Validation in the browser is only for the user's convenience. The server must still check the data it receives.
- `disabled` fields, buttons, and fields without a `name` are not validated.
