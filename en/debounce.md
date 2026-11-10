*[Bahasa Indonesia](../debounce)*

# `debounce.js` Module Documentation

`debounce.js` contains two wrapper functions (*higher-order functions*) that limit how often a function may run — useful for events that fire very frequently, such as typing, scroll, resize, or mousemove.

## Usage (Import)

```javascript
import { debounce, throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/debounce.js";
```

## `debounce(fn, delay)`

Delays running `fn` until the user **stops** triggering it for `delay` milliseconds. If it is called again before that time is up, the countdown restarts from the beginning. The result: `fn` runs only **once**, after the user is done (not in the middle).

**Most common use**: search-as-you-type — so a request is not sent to the server on every keystroke, only after the user stops typing.

```javascript
import { debounce } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/debounce.js";
import { onInput, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/element.js";
import { getJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/api.js";

const cariProduk = debounce(() => {
    const kata = getValue("kotakPencarian");
    getJSON(`https://api.example.com/produk?q=${kata}`, (res) => {
        console.log(res.data);
    });
}, 400); // wait 400ms after the user stops typing

onInput("kotakPencarian", cariProduk);
```

## `throttle(fn, delay)`

Limits `fn` so it runs **at most once** every `delay` milliseconds, even if it is triggered far more often than that. Unlike `debounce`, the first call runs immediately (*leading call*), and if there is a new trigger during the waiting period, the **last** call still runs after `delay` has passed (*trailing call*) — so the latest data is never lost.

**Most common use**: `scroll`/`resize`/`mousemove` events, which can fire dozens of times per second.

```javascript
import { throttle } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/debounce.js";

window.addEventListener("scroll", throttle(() => {
    console.log("scroll position:", window.scrollY);
}, 200)); // runs at most every 200ms
```

## Notes

- Both functions return a new, already-wrapped function — call `debounce(fn, delay)`/`throttle(fn, delay)` **once** outside the handler, then register the result as the listener (as in the examples above). Do not call `debounce(...)`/`throttle(...)` inside the handler itself, because that creates a new wrapper every time and cancels out the effect.
- `this` and all of the original call's arguments are passed through to `fn`.
