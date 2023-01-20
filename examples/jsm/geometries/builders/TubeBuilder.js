import { Vector3, Quaternion } from 't3d';

/**
 * TubeBuilder
 */
var TubeBuilder = {

	/**
	 * @param {Object} frames
	 * @param {Object} [options={}]
	 * @param {Number} [options.radius=0.1]
	 * @param {Number} [options.radialSegments=8]
	 * @param {Number} [options.startRad=0]
	 * @return {Object} - The geometry data.
	 */
	getGeometryData: function(frames, options = {}) {
		const radius = options.radius !== undefined ? options.radius : 0.1;
		const radialSegments = Math.max(2, options.radialSegments !== undefined ? options.radialSegments : 8);
		const startRad = options.startRad !== undefined ? options.startRad : 0;

		// build vertex data

		var positions = [];
		var normals = [];
		var uvs = [];
		var uvs2 = [];
		var indices = [];

		const frameLength = frames.points.length;
		const lastIndex = frameLength - 1;

		const circum = radius * 2 * Math.PI;
		const totalLength = frames.lengths[lastIndex];

		const normalVector = new Vector3();
		const quaternion = new Quaternion();
		let verticesCount = 0;
		for (let i = 0; i < frameLength; i++) {
			const uvDist = frames.lengths[i] / circum;
			const uvDist2 = frames.lengths[i] / totalLength;

			for (let r = 0; r <= radialSegments; r++) {
				let _r = r;
				if (_r == radialSegments) {
					_r = 0;
				}

				normalVector.copy(frames.normals[i]);
				quaternion.setFromAxisAngle(frames.tangents[i], startRad + Math.PI * 2 * _r / radialSegments);
				normalVector.applyQuaternion(quaternion).normalize();

				positions.push(
					frames.points[i].x + normalVector.x * radius * frames.widthScales[i],
					frames.points[i].y + normalVector.y * radius * frames.widthScales[i],
					frames.points[i].z + normalVector.z * radius * frames.widthScales[i]
				);
				normals.push(normalVector.x, normalVector.y, normalVector.z);
				uvs.push(uvDist, r / radialSegments);
				uvs2.push(uvDist2, r / radialSegments);

				verticesCount++;
			}

			if (i > 0) {
				const begin1 = verticesCount - (radialSegments + 1) * 2;
				const begin2 = verticesCount - (radialSegments + 1);

				for (let i = 0; i < radialSegments; i++) {
					indices.push(
						begin2 + i, begin1 + i, begin1 + i + 1,
						begin2 + i, begin1 + i + 1, begin2 + i + 1
					);
				}
			}
		}

		// return

		return {
			positions,
			normals,
			uvs,
			uvs2,
			indices
		};
	}

}

export { TubeBuilder };