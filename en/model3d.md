*[Bahasa Indonesia](../model3d)*

# `model3d.js` Module Documentation

`model3d.js` displays **glTF 2.0** 3D models (`.glb` and `.gltf`) directly in the browser: rotate, zoom, click a part, change its color, hide it, or change its position and rotation from code. Everything is written from scratch on top of WebGL — its own GLB binary parser, matrices, shaders, and orbit controls — without Three.js (about 600 KB) or any other library. Its size is about 16 KB gzip.

It renders with **WebGL2**, and automatically falls back to **WebGL1** in older browsers. On-screen move/rotate gizmos, HTML labels pinned to the model, animation, exploded view, cross-sections, and `.glb` export live in the add-on module [`model3dtools.js`](model3dtools).

## Usage (Import)

```javascript
import { createViewer, loadModel } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3d.js";
```

## Minimal Example

```html
<!-- index.html -->
<link rel="stylesheet" href="style.css">
<div id="model" class="model"></div>
<output id="status"></output>
<script type="module" src="index.js"></script>
```

```css
/* style.css — the viewer fills its element, so a height is required */
.model { height: 420px; }
```

```javascript
// index.js
import { createViewer, loadModel, onModelClick, highlightPart } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3d.js";
import { setInnerText } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

createViewer("model");
loadModel("model", "models/bts.glb", (info, error) => {
    if (!info) return setInnerText("status", "Gagal: " + error);
    setInnerText("status", `${info.parts.length} bagian, ${info.triangles} segitiga`);
});

onModelClick("model", (hit) => {
    highlightPart("model", hit ? hit.part : null);
    setInnerText("status", hit ? hit.path.join(" › ") : "—");
});
```

## `createViewer(id, options)`

Creates a viewer inside element `id` (usually a `<div>`). The element must have a height set from CSS. Calling it again with the same `id` recreates the viewer.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `background` | light gray gradient | Background, any CSS `background` value (`"#1a1a1a"`, a gradient, `"transparent"`) |
| `autoRotate` | `0` | Degrees per second the model spins on its own. Stops as soon as the user touches it |
| `fov` | `45` | Camera's vertical field of view, in degrees |
| `controls` | `true` | `false` = no user rotate/zoom/pan, e.g. for a static product view |
| `webgl` | `2` | `1` = force WebGL1, to test how it looks in older browsers |
| `dracoDecoder` | from `www.gstatic.com` | Folder of the Draco decoder (`draco_wasm_wrapper_gltf.js` + `draco_decoder_gltf.wasm`) for Draco-compressed models. Set it to your own folder if the app must not depend on Google's servers |

If the browser has no WebGL at all, the viewer shows a message and every other function does nothing.

## `loadModel(id, source, responseFunction)`

Loads a model, replacing the previous one. The camera is adjusted automatically so the whole model is visible.

- `source` — URL of a `.glb`/`.gltf` file, a **File/Blob** (e.g. from `<input type="file">`), or an `ArrayBuffer`.
- `responseFunction(info, error)` — called once the model is displayed. `info` contains:

| Key | Contents |
|---|---|
| `parts` | Names of all parts (nodes), in tree order |
| `triangles` | Number of triangles |
| `bounds` | `{ min, max, center, size }` the model's bounding box, in model units (glTF uses meters) |

On failure, `info` = `null` and `error` holds the reason (also printed to the console). `loadModel` also returns a Promise of the same `info`, so it can be `await`ed.

```javascript
// Opening a file from the user's computer
import { onChange } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/element.js";

onChange("file", () => {
    loadModel("model", document.getElementById("file").files[0], (info, error) => {
        console.log(info || error);
    });
});
```

For a `.gltf` that uses separate `.bin` and image files, those files are downloaded from the same folder as the `.gltf` URL. From `<input type="file">`, only `.glb` or `.gltf` with embedded data can be opened, because the companion files are not selected along with it.

## Model Parts

A glTF model is built from nested **nodes** — e.g. `Menara` › `Sektor_1` › `Antena_1`. In this module nodes are called **parts**, and they are looked up by name (the node name, or its mesh name if the node is unnamed). Changes to a part (color, hiding, position) also apply to all parts beneath it. If several nodes share the same name, all of them change.

### `getParts(id)`

List of all parts, in tree order: `[{ name, mesh, parent, depth, visible }]`. `depth` = depth in the tree (0 = top level), useful for building an indented list.

### `setPartColor(id, name, color)`

