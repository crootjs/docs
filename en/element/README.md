*[Bahasa Indonesia](../../element/)*

# Module Documentation: element.js

## 1. Introduction

The `element.js` module is a core component of the CrootJS ecosystem, designed to bridge the interaction between JavaScript logic and the DOM (Document Object Model) structure. Its main focus is to provide an abstraction over element manipulation commands that are often repetitive and complex in Vanilla JavaScript.

By using this module, developers can minimize the use of lengthy standard syntax such as:

- Manual element selection (`document.getElementById`)
- Repetitive event listener setup
- Writing dynamic content that is prone to typos

The goal is to create a more elegant web development workflow, speed up coding, and keep the code structure clean.

---

## 2. Module Scope

The `element.js` module covers a range of important utilities for managing the user interface programmatically:

### 2.1 Structure and Content Management

- Updating element contents instantly
- Creating new nodes or elements without lengthy HTML syntax
- Synchronizing element attributes with application logic

### 2.2 Interaction System (Event Handling)

- Simplifying events such as click, input, and change
- More structured callback management

### 2.3 Visual Dynamics Control

- Showing and hiding elements
- Manipulating CSS classes for animations and themes

### 2.4 External Content Integration

- Loading HTML asynchronously
- Supporting simple Single Page Applications (SPA)

One of the standout features is the `onClick` function.

---

## 3. onClick Function Documentation

### 3.1 Description

The `onClick` function is used to attach an action that runs when an HTML element is clicked. It simplifies the use of `addEventListener("click")`.

### 3.2 Syntax

```javascript
onClick(id, action)
```

### 3.3 Parameters

- `id` : ID of the target HTML element  
- `action` : callback function to run on click  

---

### 3.4 How It Works

1. Finds the element with `document.getElementById(id)`  
2. Adds a `click` event listener  
3. Waits for user interaction  
4. Runs the callback when a click occurs  
5. Shows a warning if the element is not found

### 3.5 Usage Example

HTML:
```html
<button id="btn-alert">Klik Saya!</button>
```

JavaScript:
```javascript
onClick("btn-alert", () => {
    alert("Tombol berhasil diklik menggunakan CrootJS");
    console.log("Interaksi user terekam");
});
```

### 3.6 Use Cases

- Interactive buttons  
- Navigation without reloading  
- Form validation  
- Clickable decorative elements  
- Writing modular code  

---

### 4. Conclusion

The `element.js` module helps manage elements and events efficiently.

The `onClick` function lets developers build interactions with minimal code without depending on a large framework.

Contributor: AL YASMIN ASSA'DIYAH - 714240014

# Additional element.js Function Documentation

## 1. onChange(id, actionFunction)

Adds a `change` event listener to the target element. The callback function runs when the user has finished changing the value and the element loses focus. The callback receives a reference to the target element directly. It is best called inside `runAfterDOM()`.

**Usage Example:**
```javascript
import { onChange } from './element.js';

onChange('pilihLevel', (target) => {
    console.log('Terpilih:', target.value);
});
```

## 2. getValue(id)

Gets the value as text (a string) from form elements such as input, select, and textarea. Returns an empty string if there is no value. Important note: the returned value is always text; an explicit conversion with `Number()` is required for numeric fields.

**Usage Example:**
```javascript
import { getValue } from './element.js';

const usia = Number(getValue('fieldUmur'));
const nama = getValue('fieldSiswa');
```

## 3. setInner(id, content)

Directly replaces the contents (innerHTML) of the target HTML element with new content. Commonly used for dynamic display changes without reloading the page. Important: make sure the input text or HTML string has been sanitized to prevent Cross Site Scripting (XSS).

**Usage Example:**
```javascript
import { setInner } from './element.js';

setInner('boxStatus', 'Data berhasil diperbarui.');

const infoList = dataMap.map(x => `<li>${x.teks}</li>`).join('');
setInner('ulDaftar', infoList);
```

---
## Affifah Putri Deza
# element.js Module Documentation

## 1. Introduction

`element.js` is one of the modules in CrootJS that helps with DOM manipulation and HTML element management in a simpler, more modular way.

This module reduces repetitive DOM code such as:

- `document.getElementById()`
- `document.querySelector()`
- `addEventListener()`
- `innerHTML` manipulation
- managing element classes and visibility

With this module, website development becomes tidier, more efficient, and more structured.

---

## 2. Module Scope

In general, `element.js` provides the following features:

### 2.1 Element Manipulation
- Changing element contents (`innerHTML`, `innerText`)
- Setting attributes
- Managing classes

### 2.2 Event Handling
- Adding event listeners (click, input, change, and others)
- Managing user interaction

