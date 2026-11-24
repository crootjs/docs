# `element.js` Module Documentation

*[Bahasa Indonesia](../../element/)*

`element.js` contains short functions for everyday DOM work by element ID: attaching events, reading and filling form values, changing element content and classes, loading HTML fragments from other files, and loading external JS/CSS files. Most functions call `document.getElementById(id)` and then do one thing.

## Usage (Import)

```javascript
import { onClick, getValue, setInner, serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";
```

Unless stated otherwise, the functions on this page throw a `TypeError` when no element has the given ID.

| Group | Functions |
|---|---|
| Element | [`container`](#containerid) |
| Events | [`onClick`](#onclickid-actionfunctionname), [`onClicks`](#onclicksclassname-actionfunctionname), [`onChange`](#onchangeid-actionfunctionname), [`onChanges`](#onchangesclassname-actionfunctionname), [`onInput`](#oninputid-actionfunctionname), [`onInputs`](#oninputsclassname-actionfunctionname), [`runAfterDOM`](#runafterdomrunfunctionevent), [`runAfterAll`](#runafterallrunfunctionevent) |
| Forms | [`getValue`](#getvalueid), [`setValue`](#setvalueid-valuecontent), [`getAttributeValue`](#getattributevalueid-attribute), [`getValueRadio`](#getvalueradioname), [`getValueSelect`, `getTextSelect`](#getvalueselectid-gettextselectid), [`serializeForm`](#serializeformid), [`fillForm`](#fillformid-data), [`getFileSize`](#getfilesizeid), [`textFocus`, `textBlur`](#textfocusid-textblurid), [`disableInput`, `enableInput`](#disableinputid-enableinputid) |
| Element content | [`setInner`](#setinnerid-content), [`setInnerText`](#setinnertextid-content), [`addInner`](#addinnerid-content), [`addChild`](#addchildid-tag-classvalue-content) |
| Classes and visibility | [`addClassValue`](#addclassvalueid-classvalue), [`setClassValue`](#setclassvalueel-classvalue), [`show`, `hide`](#showid-hideid) |
| Loading HTML | [`renderHTML`](#renderhtmlid-urlhtml-callback-errorcallback), [`replaceTag`](#replacetagid-urlhtml-callback) |
| Loading JS/CSS | [`addJS`, `addCSS`](#addjssrc-addcsshref), [`addJSInHead`, `addCSSInHead`](#addjsinheadsrc-addcssinheadhref), [`isJSLoaded`, `isCSSLoaded`](#isjsloadedsrc-iscssloadedhref) |

## `container(id)`

Returns the element with ID `id`, the same as `document.getElementById(id)`. The result is `null` when it doesn't exist. Useful for things this module has no function for, e.g. `container("menu").classList.remove("open")`.

## `onClick(id, actionFunctionName)`

Attaches a `click` listener to element `id` with `addEventListener`. On every click, `actionFunctionName(target)` is called with `event.target`, the element actually clicked. If the button contains other elements (an `<i>` icon, for example), `target` can be that child element rather than the button.

If the element is not found, a warning is logged and nothing throws. Calling `onClick` again for the same ID adds another listener rather than replacing the old one.

```html
<button id="saveButton" type="button">Save</button>
<p id="status"></p>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { onClick, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";

onClick("saveButton", () => {
    setInnerText("status", "Saved");
});
```

## `onClicks(className, actionFunctionName)`

Like `onClick`, for every element with class `className`. The handler is set through the `onclick` property, so it replaces any previous `onclick` handler on that element. Only elements that exist when the function is called are affected; elements added later need to be wired up again.

```javascript
onClicks("delete-button", (button) => {
    console.log("delete item", button.dataset.id);
});
```

## `onChange(id, actionFunctionName)`

Sets a `change` handler on element `id` through the `onchange` property (replacing any previous handler). `actionFunctionName(target)` receives the changed element. `change` fires when a `<select>`, checkbox, or radio selection changes, and on text inputs when the value was edited and focus moves away.

```javascript
onChange("classSelect", (select) => {
    console.log("Selected:", select.value);
});
```

## `onChanges(className, actionFunctionName)`

Like `onChange`, for every element with class `className` that exists when it is called.

## `onInput(id, actionFunctionName)`

Sets an `input` handler on element `id` through the `oninput` property (replacing any previous handler). It fires on every value change, including every keystroke. `actionFunctionName(target)` receives **the element**, not the event, so the value is in `target.value`.

```html
<label for="name">Name</label>
<input id="name" type="text">
<p id="preview"></p>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { onInput, setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";

onInput("name", (input) => {
    setInnerText("preview", input.value);
});
```

For a search that sends a request while typing, wrap the handler in [`debounce`](../debounce).

## `onInputs(className, actionFunctionName)`

Like `onInput`, for every element with class `className` that exists when it is called.

## `runAfterDOM(runFunctionEvent)`

Calls `runFunctionEvent(event)` on the `DOMContentLoaded` event, i.e. after the HTML has been parsed. `type="module"` scripts already run after the HTML is parsed, so in ordinary module code this function isn't required. If it is called after `DOMContentLoaded` has passed (for example inside a callback or after an `await`), the function is never called.

## `runAfterAll(runFunctionEvent)`

Calls `runFunctionEvent(event)` on the `load` event, i.e. after all images, stylesheets, and iframes have loaded. As with `runAfterDOM`, it is not called if the event has already passed.

## `getValue(id)`

Returns the `value` of element `id` (input, textarea, select). The result is always a string, so convert with `Number()` for numbers.

```javascript
const age = Number(getValue("age"));
const name = getValue("name").trim();
```

For a single `<select>`, `getValue` gives the `value` of the selected option.

## `setValue(id, valuecontent)`

Sets the `value` of element `id` to `valuecontent` and returns that value.

```javascript
setValue("name", "Sari");
```

## `getAttributeValue(id, attribute)`

Returns the value of attribute `attribute` on element `id`, or `null` when the attribute is absent.

```javascript
const productId = getAttributeValue("productCard", "data-id");
```

## `getValueRadio(name)`

Returns the `value` of the checked radio among all elements sharing that `name`, or `undefined` when none is checked. The parameter is the `name` attribute, not an ID. Before 0.0.30 the function also logged `Selected Value: ...` to the console for each radio.

```javascript
const size = getValueRadio("size"); // "M", or undefined
```

## `getValueSelect(id)`, `getTextSelect(id)`

Return the `value` and the text of the selected option of the `<select>` with ID `id` (if no element has that ID, it is looked up by its `name` attribute), or `""` when nothing is selected. Before 0.0.30 both always threw a `TypeError`; use 0.0.30 or later.

```javascript
const value = getValueSelect("citySelect"); // e.g. "bdg"
const text = getTextSelect("citySelect");   // e.g. "Bandung"
```

## `serializeForm(id)`

Collects every field with a `name` attribute inside the form (text, email, checkbox, the checked radio, select) and returns them as one `{name: value}` object, so you don't have to call `getValue()` for each field before sending to a server. `disabled` fields and `<input type="file">` are skipped (files are sent with [`uploadFile`](../api/#uploadfile) from `api.js`, not as plain JSON).

| Field | Value |
|---|---|
| Single checkbox | `true` / `false` |
| Several checkboxes with the same `name` (since 0.0.30) | Array of the checked `value`s, e.g. `["reading", "running"]` |
| Radio | The checked `value` (absent if none is checked) |
| `<select multiple>` (since 0.0.30) | Array of the selected `value`s |
| Anything else | `value` as text |

**Example:**

```html
<form id="signupForm">
  <input type="text" name="name">
  <input type="email" name="email">
  <input type="checkbox" name="agree">
</form>
```

```javascript
import { serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/api.js";

const data = serializeForm("signupForm");
// { name: "...", email: "...", agree: true/false }

postJSON("https://api.example.com/signup", data, (res) => {
    console.log(res);
});
```

For validation with messages below each field before sending, see [`form.js`](../form).

## `fillForm(id, data)`

The reverse of `serializeForm` (since 0.0.30): fills the form's fields from an object, for example data from the server for an edit form. Values have the same shape as `serializeForm`'s result, so `fillForm(id, serializeForm(id))` changes nothing. Only fields whose name is a key in `data` are changed; `<input type="file">` is skipped; `null`/`undefined` clears a field. If the form is not found, a warning is logged and nothing throws.

```javascript
import { fillForm, serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";
import { getJSON, putJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/api.js";

const { status, data } = await getJSON("https://api.example.com/profile/7");
if (status === 200) fillForm("profileForm", data); // { name: "Sari", hobbies: ["reading"], agree: true }

// after the user edits it:
await putJSON("https://api.example.com/profile/7", serializeForm("profileForm"), null);
```

## `getFileSize(id)`

Returns the size of the first file selected in `<input type="file">` `id`, in KB (bytes ÷ 1024, not rounded). Throws a `TypeError` when no file is selected.

```javascript
onChange("attachment", () => {
    if (getFileSize("attachment") > 2048) console.log("2 MB maximum");
});
```

## `textFocus(id)`, `textBlur(id)`

Moves keyboard focus to element `id` (`focus()`), or removes focus from it (`blur()`).

## `disableInput(id)`, `enableInput(id)`

Sets `disabled` on element `id` to `true` or `false`. Works for inputs, buttons, selects, and textareas. `disabled` fields are left out of `serializeForm`'s result.

```javascript
disableInput("sendButton"); // prevent a double click while the request runs
```

## `setInner(id, content)`

Replaces the content of element `id` with `content` through `innerHTML`, so HTML tags in `content` are rendered. Don't insert text from users or the server without escaping it — that opens an XSS hole. For plain text use `setInnerText`.

```javascript
const items = ["Apple", "Orange"].map((fruit) => `<li>${fruit}</li>`).join("");
setInner("fruitList", items);
```

## `setInnerText(id, content)`

Replaces the content of element `id` with `content` as text (`innerText`). HTML tags are shown as-is, so it is safe for user text.

## `addInner(id, content)`

Appends `content` to the end of element `id`'s content (`innerHTML += content`). The whole content is rebuilt, so listeners attached to its child elements are lost and inputs inside it are reset. The XSS warning for `setInner` applies here too.

## `addChild(id, tag, classvalue, content)`

Creates a new `<tag>` element, gives it the classes in `classvalue` (several classes separated by spaces; pass `""` for none), sets its `innerHTML` to `content`, and appends it as the last child of element `id`. Does not return the new element.

```javascript
addChild("taskList", "li", "task done", "Send the report");
// <li class="task done">Send the report</li>
```

## `addClassValue(id, classValue)`

Adds one class to element `id`. Leading and trailing spaces are removed; a class with a space in the middle (`"a b"`) makes the browser throw a `DOMException`. This module has no function to remove a class; use `container(id).classList.remove(...)`.

## `setClassValue(el, classvalue)`

Adds one class to the **element** `el` (an element object, not an ID). Does nothing when `classvalue` is empty. `addChild` uses it to apply classes.

## `show(id)`, `hide(id)`

`hide` sets `style.display = "none"`; `show` sets `style.display = "block"`. Because `show` always uses `block`, an element meant to be `flex`, `grid`, or `inline` changes its layout. For such elements, toggle a class that hides them, or use the `hidden` attribute.

## `renderHTML(id, urlHTML, callback, errorCallback)`

Fetches an HTML file from `urlHTML` and puts its content into element `id` through `innerHTML`. Useful for splitting a page into fragments (header, menu, body) or building a simple SPA.

| Parameter | Description |
|---|---|
| `id` | ID of the target element |
| `urlHTML` | URL or path of the HTML file |
| `callback` | Optional. Called with no arguments after the content is in place |
| `errorCallback` | Optional. Called with an `Error` when the element isn't found, the server answers with a non-2xx status (e.g. 404), the network fails, or the request times out (15 seconds). On failure the element's content is not changed and `callback` is not called |

Errors are always logged to the console as well. `<script>` tags inside the loaded HTML do not run (that is how `innerHTML` works), so attach listeners for the new content in `callback`.

```html
<nav id="menu"></nav>
<main id="content"></main>
<script type="module" src="app.js"></script>
```

```javascript
// app.js
import { renderHTML, onClick } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";

renderHTML("menu", "parts/menu.html");
renderHTML("content", "parts/home.html", () => {
    onClick("startButton", () => console.log("start"));
}, (error) => {
    console.log("Could not load home:", error.message);
});
```

## `replaceTag(id, urlHTML, callback)`

Like `renderHTML`, but element `id` itself is **replaced** by the first element of the loaded HTML (rather than filled). Any elements after the first one in that file are ignored. `callback` is called with no arguments afterwards, also when the file contains no element at all.

There is no `errorCallback`: a missing element, a non-2xx status, a network failure, and a timeout (15 seconds) are only logged to the console, and `callback` is not called.

```javascript
replaceTag("footer", "parts/footer.html");
```

## `addJS(src)`, `addCSS(href)`

Loads an external JS or CSS file into `<head>` if it isn't on the page yet. Both are `async`; `await` them before using what the file provides. The "already there" check uses [`isJSLoaded`/`isCSSLoaded`](#isjsloadedsrc-iscssloadedhref), and when the file is already there the Promise resolves immediately, even if that file is still loading. If the file fails to load, the Promise rejects with an `Error`.

Scripts are loaded as classic scripts (not `type="module"`), which suits third-party libraries that set a global variable.

```javascript
import { addJS, addCSS } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.35/element.js";

await addCSS("https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.min.css");
await addJS("https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.min.js");
Swal.fire("Saved");
```

## `addJSInHead(src)`, `addCSSInHead(href)`

`addJS`/`addCSS` without the check: they always add a new `<script src>` or `<link rel="stylesheet">` to `<head>`. They return a Promise that resolves when the file has loaded and rejects with an `Error` when it fails.

## `isJSLoaded(src)`, `isCSSLoaded(href)`

Return `true` when the page has a `<script>` (or `<link rel="stylesheet">`) whose full URL **contains** `src` (or `href`). Because this is a substring check, `isJSLoaded("app.js")` is also `true` for `vendor-app.js`; use a long enough piece of the URL.

---

Earlier contributors to this page: Al Yasmin Assa'diyah (714240014), Affifah Putri Deza, Muhammad Rashid Al Savero (714240006).
