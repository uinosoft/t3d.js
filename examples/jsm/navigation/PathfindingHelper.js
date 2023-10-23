import {
	BoxGeometry,
	SphereGeometry,
	BasicMaterial,
	LineMaterial,
	Mesh,
	Object3D,
	Geometry,
	Buffer,
	Attribute,
	DRAW_MODE
} from 't3d';

// Helper for debugging pathfinding behavior.
class PathfindingHelper extends Object3D {

	constructor() {
		super();

		const playerMaterial = new BasicMaterial();
		playerMaterial.diffuse.setHex(0x00FF00);
		this._playerMarker = new Mesh(new SphereGeometry(0.23, 32, 32), playerMaterial);

		const targetMaterial = new BasicMaterial();
		targetMaterial.diffuse.setHex(0xFFA500);
		this._targetMarker = new Mesh(new BoxGeometry(0.3, 0.3, 0.3), targetMaterial);

		this._pathMarker = new Object3D();

		this._pathLineMaterial = new LineMaterial();
		this._pathLineMaterial.diffuse.setHex(0x0000ff);
		this._pathLineMaterial.lineWidth = 1;
		this._pathLineMaterial.transparent = true;
		this._pathLineMaterial.opacity = 0.5;
		this._pathLineMaterial.drawMode = DRAW_MODE.LINE_STRIP;

		this._pathPointMaterial = new BasicMaterial();
		this._pathPointMaterial.diffuse.setHex(0x0000ff);
		this._pathPointGeometry = new SphereGeometry(0.08);

		this._markers = [
			this._playerMarker,
			this._targetMarker,
			this._pathMarker
		];

		this._markers.forEach(marker => {
			marker.visible = false;
			this.add(marker);
		});
	}

	setPath(path) {
		while (this._pathMarker.children.length) {
			this._pathMarker.children[0].visible = false;
			this._pathMarker.remove(this._pathMarker.children[0]);
		}

		path = [this._playerMarker.position].concat(path);

		// Draw debug lines
		const geometry = new Geometry();
		const buffer = new Buffer(new Float32Array(path.length * 3), 3);
		geometry.addAttribute('a_Position', new Attribute(buffer, 3, 0));

		for (let i = 0; i < path.length; i++) {
			const index = i * 3;
			buffer.array[index + 0] = path[i].x;
			buffer.array[index + 1] = path[i].y + OFFSET;
			buffer.array[index + 2] = path[i].z;
		}

		const lineMesh = new Mesh(geometry, this._pathLineMaterial);
		this._pathMarker.add(lineMesh);

		for (let i = 0; i < path.length - 1; i++) {
			const node = new Mesh(this._pathPointGeometry, this._pathPointMaterial);
			node.position.copy(path[i]);
			node.position.y += OFFSET;
			this._pathMarker.add(node);
		}

		this._pathMarker.visible = true;
		return this;
	}

	setPlayerPosition(position) {
		this._playerMarker.position.copy(position);
		this._playerMarker.visible = true;
		return this;
	}

	setTargetPosition(position) {
		this._targetMarker.position.copy(position);
		this._targetMarker.visible = true;
		return this;
	}

	// Hides all markers.
	reset() {
		while (this._pathMarker.children.length) {
			this._pathMarker.children[0].geometry.dispose();
			this._pathMarker.remove(this._pathMarker.children[0]);
		}

		this._markers.forEach(marker => {
			marker.visible = false;
		});

		return this;
	}

}

export { PathfindingHelper };

const OFFSET = 0.2;