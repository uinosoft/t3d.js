t3d.js
========

[![Issues][issues-badge]][issues-badge-url]

t3d.js is a web-first, light weight, extendable 3D rendering library.

*Note: The current interface is not stable, especially the RenderPass related interface, which may change in subsequent versions.*

Mostly inspired by three.js, but with improvements in the renderer and many implementation details.

[Examples](https://uinosoft.github.io/t3d.js/examples/) &mdash;
[Documentation](https://uinosoft.github.io/t3d.js/docs/)

### Usage ###

Use `t3d.js` or `t3d.min.js` in your page:

````html
<script src="t3d.min.js"></script>
````

or import as es6 module:

````javascript
import * as t3d from 't3d.module.js';
````

draw a simple cube:

````javascript
const width = window.innerWidth || 2;
const height = window.innerHeight || 2;

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2", {
  antialias: true,
  alpha: false
});
const renderer = new t3d.Renderer(gl);
renderer.renderPass.setClearColor(0.1, 0.1, 0.1, 1);
const backRenderTarget = new t3d.RenderTargetBack(canvas);

const scene = new t3d.Scene();

const geometry = new t3d.BoxGeometry(8, 8, 8);
const material = new t3d.PBRMaterial();
const mesh = new t3d.Mesh(geometry, material);
scene.add(mesh);

const ambientLight = new t3d.AmbientLight(0xffffff);
scene.add(ambientLight);

const directionalLight = new t3d.DirectionalLight(0xffffff);
directionalLight.position.set(-5, 5, 5);
directionalLight.lookAt(new t3d.Vector3(), new t3d.Vector3(0, 1, 0));
scene.add(directionalLight);

const camera = new t3d.Camera();
camera.position.set(0, 10, 30);
camera.lookAt(new t3d.Vector3(0, 0, 0), new t3d.Vector3(0, 1, 0));
camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);
scene.add(camera);

function loop(count) {
  requestAnimationFrame(loop);

  mesh.euler.y = count / 1000 * .5; // rotate cube

  scene.updateMatrix();
  scene.updateRenderStates(camera);
  scene.updateRenderQueue(camera);

  renderer.renderPass.setRenderTarget(backRenderTarget);
  renderer.renderPass.clear(true, true, false);
  renderer.renderScene(scene, camera);
}
requestAnimationFrame(loop);
````

### Build ###

Use npm to build:

````
npm install
````

````
npm run build
````

[issues-badge]: https://img.shields.io/github/issues/uinosoft/t3d.js.svg
[issues-badge-url]: https://github.com/uinosoft/t3d.js/issues