### 2.3 Visibility Control
- Showing elements
- Hiding elements
- Toggling display

### 2.4 Dynamic Content Rendering
- Loading HTML files dynamically
- Building a partial page system
- Supporting a modular approach

One of the functions in this category is `renderHTML`.

---

# 3. renderHTML Function Documentation

## 3.1 Description

The `renderHTML` function is used to fetch an HTML file from a URL and then display it inside a specific element by ID.

This function lets a web page load content dynamically without reloading the page.

---

## 3.2 Syntax

```javascript
renderHTML(id, urlHTML, callback = null, errorCallback = null)
```

---

## 3.3 Parameters

- **`id`**  
  ID of the HTML element where the content is rendered.

- **`urlHTML`**  
  URL or path of the HTML file to load.

- **`callback` (optional)**  
  Function that runs after the content has loaded successfully.

- **`errorCallback` (optional)**  
  Function called with an `Error` if the element is not found, the server replies with a non-2xx status (e.g. 404), the network fails, or the request times out (15 seconds). On failure, the element's contents are not changed and `callback` is not called.

---

## 3.4 How It Works

1. Finds the element with `document.getElementById()`.
2. If the element is not found, an error is shown in the console.
3. Fetches the file using `fetch()`.
4. Converts the response into HTML text.
5. Inserts the HTML into the element using `innerHTML`.
6. Runs `callback` if provided.

---

## 3.5 Usage Example

### HTML

```html
<div id="content"></div>
```

### JavaScript

```javascript
renderHTML("content", "about.html", () => {
    console.log("Konten berhasil dimuat");
});
```

In the example above, the file `about.html` is loaded and displayed inside the element with ID `content`. Once the process finishes, the callback runs.

---

## 3.6 Use Cases

- Building a partial page system
- Loading HTML components modularly
- Reducing page reloads
- Building dynamic websites based on ES6 Modules

---

## 4. Conclusion

The `element.js` module helps manage elements and events more efficiently.

The `renderHTML` function enables dynamic loading of HTML content using asynchronous JavaScript and DOM manipulation, supporting website development that is modular, lightweight, and independent of complex frameworks.


-------------------------- 
## Muhammad Rashid Al Savero (714240006)
# 3. onInput Function Documentation

## 3.1 Description

The `onInput` function is used to add an event listener to an HTML element that runs every time the user changes the input.

This event is typically used on elements such as:
- `<input>`
- `<textarea>`
- `<select>`

This function makes handling the `input` event easier without having to write `addEventListener` manually.

---

## 3.2 Syntax

```javascript
onInput(id, callback)
```

---

## 3.3 Parameters

- **`id`**  
  ID of the HTML element to attach the input event to.

- **`callback`**  
  Function that runs every time the element's value changes.

---

## 3.4 How It Works

1. Finds the element using `document.getElementById()`.
2. If the element is not found, an error is shown in the console.
3. Adds an `input` event listener to the element.
4. Every time the user types or changes the value, the `callback` function runs.
5. The latest input value can be accessed via `event.target.value`.

---

## 3.5 Usage Example

### HTML

```html
<input type="text" id="username" placeholder="Masukkan nama">
<p id="output"></p>
```

### JavaScript

```javascript
onInput("username", (event) => {
    const value = event.target.value;
    document.getElementById("output").innerText = value;
});
```

In the example above, every time the user types in the input, the text is immediately displayed in the `<p>` element.

---

## 3.6 Use Cases

- Real-time input validation
- Showing a live text preview
- Building a live search feature
- Improving user interface interactivity

---

## 4. Conclusion

The `onInput` function makes handling input events on HTML elements more concise and structured.

With this function, developers can build real-time interactions without repeatedly writing event listener code, making the code cleaner, more modular, and easier to understand.

---

## `serializeForm(id)`

Collects every field that has a `name` attribute inside a form (text, email, checkbox, the selected radio, select) and returns them as a single `{name: value}` object — so there's no need to call `getValue()` one by one before sending to the server. Fields that are `disabled` and `<input type="file">` are skipped automatically (files need `postFile`/`postFileJSON` from `api.js`, not plain JSON).

**Usage Example:**

```html
<form id="formDaftar">
  <input type="text" name="nama">
  <input type="email" name="email">
  <input type="checkbox" name="setuju">
</form>
```

```javascript
import { serializeForm } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/element.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.27/api.js";

const data = serializeForm("formDaftar");
// { nama: "...", email: "...", setuju: true/false }

postJSON("https://api.example.com/daftar", data, (res) => {
    console.log(res);
});
```
