import { Vector2 } from 't3d';
import { CubicBezierCurve2 } from '../../math/curves/CubicBezierCurve2.js';
import { CurvePath3 } from '../../math/curves/CurvePath3.js';
import { LineCurve2 } from '../../math/curves/LineCurve2.js';
import { QuadraticBezierCurve2 } from '../../math/curves/QuadraticBezierCurve2.js';

class Font {

	constructor(data) {
		this.data = data;
	}

	generateShapes(text, size = 100) {
		const shapes = [];
		const paths = createPaths(text, size, this.data);	// curvePath3

		for (let p = 0, pl = paths.length; p < pl; p++) {
			getShapes(paths[p], shapes);
		}
		return shapes;
	}

}

function createPaths(text, size, data) {
	const chars = Array.from(text);
	const scale = size / data.resolution;
	const line_height = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale;

	const paths = [];

	let offsetX = 0,
		offsetY = 0;

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];

		if (char === '\n') {
			offsetX = 0;
			offsetY -= line_height;
		} else {
			const ret = createPath(char, scale, offsetX, offsetY, data);
			offsetX += ret.offsetX;
			paths.push(ret.path);
		}
	}

	return paths;
}

function createPath(char, scale, offsetX, offsetY, data) {
	const glyph = data.glyphs[char] || data.glyphs['?'];

	if (!glyph) {
		console.error('Font: character "' + char + '" does not exists in font family ' + data.familyName + '.');
		return;
	}

	let count = -1;
	const path = [];

	let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

	if (glyph.o) {
		const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '));

		let currentPoint = [0, 0];

		for (let i = 0, l = outline.length; i < l;) {
			const action = outline[i++];

			switch (action) {
				case 'm': // move points
					count++;

					path[count] = new CurvePath3();
					x = outline[i++] * scale + offsetX;
					y = outline[i++] * scale + offsetY;

					currentPoint[0] = x;
					currentPoint[1] = y;

					break;

				case 'l': // line

					x = outline[i++] * scale + offsetX;
					y = outline[i++] * scale + offsetY;

					const lineCurve = new LineCurve2(new Vector2(currentPoint[0], currentPoint[1]), new Vector2(x, y))

					path[count].curves.push(lineCurve);

					currentPoint[0] = x;
					currentPoint[1] = y;

					break;

				case 'q': // quadraticCurve

					cpx = outline[i++] * scale + offsetX;
					cpy = outline[i++] * scale + offsetY;
					cpx1 = outline[i++] * scale + offsetX;
					cpy1 = outline[i++] * scale + offsetY;

					const quadraticBezierCurve = new QuadraticBezierCurve2(new Vector2(currentPoint[0], currentPoint[1]), new Vector2(cpx1, cpy1), new Vector2(cpx, cpy))

					path[count].curves.push(quadraticBezierCurve);

					currentPoint[0] = cpx;
					currentPoint[1] = cpy;

					break;

				case 'b': // bezierCurve

					cpx = outline[i++] * scale + offsetX;
					cpy = outline[i++] * scale + offsetY;
					cpx1 = outline[i++] * scale + offsetX;
					cpy1 = outline[i++] * scale + offsetY;
					cpx2 = outline[i++] * scale + offsetX;
					cpy2 = outline[i++] * scale + offsetY;

					const cubicBezierCurve = new CubicBezierCurve2(new Vector2(currentPoint[0], currentPoint[1]), new Vector2(cpx1, cpy1), new Vector2(cpx2, cpy2), new Vector2(cpx, cpy))

					path[count].curves.push(cubicBezierCurve);

					currentPoint[0] = cpx;
					currentPoint[1] = cpy;

					break;
			}
		}
	}

	return {
		offsetX: glyph.ha * scale,
		path: path
	};
}

function getShapes(curvePaths, shapes = []) {
	if (curvePaths.length === 0) return [];

	let tmpPath, tmpShape, tempPoints;

	if (curvePaths.length === 1) {
		tmpPath = curvePaths[0];
		tempPoints = tmpPath.getPoints();
		tmpShape = {
			contour: vectorsToArray(tempPoints),
			holes: []
		}
		shapes.push(tmpShape);
		return shapes;
	}

	let holesFirst = !isClockWise(curvePaths[0].getPoints());

	const newShapes = [];
	let newShapeHoles = [];
	let mainIdx = 0;
	let tmpPoints;

	newShapes[mainIdx] = undefined;
	newShapeHoles[mainIdx] = [];

	for (let i = 0, l = curvePaths.length; i < l; i++) {
		tmpPath = curvePaths[i];
		tmpPoints = tmpPath.getPoints();
		const solid = isClockWise(tmpPoints);

		if (solid) {
			if ((!holesFirst) && (newShapes[mainIdx])) mainIdx++;

			newShapes[mainIdx] = {
				contour: vectorsToArray(tmpPoints),
				holes: []
			};

			if (holesFirst) mainIdx++;
			newShapeHoles[mainIdx] = [];
		} else {
			newShapeHoles[mainIdx].push({
				l: tmpPath,
				p: tmpPoints[0]
			});
		}
	}

	let tmpHoles;

	for (let i = 0, il = newShapes.length; i < il; i++) {
		tmpShape = newShapes[i];
		shapes.push(tmpShape);
		tmpHoles = newShapeHoles[i];

		for (let j = 0, jl = tmpHoles.length; j < jl; j++) {
			tmpShape.holes.push(vectorsToArray(tmpHoles[j].l.getPoints()));
		}
	}

	return shapes;
}

// change vector2 to to two-dimensional array

function vectorsToArray(vectors) {
	const target = [];
	for (let i = 0; i < vectors.length; i++) {
		target.push([vectors[i].x, vectors[i].y]);
	}
	return target;
}

function isClockWise(contour) {
	const n = contour.length;
	let a = 0.0;

	for (let p = n - 1, q = 0; q < n; p = q++) {
		a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
	}

	return a * 0.5 < 0;
}

export { Font };