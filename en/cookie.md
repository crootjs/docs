# `cookie.js` Module Documentation

*[Bahasa Indonesia](../cookie)*

`cookie.js` saves, reads, and deletes browser cookies. Expiry is set in days, hours, or seconds. Every cookie is written with `path=/`, so it is readable on every page of the site, and it is sent to the server with every request to the same domain.

## Usage (Import)

```javascript
import { setCookieWithExpireHour, getCookie, deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/cookie.js";
```

## `setCookieWithExpireDay(cname, cvalue, exdays)`

## `setCookieWithExpireHour(cname, cvalue, exhour)`

## `setCookieWithExpireSecond(cname, cvalue, exsecs)`

Saves cookie `cname` holding `cvalue`, expiring `exdays` days, `exhour` hours, or `exsecs` seconds from now. Name and value are encoded with `encodeURIComponent`. Returns nothing.

| Parameter | Description |
|---|---|
| `cname` | Cookie name. Use only letters, digits, `-`, and `_` (see Notes) |
| `cvalue` | Cookie value, converted to a string. Objects need `JSON.stringify` first, otherwise they are stored as `"[object Object]"` |
| `exdays` / `exhour` / `exsecs` | Lifetime. `0` or negative makes the cookie expire immediately, which is the same as deleting it |

```javascript
setCookieWithExpireDay("language", "en", 30);
setCookieWithExpireHour("token", "eyJhbGciOiJIUzI1NiJ9.sample", 2);
setCookieWithExpireSecond("otpSent", "1", 60);
```

## `getCookie(cname)`

Returns the value of cookie `cname` as a string, or `""` (empty string) when the cookie does not exist or has expired.

```javascript
const token = getCookie("token");
if (token === "") {
    console.log("Not logged in");
}
```

## `deleteCookie(cname)`

Deletes cookie `cname` by setting its expiry to 1 January 1970. Only deletes a cookie with `path=/`, which is what this module creates.

### Example: log in and log out

```javascript
import { setCookieWithExpireHour, getCookie, deleteCookie } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/cookie.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/api.js";
import { onClick, getValue } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.40/element.js";

onClick("loginButton", async () => {
    const { status, data } = await postJSON("https://api.example.com/login", { user: getValue("user"), password: getValue("password") }, null);
    if (status === 200) setCookieWithExpireHour("token", data.token, 2);
});

onClick("logoutButton", () => deleteCookie("token"));

console.log(getCookie("token") ? "Logged in" : "Not logged in");
```

## Notes

- Cookies get no `Secure` or `SameSite` attribute, so the browser defaults apply. Cookies created from JavaScript cannot be `HttpOnly`, so a token stored here can be read by any script on the page.
- Since 0.0.30 `getCookie` correctly reads names with spaces or special characters and values containing `;` or `%`. Earlier versions decoded twice: such values were cut off or made it throw a `URIError`.
- Browsers limit a single cookie to about 4 KB. Larger data that doesn't need to go to the server fits better in [`storage.js`](storage).
