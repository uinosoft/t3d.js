# ThingJS 3D Engine

[![NPM Package][npm]][npm-url]
![npm-size][npm-size-url]
[![Issues][issues-badge]][issues-badge-url]
[![DeepScan grade][deepscan]][deepscan-url]
[![Discord][discord]][discord-url]
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/uinosoft/t3d.js)

ThingJS 3D Engine (t3d) is a lightweight, web-first, and extendable 3D rendering library. It is used by ThingJS for web3d rendering, but can also be used as a standalone library.

[Examples](https://uinosoft.github.io/t3d.js/examples/) &mdash;
[Docs](https://uinosoft.github.io/t3d.js/docs/) &mdash;
[Discord](https://discord.gg/urB54PPXc4)

## Import

Use `t3d.js` or `t3d.min.js` in your page:

````html
<script src="t3d.min.js"></script>
````

or import as es6 module:

````javascript
import * as t3d from 't3d.module.js';
````

## Npm

t3d is published on npm. To install, use:

````
npm install t3d --save
````

This will allow you to import t3d entirely using:

````javascript
import * as t3d from 't3d';
````

or individual classes using:

````javascript
import { Scene, Renderer } from 't3d';
````

Since v0.2.0, the JavaScript files in `examples/jsm` can be imported like this:

````javascript
import { OrbitControls } from 't3d/addons/controls/OrbitControls.js';
````

## CDN

* https://unpkg.com/t3d@latest/build/t3d.min.js
* https://unpkg.com/t3d@latest/build/t3d.module.js

* https://cdn.jsdelivr.net/npm/t3d@latest/build/t3d.min.js
* https://cdn.jsdelivr.net/npm/t3d@latest/build/t3d.module.min.js

## Quick Start

Create a simple rotating cube with PBR materials:

````javascript
// Initialize renderer with WebGL2
const width = window.innerWidth || 2;
const height = window.innerHeight || 2;

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

// Create WebGL2 context and renderer
const gl = canvas.getContext('webgl2', {
  antialias: true,
  alpha: false
});
const renderer = new t3d.WebGLRenderer(gl);
renderer.setClearColor(0.1, 0.1, 0.1, 1);
const backRenderTarget = new t3d.RenderTargetBack(canvas);

// Create scene
const scene = new t3d.Scene();

// Create mesh with PBR material
const geometry = new t3d.BoxGeometry(8, 8, 8);
const material = new t3d.PBRMaterial();
const mesh = new t3d.Mesh(geometry, material);
scene.add(mesh);

// Add lighting
const ambientLight = new t3d.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionalLight = new t3d.DirectionalLight(0xffffff);
directionalLight.position.set(-5, 5, 5);
directionalLight.lookAt(new t3d.Vector3(), new t3d.Vector3(0, 1, 0));
scene.add(directionalLight);

// Set up camera
const camera = new t3d.Camera();
camera.position.set(0, 10, 30);
camera.lookAt(new t3d.Vector3(0, 0, 0), new t3d.Vector3(0, 1, 0));
camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);
scene.add(camera);

// Animation loop
function loop(count) {
  requestAnimationFrame(loop);

  // Rotate cube
  mesh.euler.y = count / 1000 * .5;

  scene.updateMatrix();
  scene.updateRenderStates(camera);
  scene.updateRenderQueue(camera);

  // Render scene
  renderer.setRenderTarget(backRenderTarget);
  renderer.clear(true, true, false);
  renderer.renderScene(scene, camera);
}
requestAnimationFrame(loop);
````

## Extensions

* [t3d-effect-composer](https://github.com/uinosoft/t3d-effect-composer) - Post Effects extension for t3d.js.
* [t3d-particle](https://github.com/uinosoft/t3d-particle) - This is a particle system developed based on t3d.js.
* [t3d-pano](https://github.com/uinosoft/t3d-pano) - Panorama extension for t3d.
* [t3d-3dtiles](https://github.com/uinosoft/t3d-3dtiles) - A 3dtile extension based on t3d.js.
* [t3d-dynamic-sky](https://github.com/uinosoft/t3d-dynamic-sky) - Dynamic sky addon for t3d.
* [t3d-gaussian-splatting](https://github.com/uinosoft/t3d-gaussian-splatting) - A t3d-based implementation of 3D Gaussian Splatting.

## Tools

* [t3d-model-viewer](https://uinosoft.github.io/t3d-model-viewer/) - A Model Viewer based on t3d.js and t3d-effect-composer.
* [t3d-particle-editor](https://uinosoft.github.io/t3d-particle/editor) - A particle editor based on t3d.js and t3d-particle.
* [t3d-ibl-baker](https://uinosoft.github.io/t3d-ibl-baker/) - This is a simple tool to bake IBL maps for t3d.

## Contributing

Please make sure to read the [Contributing Guide](./.github/contributing.md) before making a pull request.

[npm]: https://img.shields.io/npm/v/t3d
[npm-url]: https://www.npmjs.com/package/t3d
[npm-size-url]: https://img.shields.io/bundlephobia/minzip/t3d
[issues-badge]: https://img.shields.io/github/issues/uinosoft/t3d.js.svg
[issues-badge-url]: https://github.com/uinosoft/t3d.js/issues
[deepscan]: https://deepscan.io/api/teams/20241/projects/25542/branches/800776/badge/grade.svg
[deepscan-url]: https://deepscan.io/dashboard#view=project&tid=20241&pid=25542&bid=800776
[discord]: https://img.shields.io/discord/1069800954494464043
[discord-url]: https://discord.gg/urB54PPXc4