import { Geometry, Attribute, Buffer, Vector2, Vector3 } from 't3d';

class CircleGeometry extends Geometry {

	constructor(radius = 1, segments = 32, thetaStart = 0, thetaLength = Math.PI * 2) {
		super();

		segments = Math.max(3, segments);

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		const vertex = new Vector3();
		const uv = new Vector2();

		// center point

		vertices.push(0, 0, 0);
		normals.push(0, 0, 1);
		uvs.push(0.5, 0.5);

		for (let s = 0, i = 3; s <= segments; s++, i += 3) {
			const segment = thetaStart + (s / segments) * thetaLength;

			// vertex

			vertex.x = radius * Math.cos(segment);
			vertex.y = radius * Math.sin(segment);

			vertices.push(vertex.x, vertex.y, vertex.z);

			// normal

			normals.push(0, 0, 1);

			// uvs

			uv.x = (vertices[i] / radius + 1) / 2;
			uv.y = (vertices[i + 1] / radius + 1) / 2;

			uvs.push(uv.x, uv.y);
		}

		// indices

		for (let i = 1; i <= segments; i++) {
			indices.push(i, i + 1, 0);
		}

		// build geometry

		this.setIndex(
			new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1))
		);
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
		this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

}

export { CircleGeometry };
