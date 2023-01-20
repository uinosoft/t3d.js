import {
	Attribute,
	BUFFER_USAGE,
	Buffer,
	Camera,
	Geometry,
	Mesh,
	ShaderMaterial,
	Vector2,
	Vector4
} from 't3d';

class Canvas2D extends Mesh {

	constructor(width = 640, height = 800, isScreenCanvas = true, screenMatchMode = SCREEN_MATCH_MODE.CONSTANT) {
		const geometry = new Geometry();
		const buffer = new Buffer(new Float32Array(), 5);
		buffer.usage = BUFFER_USAGE.DYNAMIC_DRAW;
		geometry.addAttribute("a_Position", new Attribute(buffer, 3, 0));
		geometry.addAttribute("a_Uv", new Attribute(buffer, 2, 3));
		geometry.setIndex(new Attribute(new Buffer(new Uint16Array([]), 1)));

		super(geometry, []);

		this.buffer = buffer;

		const sharedMaterial = new ShaderMaterial(canvas2dShader);
		sharedMaterial.depthWrite = false;
		sharedMaterial.transparent = true;

		this.sharedMaterial = sharedMaterial;

		this.sprites = [];
		this.materialInfoArray = [];

		// screen space canvas or world space canvas
		this.isScreenCanvas = isScreenCanvas;

		// the size in world space
		this._size = new Vector2(width, height);

		// the resolution size of screen canvas
		this._resolutionSize = new Vector2(width, height);
		// screen match mode
		this._screenMatchMode = screenMatchMode;
		// set the same size with the renderer viewport
		this._renderViewport = new Vector4(0, 0, width, height);
		// if screen match mode is SCREEN_MATCH_MODE.CONSTANT, use this
		this._scaleFactor = 1;

		// real viewport after calculate with screen match mode
		this.viewport = new Vector4();

		// screen canvas used ortho camera
		this.orthoCamera = new Camera();
		this.orthoCamera.setOrtho(-width / 2, width / 2, -height / 2, height / 2, 0, 1);
		this.orthoCamera.viewMatrix.getInverse(this.orthoCamera.worldMatrix); // update view matrix

		this._vertices = [];
		this._indices = [];

		this._2dChildren = [];

		this.frustumCulled = false;

		// higher render order than other
		this.renderOrder = 10000;
	}

	setSize(width, height) {
		if (this.isScreenCanvas) {
			this._resolutionSize.set(width, height);
			this._screenMatchMode.call(this);
			this._updateCamera();
		} else {
			this._size.set(width, height);
		}
	}

	setRenderViewport(x, y, w, h) {
		if (this._renderViewport.x !== x ||
			this._renderViewport.y !== y ||
			this._renderViewport.z !== w ||
			this._renderViewport.w !== h) {
			this._renderViewport.set(x, y, w, h);
			this._screenMatchMode.call(this);
			this._updateCamera();
		}
	}

	setScaleFactor(value) {
		if (this._scaleFactor !== value) {
			this._scaleFactor = value;
			this._screenMatchMode.call(this);
			this._updateCamera();
		}
	}

	setScreenMatchMode(mode) {
		if (this._screenMatchMode !== mode) {
			this._screenMatchMode = mode;
			this._screenMatchMode.call(this);
			this._updateCamera();
		}
	}

	_updateCamera() {
		if (this.isScreenCanvas) {
			this.orthoCamera.setOrtho(-this._resolutionSize.x / 2, this._resolutionSize.x / 2, -this._resolutionSize.y / 2, this._resolutionSize.y / 2, 0, 1);
			this.orthoCamera.viewMatrix.getInverse(this.orthoCamera.worldMatrix); // update view matrix
		}
	}

	/**
	 * add child to canvas2d
	 */
	add(object) {
		this._2dChildren.push(object);
	}

	/**
	 * remove child from canvas2d
	 */
	remove(object) {
		const index = this._2dChildren.indexOf(object);
		if (index !== -1) {
			this._2dChildren.splice(index, 1);
		}
	}

	updateSprites() {
	// update attributes and indices

		const vertices = this._vertices,
			indices = this._indices;

		let vertexIndex = 0,
			indexIndex = 0;

		const sprites = this.sprites;

		const width = this.isScreenCanvas ? this._resolutionSize.x : this._size.x;
		const height = this.isScreenCanvas ? this._resolutionSize.y : this._size.y;

		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];

			const x = 0;
			const y = 0;
			const w = sprite.width;
			const h = sprite.height;

			let _x, _y;
			const t = sprite.worldMatrix.elements;
			const a = t[0],
				b = t[1],
				c = t[3],
				d = t[4],
				tx = t[6] - width / 2,
				ty = height / 2 - t[7] - h;

			_x = x;
			_y = y;
			vertices[vertexIndex++] = a * _x + c * _y + tx;
			vertices[vertexIndex++] = b * _x + d * _y + ty;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 1;

			_x = x + w;
			_y = y;
			vertices[vertexIndex++] = a * _x + c * _y + tx;
			vertices[vertexIndex++] = b * _x + d * _y + ty;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 1;
			vertices[vertexIndex++] = 1;

			_x = x + w;
			_y = y + h;
			vertices[vertexIndex++] = a * _x + c * _y + tx;
			vertices[vertexIndex++] = b * _x + d * _y + ty;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 1;
			vertices[vertexIndex++] = 0;

			_x = x;
			_y = y + h;
			vertices[vertexIndex++] = a * _x + c * _y + tx;
			vertices[vertexIndex++] = b * _x + d * _y + ty;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 0;
			vertices[vertexIndex++] = 0;

			const vertCount = vertexIndex / 5 - 4;

