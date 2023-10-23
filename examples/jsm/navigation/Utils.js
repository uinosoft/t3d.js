// + Jonas Raoni Soares Silva
// @ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
export function isPointInPoly(poly, pt) {
	let c = false;
	for (let i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
		((poly[i].z <= pt.z && pt.z < poly[j].z) || (poly[j].z <= pt.z && pt.z < poly[i].z))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x)
        && (c = !c);
	}
	return c;
}

export function triarea2(a, b, c) {
	const ax = b.x - a.x;
	const az = b.z - a.z;
	const bx = c.x - a.x;
	const bz = c.z - a.z;
	return bx * az - ax * bz;
}

export function vequal(a, b) {
	return a.distanceToSquared(b) < 0.00001;
}