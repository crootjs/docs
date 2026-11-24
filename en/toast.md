# `toast.js` Module Documentation

*[Bahasa Indonesia](../toast)*

`toast.js` shows short notifications (*toasts*) in the top-right corner of the screen, with no external dependencies. The module injects its own CSS when the first toast appears, so importing this one file is enough.

## Usage (Import)

```javascript
import { toast, toastSuccess, toastError, toastWarning, toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/toast.js";
```

## `toast(message, type = "info", duration = 3000)`

Shows one toast. New toasts stack below the ones still on screen.

| Parameter | Default | Description |
|---|---|---|
| `message` | — | Message text. Set as `textContent`, so HTML tags are shown as text, not rendered |
| `type` | `"info"` | `"info"` (blue), `"success"` (green), `"error"` (red), `"warning"` (amber). Any other value gets no background color |
| `duration` | `3000` | How long it stays, in milliseconds. `0` (or negative) means it never disappears on its own |

Returns a `dismiss()` function that closes that toast at any time, including before `duration` is up. Calling it more than once has no effect.

```javascript
toast("Data saved");                    // info, gone after 3 seconds
toast("Profile updated", "success", 2000);
toast("Failed to send data", "error");
```

## `toastSuccess(message, duration)`, `toastError(message, duration)`, `toastWarning(message, duration)`, `toastInfo(message, duration)`

Same as `toast()` with the `type` already set. `duration` is optional (default 3000 ms), and the return value is also `dismiss()`.

```javascript
toastSuccess("Saved");
toastError("Something went wrong, please try again.");
toastWarning("Slow connection");
toastInfo("Loading data");
```

### Example: a toast closed manually

For work whose duration you can't predict, such as an upload, pass `duration` `0` and close it yourself when done:

```javascript
import { toastInfo, toastSuccess, toastError } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/toast.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.34/api.js";

const close = toastInfo("Sending...", 0);
const { status } = await postJSON("https://api.example.com/reports", { title: "Damaged road" }, null);
close();

if (status === 200) {
    toastSuccess("Report sent");
} else {
    toastError("Failed to send report");
}
```

## Notes

- The styles are injected once as `<style id="crootjs-toast-style">` at the start of `<head>`, and the container is a `<div id="crootjs-toast-container">` at the end of `<body>`. This is part of how the module works, not CSS you need to write. Because that `<style>` comes first in `<head>`, your own rules for `.crootjs-toast` and its color classes win without extra specificity (since 0.0.34).
- The colors come from the [croot.css](css) variables (`--croot-success`, `--croot-danger`, `--croot-warning`, `--croot-info`, text `--croot-accent-text`), so they follow dark mode on pages that use croot.css. Without croot.css the light values are used. Every combination meets WCAG AA contrast. Override those variables to change the colors.
- Screen readers announce every toast: the container is `aria-live="polite"`, and `"error"` toasts have `role="alert"`, so they are announced right away. So that the first toast is announced too, toasts shown within 100 ms of the container being created wait until those 100 ms have passed (in order).
- With `prefers-reduced-motion` toasts appear without animation.
- Toasts have no buttons and can't be clicked to close. For a confirmation dialog (OK/Cancel) use a `<dialog>` element or another library.
