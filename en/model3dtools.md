*[Bahasa Indonesia](../model3dtools)*

# `model3dtools.js` Module Documentation

`model3dtools.js` is an add-on module for [`model3d.js`](model3d) with tools for apps that modify a model rather than just display it:

- **Hotspots** — HTML labels pinned to a point or part of the model that move with it as the model rotates, and dim when hidden behind it.
- **Gizmo** — move, rotate, and scale handles for changing a part directly on screen with a mouse or finger.
- **Animation** — plays the animations stored in the glTF file, with play/pause/scrub controls.
- **Exploded view** — spreads the model's parts away from their center, like an assembly drawing.
- **Cross-section** — slices the model with a plane to see its inside.
- **AR** — opens the model in the room through the phone camera (Scene Viewer on Android, AR Quick Look on iPhone).
- **GLB export** — saves the model with all its changes as a new `.glb` file.

The middle three suit learning materials well: anatomy, engines, buildings, lab equipment. This module is separate from `model3d.js` so pages that only display a model don't have to download it (about 8 KB gzip).

## Usage (Import)

```javascript
import { createViewer, loadModel } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3d.js";
import { addHotspot, enableTransform, getAnimations, playAnimation, explodeModel, addSection, addARButton, getARLink, exportGLB, downloadGLB } from "https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.28/model3dtools.js";
```

The viewer must already be created with `createViewer`. Hotspots and gizmos that refer to a part name need the model to be loaded, so call them inside `loadModel`'s `responseFunction`.

## `addHotspot(id, anchor, content, options)`

Pins an HTML element or text to the model.

- `anchor` — a **part name** (pinned to the center of that part, and follows it if the part is moved), or **`[x, y, z]`** model coordinates.
- `content` — a DOM element (moved on top of the viewer), or text.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `at` | `"center"` | `"top"` = center of that part's top side, good for a label above an object |
| `offset` | `[0, 0, 0]` | Extra offset in model units, e.g. `[0, 0.5, 0]` slightly above it |
| `occlude` | `true` | The label is dimmed (class `.crootjs-3d-hotspot-hidden`) when its point is hidden behind another part of the model. `false` = always clear |
| `onClick` | — | Function called when the label is clicked |
| `className` | — | Extra CSS class |

Returns a `remove()` function. The hotspot is also hidden when its part is hidden with `setPartVisible`.

```javascript
loadModel("model", "models/bts.glb", () => {
    addHotspot("model", "Antena_1", "Sektor 1 · 0°", { at: "top" });
    addHotspot("model", "Kabinet", "Kabinet BBU", { onClick: () => tampilkanDetail("Kabinet") });
    addHotspot("model", [0, 30, 0], "Puncak 30 m");
});
```

For a label whose content changes (e.g. a sensor reading), pass your own element and change its content any time — the hotspot does not need to be recreated:

```javascript
const nilai = document.createElement("span");
addHotspot("model", "Antena_1", nilai, { at: "top" });
nilai.textContent = "RSRP -87 dBm";
```

## `enableTransform(id, name, mode, onChange)`

Shows a gizmo on part `name` so it can be changed directly on screen. There is only one gizmo per viewer: calling it again moves the gizmo to another part.

| `mode` | Handles | Result |
|---|---|---|
| `"translate"` | Red/green/blue arrows for the X/Y/Z axes | Moves along that axis |
| `"rotate"` | Three rings | Rotates around that axis. Hold **Shift** for 15° steps |
| `"scale"` | Boxes at the axis ends, plus an orange box in the center | Scales one axis, or uniformly |

