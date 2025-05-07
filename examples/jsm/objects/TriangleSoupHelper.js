import {
	Attribute,
	Geometry,
	Buffer,
	Mesh,
	BasicMaterial,
	DRAW_MODE,
	Object3D
} from 't3d';
import { GeometryUtils } from '../geometries/GeometryUtils.js';

/**
 * TriangleSoupHelper
 */
export class TriangleSoupHelper extends Object3D {

	constructor(triangleSoup) {
		super();

		this.triangleSoup = triangleSoup;

		const geometry = new Geometry();
		const material = new BasicMaterial();
		material.diffuse.setRGB(0.0, 0.5, 1.0);
		material.transparent = true;
		material.opacity = 0.5;
		material.depthWrite = false;
		material.envMap = undefined;
		this.mesh = new Mesh(geometry, material);
		this.add(this.mesh);

		this.wireframeMesh = null;

		this.update();
	}

	wireframe(value) {
		if (value === !!this.wireframeMesh) return this;

		if (value) {
			const geometry = this.mesh.geometry.clone();
			geometry.index = GeometryUtils.getWireframeAttribute(geometry);
			geometry.computeBoundingBox();
			geometry.computeBoundingSphere();
			const material = new BasicMaterial();
			material.diffuse.setRGB(0.08, 0.08, 0.08);
			material.drawMode = DRAW_MODE.LINES;
			material.transparent = true;
			material.opacity = 0.8;
			material.envMap = undefined;
			const wireframeMesh = new Mesh(geometry, material);
			this.add(wireframeMesh);

			this.wireframeMesh = wireframeMesh;
		} else {
			this.wireframeMesh.geometry.dispose();
			this.wireframeMesh.material.dispose();
			this.remove(this.wireframeMesh);

			this.wireframeMesh = null;
		}

		return this;
	}

	update() {
		const { positions, indices } = this.triangleSoup;
		const { geometry } = this.mesh;

		geometry.dispose();

		geometry.addAttribute(
			'a_Position',
			new Attribute(new Buffer(new Float32Array(positions), 3))
		);
		geometry.setIndex(new Attribute(new Buffer((new Uint32Array(indices)), 1)));
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		// Rebuild wireframe if it exists
		if (this.wireframeMesh) {
			this.wireframe(false).wireframe(true);
		}

		return this;
	}

	dispose() {
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();

		if (this.wireframeMesh) {
			this.wireframeMesh.geometry.dispose();
			this.wireframeMesh.material.dispose();
		}

		return this;
	}

}