Changes a part's color. `color`: any CSS color (`"#ff0000"`, `"red"`, `"rgba(255, 0, 0, 0.5)"`) or `[r, g, b, a]` in 0..1. Alpha below 1 makes it transparent. `null` = back to its original color. The new color replaces that part's texture. Returns `false` if the part does not exist.

### `setPartVisible(id, name, visible)`

Shows (`true`) or hides (`false`) a part.

### `highlightPart(id, name)`

Marks the currently selected part in blue. `null` = remove the highlight. Only one name is highlighted at a time.

### `getPartTransform(id, name)` and `setPartTransform(id, name, transform)`

A part's position, rotation, and scale **relative to its parent** — the same as the `translation`, `rotation`, and `scale` values in the glTF file.

`getPartTransform` returns:

| Key | Contents |
|---|---|
| `position` | `[x, y, z]` |
| `rotation` | `[x, y, z]` degrees, Euler in XYZ order (same as Blender and Three.js) |
| `quaternion` | `[x, y, z, w]` the same rotation |
| `scale` | `[x, y, z]` |

`setPartTransform` changes only what is given: `position`, `rotation` (`[x, y, z]` degrees, or a quaternion `[x, y, z, w]`), and `scale` (a number, or `[x, y, z]`).

```javascript
// Azimuth 150° and downtilt 6° for the sector 2 antenna. glTF's Y axis points up.
setPartTransform("model", "Sektor_2", { rotation: [0, -150, 0] });
setPartTransform("model", "Antena_2", { rotation: [6, 0, 0] });
```

## `onModelClick(id, runFunction)`

`runFunction(hit)` is called every time the model is clicked or tapped (rotating does not count as a click):

| Key | Contents |
|---|---|
| `part` | Name of the lowest part that was hit |
| `mesh` | Its mesh name, or `null` |
| `path` | Part names from the top down to `part`, e.g. `["BTS", "Menara", "Sektor_1", "Lengan_1", "Antena_1"]` — for selecting the group rather than its small piece |
| `position` | `[x, y, z]` the hit point, in model coordinates |
| `distance` | Distance from the camera |

`hit` = `null` if the background was clicked. Returns a `stop()` function.

## Camera

### `fitView(id, name)`

Smoothly moves the camera so the whole model fits on screen. With `name`, only that part; `name` may also be an array of names, e.g. `["Sektor_1", "Sektor_2", "Sektor_3"]`.

### `setCameraView(id, view, animate = true)` and `getCameraView(id)`

`view` = `{ yaw, pitch, distance, target }`, only what is given:

- `yaw` — angle around the model, in degrees. 0 = from the front (the +Z direction).
- `pitch` — angle from above, in degrees, -89 to 89.
- `distance` — distance from the camera to `target`, in model units.
- `target` — `[x, y, z]` the point being looked at.

`getCameraView` returns the same values. Save them and set them again to "bookmark" a viewpoint.

### `setAutoRotate(id, degreesPerSecond)`

Spins the model continuously; `0` = stop. It also stops as soon as the user touches the model.

## `clearModel(id)` and `removeViewer(id)`

`clearModel` removes the model but keeps the viewer. `removeViewer` removes the viewer along with its WebGL context; the element itself remains.

## Built-in Interactions

| Action | Result |
|---|---|
| Drag with the mouse or one finger | rotates the model |
| Right-click + drag, Shift/Ctrl + drag, or two-finger drag | pans the view |
| Mouse wheel / pinch | zoom |
| Double-click | centers the camera on that point and moves closer |
| Click / tap | `onModelClick` |
| Arrow keys (when the viewer has focus) | rotate by 10° |
| `+` / `-` (when the viewer has focus) | zoom |

Users who enable *reduce motion* in their system get camera moves without animation and no auto-rotation.

## glTF Support

