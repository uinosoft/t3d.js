// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Fbutterfly.ts

import { Vector4 } from 't3d';

const eix = x => [Math.cos(x), Math.sin(x)];

export const reverseBits = (v, width) => {
	return parseInt(v.toString(2).padStart(width, '0').split('').reverse().join(''), 2);
};

export const createButterflyTexture = size => {
	const width = Math.log2(size);
	const height = size;
	const texture = new Float32Array(width * height * 4);
	const w = (2.0 * Math.PI) / size;
	const bitReversed = [...Array(size).keys()].map(v => reverseBits(v, width));

	const texel = new Vector4();
	for (let j = 0; j < width; j++) {
		for (let i = 0; i < height; i++) {
			const k = i * (size >> (j + 1));
			const twiddle = eix(k * w);
			const span = 2 ** j;
			const wing = i % 2 ** (j + 1) < span ? 0 : 1; // 0 - top wing, 1 - bottom wing
			if (j === 0) {
				if (wing === 0) {
					texel.set(twiddle[0], twiddle[1], bitReversed[i], bitReversed[i + 1]);
				} else {
					texel.set(twiddle[0], twiddle[1], bitReversed[i - 1], bitReversed[i]);
				}
			} else {
				if (wing === 0) {
					texel.set(twiddle[0], twiddle[1], i, i + span);
				} else {
					texel.set(twiddle[0], twiddle[1], i - span, i);
				}
			}
			texture[(width * i + j) * 4] = texel.x;
			texture[(width * i + j) * 4 + 1] = texel.y;
			texture[(width * i + j) * 4 + 2] = texel.z;
			texture[(width * i + j) * 4 + 3] = texel.w;
		}
	}

	return texture;
};