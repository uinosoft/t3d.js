/**
 * Geometry Builder Utils
 */
var GeometryBuilderUtils = {

	convertShapeDataToEarcut: function(shape, vertices, holeIndices) {
		var contour = shape.contour;
		var holes = shape.holes;

		// check directions of shape contour and holes

		if (!isClockWise(contour)) {
			contour = contour.reverse();
		}

		if (holes) {
			for (var i = 0, l = holes.length; i < l; i++) {
				var hole = holes[i];
				if (isClockWise(hole)) {
					holes[i] = hole.reverse();
				}
			}
		}

		// triangulate shape by Earcut

		vertices = vertices || []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		holeIndices = holeIndices || []; // array of hole indices

		removeDupEndPts(contour);
		addContour(vertices, contour);

		if (holes) {
			var holeIndex = contour.length;

			holes.forEach(removeDupEndPts);

			for (var i = 0; i < holes.length; i++) {
				holeIndices.push(holeIndex);
				holeIndex += holes[i].length;
				addContour(vertices, holes[i]);
			}
		}
	}

}

function area(contour) {
	var n = contour.length;
	var a = 0.0;

	for (var p = n - 1, q = 0; q < n; p = q++) {
		a += contour[p][0] * contour[q][1] - contour[q][0] * contour[p][1];
	}

	return a * 0.5;
}

function isClockWise(contour) {
	return area(contour) < 0;
}

function removeDupEndPts(contour) {
	var l = contour.length;

	if (l > 2 && isArrayEquals(contour[l - 1], contour[0])) {
		contour.pop();
	}
}

function isArrayEquals(a1, a2) {
	if (a1.length !== a2.length) {
		return false;
	}

	for (var i = 0, l = a1.length; i < l; i++) {
		if (a1[i] !== a2[i]) {
			return false;
		}
	}

	return true;
}

function addContour(vertices, contour) {
	for (var i = 0; i < contour.length; i++) {
		vertices.push(contour[i][0]);
		vertices.push(contour[i][1]);
	}
}

export { GeometryBuilderUtils };