`onChange(info)` is called continuously while dragging, and once more on release. `info` is the same as [`getPartTransform`](model3d#getparttransformid-name-and-setparttransformid-name-transform) plus `part` (the part name) and `dragging` (`false` on the last call — the right moment to save to a server).

The move and rotate axes follow the part's **parent** axes, so they match the reported `position` and `rotation` values. The scale axes follow the part itself. While a handle is being dragged, the camera does not rotate.

Returns `{ setMode(mode), remove() }`. The gizmo disappears on its own when the model is replaced.

```javascript
let gizmo = null;

onModelClick("model", (hit) => {
    if (gizmo) gizmo.remove();
    gizmo = hit ? enableTransform("model", hit.part, "rotate", (info) => {
        if (!info.dragging) simpanKeServer(info.part, info.rotation);
    }) : null;
});

onClick("mode-geser", () => gizmo && gizmo.setMode("translate"));
```

## `getAnimations(id)` and `playAnimation(id, animation, options)`

`getAnimations` gives the list of animations in the model file: `[{ index, name, duration }]`, `duration` in seconds. A model without animations gives `[]`.

`playAnimation` plays an animation. `animation` = its name or index (default `0`, the first one).

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `loop` | `true` | `false` = stop at the end |
| `speed` | `1` | Speed: `0.5` = half, `2` = double, negative = backwards |
| `autoplay` | `true` | `false` = prepared but not yet running, e.g. to be driven by a slider |
| `onUpdate` | — | Function `(time, duration)` every frame, e.g. to move a time slider |
| `onEnd` | — | Function called when the animation finishes (only with `loop: false`) |

Returns a controller:

| Member | Purpose |
|---|---|
| `play()`, `pause()` | Play and pause |
| `stop()` | Stops and returns the parts to their positions before the animation |
| `seek(seconds)` | Jumps to a given second, including while paused — for a time slider |
| `setSpeed(speed)`, `isPlaying()`, `time()`, `duration` | Speed, whether it is playing, current time, and the animation's length |

```javascript
loadModel("model", "models/mesin.glb", () => {
    const animasi = playAnimation("model", "Langkah_Hisap", {
        loop: false,
        onUpdate: (time) => setValue("waktu", time),
    });
    onInput("waktu", () => animasi.seek(Number(getValue("waktu"))));
});
```

What gets played is **node** motion (position, rotation, scale) with `STEP`, `LINEAR`, and `CUBICSPLINE` interpolation — enough for engines, gears, doors, assemblies, or orbiting planets. Animations that bend the surface (*skinning*, e.g. a walking character, and *morph targets*) are not yet supported: the bones move, but the surface stays still.

## `explodeModel(id, amount, options)`

Spreads the model's parts away from their center. `amount`: `0` = together (original positions), `1` = fully separated, values in between are allowed — good for a slider.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `part` | automatic | Name of the part whose **children** are separated. Default: the first level from the top that branches |
| `distance` | `1` | Distance multiplier. With `1`, at `amount` 1 each part's distance from the center doubles |
| `animate` | `true` | `false` = move instantly. Use `false` for values from a slider, so it follows the finger without lag |

Each part moves straight away from its group's center. Going back to `0` restores the original positions exactly; the positions at that moment also become the reference for the next separation.

```javascript
onInput("pisah", () => {
    explodeModel("model", Number(getValue("pisah")), { part: "Mesin", animate: false });
});
```

Animation, the gizmo, and the exploded view all change part positions. Return the exploded view to `0` before playing an animation or using the gizmo on the same parts.

## `addSection(id, options)`

Slices the model with a plane. The cut-away side is not drawn and cannot be clicked; the cut surface is filled with a flat color, so hollow objects look like solids split open. Hotspots whose points are cut away are hidden.

`options` (all optional):

| Option | Default | Description |
|---|---|---|
| `axis` | `"x"` | `"x"` = vertical plane splitting left-right, `"z"` = vertical front-back, `"y"` = horizontal; or `[x, y, z]` the direction of a tilted plane |
| `position` | `0.5` | Position of the plane along that axis: `0` = the model's lower end (model whole), `1` = upper end (model gone) |
| `flip` | `false` | `true` = the opposite side is discarded |
| `color` | the part's color, darkened | CSS color of the cut surface, e.g. `"#facc15"` to make the slice stand out |

Only one section per viewer; calling again replaces the old one. Returns `{ set(options), remove() }` — `set` changes some of the options, e.g. from a slider:

```javascript
const potongan = addSection("model", { axis: "x", color: "#facc15" });
onInput("letak", () => potongan.set({ position: Number(getValue("letak")) }));
onClick("utuh", () => potongan.remove());
```

## `addARButton(id, url, options)` and `getARLink(url, options)`

A **"Lihat di AR"** ("View in AR") button in the corner of the viewer: the model is placed in the real room through the phone camera, and can be moved and rotated with a finger.

| Device | What happens |
|---|---|
| Android | Opens **Scene Viewer** (Google's app) with the `url` file |
| iPhone/iPad | Opens **AR Quick Look** — only if `options.usdz` is set, because Quick Look cannot open `.glb`. Convert it to `.usdz` first (e.g. with Apple's Reality Converter) |
| Others (desktop) | The button is not added |

`url` must be a `.glb`/`.gltf` file publicly downloadable over HTTPS — not a local file or a `blob:` from `exportGLB`, because another app opens it.

`options` (all optional): `title` (title in Scene Viewer), `usdz` (file for iPhone/iPad), `label` (default "Lihat di AR"), `mode` (`"ar_preferred"` default, `"ar_only"`, `"3d_only"`), `fallback` (page to use if Scene Viewer is not available; default this page).

Returns `{ supported, remove() }` — `supported` = `false` if the button was not added on this device.

`getARLink(url, options)` gives just the Scene Viewer link, for your own button or QR code.

```javascript
loadModel("model", "https://contoh.id/models/bts.glb", () => {
    addARButton("model", "https://contoh.id/models/bts.glb", { title: "Menara BTS", usdz: "https://contoh.id/models/bts.usdz" });
});
```

## `exportGLB(id, responseFunction)` and `downloadGLB(id, filename, responseFunction)`

Assembles the currently displayed model into a single `.glb` file, with all its changes:

- position, rotation, and scale from the gizmo or `setPartTransform`;
- colors from `setPartColor` (that part gets a new material, so other parts using the same material are not changed);
- parts hidden with `setPartVisible` are removed from the scene;
- external buffers and textures of a `.gltf` model are packed into the single file.

`exportGLB` passes a `Blob` (type `model/gltf-binary`) to `responseFunction(blob)` and also returns it as a Promise — e.g. for uploading to a server. `downloadGLB` downloads it directly as `filename` (default `"model.glb"`). If there is no model yet, `blob` = `null`.

```javascript
onClick("unduh", () => downloadGLB("model", "bts-editan.glb"));

// or upload to a server
onClick("simpan", async () => {
    const form = new FormData();
    form.append("model", await exportGLB("model"), "bts.glb");
    fetch("https://contoh.server/api/model", { method: "POST", body: form });
});
```

The resulting file can be opened again with `loadModel`, in Blender, or in other glTF viewers.

## Styling

Everything can be overridden from the page's CSS without `!important`.

| Class | Element |
|---|---|
| `.crootjs-3d-hotspot` | Hotspot label. The blue dot below it is `::after` |
| `.crootjs-3d-hotspot-hidden` | A hotspot whose point is hidden by the model (default: dimmed) |
| `.crootjs-3d-hotspot-clickable` | A hotspot that has `onClick` |
| `a.crootjs-3d-ar` | The "Lihat di AR" button |
| `svg.crootjs-3d-gizmo` | The gizmo |
| `.crootjs-3d-gizmo-x`, `-y`, `-z`, `-all` | Color of each axis (via `color`), and the uniform-scale handle |
| `.crootjs-3d-gizmo-line`, `-knob`, `-hit` | The visible line/ring, the handle tip, and the click area wider than the line |

## Notes

- The gizmo and hotspots are drawn as SVG/HTML on top of the canvas, so they stay sharp and are easy to style, and the gizmo is always visible even when its part is hidden behind another.
- For a part name used by several nodes: the gizmo grabs the first one, the hotspot is pinned to the center of all of them.
- Export copies the original model data as-is; old meshes and materials that are no longer used stay in the file (still valid, just slightly larger).
