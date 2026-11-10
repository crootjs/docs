*[Bahasa Indonesia](../toast)*

# `toast.js` Module Documentation

`toast.js` shows small notifications (*toasts*) in the top-right corner of the screen — with no external dependencies at all. Its CSS is *injected* automatically by the module itself, only once (not written by hand in your project's HTML/CSS), so importing this one file is all you need to start using it.

## Usage (Import)

```javascript
import { toast, toastSuccess, toastError, toastWarning, toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/toast.js";
```

## `toast(message, type = "info", duration = 3000)`

Shows one toast. `type` determines the color: `"info"` (blue, default), `"success"` (green), `"error"` (red), `"warning"` (yellow). `duration` is in milliseconds — the toast disappears automatically after it. If `duration` is set to `0`, the toast does **not** disappear automatically (it has to be dismissed manually).

Returns a `dismiss()` function — call it at any time to close that toast manually, even before `duration` has elapsed.

```javascript
toast("Data berhasil disimpan"); // info, disappears automatically after 3 seconds
toast("Berhasil!", "success", 2000);
toast("Gagal mengirim data", "error");
```

## Shortcut Functions

Same as `toast()` but with the type already set — you only need to provide `message` and (optionally) `duration`:

```javascript
toastSuccess("Berhasil disimpan!");
toastError("Terjadi kesalahan, coba lagi.");
toastWarning("Koneksi lambat...");
toastInfo("Memuat data...");
```

## Manually dismissed toast (e.g. a loading state)

```javascript
import { toastInfo } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/toast.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/api.js";

const tutupLoading = toastInfo("Mengunggah...", 0); // duration 0 = does not disappear on its own

postJSON("https://api.example.com/upload", data, (res) => {
    tutupLoading(); // close the loading toast once finished
    if (res.status === 200) {
        toastSuccess("Berhasil diunggah!");
    } else {
        toastError("Gagal mengunggah.");
    }
});
```

## Notes

- The toast styles (colors, position, animation) are *injected* automatically as a single `<style id="crootjs-toast-style">` in `<head>` when the first toast is shown — this is part of how the module works, not a style you need to (or should) write by hand in your project's CSS file.
- If you need a confirmation dialog (with OK/Cancel buttons), this module is not meant for that — `toast.js` is only for brief notifications that do not require user interaction.
