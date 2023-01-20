import { Vector3 } from 't3d';

/**
 * RouteBuilder
 */
var RouteBuilder = {

	/**
	 * @param {Object} frames
	 * @param {Object} [options={}]
	 * @param {Number} [options.width=0.1]
	 * @param {Boolean} [options.arrow=true]
	 * @param {String} [options.side='both'] - 'both' / 'left' / 'right'
	 * @param {Boolean} [options.sharp=false]
	 * @return {Object} - The geometry data.
	 */
	getGeometryData: function(frames, options = {}) {
		const width = options.width !== undefined ? options.width : 0.1;
		const arrow = options.arrow !== undefined ? options.arrow : true;
		const side = options.side !== undefined ? options.side : 'both';
		const sharp = options.sharp !== undefined ? options.sharp : false;

		// build vertex data

		var positions = [];
		var normals = [];
		var uvs = [];
		var uvs2 = [];
		var indices = [];

		const frameLength = frames.points.length;
		const lastIndex = frameLength - 1;

		const halfWidth = width / 2;
		const sideWidth = (side !== 'both' ? width / 2 : width);
		const totalLength = frames.lengths[lastIndex];

		// for sharp corners
		const sharpUvOffset = halfWidth / sideWidth;
		const sharpUvOffset2 = halfWidth / totalLength;
		const leftOffset = new Vector3();
		const rightOffset = new Vector3();
		const tempPoint1 = new Vector3();
		const tempPoint2 = new Vector3();

		const left = new Vector3();
		const right = new Vector3();
		let verticesCount = 0;
		for (let i = 0; i < frameLength; i++) {
			const uvDist = frames.lengths[i] / sideWidth;
			const uvDist2 = frames.lengths[i] / totalLength;

			if (side !== 'left') {
				right.copy(frames.binormals[i]).multiplyScalar(halfWidth * frames.widthScales[i]);
			} else {
				right.set(0, 0, 0);
			}

			if (side !== 'right') {
				left.copy(frames.binormals[i]).multiplyScalar(-halfWidth * frames.widthScales[i]);
			} else {
				left.set(0, 0, 0);
			}

			const normal = frames.normals[i];

			right.add(frames.points[i]);
			left.add(frames.points[i]);

			if (sharp && frames.sharps[i]) { // sharp corners
				rightOffset.fromArray(positions, positions.length - 3).sub(right);
				leftOffset.fromArray(positions, positions.length - 6).sub(left);

				const rightDist = rightOffset.getLength();
				const leftDist = leftOffset.getLength();

				const sideOffset = leftDist - rightDist;
				let longerOffset, longEdge;

				if (sideOffset > 0) {
					longerOffset = leftOffset;
					longEdge = left;
				} else {
					longerOffset = rightOffset;
					longEdge = right;
				}

				tempPoint1.copy(longerOffset).normalize(Math.abs(sideOffset)).add(longEdge);

				let _cos = tempPoint2.copy(longEdge).sub(tempPoint1).normalize().dot(frames.tangents[i]);
				let _len = tempPoint2.copy(longEdge).sub(tempPoint1).getLength();
				let _dist = _cos * _len * 2;

				tempPoint2.copy(frames.tangents[i]).normalize(_dist).add(tempPoint1);

				if (sideOffset > 0) {
					positions.push(
						tempPoint1.x, tempPoint1.y, tempPoint1.z, // 6
						right.x, right.y, right.z, // 5
						left.x, left.y, left.z, // 4
						right.x, right.y, right.z, // 3
						tempPoint2.x, tempPoint2.y, tempPoint2.z, // 2
						right.x, right.y, right.z // 1
					);

					verticesCount += 6;

					indices.push(
						verticesCount - 6, verticesCount - 8, verticesCount - 7,
						verticesCount - 6, verticesCount - 7, verticesCount - 5,

						verticesCount - 4, verticesCount - 6, verticesCount - 5,
						verticesCount - 2, verticesCount - 4, verticesCount - 1
					);
				} else {
					positions.push(
						left.x, left.y, left.z, // 6
						tempPoint1.x, tempPoint1.y, tempPoint1.z, // 5
						left.x, left.y, left.z, // 4
						right.x, right.y, right.z, // 3
						left.x, left.y, left.z, // 2
						tempPoint2.x, tempPoint2.y, tempPoint2.z // 1
					);

					verticesCount += 6;

					indices.push(
						verticesCount - 6, verticesCount - 8, verticesCount - 7,
						verticesCount - 6, verticesCount - 7, verticesCount - 5,

						verticesCount - 6, verticesCount - 5, verticesCount - 3,
						verticesCount - 2, verticesCount - 3, verticesCount - 1
					);
				}

				normals.push(
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z
				);

				uvs.push(
					uvDist - sharpUvOffset, 0,
					uvDist - sharpUvOffset, 1,
					uvDist, 0,
					uvDist, 1,
					uvDist + sharpUvOffset, 0,
					uvDist + sharpUvOffset, 1
				);

				uvs2.push(
					uvDist2 - sharpUvOffset2, 0,
					uvDist2 - sharpUvOffset2, 1,
					uvDist2, 0,
					uvDist2, 1,
					uvDist2 + sharpUvOffset2, 0,
					uvDist2 + sharpUvOffset2, 1
				);
			} else {
				positions.push(
					left.x, left.y, left.z,
					right.x, right.y, right.z
				);

				normals.push(
					normal.x, normal.y, normal.z,
					normal.x, normal.y, normal.z
				);

				uvs.push(
					uvDist, 0,
					uvDist, 1
				);

				uvs2.push(
					uvDist2, 0,
					uvDist2, 1
				);

				verticesCount += 2;

				if (i > 0) {
					indices.push(
						verticesCount - 2, verticesCount - 4, verticesCount - 3,
						verticesCount - 2, verticesCount - 3, verticesCount - 1
					);
				}
			}
		}

		if (arrow) {
			const uvDist = frames.lengths[lastIndex] / sideWidth;
			const uvDist2 = frames.lengths[lastIndex] / totalLength;

			const normal = frames.normals[lastIndex];

			if (side !== 'left') {
				right.copy(frames.binormals[lastIndex]).multiplyScalar(halfWidth * 2);
			} else {
				right.set(0, 0, 0);
			}

			if (side !== 'right') {
				left.copy(frames.binormals[lastIndex]).multiplyScalar(-halfWidth * 2);
			} else {
				left.set(0, 0, 0);
			}

			const sharp = tempPoint1.copy(frames.tangents[lastIndex]).normalize(halfWidth * 3);

			right.add(frames.points[lastIndex]);
			left.add(frames.points[lastIndex]);
			sharp.add(frames.points[lastIndex]);

			positions.push(
				left.x, left.y, left.z,
				right.x, right.y, right.z,
				sharp.x, sharp.y, sharp.z
			);

			normals.push(
				normal.x, normal.y, normal.z,
				normal.x, normal.y, normal.z,
				normal.x, normal.y, normal.z
			);

			uvs.push(
				uvDist, side !== 'both' ? (side !== 'right' ? -2 : 0) : -0.5,
				uvDist, side !== 'both' ? (side !== 'left' ? 2 : 0) : 1.5,
				uvDist + 1.5, side !== 'both' ? 0 : 0.5
			);

			uvs2.push(
				uvDist2, side !== 'both'  ? (side !== 'right' ? -2 : 0) : -0.5,
				uvDist2, side !== 'both'  ? (side !== 'left' ? 2 : 0) : 1.5,
				uvDist2 + (1.5 * width / totalLength), side !== 'both'  ? 0 : 0.5
			);

			verticesCount += 3;

			indices.push(
				verticesCount - 1, verticesCount - 3, verticesCount - 2
			);
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

export { RouteBuilder };