			indices[indexIndex++] = vertCount + 0;
			indices[indexIndex++] = vertCount + 1;
			indices[indexIndex++] = vertCount + 2;
			indices[indexIndex++] = vertCount + 2;
			indices[indexIndex++] = vertCount + 3;
			indices[indexIndex++] = vertCount + 0;
		}

		vertices.length = vertexIndex;
		indices.length = indexIndex;

		const geometry = this.geometry;

		this.buffer.array = new Float32Array(vertices);
		this.buffer.count = this.buffer.array.length / this.buffer.stride;
		geometry.index.buffer.array = new Uint16Array(indices);
		geometry.index.buffer.count = geometry.index.buffer.array.length;

		this.buffer.version++;
		geometry.index.version++;

		// push groups

		let currentTexture, currentCount = 0, currentOffset = 0;
		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			if (currentTexture !== sprite.texture) {
				if (geometry.groups[currentCount]) {
					geometry.groups.start = currentOffset;
					geometry.groups.count = 6;
					geometry.groups.materialIndex = currentCount;
				} else {
					geometry.groups.push({
						start: currentOffset,
						count: 6,
						materialIndex: currentCount
					});
				}
				this.material[currentCount] = this.sharedMaterial;

				this.materialInfoArray[currentCount] = sprite.texture;

				currentCount++;
				currentOffset += 6;
				currentTexture = sprite.texture;
			} else {
				geometry.groups[currentCount - 1].count += 6;
			}
		}

		geometry.groups.length = currentCount;
		this.materialInfoArray.length = currentCount;
	}

	// override
	updateMatrix(force) {
		Mesh.prototype.updateMatrix.call(this, force);

		this.sprites = [];

		const children = this._2dChildren;
		for (let i = 0, l = children.length; i < l; i++) {
			this.cacheSprites(children[i]);
		}

		const sprites = this.sprites;
		for (let i = 0, l = sprites.length; i < l; i++) {
			sprites[i].updateMatrix();
		}

		// update geometry
		this.updateSprites();
	}

	cacheSprites(object) {
		const sprites = this.sprites;

		sprites.push(object);

		for (let i = 0, l = object.children.length; i < l; i++) {
			this.cacheSprites(object.children[i]);
		}
	}

}

const canvas2dShader = {

	name: 'canvas2d_common',

	uniforms: {
		'spriteTexture': null
	},

	vertexShader: `
		#include <common_vert>
		attribute vec2 a_Uv;
		varying vec2 v_Uv;
		void main() {
			#include <begin_vert>
			#include <pvm_vert>
			v_Uv = a_Uv;
		}
	`,

	fragmentShader: `
		#include <common_frag>
		varying vec2 v_Uv;
		uniform sampler2D spriteTexture;
		void main() {
			#include <begin_frag>
			outColor *= texture2D(spriteTexture, v_Uv);
			#include <end_frag>
			#include <premultipliedAlpha_frag>
		}
	`

};

function constant() {
	const renderViewport = this._renderViewport;
	const curViewX = renderViewport.x;
	const curViewY = renderViewport.y;
	const curViewW = renderViewport.z;
	const curViewH = renderViewport.w;

	const scaleFactor = this._scaleFactor;

	let resultX, resultY, resultW, resultH;
	resultX = curViewX;
	resultY = curViewY;
	resultW = curViewW;
	resultH = curViewH;

	this._resolutionSize.set(resultW / scaleFactor, resultH / scaleFactor);

	this.viewport.set(resultX, resultY, resultW, resultH);
}

function shrink() {
	const renderViewport = this._renderViewport;
	const curViewX = renderViewport.x;
	const curViewY = renderViewport.y;
	const curViewW = renderViewport.z;
	const curViewH = renderViewport.w;

	const resolutionSize = this._resolutionSize.copy(this._size);

	const screenRate = (curViewW - curViewX) / (curViewH - curViewY);
	const resolutionRate = resolutionSize.x / resolutionSize.y;
	const widthBigger = resolutionRate > screenRate;

	let resultX, resultY, resultW, resultH;
	if (widthBigger) {
		resultW = curViewW;
		resultH = Math.floor(resultW / resolutionRate);
	} else {
		resultH = curViewH;
		resultW = Math.floor(resultH * resolutionRate);
	}
	resultX = Math.floor((curViewW - resultW) / 2) + curViewX;
	resultY = Math.floor((curViewH - resultH) / 2) + curViewY;

	this.viewport.set(resultX, resultY, resultW, resultH);
}

function expand() {
	const renderViewport = this._renderViewport;
	const curViewX = renderViewport.x;
	const curViewY = renderViewport.y;
	const curViewW = renderViewport.z;
	const curViewH = renderViewport.w;

	const resolutionSize = this._resolutionSize.copy(this._size);

	const screenRate = (curViewW - curViewX) / (curViewH - curViewY);
	const resolutionRate = resolutionSize.x / resolutionSize.y;
	const widthBigger = resolutionRate > screenRate;

	let resultX, resultY, resultW, resultH;
	if (widthBigger) {
		resultH = curViewH;
		resultW = Math.floor(resultH * resolutionRate);
	} else {
		resultW = curViewW;
		resultH = Math.floor(resultW / resolutionRate);
	}
	resultX = Math.floor((curViewW - resultW) / 2) + curViewX;
	resultY = Math.floor((curViewH - resultH) / 2) + curViewY;

	this.viewport.set(resultX, resultY, resultW, resultH);
}

const SCREEN_MATCH_MODE = {
	CONSTANT: constant,
	SHRINK: shrink,
	EXPAND: expand
};

Canvas2D.SCREEN_MATCH_MODE = SCREEN_MATCH_MODE;

export { Canvas2D };