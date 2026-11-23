# `mongo.js` Module Documentation

*[Bahasa Indonesia](../mongo)*

`mongo.js` is a small **browser** module for working with MongoDB `ObjectId` values on the client — no MongoDB driver and no database connection at all. It only contains string/date utility functions.

## Usage (Import)

```javascript
import { generateObjectId, getDateFromObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/mongo.js";
```

## `generateObjectId()`

Creates a 24-character string in the shape of a MongoDB `ObjectId` (8 hex characters of the timestamp in seconds + 16 random hex characters from `Math.random()`, not a counter like a real ObjectId), directly in the browser, without calling a server or the `mongodb` library.

```javascript
import { generateObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/mongo.js";

const id = generateObjectId();
console.log(id); // e.g. "65f1a2b3c4d5e6f708192a3b"
```

## `getDateFromObjectId(stringID)`

Reads back the creation time embedded in the first 8 characters of an `ObjectId` and returns it as a `Date`.

| Parameter | Type | Description |
|---|---|---|
| `stringID` | `string` | ObjectId string (24 hex characters, or at least the first 8) |

```javascript
import { getDateFromObjectId } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.31/mongo.js";

const created = getDateFromObjectId("65f1a2b3c4d5e6f708192a3b");
console.log(created); // Date from the first 8 characters of the ObjectId
```

## Notes

- This module does **not** connect to MongoDB — it only creates/reads strings compatible with the MongoDB `ObjectId` format, useful on the frontend for a temporary ID before the data is sent to the backend.
- A real MongoDB connection (the `mongodb` driver, `MongoClient`, etc.) is **server-side (Node.js)** code and outside the scope of `crootjs/lib`.