| Supported | Not yet supported |
|---|---|
| `.glb` and `.gltf` (embedded buffer, `data:` URI, or a separate `.bin` file) | meshopt compression — re-export without compression |
| **Draco** compression (`KHR_draco_mesh_compression`), see the [Draco notes](#draco) | |
| Nested nodes with `matrix` or translation/rotation/scale | |
| ***Skinning*** — characters or organs whose surface bends to follow bones, up to 64 bones per mesh | More than 64 bones (or more than the GPU can handle) — shown in a rest pose, with a warning |
| Node animation, played with [`playAnimation`](model3dtools#getanimationsid-and-playanimationid-animation-options) in `model3dtools.js` | |
| Base color, color textures (PNG/JPEG), per-vertex color (`COLOR_0`) | Normal maps, *occlusion*, and metallic/roughness textures |
| `metallicFactor`, `roughnessFactor`, `emissiveFactor` | *Morph targets*, cameras and lights from the file |
| Transparent (`BLEND`) and cutout (`MASK`), double-sided | `KHR_texture_transform` and other material extensions |
| All accessor types (Float32, Int8/16, Uint8/16/32), interleaved data, sparse | |
| `KHR_materials_unlit`, `KHR_materials_emissive_strength`, `KHR_mesh_quantization` | |

### Draco

Draco-compressed models (many models from Sketchfab and from export tools that shrink files) are decoded with **Google's official decoder** in WebAssembly. That decoder (about 300 KB) is downloaded only when a model that uses it is loaded — pages with ordinary models download nothing extra. By default it comes from `www.gstatic.com`; for apps that must run without Google's servers, copy both decoder files to your own server and set the `dracoDecoder` option.

### Skinning

Skinned meshes are driven by their bones (glTF nodes), so animation from [`playAnimation`](model3dtools#getanimationsid-and-playanimationid-animation-options) or `setPartTransform` on a bone bends the surface directly. Clicks and bounding boxes (`fitView`, hotspots) use the bone-deformed positions.

The lighting is simple: sky/ground light plus one directional light that follows the camera, with shininess based on `roughness`. It is enough to see shape and color clearly, but it is not full PBR with environment maps like Three.js or `<model-viewer>`.

## Styling

| Class | Element |
|---|---|
| `.crootjs-3d` | The viewer (contains the canvas and overlay). Its default background is set here and can be overridden from the page's CSS |
| `.crootjs-3d-loading` | Added to `.crootjs-3d` while a model is loading, e.g. to show a *spinner* |
| `.crootjs-3d-dragging` | Added while the model is being rotated/panned |
| `canvas.crootjs-3d-canvas` | The WebGL canvas |
| `.crootjs-3d-overlay` | HTML layer above the canvas (where hotspots and gizmos go) |

## Writing Your Own Add-on

`createViewer` attaches a small interface to its element, in the `crootjs3d` property. That is how [`model3dtools.js`](model3dtools) works without importing `model3d.js` (which would load a second copy with a separate list of viewers).

| `crootjs3d` member | Purpose |
|---|---|
| `root`, `canvas`, `overlay` | The viewer element, its canvas, and the HTML layer above it |
| `requestRender()` | Requests a redraw on the next frame |
| `onRender(runFunction)` | Called after every draw; returns `stop()` |
| `onModel(runFunction)` | Called every time the model is replaced or removed; returns `stop()` |
| `camera()` | `{ eye, target, forward, right, up, viewProj, fov, width, height }` |
| `toScreen([x, y, z])` | Model point → `[x, y, depth]` pixels on the canvas, or `null` if behind the camera |
| `rayAt([x, y])`, `raycast(origin, direction, skip?)` | A ray from the camera through a screen point, and the first surface hit: `{ node, t, position }` |
| `findParts(name)`, `isShown(node)`, `boundsOf(nodes)` | Nodes named `name`, whether they are shown, and their bounding box |
| `getTransform(node)`, `setTransform(node, transform)` | Same as `getPartTransform`/`setPartTransform`, for a single node |
| `getModel()` | The loaded model: `{ source: { json, buffers, images }, nodes, roots }` |
| `readAccessor(index)` | glTF accessor data: `{ array, size, componentType, normalized, count }` |
| `update()` | After a node's `translation`/`rotation`/`scale` is changed directly (e.g. by animation), recompute and redraw |
| `setClip(plane, cap)` | Clipping plane `[nx, ny, nz, w]` (points with `n·p + w > 0` are discarded) and the color of the cut surface; `null` = no clipping |
| `parseColor(color)` | CSS color → linear `[r, g, b, a]` |

## Notes

- **No WebGPU.** A second backend would double the module's size, while WebGL2 is already available in nearly every browser and WebGL1 covers the rest.
- Models from other domains must allow CORS. Files opened directly from disk (`file://`) cannot be `fetch`ed; run through a local server, or open the file with `<input type="file">`.
- glTF units are meters with the Y axis up. Models from CAD applications that use millimeters will appear 1000× larger — the camera still adjusts, but `position` and `bounds` are in those units.
- Clicks are computed on the CPU against every triangle. A million-triangle model takes about 1 ms per click; no problem for ordinary models.
