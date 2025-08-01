import { Vector3, Quaternion } from 't3d';

/**
 * TubeBuilder
 */
const TubeBuilder = {

	/**
	 * @param {object} frames
	 * @param {object} [options={}]
	 * @param {number} [options.radius=0.1]
	 * @param {number} [options.radialSegments=8]
	 * @param {number} [options.startRad=0]
	 * @param {boolean} [options.generateStartCap=false] - Whether to generate the start cap.
	 * @param {boolean} [options.generateEndCap=false] - Whether to generate the end cap.
	 * @returns {object} - The geometry data.
	 */
	getGeometryData: function(frames, options = {}) {
		const radius = options.radius !== undefined ? options.radius : 0.1;
		const radialSegments = Math.max(2, options.radialSegments !== undefined ? options.radialSegments : 8);
		const startRad = options.startRad !== undefined ? options.startRad : 0;
		const generateStartCap = (options.generateStartCap !== undefined) ? options.generateStartCap : false;
		const generateEndCap = (options.generateEndCap !== undefined) ? options.generateEndCap : false;

		// build side vertex data

		const positions = [];
		const normals = [];
		const uvs = [];
		const uvs2 = [];
		const indices = [];

		const frameLength = frames.points.length;
		const lastIndex = frameLength - 1;

		const circum = radius * 2 * Math.PI;
		const totalLength = frames.lengths[lastIndex];

		const quaternion = new Quaternion();
		const segmentVector = new Vector3();
		const normalVector = new Vector3();
		const offsetVector = new Vector3();

		let verticesCount = 0;

		for (let i = 0; i < frameLength; i++) {
			const uvDist = frames.lengths[i] / circum;
			const uvDist2 = frames.lengths[i] / totalLength;

			const sharp = frames.sharps[i];
			const widthScale = frames.widthScales[i];

			for (let r = 0; r <= radialSegments; r++) {
				let _r = r;
				if (_r == radialSegments) {
					_r = 0;
				}

				segmentVector.copy(frames.normals[i]);
				quaternion.setFromAxisAngle(frames.tangents[i], startRad + Math.PI * 2 * _r / radialSegments);
				segmentVector.applyQuaternion(quaternion).normalize();

				if (sharp) {
					// At sharp corners, the cross-section is not a circle, but an ellipse.
					// Here, we stretch the cross-section according to the direction of the angle bisector.
					offsetVector.copy(segmentVector)
						.scaleAlong(frames.bisectors[i], widthScale)
						.multiplyScalar(radius).add(frames.points[i]);
					normalVector.copy(segmentVector)
						.scaleAlong(frames.bisectors[i], 1 / widthScale)
						.normalize();
				} else {
					// fallback to simple calculation, because the angle is not obvious,
					// the benefit of precise stretching is not obvious
					offsetVector.copy(segmentVector).multiplyScalar(radius * widthScale).add(frames.points[i]);
					normalVector.copy(segmentVector);
				}

				positions.push(offsetVector.x, offsetVector.y, offsetVector.z);
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

		// end cap

		if (radialSegments >= 3 && generateEndCap) {
			normalVector.copy(frames.tangents[lastIndex]);
			normalVector.normalize();

			for (let r = verticesCount - radialSegments, l = verticesCount; r < l; r++) {
				positions.push(positions[r * 3], positions[r * 3 + 1], positions[r * 3 + 2]);
				uvs.push(uvs[r * 2], uvs[r * 2 + 1]);
				uvs2.push(uvs2[r * 2], uvs2[r * 2 + 1]);
				normals.push(normalVector.x, normalVector.y, normalVector.z);
				verticesCount++;
			}

			const index = verticesCount - radialSegments;
			for (let i = 0; i < radialSegments - 2; i++) {
				indices.push(index, index + i + 1, index + i + 2);
			}
		}

		// start cap

		if (radialSegments >= 3 && generateStartCap) {
			normalVector.copy(frames.tangents[0]);
			normalVector.normalize();

			for (let r = 0; r < radialSegments; r++) {
				positions.push(positions[r * 3], positions[r * 3 + 1], positions[r * 3 + 2]);
				normals.push(-normalVector.x, -normalVector.y, -normalVector.z);
				uvs.push(uvs[r * 2], uvs[r * 2 + 1]);
				uvs2.push(uvs2[r * 2], uvs2[r * 2 + 1]);
				verticesCount++;
			}

			const index = verticesCount - radialSegments;
			for (let i = 0; i < radialSegments - 2; i++) {
				indices.push(index, index + i + 2, index + i + 1);
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

};

export { TubeBuilder };