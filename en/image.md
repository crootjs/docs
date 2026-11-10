*[Bahasa Indonesia](../image)*

# image Function Manual

## Introduction
This file contains JavaScript functions used to generate random color values. These functions are very useful when you need dynamic colors for user interface (UI) elements, such as _background_ colors, text, or image _placeholders_.

---

## Functions and How to Use Them

### 1. `getRandomColor()`
**Description:**
Returns a random 6-character hexadecimal color code (for example: `#3E2F1B` or `#FF5733`).

**Usage:**

```javascript
let hexColor = getRandomColor();
console.log(hexColor); // Example output: "#7A2B9C" (the value will vary)
```

---

### 2. `getRandomColorName()`
**Description:**
Returns a random color name from a predefined list in the system (such as `yellow`, `blue`, `slate`, `emerald`, etc.). This function pairs very well with CSS frameworks such as Tailwind.

**Usage:**
```javascript
let colorName = getRandomColorName();
console.log(colorName); // Example output: "emerald" (the value will vary)
```

---

## Closing
These functions are very handy for adding instant visual variety to your web application. Make sure to call them at the right time to make your UI more attractive.
