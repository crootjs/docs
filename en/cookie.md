*[Bahasa Indonesia](../cookie)*

# setCookieWithExpireHour – CrootJS Cookie Module

`cookie.js` is a CrootJS module used to manage cookies in the browser. It provides functions to save, read, and delete cookies with various expiry options (days, hours, or seconds).

`setCookieWithExpireHour` is a function from the `cookie.js` module (CrootJS) used to save a cookie whose validity period is measured in **hours**.

This function is well suited for:

- Temporary login sessions  
- Authentication tokens  
- Active-user status  
- Temporary preferences  

The module uses **ES Modules (ESM)**, so it must be imported using `type="module"`.

---

## Installation (CDN)

Import directly from jsDelivr:

```javascript
import { setCookieWithExpireHour } 
from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js";

```

## Function

`setCookieWithExpireHour(name, value, hour)`

Saves a cookie with a validity period measured in hours.

| Parameter | Type   |Description            |
| --------- | ------ |---------------------- |
| `name`    | String |Cookie name            |
| `value`   | String |Cookie value           |
| `hour`    | Number |Validity period in hours |

Example 

Saving a Session for 2 Hours

`setCookieWithExpireHour("loginUser", "user_714240003", 2);`

```javascript
import { setCookieWithExpireHour } 
from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/cookie.js";
function login() {
  let username = "Zahra";
setCookieWithExpireHour("loginUser", "user_714240003", 2);
  console.log("Login successful, valid for 2 hours.");
}

function logout() {
  document.cookie = "loginUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  console.log("Logout successful.");
}
```

## Note :
-Cookies are stored only for the same domain.
-If the hour value is 0 or negative, the cookie expires immediately.
