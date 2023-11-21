import { Color3 } from 't3d';

class ColorGradient {

	constructor() {
		this._colorStops = [];
		this._sortDirty = false;
	}

	addColorStop(position, color) {
		this._colorStops.push({ position, color });
		this._sortDirty = true;
		return this;
	}

	removeColorStop(position) {
		for (let i = 0; i < this._colorStops.length; i++) {
			if (this._colorStops[i].position === position) {
				this._colorStops.splice(i, 1);
				this._sortDirty = true;
				break;
			}
		}
		return this;
	}

	clear() {
		this._colorStops = [];
		return this;
	}

	getColor(position, target = new Color3()) {
		this._sort();

		const colorStops = this._colorStops;

		target.copy(colorStops[0].color);

		if (position > 0) {
			let prevPosition = 0;

			for (let i = 0; i < colorStops.length; i++) {
				const colorStop = colorStops[i];

				if (colorStop.position < position) {
					target.copy(colorStop.color);
					prevPosition = colorStop.position;
				} else {
					const t = (position - prevPosition) / (colorStop.position - prevPosition);
					target.lerp(colorStop.color, t);
					break;
				}
			}
		}

		return target;
	}

	getUint8Array(steps, target = new Uint8Array(steps * 4)) {
		this._sort();

		const colorStops = this._colorStops;

		const prevColor = _tempColor1,
			color = _tempColor2;

		prevColor.copy(colorStops[0].color);

		let prevPosition = 0,
			colorStopIndex = 0;

		for (let i = 0; i < steps; i++) {
			const position = i / (steps - 1);

			if (position > 0) {
				while (colorStopIndex < colorStops.length) {
					const colorStop = colorStops[colorStopIndex];

					if (colorStop.position < position) {
						prevColor.copy(colorStop.color);
						color.copy(prevColor);
						prevPosition = colorStop.position;
					} else {
						const t = (position - prevPosition) / (colorStop.position - prevPosition);
						color.lerpColors(prevColor, colorStop.color, t);
						break;
					}

					colorStopIndex++;
				}
			} else {
				color.copy(prevColor);
			}

			const offset = i * 4;

			target[offset] = color.r * 255;
			target[offset + 1] = color.g * 255;
			target[offset + 2] = color.b * 255;
			target[offset + 3] = 255;
		}

		return target;
	}

	_sort() {
		if (this._sortDirty) {
			this._colorStops.sort((a, b) => a.position - b.position);
			this._sortDirty = false;
		}
	}

}

const _tempColor1 = new Color3();
const _tempColor2 = new Color3();

export { ColorGradient };