*[Bahasa Indonesia](../loading)*

## Documentation: loading.js
The `loading.js` module provides a visual asset in the form of a lightweight, elegant SVG-based loading animation. It is designed to give users visual feedback while the application is performing an asynchronous process (such as fetching data from an API).

## Key Features
-Vector Based: The animation stays sharp and crisp at any screen resolution (Retina/4K).
-Zero Dependencies: No external image files (.gif/.png) or additional CSS libraries are needed.
-Microsoft Style: Uses an animation of 8 dots in a circle with smooth spline transitions.
-Performance: Because it is an SVG text string, rendering is almost instant.

## Variable Structure
The loading variable exports an HTML string containing an <svg> element.
Technical Specifications
ID: loading
-Default Dimensions: 80px x 80px
-ViewBox: 0 0 100 100
-Circle Colors: Multi-color (#e15b64, #f47e60, #f8b26a, #abbd81, #849b87).

## Animation Mechanism
This animation does not use external CSS Animation; instead it uses the SMIL (Synchronized Multimedia Integration Language) feature embedded directly in the SVG through the <animateTransform> tag.

-Motion Type: rotate (360-degree rotation).
-Duration: 1.5 seconds per cycle.
-Calc Mode: spline (Produces smooth acceleration and deceleration, not as stiff as linear).
-Interactivity: The animation runs indefinitely (continuously) as soon as the element is inserted into the DOM.
