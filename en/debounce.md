# `debounce.js` Module Documentation

*[Bahasa Indonesia](../debounce)*

`debounce.js` contains two wrapper functions that limit how often a function runs, useful for events that fire very often such as typing, scroll, resize, or mousemove.

## Usage (Import)

```javascript
import { debounce, throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/debounce.js";
```

## `debounce(fn, delay)`

Returns a new function that holds off `fn` until there have been no calls for `delay` milliseconds. Each new call restarts the countdown, so `fn` runs once after the triggering stops, with the arguments of the last call.

The typical use is search-as-you-type: the request goes out after the user stops typing, not on every keystroke.

```javascript
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/debounce.js";
import { onInput } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/api.js";

const searchProducts = debounce(async (input) => {
    const { status, data } = await getJSON(`https://api.example.com/products?q=${encodeURIComponent(input.value)}`);
    if (status === 200) console.log(data);
}, 400);

onInput("searchBox", searchProducts); // onInput passes the input element to the callback
```

## `throttle(fn, delay)`

Returns a new function that runs `fn` at most once every `delay` milliseconds. The first call runs immediately; calls that arrive during the wait are merged, and the last one runs as soon as the wait is over, so the latest value is not lost.

The typical use is `scroll`, `resize`, and `mousemove` events.

```javascript
import { throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.37/debounce.js";

window.addEventListener("scroll", throttle(() => {
    console.log("scroll position:", window.scrollY);
}, 200));
```

## Notes

- Call `debounce(...)`/`throttle(...)` once and register the result as the listener, as in the examples above. Calling it inside the handler creates a new wrapper on every event, so nothing gets limited.
- `this` and all arguments are passed through to `fn`. The return value of `fn` is not: the wrapped function always returns `undefined`.
- There is no way to cancel a pending call.
