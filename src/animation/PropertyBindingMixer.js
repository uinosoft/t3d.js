import { Quaternion } from '../math/Quaternion.js';

/**
 * This holds a reference to a real property in the scene graph; used internally.
 * Binding property and value, mixer for multiple values.
 * @memberof t3d
 */
class PropertyBindingMixer {

	/**
	 * @param {Object3D} target
	 * @param {String} propertyPath
	 * @param {String} typeName - vector/bool/string/quaternion/number/color
	 * @param {Number} valueSize
	 */
	constructor(target, propertyPath, typeName, valueSize) {
		this.target = null;

		this.property = '';

		this.parseBinding(target, propertyPath);

		this.valueSize = valueSize;

		let BufferType = Float64Array;
		let mixFunction, mixFunctionAdditive, setIdentity;

		switch (typeName) {
			case 'quaternion':
				mixFunction = slerp;
				mixFunctionAdditive = slerpAdditive;
				setIdentity = setIdentityQuaternion;
				break;
			case 'string':
			case 'bool':
				BufferType = Array;
				mixFunction = select;
				mixFunctionAdditive = select;
				setIdentity = setIdentityOther;
				break;
			default:
				mixFunction = lerp;
				mixFunctionAdditive = lerpAdditive;
				setIdentity = setIdentityNumeric;
		}

		// [ incoming | accu | orig | addAccu ]
		this.buffer = new BufferType(valueSize * 4);

		this._mixBufferFunction = mixFunction;
		this._mixBufferFunctionAdditive = mixFunctionAdditive;
		this._setIdentity = setIdentity;

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;
	}

	parseBinding(target, propertyPath) {
		propertyPath = propertyPath.split('.');

		if (propertyPath.length > 1) {
			let property = target[propertyPath[0]];

			for (let index = 1; index < propertyPath.length - 1; index++) {
				property = property[propertyPath[index]];
			}

			this.property = propertyPath[propertyPath.length - 1];
			this.target = property;
		} else {
			this.property = propertyPath[0];
			this.target = target;
		}
	}

	/**
	 * Remember the state of the bound property and copy it to both accus.
	 */
	saveOriginalState() {
		const buffer = this.buffer,
			stride = this.valueSize,
			originalValueOffset = stride * 2;

		// get value
		if (this.valueSize > 1) {
			if (this.target[this.property].toArray) {
				this.target[this.property].toArray(buffer, originalValueOffset);
			} else {
				setArray(buffer, this.target[this.property], originalValueOffset, this.valueSize);
			}
		} else {
			this.target[this.property] = buffer[originalValueOffset];
		}

		// accu[0..1] := orig -- initially detect changes against the original
		for (let i = stride, e = originalValueOffset; i !== e; ++i) {
			buffer[i] = buffer[originalValueOffset + (i % stride)];
		}

		// Add to identify for additive
		this._setIdentity(buffer, stride * 3, stride, originalValueOffset);

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;
	}

	/**
	 * Apply the state previously taken via 'saveOriginalState' to the binding.
	 */
	restoreOriginalState() {
		const buffer = this.buffer,
			stride = this.valueSize,
			originalValueOffset = stride * 2;

		// accu[0..1] := orig -- initially detect changes against the original
		for (let i = stride, e = originalValueOffset; i !== e; ++i) {
			buffer[i] = buffer[originalValueOffset + (i % stride)];
		}

		this.apply();
	}

	/**
     * Accumulate value.
     * @param {Number} weight
     */
	accumulate(weight) {
		const buffer = this.buffer,
			stride = this.valueSize,
			offset = stride;

		let currentWeight = this.cumulativeWeight;

		if (currentWeight === 0) {
			for (let i = 0; i !== stride; ++i) {
				buffer[offset + i] = buffer[i];
			}

			currentWeight = weight;
		} else {
			currentWeight += weight;
			const mix = weight / currentWeight;
			this._mixBufferFunction(buffer, offset, 0, mix, stride);
		}

		this.cumulativeWeight = currentWeight;
	}

	/**
     * Additive Accumulate value.
     * @param {Number} weight
     */
	accumulateAdditive(weight) {
		const buffer = this.buffer,
			stride = this.valueSize,
			offset = stride * 3;

		if (this.cumulativeWeightAdditive === 0) {
			this._setIdentity(buffer, offset, stride, stride * 2);
		}

		this._mixBufferFunctionAdditive(buffer, offset, 0, weight, stride);

		this.cumulativeWeightAdditive += weight;
	}

	/**
     * Apply to scene graph.
     */
	apply() {
		const buffer = this.buffer,
			stride = this.valueSize,
			weight = this.cumulativeWeight,
			weightAdditive = this.cumulativeWeightAdditive;

		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;

		if (weight < 1) {
			// accuN := accuN + original * ( 1 - cumulativeWeight )
			const originalValueOffset = stride * 2;
			this._mixBufferFunction(buffer, stride, originalValueOffset, 1 - weight, stride);
		}

		if (weightAdditive > 0) {
			// accuN := accuN + additive accuN
			this._mixBufferFunctionAdditive(buffer, stride, 3 * stride, 1, stride);
		}

		// set value
		if (this.valueSize > 1) {
			if (this.target[this.property].fromArray) {
				this.target[this.property].fromArray(buffer, stride);
			} else {
				getArray(this.target[this.property], buffer, stride, this.valueSize);
			}
		} else {
			this.target[this.property] = buffer[stride];
		}
	}

}

// Mix functions

function select(buffer, dstOffset, srcOffset, t, stride) {
	if (t >= 0.5) {
		for (let i = 0; i !== stride; ++i) {
			buffer[dstOffset + i] = buffer[srcOffset + i];
		}
	}
}

function slerp(buffer, dstOffset, srcOffset, t) {
	Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
}

const tempQuternionBuffer = new Float64Array(4);
function slerpAdditive(buffer, dstOffset, srcOffset, t) {
	// Store result in tempQuternionBuffer
	Quaternion.multiplyQuaternionsFlat(tempQuternionBuffer, 0, buffer, dstOffset, buffer, srcOffset);
	// Slerp to the result
	Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, tempQuternionBuffer, 0, t);
}

function lerp(buffer, dstOffset, srcOffset, t, stride) {
	const s = 1 - t;

	for (let i = 0; i !== stride; ++i) {
		const j = dstOffset + i;

		buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
	}
}

function lerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
	for (let i = 0; i !== stride; ++i) {
		const j = dstOffset + i;

		buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
	}
}

// identity
function setIdentityNumeric(buffer, offset, stride) {
	for (let i = 0; i < stride; i++) {
		buffer[offset + i] = 0;
	}
}

function setIdentityQuaternion(buffer, offset) {
	setIdentityNumeric(buffer, offset, 3);
	buffer[offset + 3] = 1;
}

function setIdentityOther(buffer, offset, stride, copyOffset) {
	for (let i = 0; i < stride; i++) {
		buffer[offset + i] = buffer[copyOffset + i];
	}
}

// get array
function getArray(target, source, stride, count) {
	for (let i = 0; i < count; i++) {
		target[i] = source[stride + i];
	}
}

function setArray(target, source, stride, count) {
	for (let i = 0; i < count; i++) {
		target[stride + i] = source[i];
	}
}

export { PropertyBindingMixer };