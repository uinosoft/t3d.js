// t3d

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.t3d = {}));
})(this, (function (exports) { 'use strict';

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
		}
	}
	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		Object.defineProperty(Constructor, "prototype", {
			writable: false
		});
		return Constructor;
	}
	function _inheritsLoose(subClass, superClass) {
		subClass.prototype = Object.create(superClass.prototype);
		subClass.prototype.constructor = subClass;
		_setPrototypeOf(subClass, superClass);
	}
	function _getPrototypeOf(o) {
		_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
			return o.__proto__ || Object.getPrototypeOf(o);
		};
		return _getPrototypeOf(o);
	}
	function _setPrototypeOf(o, p) {
		_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
			o.__proto__ = p;
			return o;
		};
		return _setPrototypeOf(o, p);
	}
	function _isNativeReflectConstruct() {
		if (typeof Reflect === "undefined" || !Reflect.construct) return false;
		if (Reflect.construct.sham) return false;
		if (typeof Proxy === "function") return true;
		try {
			Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
			return true;
		} catch (e) {
			return false;
		}
	}
	function _construct(Parent, args, Class) {
		if (_isNativeReflectConstruct()) {
			_construct = Reflect.construct.bind();
		} else {
			_construct = function _construct(Parent, args, Class) {
				var a = [null];
				a.push.apply(a, args);
				var Constructor = Function.bind.apply(Parent, a);
				var instance = new Constructor();
				if (Class) _setPrototypeOf(instance, Class.prototype);
				return instance;
			};
		}
		return _construct.apply(null, arguments);
	}
	function _isNativeFunction(fn) {
		return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}
	function _wrapNativeSuper(Class) {
		var _cache = typeof Map === "function" ? new Map() : undefined;
		_wrapNativeSuper = function _wrapNativeSuper(Class) {
			if (Class === null || !_isNativeFunction(Class)) return Class;
			if (typeof Class !== "function") {
				throw new TypeError("Super expression must either be null or a function");
			}
			if (typeof _cache !== "undefined") {
				if (_cache.has(Class)) return _cache.get(Class);
				_cache.set(Class, Wrapper);
			}
			function Wrapper() {
				return _construct(Class, arguments, _getPrototypeOf(this).constructor);
			}
			Wrapper.prototype = Object.create(Class.prototype, {
				constructor: {
					value: Wrapper,
					enumerable: false,
					writable: true,
					configurable: true
				}
			});
			return _setPrototypeOf(Wrapper, Class);
		};
		return _wrapNativeSuper(Class);
	}
	function _assertThisInitialized(self) {
		if (self === void 0) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}
		return self;
	}
	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}
	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;
		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
		return arr2;
	}
	function _createForOfIteratorHelperLoose(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
		if (it) return (it = it.call(o)).next.bind(it);
		if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
			if (it) o = it;
			var i = 0;
			return function () {
				if (i >= o.length) return {
					done: true
				};
				return {
					done: false,
					value: o[i++]
				};
			};
		}
		throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function _toPrimitive(input, hint) {
		if (typeof input !== "object" || input === null) return input;
		var prim = input[Symbol.toPrimitive];
		if (prim !== undefined) {
			var res = prim.call(input, hint || "default");
			if (typeof res !== "object") return res;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return (hint === "string" ? String : Number)(input);
	}
	function _toPropertyKey(arg) {
		var key = _toPrimitive(arg, "string");
		return typeof key === "symbol" ? key : String(key);
	}

	/**
	 * Base class for property track.
	 * @memberof t3d
	 * @abstract
	 */
	var KeyframeTrack = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function KeyframeTrack(target, propertyPath, times, values, interpolant) {
			if (interpolant === void 0) {
				interpolant = true;
			}
			this.target = target;
			this.propertyPath = propertyPath;
			this.name = this.target.uuid + "." + propertyPath;
			this.times = times;
			this.values = values;
			this.valueSize = values.length / times.length;
			this.interpolant = interpolant;
		}
		var _proto = KeyframeTrack.prototype;
		_proto.getValue = function getValue(t, outBuffer) {
			var times = this.times,
				tl = times.length;
			if (t <= times[0]) {
				return this._copyValue(0, outBuffer);
			} else if (t >= times[tl - 1]) {
				return this._copyValue(tl - 1, outBuffer);
			}

			// TODO optimize
			// https://github.com/mrdoob/three.js/blob/dev/src/math/Interpolant.js
			var i0 = tl - 1;
			while (t < times[i0] && i0 > 0) {
				i0--;
			}
			var ratio = (t - times[i0]) / (times[i0 + 1] - times[i0]);
			return this._interpolate(i0, ratio, outBuffer);
		};
		_proto._interpolate = function _interpolate(index0, ratio, outBuffer) {
			var values = this.values,
				valueSize = this.valueSize;
			var value1, value2;
			for (var i = 0; i < valueSize; i++) {
				value1 = values[index0 * valueSize + i];
				value2 = values[(index0 + 1) * valueSize + i];
				if (this.interpolant) {
					if (value1 !== undefined && value2 !== undefined) {
						outBuffer[i] = value1 * (1 - ratio) + value2 * ratio;
					} else {
						outBuffer[i] = value1;
					}
				} else {
					outBuffer[i] = value1;
				}
			}
			return outBuffer;
		};
		_proto._copyValue = function _copyValue(index, outBuffer) {
			var values = this.values,
				valueSize = this.valueSize,
				offset = valueSize * index;
			for (var i = 0; i < valueSize; i++) {
				outBuffer[i] = values[offset + i];
			}
			return outBuffer;
		};
		return KeyframeTrack;
	}();

	/**
	 * Used for boolean property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var BooleanKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(BooleanKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function BooleanKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		var _proto = BooleanKeyframeTrack.prototype;
		_proto._interpolate = function _interpolate(index0, _ratio, outBuffer) {
			outBuffer[0] = this.values[index0];
			return outBuffer;
		};
		return BooleanKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'bool'
	 */
	BooleanKeyframeTrack.prototype.valueTypeName = 'bool';

	/**
	 * Used for color property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var ColorKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(ColorKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function ColorKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		return ColorKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'color'
	 */
	ColorKeyframeTrack.prototype.valueTypeName = 'color';

	/**
	 * Used for number property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var NumberKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(NumberKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function NumberKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		return NumberKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'number'
	 */
	NumberKeyframeTrack.prototype.valueTypeName = 'number';

	/**
	 * The vector 3 class.
	 * @memberof t3d
	 */
	var Vector3 = /*#__PURE__*/function () {
		/**
		 * @param {Number} [x=0] - the x value of this vector. Default is 0.
		 * @param {Number} [y=0] - the y value of this vector. Default is 0.
		 * @param {Number} [z=0] - the z value of this vector. Default is 0.
		 */
		function Vector3(x, y, z) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			this.x = x;
			this.y = y;
			this.z = z;
		}

		/**
		 * Sets this vector to be the vector linearly interpolated between v1 and v2
		 * where ratio is the percent distance along the line connecting the two vectors
		 * - ratio = 0 will be v1, and ratio = 1 will be v2.
		 * @param {t3d.Vector3} v1
		 * @param {t3d.Vector3} v2
		 * @param {Number} ratio
		 * @return {t3d.Vector3}
		 */
		var _proto = Vector3.prototype;
		_proto.lerpVectors = function lerpVectors(v1, v2, ratio) {
			return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
		}

		/**
		 * Sets the x, y and z components of this vector.
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} z
		 * @return {t3d.Vector3}
		 */;
		_proto.set = function set(x, y, z) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		/**
		 * If this vector's x, y or z value is greater than v's x, y or z value, replace that value with the corresponding min value.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.min = function min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			this.z = Math.min(this.z, v.z);
			return this;
		}

		/**
		 * If this vector's x, y or z value is less than v's x, y or z value, replace that value with the corresponding max value.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.max = function max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			this.z = Math.max(this.z, v.z);
			return this;
		}

		/**
		 * Computes the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
		 * @return {Number}
		 */;
		_proto.getLength = function getLength() {
			return Math.sqrt(this.getLengthSquared());
		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
		 * If you are comparing the lengths of vectors, you should compare the length squared instead as it is slightly
		 * more efficient to calculate.
		 * @return {Number}
		 */;
		_proto.getLengthSquared = function getLengthSquared() {
			return this.x * this.x + this.y * this.y + this.z * this.z;
		}

		/**
		 * Convert this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
		 * @param {Number} [thickness=1]
		 */;
		_proto.normalize = function normalize(thickness) {
			if (thickness === void 0) {
				thickness = 1;
			}
			var length = this.getLength() || 1;
			var invLength = thickness / length;
			this.x *= invLength;
			this.y *= invLength;
			this.z *= invLength;
			return this;
		}

		/**
		 * Subtracts a from this vector.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} [target]
		 * @return {t3d.Vector3}
		 */;
		_proto.subtract = function subtract(a, target) {
			if (target === void 0) {
				target = new Vector3();
			}
			return target.set(this.x - a.x, this.y - a.y, this.z - a.z);
		}

		/**
		 * Multiplies this vector by v.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.multiply = function multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			return this;
		}

		/**
		 * Sets this vector to cross product of a and b.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @return {t3d.Vector3}
		 */;
		_proto.crossVectors = function crossVectors(a, b) {
			var ax = a.x,
				ay = a.y,
				az = a.z;
			var bx = b.x,
				by = b.y,
				bz = b.z;
			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;
			return this;
		}

		/**
		 * Sets this vector to cross product of itself and v.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.cross = function cross(v) {
			return this.crossVectors(this, v);
		}

		/**
		 * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
		 * @return {t3d.Vector3}
		 */;
		_proto.negate = function negate() {
			this.x = -this.x;
			this.y = -this.y;
			this.z = -this.z;
			return this;
		}

		/**
		 * Calculate the dot product of this vector and v.
		 * @param {t3d.Vector3} a
		 * @return {t3d.Vector3}
		 */;
		_proto.dot = function dot(a) {
			return this.x * a.x + this.y * a.y + this.z * a.z;
		}

		/**
		 * Applies a Quaternion transform to this vector.
		 * @param {t3d.Quaternion} q
		 * @return {t3d.Vector3}
		 */;
		_proto.applyQuaternion = function applyQuaternion(q) {
			var x = this.x,
				y = this.y,
				z = this.z;
			var qx = q._x,
				qy = q._y,
				qz = q._z,
				qw = q._w;

			// calculate quat * vector

			var ix = qw * x + qy * z - qz * y;
			var iy = qw * y + qz * x - qx * z;
			var iz = qw * z + qx * y - qy * x;
			var iw = -qx * x - qy * y - qz * z;

			// calculate result * inverse quat

			this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
			return this;
		}

		/**
		 * Multiplies this vector (with an implicit 1 in the 4th dimension) and m, and divides by perspective.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Vector3}
		 */;
		_proto.applyMatrix4 = function applyMatrix4(m) {
			var x = this.x,
				y = this.y,
				z = this.z;
			var e = m.elements;
			var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
			this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
			this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
			this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
			return this;
		}

		/**
		 * Multiplies this vector by m
		 * @param {t3d.Matrix3} m
		 * @return {t3d.Vector3}
		 */;
		_proto.applyMatrix3 = function applyMatrix3(m) {
			var x = this.x,
				y = this.y,
				z = this.z;
			var e = m.elements;
			this.x = e[0] * x + e[3] * y + e[6] * z;
			this.y = e[1] * x + e[4] * y + e[7] * z;
			this.z = e[2] * x + e[5] * y + e[8] * z;
			return this;
		}

		/**
		 * Transforms the direction of this vector by a matrix (the upper left 3 x 3 subset of a m) and then
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Vector3}
		 */;
		_proto.transformDirection = function transformDirection(m) {
			// input: Matrix4 affine matrix
			// vector interpreted as a direction

			var x = this.x,
				y = this.y,
				z = this.z;
			var e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z;
			this.y = e[1] * x + e[5] * y + e[9] * z;
			this.z = e[2] * x + e[6] * y + e[10] * z;
			return this.normalize();
		}

		/**
		 * Sets this vector to the position elements of the transformation matrix m.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Vector3}
		 */;
		_proto.setFromMatrixPosition = function setFromMatrixPosition(m) {
			return this.setFromMatrixColumn(m, 3);
		}

		/**
		 * Sets this vector's x, y and z components from index column of matrix.
		 * @param {t3d.Matrix3} m
		 * @param {Number} index
		 * @return {t3d.Vector3}
		 */;
		_proto.setFromMatrixColumn = function setFromMatrixColumn(m, index) {
			return this.fromArray(m.elements, index * 4);
		}

		/**
		 * Sets this vector's x value to be array[ offset + 0 ], y value to be array[ offset + 1 ] and z value to be array[ offset + 2 ].
		 * @param {Number[]} array - the source array.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {t3d.Vector3}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			this.x = array[offset];
			this.y = array[offset + 1];
			this.z = array[offset + 2];
			return this;
		}

		/**
		 * Returns an array [x, y, z], or copies x, y and z into the provided array.
		 * @param {Number[]} [array] - array to store this vector to. If this is not provided a new array will be created.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {Number[]}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			array[offset] = this.x;
			array[offset + 1] = this.y;
			array[offset + 2] = this.z;
			return array;
		}

		/**
		 * Copies the values of the passed vector3's x, y and z properties to this vector3.
		 * @param {t3d.Vector3} v
		 * @returns {t3d.Vector3}
		 */;
		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			return this;
		}

		/**
		 * Sets this vector to a + b.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @return {t3d.Vector3}
		 */;
		_proto.addVectors = function addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;
			return this;
		}

		/**
		 * Adds the scalar value s to this vector's x, y and z values.
		 * @param {Number} s
		 * @return {t3d.Vector3}
		 */;
		_proto.addScalar = function addScalar(s) {
			this.x += s;
			this.y += s;
			this.z += s;
			return this;
		}

		/**
		 * Adds v to this vector.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.add = function add(v) {
			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			return this;
		}

		/**
		 * Adds the multiple of v and s to this vector.
		 * @param {t3d.Vector3} v
		 * @param {Number} s
		 * @return {t3d.Vector3}
		 */;
		_proto.addScaledVector = function addScaledVector(v, s) {
			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;
			return this;
		}

		/**
		 * Sets this vector to a - b.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @return {t3d.Vector3}
		 */;
		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			return this;
		}

		/**
		 * Subtracts v from this vector.
		 * @param {t3d.Vector3} v
		 * @return {t3d.Vector3}
		 */;
		_proto.sub = function sub(v) {
			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
			return this;
		}

		/**
		 * Multiplies this vector by scalar s.
		 * @param {Number} scalar
		 * @return {t3d.Vector3}
		 */;
		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}

		/**
		 * Computes the squared distance from this vector to v.
		 * If you are just comparing the distance with another distance,
		 * you should compare the distance squared instead as it is slightly more efficient to calculate.
		 * @param {t3d.Vector3} v
		 * @return {Number}
		 */;
		_proto.distanceToSquared = function distanceToSquared(v) {
			var dx = this.x - v.x,
				dy = this.y - v.y,
				dz = this.z - v.z;
			return dx * dx + dy * dy + dz * dz;
		}

		/**
		 * Computes the distance from this vector to v.
		 * @param {t3d.Vector3} v
		 * @return {Number}
		 */;
		_proto.distanceTo = function distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		}

		/**
		 * Sets this vector from the spherical coordinates s.
		 * @param {t3d.Spherical} s
		 * @return {t3d.Vector3}
		 */;
		_proto.setFromSpherical = function setFromSpherical(s) {
			var sinPhiRadius = Math.sin(s.phi) * s.radius;
			this.x = sinPhiRadius * Math.sin(s.theta);
			this.y = Math.cos(s.phi) * s.radius;
			this.z = sinPhiRadius * Math.cos(s.theta);
			return this;
		}

		/**
		 * Projects this vector from world space into the camera's normalized device coordinate (NDC) space.
		 * @param {t3d.Camera} camera
		 * @return {t3d.Vector3}
		 */;
		_proto.project = function project(camera) {
			return this.applyMatrix4(camera.projectionViewMatrix);
		}

		/**
		 * Projects this vector from the camera's normalized device coordinate (NDC) space into world space.
		 * @param {t3d.Camera} camera
		 * @return {t3d.Vector3}
		 */;
		_proto.unproject = function unproject(camera) {
			return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.worldMatrix);
		}

		/**
		 * Reflect this vector off of plane orthogonal to normal. Normal is assumed to have unit length.
		 * @param {t3d.Vector3} narmal - the normal to the reflecting plane
		 * @return {t3d.Vector3}
		 */;
		_proto.reflect = function reflect(normal) {
			// reflect incident vector off plane orthogonal to normal
			// normal is assumed to have unit length
			return this.sub(_vector$2.copy(normal).multiplyScalar(2 * this.dot(normal)));
		}

		/**
		 * Checks for strict equality of this vector and v.
		 * @param {t3d.Vector3} v
		 * @return {Boolean}
		 */;
		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z;
		}

		/**
		 * Returns a new vector3 with the same x, y and z values as this one.
		 * @return {t3d.Vector3}
		 */;
		_proto.clone = function clone() {
			return new Vector3(this.x, this.y, this.z);
		};
		return Vector3;
	}();
	var _vector$2 = new Vector3();

	/**
	 * 4x4 matrix class.
	 * @constructor
	 * @memberof t3d
	 */
	var Matrix4 = /*#__PURE__*/function () {
		/**
		 * Create a 4x4 matrix.
		 */
		function Matrix4() {
			// Keep Matrix elements in double precision for added precision
			// https:// github.com/mrdoob/three.js/pull/10702
			this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
		}

		/**
		 * Resets this matrix to the identity matrix.
		 * @return {t3d.Matrix4}
		 */
		var _proto = Matrix4.prototype;
		_proto.identity = function identity() {
			return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		}

		/**
		 * Check if the current matrix is identity.
		 * @returns {Boolean} true is the matrix is the identity matrix
		 */;
		_proto.isIdentity = function isIdentity() {
			var te = this.elements;
			return te[0] === 1 && te[4] === 0 && te[8] === 0 && te[12] === 0 && te[1] === 0 && te[5] === 1 && te[9] === 0 && te[13] === 0 && te[2] === 0 && te[6] === 0 && te[10] === 1 && te[14] === 0 && te[3] === 0 && te[7] === 0 && te[11] === 0 && te[15] === 1;
		}

		/**
		 * Set the elements of this matrix to the supplied row-major values n11, n12, ... n44.
		 * @param {Number} n11
		 * @param {Number} n12
		 * @param {Number} n13
		 * @param {Number} n14
		 * @param {Number} n21
		 * @param {Number} n22
		 * @param {Number} n23
		 * @param {Number} n24
		 * @param {Number} n31
		 * @param {Number} n32
		 * @param {Number} n33
		 * @param {Number} n34
		 * @param {Number} n41
		 * @param {Number} n42
		 * @param {Number} n43
		 * @param {Number} n44
		 * @return {t3d.Matrix4}
		 */;
		_proto.set = function set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
			var ele = this.elements;
			ele[0] = n11;
			ele[4] = n12;
			ele[8] = n13;
			ele[12] = n14;
			ele[1] = n21;
			ele[5] = n22;
			ele[9] = n23;
			ele[13] = n24;
			ele[2] = n31;
			ele[6] = n32;
			ele[10] = n33;
			ele[14] = n34;
			ele[3] = n41;
			ele[7] = n42;
			ele[11] = n43;
			ele[15] = n44;
			return this;
		}

		/**
		 * Creates a new Matrix4 with identical elements to this one.
		 * @return {t3d.Matrix4}
		 */;
		_proto.clone = function clone() {
			return new Matrix4().fromArray(this.elements);
		}

		/**
		 * Copies the elements of matrix m into this matrix.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Matrix4}
		 */;
		_proto.copy = function copy(m) {
			var te = this.elements;
			var me = m.elements;
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
			te[9] = me[9];
			te[10] = me[10];
			te[11] = me[11];
			te[12] = me[12];
			te[13] = me[13];
			te[14] = me[14];
			te[15] = me[15];
			return this;
		}

		/**
		 * Sets this matrix as a translation transform.
		 * @param {Number} x - the amount to translate in the X axis.
		 * @param {Number} y - the amount to translate in the Y axis.
		 * @param {Number} z - the amount to translate in the Z axis.
		 * @return {t3d.Matrix4}
		 */;
		_proto.makeTranslation = function makeTranslation(x, y, z) {
			return this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
		}

		/**
		 * Post-multiplies this matrix by m.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Matrix4}
		 */;
		_proto.multiply = function multiply(m) {
			return this.multiplyMatrices(this, m);
		}

		/**
		 * Pre-multiplies this matrix by m.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Matrix4}
		 */;
		_proto.premultiply = function premultiply(m) {
			return this.multiplyMatrices(m, this);
		}

		/**
		 * Sets this matrix to a x b.
		 * @param {t3d.Matrix4} a
		 * @param {t3d.Matrix4} b
		 * @return {t3d.Matrix4}
		 */;
		_proto.multiplyMatrices = function multiplyMatrices(a, b) {
			var ae = a.elements;
			var be = b.elements;
			var te = this.elements;
			var a11 = ae[0],
				a12 = ae[4],
				a13 = ae[8],
				a14 = ae[12];
			var a21 = ae[1],
				a22 = ae[5],
				a23 = ae[9],
				a24 = ae[13];
			var a31 = ae[2],
				a32 = ae[6],
				a33 = ae[10],
				a34 = ae[14];
			var a41 = ae[3],
				a42 = ae[7],
				a43 = ae[11],
				a44 = ae[15];
			var b11 = be[0],
				b12 = be[4],
				b13 = be[8],
				b14 = be[12];
			var b21 = be[1],
				b22 = be[5],
				b23 = be[9],
				b24 = be[13];
			var b31 = be[2],
				b32 = be[6],
				b33 = be[10],
				b34 = be[14];
			var b41 = be[3],
				b42 = be[7],
				b43 = be[11],
				b44 = be[15];
			te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
			te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
			te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
			te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
			te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
			te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
			te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
			te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
			te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
			te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
			te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
			te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
			te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
			te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
			te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
			te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
			return this;
		}

		/**
		 * Transposes this matrix.
		 * @return {t3d.Matrix4}
		 */;
		_proto.transpose = function transpose() {
			var te = this.elements;
			var tmp;
			tmp = te[1];
			te[1] = te[4];
			te[4] = tmp;
			tmp = te[2];
			te[2] = te[8];
			te[8] = tmp;
			tmp = te[6];
			te[6] = te[9];
			te[9] = tmp;
			tmp = te[3];
			te[3] = te[12];
			te[12] = tmp;
			tmp = te[7];
			te[7] = te[13];
			te[13] = tmp;
			tmp = te[11];
			te[11] = te[14];
			te[14] = tmp;
			return this;
		}

		/**
		 * Take the inverse of this matrix
		 * @return {t3d.Matrix4}
		 */;
		_proto.inverse = function inverse() {
			return this.getInverse(this);
		}

		/**
		 * Take the inverse of the matrix
		 * @return {t3d.Matrix4}
		 */;
		_proto.getInverse = function getInverse(m) {
			// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
			var te = this.elements,
				me = m.elements,
				n11 = me[0],
				n21 = me[1],
				n31 = me[2],
				n41 = me[3],
				n12 = me[4],
				n22 = me[5],
				n32 = me[6],
				n42 = me[7],
				n13 = me[8],
				n23 = me[9],
				n33 = me[10],
				n43 = me[11],
				n14 = me[12],
				n24 = me[13],
				n34 = me[14],
				n44 = me[15],
				t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
				t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
				t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
				t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
			var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
			if (det === 0) {
				console.warn('Matrix4: can not invert matrix, determinant is 0');
				return this.identity();
			}
			var detInv = 1 / det;
			te[0] = t11 * detInv;
			te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
			te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
			te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
			te[4] = t12 * detInv;
			te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
			te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
			te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
			te[8] = t13 * detInv;
			te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
			te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
			te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
			te[12] = t14 * detInv;
			te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
			te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
			te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
			return this;
		}

		/**
		 * Make transform from position&scale&quaternion(Quaternion).
		 * @param {t3d.Vector3} position
		 * @param {t3d.Vector3} scale
		 * @param {t3d.Quaternion} quaternion
		 * @return {t3d.Matrix4}
		 */;
		_proto.transform = function transform(position, scale, quaternion) {
			var te = this.elements;
			var x = quaternion._x,
				y = quaternion._y,
				z = quaternion._z,
				w = quaternion._w;
			var x2 = x + x,
				y2 = y + y,
				z2 = z + z;
			var xx = x * x2,
				xy = x * y2,
				xz = x * z2;
			var yy = y * y2,
				yz = y * z2,
				zz = z * z2;
			var wx = w * x2,
				wy = w * y2,
				wz = w * z2;
			var sx = scale.x,
				sy = scale.y,
				sz = scale.z;
			te[0] = (1 - (yy + zz)) * sx;
			te[1] = (xy + wz) * sx;
			te[2] = (xz - wy) * sx;
			te[3] = 0;
			te[4] = (xy - wz) * sy;
			te[5] = (1 - (xx + zz)) * sy;
			te[6] = (yz + wx) * sy;
			te[7] = 0;
			te[8] = (xz + wy) * sz;
			te[9] = (yz - wx) * sz;
			te[10] = (1 - (xx + yy)) * sz;
			te[11] = 0;
			te[12] = position.x;
			te[13] = position.y;
			te[14] = position.z;
			te[15] = 1;
			return this;
		}

		/**
		 * Sets the rotation component of this matrix to the rotation specified by q, as outlined here.
		 * @param {t3d.Quaternion} q
		 * @return {t3d.Matrix4}
		 */;
		_proto.makeRotationFromQuaternion = function makeRotationFromQuaternion(q) {
			var te = this.elements;
			var x = q.x,
				y = q.y,
				z = q.z,
				w = q.w;
			var x2 = x + x,
				y2 = y + y,
				z2 = z + z;
			var xx = x * x2,
				xy = x * y2,
				xz = x * z2;
			var yy = y * y2,
				yz = y * z2,
				zz = z * z2;
			var wx = w * x2,
				wy = w * y2,
				wz = w * z2;
			te[0] = 1 - (yy + zz);
			te[4] = xy - wz;
			te[8] = xz + wy;
			te[1] = xy + wz;
			te[5] = 1 - (xx + zz);
			te[9] = yz - wx;
			te[2] = xz - wy;
			te[6] = yz + wx;
			te[10] = 1 - (xx + yy);

			// last column
			te[3] = 0;
			te[7] = 0;
			te[11] = 0;

			// bottom row
			te[12] = 0;
			te[13] = 0;
			te[14] = 0;
			te[15] = 1;
			return this;
		}

		/**
		 * Extracts the rotation component of the supplied matrix m into this matrix's rotation component.
		 * @return {t3d.Matrix4}
		 */;
		_proto.extractRotation = function extractRotation(m) {
			// this method does not support reflection matrices

			var te = this.elements;
			var me = m.elements;
			var scaleX = 1 / _vec3_1$4.setFromMatrixColumn(m, 0).getLength();
			var scaleY = 1 / _vec3_1$4.setFromMatrixColumn(m, 1).getLength();
			var scaleZ = 1 / _vec3_1$4.setFromMatrixColumn(m, 2).getLength();
			te[0] = me[0] * scaleX;
			te[1] = me[1] * scaleX;
			te[2] = me[2] * scaleX;
			te[3] = 0;
			te[4] = me[4] * scaleY;
			te[5] = me[5] * scaleY;
			te[6] = me[6] * scaleY;
			te[7] = 0;
			te[8] = me[8] * scaleZ;
			te[9] = me[9] * scaleZ;
			te[10] = me[10] * scaleZ;
			te[11] = 0;
			te[12] = 0;
			te[13] = 0;
			te[14] = 0;
			te[15] = 1;
			return this;
		}

		/**
		 * Constructs a rotation matrix, looking from eye towards center oriented by the up vector.
		 * @param {t3d.Vector3} eye
		 * @param {t3d.Vector3} target
		 * @param {t3d.Vector3} update
		 * @return {t3d.Matrix4}
		 */;
		_proto.lookAtRH = function lookAtRH(eye, target, up) {
			var te = this.elements;
			_z.subVectors(eye, target);
			if (_z.getLengthSquared() === 0) {
				// eye and target are in the same position
				_z.z = 1;
			}
			_z.normalize();
			_x.crossVectors(up, _z);
			if (_x.getLengthSquared() === 0) {
				// up and z are parallel

				if (Math.abs(up.z) === 1) {
					_z.x += 0.0001;
				} else {
					_z.z += 0.0001;
				}
				_z.normalize();
				_x.crossVectors(up, _z);
			}
			_x.normalize();
			_y.crossVectors(_z, _x);
			te[0] = _x.x;
			te[4] = _y.x;
			te[8] = _z.x;
			te[1] = _x.y;
			te[5] = _y.y;
			te[9] = _z.y;
			te[2] = _x.z;
			te[6] = _y.z;
			te[10] = _z.z;
			return this;
		}

		/**
		 * Decomposes this matrix into it's position, quaternion and scale components.
		 * @param {t3d.Vector3} position
		 * @param {t3d.Quaternion} quaternion
		 * @param {t3d.Vector3} scale
		 * @return {t3d.Matrix4}
		 */;
		_proto.decompose = function decompose(position, quaternion, scale) {
			var te = this.elements;
			var sx = _vec3_1$4.set(te[0], te[1], te[2]).getLength();
			var sy = _vec3_1$4.set(te[4], te[5], te[6]).getLength();
			var sz = _vec3_1$4.set(te[8], te[9], te[10]).getLength();

			// if determine is negative, we need to invert one scale
			var det = this.determinant();
			if (det < 0) {
				sx = -sx;
			}
			position.x = te[12];
			position.y = te[13];
			position.z = te[14];

			// scale the rotation part
			_mat4_1$4.copy(this);
			var invSX = 1 / sx;
			var invSY = 1 / sy;
			var invSZ = 1 / sz;
			_mat4_1$4.elements[0] *= invSX;
			_mat4_1$4.elements[1] *= invSX;
			_mat4_1$4.elements[2] *= invSX;
			_mat4_1$4.elements[4] *= invSY;
			_mat4_1$4.elements[5] *= invSY;
			_mat4_1$4.elements[6] *= invSY;
			_mat4_1$4.elements[8] *= invSZ;
			_mat4_1$4.elements[9] *= invSZ;
			_mat4_1$4.elements[10] *= invSZ;
			quaternion.setFromRotationMatrix(_mat4_1$4);
			scale.x = sx;
			scale.y = sy;
			scale.z = sz;
			return this;
		}

		/**
		 * Computes and returns the determinant of this matrix.
		 * @return {Number}
		 */;
		_proto.determinant = function determinant() {
			var te = this.elements;
			var n11 = te[0],
				n12 = te[4],
				n13 = te[8],
				n14 = te[12];
			var n21 = te[1],
				n22 = te[5],
				n23 = te[9],
				n24 = te[13];
			var n31 = te[2],
				n32 = te[6],
				n33 = te[10],
				n34 = te[14];
			var n41 = te[3],
				n42 = te[7],
				n43 = te[11],
				n44 = te[15];

			// TODO: make this more efficient
			// ( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

			return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
		}

		/**
		 * Sets the elements of this matrix based on an array in column-major format.
		 * @param {Number[]} array
		 * @param {Number} [offset=0]
		 * @return {t3d.Matrix4}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			for (var i = 0; i < 16; i++) {
				this.elements[i] = array[i + offset];
			}
			return this;
		}

		/**
		 * Gets the maximum scale value of the 3 axes.
		 * @return {Number}
		 */;
		_proto.getMaxScaleOnAxis = function getMaxScaleOnAxis() {
			var te = this.elements;
			var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
			var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
			var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
			return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
		}

		/**
		 * Sets this matrix as rotation transform around axis by theta radians.
		 * @param {t3d.Vector3} axis
		 * @param {Number} angle
		 * @return {t3d.Matrix4}
		 */;
		_proto.makeRotationAxis = function makeRotationAxis(axis, angle) {
			// Based on http://www.gamedev.net/reference/articles/article1199.asp

			var c = Math.cos(angle);
			var s = Math.sin(angle);
			var t = 1 - c;
			var x = axis.x,
				y = axis.y,
				z = axis.z;
			var tx = t * x,
				ty = t * y;
			return this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
		}

		/**
		 * Return true if this matrix and m are equal.
		 * @param {t3d.Matrix4} m
		 * @return {Boolean}
		 */;
		_proto.equals = function equals(m) {
			var te = this.elements;
			var me = m.elements;
			for (var i = 0; i < 16; i++) {
				if (te[i] !== me[i]) return false;
			}
			return true;
		}

		/**
		 * Writes the elements of this matrix to an array in column-major format.
		 * @param {Number[]} [array]
		 * @param {Number} [offset=0]
		 * @return {Number[]}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			var te = this.elements;
			array[offset] = te[0];
			array[offset + 1] = te[1];
			array[offset + 2] = te[2];
			array[offset + 3] = te[3];
			array[offset + 4] = te[4];
			array[offset + 5] = te[5];
			array[offset + 6] = te[6];
			array[offset + 7] = te[7];
			array[offset + 8] = te[8];
			array[offset + 9] = te[9];
			array[offset + 10] = te[10];
			array[offset + 11] = te[11];
			array[offset + 12] = te[12];
			array[offset + 13] = te[13];
			array[offset + 14] = te[14];
			array[offset + 15] = te[15];
			return array;
		};
		return Matrix4;
	}();
	var _vec3_1$4 = new Vector3();
	var _mat4_1$4 = new Matrix4();
	var _x = new Vector3();
	var _y = new Vector3();
	var _z = new Vector3();

	/**
	 * The Quaternion class
	 * @memberof t3d
	 */
	var Quaternion = /*#__PURE__*/function () {
		/**
		 * @param {Number} [x=0] - x coordinate
		 * @param {Number} [y=0] - y coordinate
		 * @param {Number} [z=0] - z coordinate
		 * @param {Number} [w=1] - w coordinate
		 */
		function Quaternion(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (w === void 0) {
				w = 1;
			}
			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;
		}

		/**
		 * Slerp method, operates directly on flat arrays of numbers.
		 * @param {Number[]} dst - The output array.
		 * @param {Number} dstOffset - An offset into the output array.
		 * @param {Number[]} src0 - The source array of the starting quaternion.
		 * @param {Number} srcOffset0 - An offset into the array src0.
		 * @param {Number[]} src1 - The source array of the target quatnerion.
		 * @param {Number} srcOffset1 - An offset into the array src1.
		 * @param {Number} t - Normalized interpolation factor (between 0 and 1).
		 */
		Quaternion.slerpFlat = function slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
			// fuzz-free, array-based Quaternion SLERP operation

			var x0 = src0[srcOffset0 + 0],
				y0 = src0[srcOffset0 + 1],
				z0 = src0[srcOffset0 + 2],
				w0 = src0[srcOffset0 + 3];
			var x1 = src1[srcOffset1 + 0],
				y1 = src1[srcOffset1 + 1],
				z1 = src1[srcOffset1 + 2],
				w1 = src1[srcOffset1 + 3];
			if (t === 0) {
				dst[dstOffset] = x0;
				dst[dstOffset + 1] = y0;
				dst[dstOffset + 2] = z0;
				dst[dstOffset + 3] = w0;
				return;
			}
			if (t === 1) {
				dst[dstOffset] = x1;
				dst[dstOffset + 1] = y1;
				dst[dstOffset + 2] = z1;
				dst[dstOffset + 3] = w1;
				return;
			}
			if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
				var s = 1 - t;
				var cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
					dir = cos >= 0 ? 1 : -1,
					sqrSin = 1 - cos * cos;

				// Skip the Slerp for tiny steps to avoid numeric problems:
				if (sqrSin > Number.EPSILON) {
					var sin = Math.sqrt(sqrSin),
						len = Math.atan2(sin, cos * dir);
					s = Math.sin(s * len) / sin;
					t = Math.sin(t * len) / sin;
				}
				var tDir = t * dir;
				x0 = x0 * s + x1 * tDir;
				y0 = y0 * s + y1 * tDir;
				z0 = z0 * s + z1 * tDir;
				w0 = w0 * s + w1 * tDir;

				// Normalize in case we just did a lerp:
				if (s === 1 - t) {
					var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
					x0 *= f;
					y0 *= f;
					z0 *= f;
					w0 *= f;
				}
			}
			dst[dstOffset] = x0;
			dst[dstOffset + 1] = y0;
			dst[dstOffset + 2] = z0;
			dst[dstOffset + 3] = w0;
		}

		/**
		 * Multipley quaternions, but operates directly on flat arrays of numbers.
		 * @param {Number[]} dst - The output array.
		 * @param {Number} dstOffset - An offset into the output array.
		 * @param {Number[]} src0 - The source array of the starting quaternion.
		 * @param {Number} srcOffset0 - An offset into the array src0.
		 * @param {Number[]} src1 - The source array of the target quatnerion.
		 * @param {Number} srcOffset1 - An offset into the array src1.
		 * @return {Number[]}
		 */;
		Quaternion.multiplyQuaternionsFlat = function multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
			var x0 = src0[srcOffset0];
			var y0 = src0[srcOffset0 + 1];
			var z0 = src0[srcOffset0 + 2];
			var w0 = src0[srcOffset0 + 3];
			var x1 = src1[srcOffset1];
			var y1 = src1[srcOffset1 + 1];
			var z1 = src1[srcOffset1 + 2];
			var w1 = src1[srcOffset1 + 3];
			dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
			dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
			dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
			dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
			return dst;
		}

		/**
		 * @type {Number}
		 */;
		var _proto = Quaternion.prototype;
		/**
		 * Normalizes this quaternion - that is, calculated the quaternion that performs the same rotation as this one,
		 * but has length equal to 1.
		 * @return {t3d.Quaternion}
		 */
		_proto.normalize = function normalize() {
			var l = this.length();
			if (l === 0) {
				this._x = 0;
				this._y = 0;
				this._z = 0;
				this._w = 1;
			} else {
				l = 1 / l;
				this._x = this._x * l;
				this._y = this._y * l;
				this._z = this._z * l;
				this._w = this._w * l;
			}
			this.onChangeCallback();
			return this;
		}

		/**
		 * Computes the Euclidean length (straight-line length) of this quaternion, considered as a 4 dimensional vector.
		 * @return {Number}
		 */;
		_proto.length = function length() {
			return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
		}

		/**
		 * Linearly interpolates between two quaternions.
		 * @param {t3d.Quaternion} q1
		 * @param {t3d.Quaternion} q2
		 * @param {Number} ratio
		 * @return {t3d.Quaternion}
		 */;
		_proto.lerpQuaternions = function lerpQuaternions(q1, q2, ratio) {
			if (ratio === 0) return this.copy(q1);
			if (ratio === 1) return this.copy(q2);
			var w1 = q1._w,
				x1 = q1._x,
				y1 = q1._y,
				z1 = q1._z;
			var w2 = q2._w,
				x2 = q2._x,
				y2 = q2._y,
				z2 = q2._z;
			var dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

			// shortest direction
			if (dot < 0) {
				w2 = -w2;
				x2 = -x2;
				y2 = -y2;
				z2 = -z2;
			}
			this._w = w1 + ratio * (w2 - w1);
			this._x = x1 + ratio * (x2 - x1);
			this._y = y1 + ratio * (y2 - y1);
			this._z = z1 + ratio * (z2 - z1);
			var len = 1.0 / Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);
			this._w *= len;
			this._x *= len;
			this._y *= len;
			this._z *= len;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Spherically interpolates between two quaternions
		 * providing an interpolation between rotations with constant angle change rate.
		 * @param {t3d.Quaternion} q1
		 * @param {t3d.Quaternion} q2
		 * @param {Number} ratio
		 * @return {t3d.Quaternion}
		 */;
		_proto.slerpQuaternions = function slerpQuaternions(q1, q2, ratio) {
			if (ratio === 0) return this.copy(q1);
			if (ratio === 1) return this.copy(q2);
			var w1 = q1._w,
				x1 = q1._x,
				y1 = q1._y,
				z1 = q1._z;
			var w2 = q2._w,
				x2 = q2._x,
				y2 = q2._y,
				z2 = q2._z;
			var dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

			// shortest direction
			if (dot < 0) {
				dot = -dot;
				w2 = -w2;
				x2 = -x2;
				y2 = -y2;
				z2 = -z2;
			}
			if (dot < 0.95) {
				var angle = Math.acos(dot);
				var s = 1 / Math.sin(angle);
				var s1 = Math.sin(angle * (1 - ratio)) * s;
				var s2 = Math.sin(angle * ratio) * s;
				this._w = w1 * s1 + w2 * s2;
				this._x = x1 * s1 + x2 * s2;
				this._y = y1 * s1 + y2 * s2;
				this._z = z1 * s1 + z2 * s2;
			} else {
				// nearly identical angle, interpolate linearly
				this._w = w1 + ratio * (w2 - w1);
				this._x = x1 + ratio * (x2 - x1);
				this._y = y1 + ratio * (y2 - y1);
				this._z = z1 + ratio * (z2 - z1);
				var len = 1.0 / Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);
				this._w *= len;
				this._x *= len;
				this._y *= len;
				this._z *= len;
			}
			this.onChangeCallback();
			return this;
		}

		/**
		 * Sets x, y, z, w properties of this quaternion.
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} z
		 * @param {Number} w
		 * @return {t3d.Quaternion}
		 */;
		_proto.set = function set(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (w === void 0) {
				w = 1;
			}
			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Creates a new Quaternion with identical x, y, z and w properties to this one.
		 * @return {t3d.Quaternion}
		 */;
		_proto.clone = function clone() {
			return new Quaternion(this._x, this._y, this._z, this._w);
		}

		/**
		 * Copies the x, y, z and w properties of q into this quaternion.
		 * @param {t3d.Quaternion} quaternion
		 * @return {t3d.Quaternion}
		 */;
		_proto.copy = function copy(quaternion) {
			this._x = quaternion.x;
			this._y = quaternion.y;
			this._z = quaternion.z;
			this._w = quaternion.w !== undefined ? quaternion.w : 1;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Sets this quaternion from the rotation specified by Euler angle.
		 * @param {t3d.Euler} euler
		 * @param {Boolean} [update=true] - Whether to notify quaternion angle has changed
		 * @return {t3d.Quaternion}
		 */;
		_proto.setFromEuler = function setFromEuler(euler, update) {
			if (update === void 0) {
				update = true;
			}
			var c1 = Math.cos(euler._x / 2);
			var c2 = Math.cos(euler._y / 2);
			var c3 = Math.cos(euler._z / 2);
			var s1 = Math.sin(euler._x / 2);
			var s2 = Math.sin(euler._y / 2);
			var s3 = Math.sin(euler._z / 2);
			var order = euler._order;
			if (order === 'XYZ') {
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
			} else if (order === 'YXZ') {
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
			} else if (order === 'ZXY') {
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
			} else if (order === 'ZYX') {
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
			} else if (order === 'YZX') {
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
			} else if (order === 'XZY') {
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
			}
			if (update === true) this.onChangeCallback();
			return this;
		}

		/**
		 * Sets this quaternion from rotation component of m.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Quaternion}
		 */;
		_proto.setFromRotationMatrix = function setFromRotationMatrix(m) {
			var te = m.elements,
				m11 = te[0],
				m12 = te[4],
				m13 = te[8],
				m21 = te[1],
				m22 = te[5],
				m23 = te[9],
				m31 = te[2],
				m32 = te[6],
				m33 = te[10],
				trace = m11 + m22 + m33;
			var s;
			if (trace > 0) {
				s = 0.5 / Math.sqrt(trace + 1.0);
				this._w = 0.25 / s;
				this._x = (m32 - m23) * s;
				this._y = (m13 - m31) * s;
				this._z = (m21 - m12) * s;
			} else if (m11 > m22 && m11 > m33) {
				s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
				this._w = (m32 - m23) / s;
				this._x = 0.25 * s;
				this._y = (m12 + m21) / s;
				this._z = (m13 + m31) / s;
			} else if (m22 > m33) {
				s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
				this._w = (m13 - m31) / s;
				this._x = (m12 + m21) / s;
				this._y = 0.25 * s;
				this._z = (m23 + m32) / s;
			} else {
				s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
				this._w = (m21 - m12) / s;
				this._x = (m13 + m31) / s;
				this._y = (m23 + m32) / s;
				this._z = 0.25 * s;
			}
			this.onChangeCallback();
			return this;
		}

		/**
		 * vFrom and vTo are assumed to be normalized.
		 * @param {t3d.Vector3} vFrom
		 * @param {t3d.Vector3} vTo
		 * @return {t3d.Quaternion}
		 */;
		_proto.setFromUnitVectors = function setFromUnitVectors(vFrom, vTo) {
			// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

			// assumes direction vectors vFrom and vTo are normalized

			var r = vFrom.dot(vTo) + 1;
			if (r < Number.EPSILON) {
				r = 0;
				if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
					this._x = -vFrom.y;
					this._y = vFrom.x;
					this._z = 0;
					this._w = r;
				} else {
					this._x = 0;
					this._y = -vFrom.z;
					this._z = vFrom.y;
					this._w = r;
				}
			} else {
				// crossVectors(vFrom, vTo); // inlined to avoid cyclic dependency on Vector3

				this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
				this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
				this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
				this._w = r;
			}
			return this.normalize();
		}

		/**
		 * Multiplies this quaternion by q.
		 * @param {t3d.Quaternion} q
		 * @return {t3d.Quaternion}
		 */;
		_proto.multiply = function multiply(q) {
			return this.multiplyQuaternions(this, q);
		}

		/**
		 * Pre-multiplies this quaternion by q.
		 * @param {t3d.Quaternion} q
		 * @return {t3d.Quaternion}
		 */;
		_proto.premultiply = function premultiply(q) {
			return this.multiplyQuaternions(q, this);
		}

		/**
		 * Sets this quaternion to a x b.
		 * @param {t3d.Quaternion} a
		 * @param {t3d.Quaternion} b
		 * @return {t3d.Quaternion}
		 */;
		_proto.multiplyQuaternions = function multiplyQuaternions(a, b) {
			// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

			var qax = a._x,
				qay = a._y,
				qaz = a._z,
				qaw = a._w;
			var qbx = b._x,
				qby = b._y,
				qbz = b._z,
				qbw = b._w;
			this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
			this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
			this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
			this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Convert the current quaternion to a matrix4
		 * @param {t3d.Matrix4} target
		 * @return {t3d.Matrix4}
		 */;
		_proto.toMatrix4 = function toMatrix4(target) {
			if (target === void 0) {
				target = new Matrix4();
			}
			var ele = target.elements;
			var xy2 = 2.0 * this._x * this._y,
				xz2 = 2.0 * this._x * this._z,
				xw2 = 2.0 * this._x * this._w;
			var yz2 = 2.0 * this._y * this._z,
				yw2 = 2.0 * this._y * this._w,
				zw2 = 2.0 * this._z * this._w;
			var xx = this._x * this._x,
				yy = this._y * this._y,
				zz = this._z * this._z,
				ww = this._w * this._w;
			ele[0] = xx - yy - zz + ww;
			ele[4] = xy2 - zw2;
			ele[8] = xz2 + yw2;
			ele[12] = 0;
			ele[1] = xy2 + zw2;
			ele[5] = -xx + yy - zz + ww;
			ele[9] = yz2 - xw2;
			ele[13] = 0;
			ele[2] = xz2 - yw2;
			ele[6] = yz2 + xw2;
			ele[10] = -xx - yy + zz + ww;
			ele[14] = 0;
			ele[3] = 0.0;
			ele[7] = 0.0;
			ele[11] = 0;
			ele[15] = 1;
			return target;
		}

		/**
		 * Returns the rotational conjugate of this quaternion.
		 * The conjugate of a quaternion represents the same rotation in the opposite direction about the rotational axis.
		 * @return {t3d.Quaternion}
		 */;
		_proto.conjugate = function conjugate() {
			this._x *= -1;
			this._y *= -1;
			this._z *= -1;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Calculates the dot product of quaternions v and this one.
		 * @param {t3d.Quaternion} v
		 * @return {t3d.Quaternion}
		 */;
		_proto.dot = function dot(v) {
			return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
		}

		/**
		 * Set quaternion from axis angle
		 * @param {t3d.Vector3} axis
		 * @param {Number} angle
		 * @return {t3d.Quaternion}
		 */;
		_proto.setFromAxisAngle = function setFromAxisAngle(axis, angle) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

			// assumes axis is normalized

			var halfAngle = angle / 2,
				s = Math.sin(halfAngle);
			this._x = axis.x * s;
			this._y = axis.y * s;
			this._z = axis.z * s;
			this._w = Math.cos(halfAngle);
			this.onChangeCallback();
			return this;
		}

		/**
		 * Sets this quaternion's x, y, z and w properties from an array.
		 * @param {Number[]} - array of format (x, y, z, w) used to construct the quaternion.
		 * @param {Number} [offset=0] - an offset into the array.
		 * @return {t3d.Quaternion}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			this._x = array[offset];
			this._y = array[offset + 1];
			this._z = array[offset + 2];
			this._w = array[offset + 3];
			this.onChangeCallback();
			return this;
		}

		/**
		 * Returns the numerical elements of this quaternion in an array of format [x, y, z, w].
		 * @param {Number[]} [array] - An array to store the quaternion. If not specified, a new array will be created.
		 * @param {Number} [offset=0] - An offset into the array.
		 * @return {t3d.Quaternion}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			array[offset] = this._x;
			array[offset + 1] = this._y;
			array[offset + 2] = this._z;
			array[offset + 3] = this._w;
			return array;
		}

		/**
		 * @param {Function} callback - When the Quaternion angle value changes, the callback method is triggered
		 * @return {t3d.Quaternion}
		 */;
		_proto.onChange = function onChange(callback) {
			this.onChangeCallback = callback;
			return this;
		};
		_proto.onChangeCallback = function onChangeCallback() {};
		_createClass(Quaternion, [{
			key: "x",
			get: function get() {
				return this._x;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._x = value;
				this.onChangeCallback();
			}

			/**
			 * @type {Number}
			 */
		}, {
			key: "y",
			get: function get() {
				return this._y;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._y = value;
				this.onChangeCallback();
			}

			/**
			 * @type {Number}
			 */
		}, {
			key: "z",
			get: function get() {
				return this._z;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._z = value;
				this.onChangeCallback();
			}

			/**
			 * @type {Number}
			 */
		}, {
			key: "w",
			get: function get() {
				return this._w;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._w = value;
				this.onChangeCallback();
			}
		}]);
		return Quaternion;
	}();

	/**
	 * Used for quaternion property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var QuaternionKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(QuaternionKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function QuaternionKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		var _proto = QuaternionKeyframeTrack.prototype;
		_proto._interpolate = function _interpolate(index0, ratio, outBuffer) {
			var values = this.values;
			if (this.interpolant) {
				Quaternion.slerpFlat(outBuffer, 0, values, index0 * 4, values, (index0 + 1) * 4, ratio);
			} else {
				this._copyValue(index0, outBuffer);
			}
			return outBuffer;
		};
		return QuaternionKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'quaternion'
	 */
	QuaternionKeyframeTrack.prototype.valueTypeName = 'quaternion';

	/**
	 * Used for string property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var StringKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(StringKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function StringKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		var _proto = StringKeyframeTrack.prototype;
		_proto._interpolate = function _interpolate(index0, _ratio, outBuffer) {
			outBuffer[0] = this.values[index0];
			return outBuffer;
		};
		return StringKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'string'
	 */
	StringKeyframeTrack.prototype.valueTypeName = 'string';

	/**
	 * Used for vector property track.
	 * @memberof t3d
	 * @extends t3d.KeyframeTrack
	 */
	var VectorKeyframeTrack = /*#__PURE__*/function (_KeyframeTrack) {
		_inheritsLoose(VectorKeyframeTrack, _KeyframeTrack);
		/**
		 * @param {t3d.Object3D} target
		 * @param {String} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {Boolean} [interpolant=true]
		 */
		function VectorKeyframeTrack(target, propertyPath, times, values, interpolant) {
			return _KeyframeTrack.call(this, target, propertyPath, times, values, interpolant) || this;
		}
		return VectorKeyframeTrack;
	}(KeyframeTrack);
	/**
	 * @readonly
	 * @type {String}
	 * @default 'vector'
	 */
	VectorKeyframeTrack.prototype.valueTypeName = 'vector';

	/**
	 * Enum for material Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var MATERIAL_TYPE = {
		BASIC: "basic",
		LAMBERT: "lambert",
		PHONG: "phong",
		PBR: "pbr",
		PBR2: "pbr2",
		MATCAP: 'matcap',
		POINT: "point",
		LINE: "line",
		SHADER: "shader",
		DEPTH: "depth",
		DISTANCE: "distance"
	};

	/**
	 * Enum for blend Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var BLEND_TYPE = {
		NONE: "none",
		NORMAL: "normal",
		ADD: "add",
		SUB: "sub",
		MUL: "mul",
		CUSTOM: "custom"
	};

	/**
	 * Enum for blend equation.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var BLEND_EQUATION = {
		ADD: 100,
		SUBTRACT: 101,
		REVERSE_SUBTRACT: 102
	};

	/**
	 * Enum for blend factor.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var BLEND_FACTOR = {
		ZERO: 200,
		ONE: 201,
		SRC_COLOR: 202,
		SRC_ALPHA: 203,
		SRC_ALPHA_SATURATE: 204,
		DST_COLOR: 205,
		DST_ALPHA: 206,
		ONE_MINUS_SRC_COLOR: 207,
		ONE_MINUS_SRC_ALPHA: 208,
		ONE_MINUS_DST_COLOR: 209,
		ONE_MINUS_DST_ALPHA: 210
	};

	/**
	 * Enum for cull face Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var CULL_FACE_TYPE = {
		NONE: "none",
		FRONT: "front",
		BACK: "back",
		FRONT_AND_BACK: "front_and_back"
	};

	/**
	 * Enum for draw side.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var DRAW_SIDE = {
		FRONT: "front",
		BACK: "back",
		DOUBLE: "double"
	};

	/**
	 * Enum for shading side.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var SHADING_TYPE = {
		SMOOTH_SHADING: "smooth_shading",
		FLAT_SHADING: "flat_shading"
	};

	/**
	 * Enum for pixel format.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var PIXEL_FORMAT = {
		DEPTH_COMPONENT: 1000,
		DEPTH_STENCIL: 1001,
		STENCIL_INDEX8: 1002,
		ALPHA: 1003,
		RED: 1004,
		RGB: 1005,
		RGBA: 1006,
		LUMINANCE: 1007,
		LUMINANCE_ALPHA: 1008,
		/** Only webgl2 */
		RED_INTEGER: 1010,
		RG: 1011,
		RG_INTEGER: 1012,
		RGB_INTEGER: 1013,
		RGBA_INTEGER: 1014,
		/** Only internal formats and webgl2 */
		R32F: 1100,
		R16F: 1101,
		R8: 1102,
		RG32F: 1103,
		RG16F: 1104,
		RG8: 1105,
		RGB32F: 1106,
		RGB16F: 1107,
		RGB8: 1108,
		RGBA32F: 1109,
		RGBA16F: 1110,
		RGBA8: 1111,
		RGBA4: 1112,
		RGB5_A1: 1113,
		DEPTH_COMPONENT32F: 1114,
		DEPTH_COMPONENT24: 1115,
		DEPTH_COMPONENT16: 1116,
		DEPTH24_STENCIL8: 1117,
		DEPTH32F_STENCIL8: 1118,
		/** For compressed texture formats */
		RGB_S3TC_DXT1: 1200,
		RGBA_S3TC_DXT1: 1201,
		RGBA_S3TC_DXT3: 1202,
		RGBA_S3TC_DXT5: 1203,
		RGB_PVRTC_4BPPV1: 1204,
		RGB_PVRTC_2BPPV1: 1205,
		RGBA_PVRTC_4BPPV1: 1206,
		RGBA_PVRTC_2BPPV1: 1207,
		RGB_ETC1: 1208,
		RGBA_ASTC_4x4: 1209,
		RGBA_BPTC: 1210
	};

	/**
	 * Enum for pixel Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var PIXEL_TYPE = {
		UNSIGNED_BYTE: 1500,
		UNSIGNED_SHORT_5_6_5: 1501,
		UNSIGNED_SHORT_4_4_4_4: 1502,
		UNSIGNED_SHORT_5_5_5_1: 1503,
		UNSIGNED_SHORT: 1504,
		UNSIGNED_INT: 1505,
		UNSIGNED_INT_24_8: 1506,
		FLOAT: 1507,
		HALF_FLOAT: 1508,
		FLOAT_32_UNSIGNED_INT_24_8_REV: 1509,
		BYTE: 1510,
		SHORT: 1511,
		INT: 1512
	};

	/**
	 * Enum for texture filter.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var TEXTURE_FILTER = {
		NEAREST: 1600,
		LINEAR: 1601,
		NEAREST_MIPMAP_NEAREST: 1602,
		LINEAR_MIPMAP_NEAREST: 1603,
		NEAREST_MIPMAP_LINEAR: 1604,
		LINEAR_MIPMAP_LINEAR: 1605
	};

	/**
	 * Enum for texture wrap.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var TEXTURE_WRAP = {
		REPEAT: 1700,
		CLAMP_TO_EDGE: 1701,
		MIRRORED_REPEAT: 1702
	};

	/**
	 * Enum for compare function.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var COMPARE_FUNC = {
		LEQUAL: 0x0203,
		GEQUAL: 0x0206,
		LESS: 0x0201,
		GREATER: 0x0204,
		EQUAL: 0x0202,
		NOTEQUAL: 0x0205,
		ALWAYS: 0x0207,
		NEVER: 0x0200
	};

	/**
	 * Enum for operation.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var OPERATION = {
		KEEP: 0x1E00,
		REPLACE: 0x1E01,
		INCR: 0x1E02,
		DECR: 0x1E03,
		INVERT: 0x150A,
		INCR_WRAP: 0x8507,
		DECR_WRAP: 0x8508
	};

	/**
	 * Enum for Shadow Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var SHADOW_TYPE = {
		HARD: "hard",
		POISSON_SOFT: "poisson_soft",
		PCF3_SOFT: "pcf3_soft",
		PCF5_SOFT: "pcf5_soft",
		/** Only webgl2 */
		PCSS16_SOFT: "pcss16_soft",
		/** Only webgl2 */
		PCSS32_SOFT: "pcss32_soft",
		/** Only webgl2 */
		PCSS64_SOFT: "pcss64_soft"
	};

	/**
	 * Enum for Texel Encoding Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var TEXEL_ENCODING_TYPE = {
		LINEAR: "linear",
		SRGB: "sRGB",
		RGBE: "RGBE",
		RGBM7: "RGBM7",
		RGBM16: "RGBM16",
		RGBD: "RGBD",
		GAMMA: "Gamma"
	};

	/**
	 * Enum for Envmap Combine Type.
	 * @memberof t3d
	 * @readonly
	 * @enum {String}
	 */
	var ENVMAP_COMBINE_TYPE = {
		MULTIPLY: "ENVMAP_BLENDING_MULTIPLY",
		MIX: "ENVMAP_BLENDING_MIX",
		ADD: "ENVMAP_BLENDING_ADD"
	};

	/**
	 * Enum for Draw Mode.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var DRAW_MODE = {
		POINTS: 0,
		LINES: 1,
		LINE_LOOP: 2,
		LINE_STRIP: 3,
		TRIANGLES: 4,
		TRIANGLE_STRIP: 5,
		TRIANGLE_FAN: 6
	};

	/**
	 * Enum for Vertex Color.
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var VERTEX_COLOR = {
		NONE: 0,
		RGB: 1,
		RGBA: 2
	};

	/**
	 * Enum for ATTACHMENT
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var ATTACHMENT = {
		COLOR_ATTACHMENT0: 2000,
		COLOR_ATTACHMENT1: 2001,
		COLOR_ATTACHMENT2: 2002,
		COLOR_ATTACHMENT3: 2003,
		COLOR_ATTACHMENT4: 2004,
		COLOR_ATTACHMENT5: 2005,
		COLOR_ATTACHMENT6: 2006,
		COLOR_ATTACHMENT7: 2007,
		COLOR_ATTACHMENT8: 2008,
		COLOR_ATTACHMENT9: 2009,
		COLOR_ATTACHMENT10: 2010,
		COLOR_ATTACHMENT11: 2011,
		COLOR_ATTACHMENT12: 2012,
		COLOR_ATTACHMENT13: 2013,
		COLOR_ATTACHMENT14: 2014,
		COLOR_ATTACHMENT15: 2015,
		DEPTH_ATTACHMENT: 2020,
		STENCIL_ATTACHMENT: 2021,
		DEPTH_STENCIL_ATTACHMENT: 2030
	};

	/**
	 * Enum for BUFFER_USAGE
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var BUFFER_USAGE = {
		STREAM_DRAW: 35040,
		STREAM_READ: 35041,
		STREAM_COPY: 35042,
		STATIC_DRAW: 35044,
		STATIC_READ: 35045,
		STATIC_COPY: 35046,
		DYNAMIC_DRAW: 35048,
		DYNAMIC_READ: 35049,
		DYNAMIC_COPY: 35050
	};

	/**
	 * Enum for QUERY_TYPE
	 * @memberof t3d
	 * @readonly
	 * @enum {Number}
	 */
	var QUERY_TYPE = {
		ANY_SAMPLES_PASSED: 7000,
		ANY_SAMPLES_PASSED_CONSERVATIVE: 7001,
		TIME_ELAPSED: 7002
	};

	/**
	 * JavaScript events for custom objects.
	 * @memberof t3d
	 */
	var EventDispatcher = /*#__PURE__*/function () {
		function EventDispatcher() {}
		var _proto = EventDispatcher.prototype;
		/**
		 * Adds a listener to an event type.
		 * @param {String} type - The type of event to listen to.
		 * @param {Function} listener - The function that gets called when the event is fired.
		 * @param {Object} [thisObject = this] - The Object of calling listener method.
		 */
		_proto.addEventListener = function addEventListener(type, listener, thisObject) {
			if (this._eventMap === undefined) this._eventMap = {};
			var eventMap = this._eventMap;
			if (eventMap[type] === undefined) {
				eventMap[type] = [];
			}
			eventMap[type].push({
				listener: listener,
				thisObject: thisObject || this
			});
		}

		/**
		 * Removes a listener from an event type.
		 * @param {String} type - The type of the listener that gets removed.
		 * @param {Function} listener - The listener function that gets removed.
		 * @param {Object} [thisObject = this] thisObject - The Object of calling listener method.
		 */;
		_proto.removeEventListener = function removeEventListener(type, listener, thisObject) {
			if (this._eventMap === undefined) return;
			var eventMap = this._eventMap;
			var eventArray = eventMap[type];
			if (eventArray !== undefined) {
				for (var i = 0, len = eventArray.length; i < len; i++) {
					var bin = eventArray[i];
					if (bin.listener === listener && bin.thisObject === (thisObject || this)) {
						eventArray.splice(i, 1);
						break;
					}
				}
			}
		}

		/**
		 * Fire an event.
		 * @param {Object} event - The event that gets fired.
		 */;
		_proto.dispatchEvent = function dispatchEvent(event) {
			if (this._eventMap === undefined) return;
			var eventMap = this._eventMap;
			var eventArray = eventMap[event.type];
			if (eventArray !== undefined) {
				event.target = this;

				// Make a copy, in case listeners are removed while iterating.
				var array = eventArray.slice(0);
				for (var i = 0, len = array.length; i < len; i++) {
					var bin = array[i];
					bin.listener.call(bin.thisObject, event);
				}
				event.target = null;
			}
		};
		return EventDispatcher;
	}();

	/**
	 * AnimationAction wraps AnimationClip and is mainly responsible for the update logic of time.
	 * You can extend other functions by inheriting this class, such as repeat playback, pingpang, etc.
	 * And since this class inherits from EventDispatcher, animation events can also be extended.
	 * @memberof t3d
	 * @extends t3d.EventDispatcher
	 */
	var AnimationAction = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(AnimationAction, _EventDispatcher);
		/**
		 * @param {t3d.KeyframeClip} clip - The keyframe clip for this action.
		 */
		function AnimationAction(clip) {
			var _this;
			_this = _EventDispatcher.call(this) || this;

			/**
						 * The keyframe clip for this action.
			 * @type {t3d.KeyframeClip}
						 */
			_this.clip = clip;

			/**
						 * The degree of influence of this action (in the interval [0, 1]).
						 * Values can be used to blend between several actions.
			 * @type {Number}
						 * @default 0
						 */
			_this.weight = 0;

			/**
						 * The local time of this action (in seconds).
			 * @type {Number}
						 */
			_this.time = 0;

			/**
						 * The blend mode for this action, currently only two values BLEND_TYPE.NORMAL and BLEND_TYPE.ADD are available.
			 * @type {t3d.BLEND_TYPE}
			 * @default {t3d.BLEND_TYPE.NORMAL}
						 */
			_this.blendMode = BLEND_TYPE.NORMAL;
			return _this;
		}

		/**
				* Update time.
				* @param {Number} deltaTime - The delta time in seconds.
				*/
		var _proto = AnimationAction.prototype;
		_proto.update = function update(deltaTime) {
			this.time += deltaTime;
			var endTime = this.clip.duration;
			if (endTime === 0) {
				this.time = 0;
				return;
			}
			if (this.time > endTime) {
				this.time = this.time % endTime;
			}
			if (this.time < 0) {
				this.time = this.time % endTime + endTime;
			}
		};
		return AnimationAction;
	}(EventDispatcher);

	/**
	 * This holds a reference to a real property in the scene graph; used internally.
	 * Binding property and value, mixer for multiple values.
	 * @memberof t3d
	 */
	var PropertyBindingMixer = /*#__PURE__*/function () {
		/**
		 * @param {Object3D} target
		 * @param {String} propertyPath
		 * @param {String} typeName - vector/bool/string/quaternion/number/color
		 * @param {Number} valueSize
		 */
		function PropertyBindingMixer(target, propertyPath, typeName, valueSize) {
			this.target = null;
			this.property = "";
			this.parseBinding(target, propertyPath);
			this.valueSize = valueSize;
			var BufferType = Float64Array;
			var mixFunction, mixFunctionAdditive, setIdentity;
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
		var _proto = PropertyBindingMixer.prototype;
		_proto.parseBinding = function parseBinding(target, propertyPath) {
			propertyPath = propertyPath.split(".");
			if (propertyPath.length > 1) {
				var property = target[propertyPath[0]];
				for (var index = 1; index < propertyPath.length - 1; index++) {
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
		 */;
		_proto.saveOriginalState = function saveOriginalState() {
			var buffer = this.buffer,
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
			for (var i = stride, e = originalValueOffset; i !== e; ++i) {
				buffer[i] = buffer[originalValueOffset + i % stride];
			}

			// Add to identify for additive
			this._setIdentity(buffer, stride * 3, stride, originalValueOffset);
			this.cumulativeWeight = 0;
			this.cumulativeWeightAdditive = 0;
		}

		/**
		 * Apply the state previously taken via 'saveOriginalState' to the binding.
		 */;
		_proto.restoreOriginalState = function restoreOriginalState() {
			var buffer = this.buffer,
				stride = this.valueSize,
				originalValueOffset = stride * 2;

			// accu[0..1] := orig -- initially detect changes against the original
			for (var i = stride, e = originalValueOffset; i !== e; ++i) {
				buffer[i] = buffer[originalValueOffset + i % stride];
			}
			this.apply();
		}

		/**
				* Accumulate value.
				* @param {Number} weight
				*/;
		_proto.accumulate = function accumulate(weight) {
			var buffer = this.buffer,
				stride = this.valueSize,
				offset = stride;
			var currentWeight = this.cumulativeWeight;
			if (currentWeight === 0) {
				for (var i = 0; i !== stride; ++i) {
					buffer[offset + i] = buffer[i];
				}
				currentWeight = weight;
			} else {
				currentWeight += weight;
				var mix = weight / currentWeight;
				this._mixBufferFunction(buffer, offset, 0, mix, stride);
			}
			this.cumulativeWeight = currentWeight;
		}

		/**
				* Additive Accumulate value.
				* @param {Number} weight
				*/;
		_proto.accumulateAdditive = function accumulateAdditive(weight) {
			var buffer = this.buffer,
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
				*/;
		_proto.apply = function apply() {
			var buffer = this.buffer,
				stride = this.valueSize,
				weight = this.cumulativeWeight,
				weightAdditive = this.cumulativeWeightAdditive;
			this.cumulativeWeight = 0;
			this.cumulativeWeightAdditive = 0;
			if (weight < 1) {
				// accuN := accuN + original * ( 1 - cumulativeWeight )
				var originalValueOffset = stride * 2;
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
		};
		return PropertyBindingMixer;
	}(); // Mix functions
	function select(buffer, dstOffset, srcOffset, t, stride) {
		if (t >= 0.5) {
			for (var i = 0; i !== stride; ++i) {
				buffer[dstOffset + i] = buffer[srcOffset + i];
			}
		}
	}
	function slerp(buffer, dstOffset, srcOffset, t) {
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
	}
	var tempQuternionBuffer = new Float64Array(4);
	function slerpAdditive(buffer, dstOffset, srcOffset, t) {
		// Store result in tempQuternionBuffer
		Quaternion.multiplyQuaternionsFlat(tempQuternionBuffer, 0, buffer, dstOffset, buffer, srcOffset);
		// Slerp to the result
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, tempQuternionBuffer, 0, t);
	}
	function lerp(buffer, dstOffset, srcOffset, t, stride) {
		var s = 1 - t;
		for (var i = 0; i !== stride; ++i) {
			var j = dstOffset + i;
			buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
		}
	}
	function lerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
		for (var i = 0; i !== stride; ++i) {
			var j = dstOffset + i;
			buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
		}
	}

	// identity
	function setIdentityNumeric(buffer, offset, stride) {
		for (var i = 0; i < stride; i++) {
			buffer[offset + i] = 0;
		}
	}
	function setIdentityQuaternion(buffer, offset) {
		setIdentityNumeric(buffer, offset, 3);
		buffer[offset + 3] = 1;
	}
	function setIdentityOther(buffer, offset, stride, copyOffset) {
		for (var i = 0; i < stride; i++) {
			buffer[offset + i] = buffer[copyOffset + i];
		}
	}

	// get array
	function getArray(target, source, stride, count) {
		for (var i = 0; i < count; i++) {
			target[i] = source[stride + i];
		}
	}
	function setArray(target, source, stride, count) {
		for (var i = 0; i < count; i++) {
			target[stride + i] = source[i];
		}
	}

	/**
	 * The AnimationMixer is a player for animations on a particular object in the scene.
	 * When multiple objects in the scene are animated independently, one AnimationMixer may be used for each object.
	 * @memberof t3d
	 */
	var AnimationMixer = /*#__PURE__*/function () {
		function AnimationMixer() {
			this._actions = [];
			this._bindings = {};
		}

		/**
		 * Add an action to this mixer.
		 * @param {t3d.AnimationAction} action - The action to add.
		 */
		var _proto = AnimationMixer.prototype;
		_proto.addAction = function addAction(action) {
			if (this._actions.indexOf(action) !== -1) {
				console.warn("AnimationMixer.addAction(): already has the action, clip name is <" + action.clip.name + ">.");
				return;
			}
			this._actions.push(action);
			var tracks = action.clip.tracks;
			for (var i = 0; i < tracks.length; i++) {
				var track = tracks[i];
				var trackName = track.name;
				if (!this._bindings[trackName]) {
					var binding = new PropertyBindingMixer(track.target, track.propertyPath, track.valueTypeName, track.valueSize);
					this._bindings[trackName] = {
						binding: binding,
						referenceCount: 0,
						active: false,
						cachedActive: false
					};
				}
				this._bindings[trackName].referenceCount++;
			}
		}

		/**
		 * Remove an action from this mixer.
		 * @param {t3d.AnimationAction} action - The action to be removed.
		 */;
		_proto.removeAction = function removeAction(action) {
			var index = this._actions.indexOf(action);
			if (index === -1) {
				console.warn("AnimationMixer.removeAction(): action not found in this mixer, clip name is <" + action.clip.name + ">.");
				return;
			}
			if (action.weight > 0) {
				console.warn("AnimationMixer.removeAction(): make sure action's weight is zero before removing it.");
				return;
			}
			this._actions.splice(index, 1);
			var tracks = clip.tracks;
			for (var i = 0; i < tracks.length; i++) {
				var trackName = tracks[i].name;
				var bindingInfo = this._bindings[trackName];
				if (bindingInfo) {
					if (--bindingInfo.referenceCount <= 0) {
						if (bindingInfo.cachedActive) {
							bindingInfo.binding.restoreOriginalState();
						}
						delete this._bindings[trackName];
					}
				}
			}
		}

		/**
		 * Whether has this action.
		 * @param {t3d.AnimationAction} action - The action.
		 * @return {Boolean}
		 */;
		_proto.hasAction = function hasAction(action) {
			return this._actions.indexOf(action) > -1;
		}

		/**
		 * Get all actions.
		 * @return {t3d.AnimationAction[]}
		 */;
		_proto.getActions = function getActions() {
			return this._actions;
		}

		/**
		 * Advances the global mixer time and updates the animation.
		 * @param {Number} deltaTime - The delta time in seconds.
		 */;
		_proto.update = function update(deltaTime) {
			// Mark active to false for all bindings.

			for (var bindingName in this._bindings) {
				this._bindings[bindingName].active = false;
			}

			// Update the time of actions with a weight greater than 1
			// And accumulate those bindings

			for (var i = 0, l = this._actions.length; i < l; i++) {
				var action = this._actions[i];
				if (action.weight > 0) {
					action.update(deltaTime);
					var tracks = action.clip.tracks;
					for (var j = 0, tl = tracks.length; j < tl; j++) {
						var track = tracks[j];
						var bindingInfo = this._bindings[track.name];
						var binding = bindingInfo.binding;
						bindingInfo.active = true;
						if (!bindingInfo.cachedActive) {
							bindingInfo.binding.saveOriginalState();
							bindingInfo.cachedActive = true;
						}
						track.getValue(action.time, binding.buffer);
						if (action.blendMode === BLEND_TYPE.ADD) {
							binding.accumulateAdditive(action.weight);
						} else {
							binding.accumulate(action.weight);
						}
					}
				}
			}

			// Apply all bindings.

			for (var _bindingName in this._bindings) {
				var _bindingInfo = this._bindings[_bindingName];
				if (_bindingInfo.active) {
					_bindingInfo.binding.apply();
				} else {
					if (_bindingInfo.cachedActive) {
						_bindingInfo.binding.restoreOriginalState();
						_bindingInfo.cachedActive = false;
					}
				}
			}
		};
		return AnimationMixer;
	}();

	/**
	 * An KeyframeClip is a reusable set of keyframe tracks which represent an animation.
	 * @memberof t3d
	 */
	var KeyframeClip = /*#__PURE__*/function () {
		/**
		 * @param {String} name - A name for this clip.
		 * @param {t3d.KeyframeTrack[]} tracks - An array of KeyframeTracks.
		 * @param {Number} [duration] - The duration of this clip (in seconds). If not passed, the duration will be calculated from the passed tracks array.
		 */
		function KeyframeClip(name, tracks, duration) {
			if (duration === void 0) {
				duration = -1;
			}
			/**
			 * A name for this clip.
			 * @type {String}
			 */
			this.name = name;

			/**
			 * An array of KeyframeTracks.
			 * @type {t3d.KeyframeTrack[]}
			 */
			this.tracks = tracks;

			/**
			 * The duration of this clip (in seconds).
			 * If a negative value is passed, the duration will be calculated from the passed tracks array.
			 * @type {Number}
			 */
			this.duration = duration;
			if (this.duration < 0) {
				this.resetDuration();
			}
		}

		/**
		 * Sets the duration of the clip to the duration of its longest KeyframeTrack.
		 * @return {t3d.KeyframeClip}
		 */
		var _proto = KeyframeClip.prototype;
		_proto.resetDuration = function resetDuration() {
			var tracks = this.tracks;
			var duration = 0;
			for (var i = 0, l = tracks.length; i < l; i++) {
				var track = tracks[i];
				duration = Math.max(duration, track.times[track.times.length - 1]);
			}
			this.duration = duration;
			return this;
		};
		return KeyframeClip;
	}();

	/**
	 * Handles and keeps track of loaded and pending data. A default global instance of this class is created and used by loaders if not supplied manually - see {@link t3d.DefaultLoadingManager}.
	 * In general that should be sufficient, however there are times when it can be useful to have seperate loaders - for example if you want to show seperate loading bars for objects and textures.
	 * In addition to observing progress, a LoadingManager can be used to override resource URLs during loading. This may be helpful for assets coming from drag-and-drop events, WebSockets, WebRTC, or other APIs.
	 * @memberof t3d
	 */
	var LoadingManager = /*#__PURE__*/function () {
		/**
		 * Creates a new LoadingManager.
		 * @param {Function} [onLoad] — this function will be called when all loaders are done.
		 * @param {Function} [onProgress] — this function will be called when an item is complete.
		 * @param {Function} [onError] — this function will be called a loader encounters errors.
		 */
		function LoadingManager(onLoad, onProgress, onError) {
			this.isLoading = false;
			this.itemsLoaded = 0;
			this.itemsTotal = 0;
			this.urlModifier = undefined;

			/**
			 * This function will be called when loading starts.
			 * The arguments are:
			 * url — The url of the item just loaded.
			 * itemsLoaded — the number of items already loaded so far.
			 * itemsTotal — the total amount of items to be loaded.
			 * @type {Function}
			 * @default undefined
			 */
			this.onStart = undefined;
			this.onLoad = onLoad;
			this.onProgress = onProgress;
			this.onError = onError;
		}

		/**
		 * This should be called by any loader using the manager when the loader starts loading an url.
		 * @param {String} url - the url to load.
		 */
		var _proto = LoadingManager.prototype;
		_proto.itemStart = function itemStart(url) {
			this.itemsTotal++;
			if (this.isLoading === false) {
				if (this.onStart !== undefined) {
					this.onStart(url, this.itemsLoaded, this.itemsTotal);
				}
			}
			this.isLoading = true;
		}

		/**
		 * This should be called by any loader using the manager when the loader ended loading an url.
		 * @param {String} url - the loaded url.
		 */;
		_proto.itemEnd = function itemEnd(url) {
			this.itemsLoaded++;
			if (this.onProgress !== undefined) {
				this.onProgress(url, this.itemsLoaded, this.itemsTotal);
			}
			if (this.itemsLoaded === this.itemsTotal) {
				this.isLoading = false;
				if (this.onLoad !== undefined) {
					this.onLoad();
				}
			}
		}

		/**
		 * This should be called by any loader using the manager when the loader errors loading an url.
		 * @param {String} url - the loaded url.
		 */;
		_proto.itemError = function itemError(url) {
			if (this.onError !== undefined) {
				this.onError(url);
			}
		}

		/**
		 * Given a URL, uses the URL modifier callback (if any) and returns a resolved URL.
		 * If no URL modifier is set, returns the original URL.
		 * @param {String} url - the url to load.
		 */;
		_proto.resolveURL = function resolveURL(url) {
			if (this.urlModifier) {
				return this.urlModifier(url);
			}
			return url;
		}

		/**
		 * If provided, the callback will be passed each resource URL before a request is sent.
		 * The callback may return the original URL, or a new URL to override loading behavior.
		 * This behavior can be used to load assets from .ZIP files, drag-and-drop APIs, and Data URIs.
		 * @param {Function} callback - URL modifier callback. Called with url argument, and must return resolvedURL.
		 */;
		_proto.setURLModifier = function setURLModifier(callback) {
			this.urlModifier = callback;
			return this;
		};
		return LoadingManager;
	}();
	/**
	 * A global instance of the {@link t3d.LoadingManager}, used by most loaders when no custom manager has been specified.
	 * This will be sufficient for most purposes, however there may be times when you desire separate loading managers for say, textures and models.
	 * @memberof t3d
	 */
	var DefaultLoadingManager = new LoadingManager();

	/**
	 * Base class for implementing loaders.
	 * @memberof t3d
	 */
	var Loader = /*#__PURE__*/function () {
		/**
				* Creates a new Loader.
				* @param {t3d.LoadingManager} [manager=t3d.DefaultLoadingManager] - The loadingManager the loader is using.
				*/
		function Loader(manager) {
			/**
						 * The loadingManager the loader is using.
						 * @type {t3d.LoadingManager}
						 * @default t3d.DefaultLoadingManager
						 */
			this.manager = manager !== undefined ? manager : DefaultLoadingManager;

			/**
						 * The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS.
						 * @type {String}
						 * @default 'anonymous'
						 */
			this.crossOrigin = 'anonymous';

			/**
						 * Whether the XMLHttpRequest uses credentials.
						 * @type {Boolean}
						 * @default false
						 */
			this.withCredentials = false;

			/**
						 * The base path from which the asset will be loaded.
						 * @type {String}
						 * @default ''
						 */
			this.path = '';

			/**
						 * The request header used in HTTP request.
						 * @type {Object}
						 * @default {}
						 */
			this.requestHeader = {};
		}

		/**
				* This method needs to be implement by all concrete loaders.
				* It holds the logic for loading the asset from the backend.
				*/
		var _proto = Loader.prototype;
		_proto.load = function load( /* url, onLoad, onProgress, onError */) {}

		/**
				* This method is equivalent to .load, but returns a Promise.
				* onLoad is handled by Promise.resolve and onError is handled by Promise.reject.
				* @param {String} url - A string containing the path/URL of the file to be loaded.
				* @param {Function} [onProgress] - A function to be called while the loading is in progress.
				* The argument will be the ProgressEvent instance, which contains .lengthComputable, .total and .loaded.
				* If the server does not set the Content-Length header; .total will be 0.
				* @return {Promise}
				*/;
		_proto.loadAsync = function loadAsync(url, onProgress) {
			var scope = this;
			return new Promise(function (resolve, reject) {
				scope.load(url, resolve, onProgress, reject);
			});
		}

		/**
				* @param {String} crossOrigin - The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS.
				* @return {this}
				*/;
		_proto.setCrossOrigin = function setCrossOrigin(crossOrigin) {
			this.crossOrigin = crossOrigin;
			return this;
		}

		/**
				* @param {Boolean} value - Whether the XMLHttpRequest uses credentials such as cookies, authorization headers or TLS client certificates.
				* Note that this has no effect if you are loading files locally or from the same domain.
				* @return {this}
				*/;
		_proto.setWithCredentials = function setWithCredentials(value) {
			this.withCredentials = value;
			return this;
		}

		/**
				* @param {String} path - Set the base path for the asset.
				* @return {this}
				*/;
		_proto.setPath = function setPath(path) {
			this.path = path;
			return this;
		}

		/**
				* @param {Object} requestHeader - key: The name of the header whose value is to be set. value: The value to set as the body of the header.
				* @return {this}
				*/;
		_proto.setRequestHeader = function setRequestHeader(requestHeader) {
			this.requestHeader = requestHeader;
			return this;
		};
		return Loader;
	}();

	/**
	 * A low level class for loading resources with Fetch, used internaly by most loaders.
	 * It can also be used directly to load any file type that does not have a loader.
	 * @memberof t3d
	 * @extends t3d.Loader
	 */
	var FileLoader = /*#__PURE__*/function (_Loader) {
		_inheritsLoose(FileLoader, _Loader);
		function FileLoader(manager) {
			var _this;
			_this = _Loader.call(this, manager) || this;

			/**
			 * The expected response type. See {@link t3d.FileLoader.setResponseType}.
			 * @type {String}
			 * @default undefined
			 */
			_this.responseType = undefined;

			/**
			 * The expected mimeType. See {@link t3d.FileLoader.setMimeType}.
			 * @type {String}
			 * @default undefined
			 */
			_this.mimeType = undefined;
			return _this;
		}

		/**
		 * Load the URL and pass the response to the onLoad function.
		 * @param {String} url — the path or URL to the file. This can also be a Data URI.
		 * @param {Function} [onLoad=] — Will be called when loading completes. The argument will be the loaded response.
		 * @param {Function} [onProgress=] — Will be called while load progresses. The argument will be the XMLHttpRequest instance, which contains .total and .loaded bytes.
		 * @param {Function} [onError=] — Will be called if an error occurs.
		 */
		var _proto = FileLoader.prototype;
		_proto.load = function load(url, onLoad, onProgress, onError) {
			var _this2 = this;
			if (url === undefined) url = '';
			if (this.path != undefined) url = this.path + url;
			url = this.manager.resolveURL(url);

			// create request
			var req = new Request(url, {
				headers: new Headers(this.requestHeader),
				credentials: this.withCredentials ? 'include' : 'same-origin'
				// An abort controller could be added within a future PR
			});

			// record states ( avoid data race )
			var mimeType = this.mimeType;
			var responseType = this.responseType;

			// start the fetch
			fetch(req).then(function (response) {
				if (response.status === 200 || response.status === 0) {
					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if (response.status === 0) {
						console.warn('t3d.FileLoader: HTTP Status 0 received.');
					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
						return response;
					}
					var reader = response.body.getReader();
					var contentLength = response.headers.get('Content-Length');
					var total = contentLength ? parseInt(contentLength) : 0;
					var lengthComputable = total !== 0;
					var loaded = 0;

					// periodically read data into the new stream tracking while download progress
					var stream = new ReadableStream({
						start: function start(controller) {
							readData();
							function readData() {
								reader.read().then(function (_ref) {
									var done = _ref.done,
										value = _ref.value;
									if (done) {
										controller.close();
									} else {
										loaded += value.byteLength;
										var event = new ProgressEvent('progress', {
											lengthComputable: lengthComputable,
											loaded: loaded,
											total: total
										});
										if (onProgress !== undefined) {
											onProgress(event);
										}
										controller.enqueue(value);
										readData();
									}
								});
							}
						}
					});
					return new Response(stream);
				} else {
					throw new HttpError("fetch for \"" + response.url + "\" responded with " + response.status + ": " + response.statusText, response);
				}
			}).then(function (response) {
				switch (responseType) {
					case 'arraybuffer':
						return response.arrayBuffer();
					case 'blob':
						return response.blob();
					case 'document':
						return response.text().then(function (text) {
							var parser = new DOMParser();
							return parser.parseFromString(text, mimeType);
						});
					case 'json':
						return response.json();
					default:
						if (mimeType === undefined) {
							return response.text();
						} else {
							// sniff encoding
							var re = /charset="?([^;"\s]*)"?/i;
							var exec = re.exec(mimeType);
							var label = exec && exec[1] ? exec[1].toLowerCase() : undefined;
							var decoder = new TextDecoder(label);
							return response.arrayBuffer().then(function (ab) {
								return decoder.decode(ab);
							});
						}
				}
			}).then(function (data) {
				if (onLoad) onLoad(data);
			}).catch(function (err) {
				onError && onError(err);
				_this2.manager.itemError(url);
			}).finally(function () {
				_this2.manager.itemEnd(url);
			});
			this.manager.itemStart(url);
		}

		/**
		 * Change the response type. Valid values are:
		 * text or empty string (default) - returns the data as string.
		 * arraybuffer - loads the data into a ArrayBuffer and returns that.
		 * blob - returns the data as a Blob.
		 * document - parses the file using the DOMParser.
		 * json - parses the file using JSON.parse.
		 * @param {String} value
		 * @return {t3d.FileLoader}
		 */;
		_proto.setResponseType = function setResponseType(value) {
			this.responseType = value;
			return this;
		}

		/**
		 * Set the expected mimeType of the file being loaded.
		 * Note that in many cases this will be determined automatically, so by default it is undefined.
		 * @param {String} value
		 * @return {t3d.FileLoader}
		 */;
		_proto.setMimeType = function setMimeType(value) {
			this.mimeType = value;
			return this;
		};
		return FileLoader;
	}(Loader);
	var HttpError = /*#__PURE__*/function (_Error) {
		_inheritsLoose(HttpError, _Error);
		function HttpError(message, response) {
			var _this3;
			_this3 = _Error.call(this, message) || this;
			_this3.response = response;
			return _this3;
		}
		return HttpError;
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	/**
	 * A loader for loading an Image.
	 * @memberof t3d
	 * @extends t3d.Loader
	 */
	var ImageLoader = /*#__PURE__*/function (_Loader) {
		_inheritsLoose(ImageLoader, _Loader);
		function ImageLoader(manager) {
			return _Loader.call(this, manager) || this;
		}

		/**
		 * Begin loading from url and return the image object that will contain the data.
		 * @param {String} url — the path or URL to the file. This can also be a Data URI.
		 * @param {Function} [onLoad=] — Will be called when loading completes. The argument will be the loaded response.
		 * @param {Function} [onProgress=] — Will be called while load progresses. The argument will be the XMLHttpRequest instance, which contains .total and .loaded bytes.
		 * @param {Function} [onError=] — Will be called if an error occurs.
		 * @return {HTMLImageElement}
		 */
		var _proto = ImageLoader.prototype;
		_proto.load = function load(url, onLoad, onProgress, onError) {
			if (url === undefined) url = '';
			if (this.path !== undefined) url = this.path + url;
			url = this.manager.resolveURL(url);
			var scope = this;
			var image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
			function onImageLoad() {
				removeEventListeners();
				if (onLoad) onLoad(this);
				scope.manager.itemEnd(url);
			}
			function onImageError(event) {
				removeEventListeners();
				if (onError) onError(event);
				scope.manager.itemError(url);
				scope.manager.itemEnd(url);
			}
			function removeEventListeners() {
				image.removeEventListener('load', onImageLoad, false);
				image.removeEventListener('error', onImageError, false);
			}
			image.addEventListener('load', onImageLoad, false);
			image.addEventListener('error', onImageError, false);
			if (url.slice(0, 5) !== 'data:') {
				if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin;
			}
			scope.manager.itemStart(url);
			image.src = url;
			return image;
		};
		return ImageLoader;
	}(Loader);

	/**
	 * The vector 2 class
	 * @memberof t3d
	 */
	var Vector2 = /*#__PURE__*/function () {
		/**
		 * @param {Number} [x=0] - the x value of this vector.
		 * @param {Number} [y=0] - the y value of this vector.
		 */
		function Vector2(x, y) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			this.x = x;
			this.y = y;
		}

		/**
				* Sets the x and y components of this vector.
		 * @param {Number} x
		 * @param {Number} y
		 * @return {t3d.Vector2}
				*/
		var _proto = Vector2.prototype;
		_proto.set = function set(x, y) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			this.x = x;
			this.y = y;
			return this;
		}

		/**
				* Sets this vector to be the vector linearly interpolated between v1 and v2
		 * where ratio is the percent distance along the line connecting the two vectors
		 * - ratio = 0 will be v1, and ratio = 1 will be v2.
		 * @param {t3d.Vector2} v1 - the starting Vector2.
		 * @param {t3d.Vector2} v2 - Vector2 to interpolate towards.
		 * @param {Number} ratio - interpolation factor, typically in the closed interval [0, 1].
		 * @return {t3d.Vector2}
				*/;
		_proto.lerpVectors = function lerpVectors(v1, v2, ratio) {
			return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
		}

		/**
				* If this vector's x or y value is greater than v's x or y value, replace that value with the corresponding min value.
		 * @param {t3d.Vector2} v
		 * @return {t3d.Vector2}
				*/;
		_proto.min = function min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			return this;
		}

		/**
				* If this vector's x or y value is less than v's x or y value, replace that value with the corresponding max value.
		 * @param {t3d.Vector2} v
		 * @return {t3d.Vector2}
				*/;
		_proto.max = function max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			return this;
		}

		/**
				* Computes the Euclidean length (straight-line length) from (0, 0) to (x, y).
		 * @return {Number}
				*/;
		_proto.getLength = function getLength() {
			return Math.sqrt(this.getLengthSquared());
		}

		/**
				* Computes the square of the Euclidean length (straight-line length) from (0, 0) to (x, y).
		 * If you are comparing the lengths of vectors, you should compare the length squared instead
		 * as it is slightly more efficient to calculate.
		 * @return {Number}
				*/;
		_proto.getLengthSquared = function getLengthSquared() {
			return this.x * this.x + this.y * this.y;
		}

		/**
				* Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
		 * @param {Number} [thickness=1]
		 * @return {t3d.Vector2}
				*/;
		_proto.normalize = function normalize(thickness) {
			if (thickness === void 0) {
				thickness = 1;
			}
			var length = this.getLength() || 1;
			var invLength = thickness / length;
			this.x *= invLength;
			this.y *= invLength;
			return this;
		}

		/**
				* Subtracts v from the vector.
		 * @param {t3d.Vector2} a
		 * @param {t3d.Vector2} target - the result vector2
		 * @return {t3d.Vector2}
				*/;
		_proto.subtract = function subtract(a, target) {
			if (target === void 0) {
				target = new Vector2();
			}
			return target.set(this.x - a.x, this.y - a.y);
		}

		/**
				* Subtracts v from this vector.
		 * @param {t3d.Vector2} v
		 * @return {t3d.Vector2}
				*/;
		_proto.sub = function sub(v) {
			this.x -= v.x;
			this.y -= v.y;
			return this;
		}

		/**
				* Copies the values of the passed Vector2's x and y properties to this Vector2.
		 * @param {t3d.Vector2} v
		 * @return {t3d.Vector2}
				*/;
		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		}

		/**
				* Sets this vector to a + b.
		 * @param {t3d.Vector2} a
		 * @param {t3d.Vector2} b
		 * @return {t3d.Vector2}
				*/;
		_proto.addVectors = function addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			return this;
		}

		/**
				* Sets this vector to a - b.
		 * @param {t3d.Vector2} a
		 * @param {t3d.Vector2} b
		 * @return {t3d.Vector2}
				*/;
		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			return this;
		}

		/**
				* Multiplies this vector by scalar.
		 * @param {Number} scalar
		 * @return {t3d.Vector2}
				*/;
		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		}

		/**
				* Computes the squared distance from this vector to v. If you are just comparing the distance with
		 * another distance, you should compare the distance squared instead as it is slightly more efficient to calculate.
		 * @param {t3d.Vector2} v
		 * @return {Number}
				*/;
		_proto.distanceToSquared = function distanceToSquared(v) {
			var dx = this.x - v.x,
				dy = this.y - v.y;
			return dx * dx + dy * dy;
		}

		/**
				* Computes the distance from this vector to v.
		 * @param {t3d.Vector2} v
		 * @return {Number}
				*/;
		_proto.distanceTo = function distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		}

		/**
				* Sets this vector's x value to be array[ offset ] and y value to be array[ offset + 1 ].
		 * @param {Number[]} array - the source array.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {t3d.Vector2}
				*/;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			this.x = array[offset];
			this.y = array[offset + 1];
			return this;
		}

		/**
		 * Sets this array[ offset ] value to be vector's x and array[ offset + 1 ] to be vector's y.
		 * @param {Number[]} [array] - the target array.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {Number[]}
				*/;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			array[offset] = this.x;
			array[offset + 1] = this.y;
			return array;
		}

		/**
				* Adds v to this vector.
		 * @param {t3d.Vector2} v
		 * @return {t3d.Vector2}
				*/;
		_proto.add = function add(v) {
			this.x += v.x;
			this.y += v.y;
			return this;
		}

		/**
				* Computes the angle in radians of this vector with respect to the positive x-axis.
		 * @return {Number}
				*/;
		_proto.angle = function angle() {
			// computes the angle in radians with respect to the positive x-axis

			// let angle = Math.atan2(this.y, this.x);
			// if (angle < 0) angle += 2 * Math.PI;
			// return angle;

			return Math.atan2(-this.y, -this.x) + Math.PI;
		}

		/**
				* Returns a new Vector2 with the same x and y values as this one.
		 * @return {t3d.Vector2}
				*/;
		_proto.clone = function clone() {
			return new Vector2(this.x, this.y);
		};
		return Vector2;
	}();

	/**
	 * Represents an axis-aligned bounding box (AABB) in 2D space.
	 * @memberof t3d
	 */
	var Box2 = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector2} min - (optional) Vector2 representing the lower (x, y) boundary of the box.
		 * 								Default is ( + Infinity, + Infinity ).
		 * @param {t3d.Vector2} max - (optional) Vector2 representing the upper (x, y) boundary of the box.
		 * 								Default is ( - Infinity, - Infinity ).
		 */
		function Box2(min, max) {
			this.min = min !== undefined ? min : new Vector2(+Infinity, +Infinity);
			this.max = max !== undefined ? max : new Vector2(-Infinity, -Infinity);
		}

		/**
		 * @param {Number} x1
		 * @param {Number} y1
		 * @param {Number} x2
		 * @param {Number} y2
		 */
		var _proto = Box2.prototype;
		_proto.set = function set(x1, y1, x2, y2) {
			this.min.set(x1, y1);
			this.max.set(x2, y2);
		}

		/**
		 * Returns a new Box2 with the same min and max as this one.
		 * @return {t3d.Box2}
		 */;
		_proto.clone = function clone() {
			return new Box2().copy(this);
		}

		/**
		 * Copies the min and max from box to this box.
		 * @param {t3d.Box2} box
		 * @return {t3d.Box2}
		 */;
		_proto.copy = function copy(box) {
			this.min.copy(box.min);
			this.max.copy(box.max);
			return this;
		};
		return Box2;
	}();

	var _points = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];

	/**
	 * Represents an axis-aligned bounding box (AABB) in 3D space.
	 * @memberof t3d
	 */
	var Box3 = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector3} min - (optional) Vector3 representing the lower (x, y, z) boundary of the box.
		 * 								Default is ( + Infinity, + Infinity, + Infinity ).
		 * @param {t3d.Vector3} max - (optional) Vector3 representing the upper (x, y, z) boundary of the box.
		 * 								Default is ( - Infinity, - Infinity, - Infinity ).
		 */
		function Box3(min, max) {
			this.min = min !== undefined ? min : new Vector3(+Infinity, +Infinity, +Infinity);
			this.max = max !== undefined ? max : new Vector3(-Infinity, -Infinity, -Infinity);
		}

		/**
		 * Sets the lower and upper (x, y, z) boundaries of this box.
		 * @param {t3d.Vector3} min - Vector3 representing the lower (x, y, z) boundary of the box.
		 * @param {t3d.Vector3} max - Vector3 representing the lower upper (x, y, z) boundary of the box.
		 */
		var _proto = Box3.prototype;
		_proto.set = function set(min, max) {
			this.min.copy(min);
			this.max.copy(max);
		}

		/**
		 * Sets the upper and lower bounds of this box to include all of the points in points.
		 * @param {t3d.Vector3[]} points - Array of Vector3s that the resulting box will contain.
		 * @return {t3d.Box3}
		 */;
		_proto.setFromPoints = function setFromPoints(points) {
			this.makeEmpty();
			for (var i = 0, il = points.length; i < il; i++) {
				this.expandByPoint(points[i]);
			}
			return this;
		}

		/**
		 * Makes this box empty.
		 * @return {t3d.Box3}
		 */;
		_proto.makeEmpty = function makeEmpty() {
			this.min.x = this.min.y = this.min.z = +Infinity;
			this.max.x = this.max.y = this.max.z = -Infinity;
			return this;
		}

		/**
		 * Expands the boundaries of this box to include point.
		 * @param {t3d.Vector3} point - Vector3 that should be included in the box.
		 * @return {t3d.Box3}
		 */;
		_proto.expandByPoint = function expandByPoint(point) {
			this.min.min(point);
			this.max.max(point);
			return this;
		}

		/**
		 * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
		 * @param {Number} scalar - Distance to expand the box by.
		 * @return {t3d.Box3}
		 */;
		_proto.expandByScalar = function expandByScalar(scalar) {
			this.min.addScalar(-scalar);
			this.max.addScalar(scalar);
			return this;
		}

		/**
		 * Expands the boundaries of this box to include box3.
		 * @param {t3d.Box3} box3 - Box that will be unioned with this box.
		 * @return {t3d.Box3}
		 */;
		_proto.expandByBox3 = function expandByBox3(box3) {
			this.min.min(box3.min);
			this.max.max(box3.max);
			return this;
		}

		/**
		 * Sets the upper and lower bounds of this box to include all of the data in array.
		 * @param {Number[]} array - An array of position data that the resulting box will envelop.
		 * @param {Number} [gap=3]
		 * @param {Number} [offset=0]
		 * @return {t3d.Box3}
		 */;
		_proto.setFromArray = function setFromArray(array, gap, offset) {
			if (gap === void 0) {
				gap = 3;
			}
			if (offset === void 0) {
				offset = 0;
			}
			var minX = +Infinity;
			var minY = +Infinity;
			var minZ = +Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var maxZ = -Infinity;
			for (var i = 0, l = array.length; i < l; i += gap) {
				var x = array[i + offset];
				var y = array[i + offset + 1];
				var z = array[i + offset + 2];
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (z < minZ) minZ = z;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
				if (z > maxZ) maxZ = z;
			}
			this.min.set(minX, minY, minZ);
			this.max.set(maxX, maxY, maxZ);
			return this;
		}

		/**
		 * Returns true if this box includes zero points within its bounds.
		 * @return {Boolean}
		 */;
		_proto.isEmpty = function isEmpty() {
			// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
			return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
		}

		/**
		 * Returns true if this box and box share the same lower and upper bounds.
		 * @param {t3d.Box3} box - Box to compare with this one.
		 * @return {Boolean}
		 */;
		_proto.equals = function equals(box) {
			return box.min.equals(this.min) && box.max.equals(this.max);
		}

		/**
		 * Returns the center point of the box as a Vector3.
		 * @param {t3d.Vector3} optionalTarget - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		_proto.getCenter = function getCenter(optionalTarget) {
			var result = optionalTarget || new Vector3();
			return this.isEmpty() ? result.set(0, 0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);
		}

		/**
		 * Transforms this Box3 with the supplied matrix.
		 * @param {t3d.Matrix4} matrix - The Matrix4 to apply
		 * @return {t3d.Box3}
		 */;
		_proto.applyMatrix4 = function applyMatrix4(matrix) {
			// transform of empty box is an empty box.
			if (this.isEmpty()) return this;

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
			_points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
			_points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
			_points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
			_points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
			_points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
			_points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
			_points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

			this.setFromPoints(_points);
			return this;
		}

		/**
		 * Determines whether or not this box intersects triangle.
		 * @param {t3d.Triangle} triangle - Triangle to check for intersection against.
		 * @return {Boolean}
		 */;
		_proto.intersectsTriangle = function intersectsTriangle(triangle) {
			if (this.isEmpty()) {
				return false;
			}

			// compute box center and extents
			this.getCenter(_center);
			_extents.subVectors(this.max, _center);

			// translate triangle to aabb origin
			_v0$1.subVectors(triangle.a, _center);
			_v1$1.subVectors(triangle.b, _center);
			_v2$1.subVectors(triangle.c, _center);

			// compute edge vectors for triangle
			_f0.subVectors(_v1$1, _v0$1);
			_f1.subVectors(_v2$1, _v1$1);
			_f2.subVectors(_v0$1, _v2$1);

			// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
			// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
			// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
			var axes = [0, -_f0.z, _f0.y, 0, -_f1.z, _f1.y, 0, -_f2.z, _f2.y, _f0.z, 0, -_f0.x, _f1.z, 0, -_f1.x, _f2.z, 0, -_f2.x, -_f0.y, _f0.x, 0, -_f1.y, _f1.x, 0, -_f2.y, _f2.x, 0];
			if (!satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents)) {
				return false;
			}

			// test 3 face normals from the aabb
			axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
			if (!satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents)) {
				return false;
			}

			// finally testing the face normal of the triangle
			// use already existing triangle edge vectors here
			_triangleNormal.crossVectors(_f0, _f1);
			axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
			return satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents);
		}

		/**
		 * Returns a new Box3 with the same min and max as this one.
		 * @return {t3d.Box3}
		 */;
		_proto.clone = function clone() {
			return new Box3().copy(this);
		}

		/**
		 * Copies the min and max from box to this box.
		 * @param {t3d.Box3} box - Box3 to copy.
		 * @return {t3d.Box3}
		 */;
		_proto.copy = function copy(box) {
			this.min.copy(box.min);
			this.max.copy(box.max);
			return this;
		};
		return Box3;
	}(); // triangle centered vertices
	var _v0$1 = new Vector3();
	var _v1$1 = new Vector3();
	var _v2$1 = new Vector3();

	// triangle edge vectors

	var _f0 = new Vector3();
	var _f1 = new Vector3();
	var _f2 = new Vector3();
	var _center = new Vector3();
	var _extents = new Vector3();
	var _triangleNormal = new Vector3();
	var _testAxis = new Vector3();
	function satForAxes(axes, v0, v1, v2, extents) {
		for (var i = 0, j = axes.length - 3; i <= j; i += 3) {
			_testAxis.fromArray(axes, i);
			// project the aabb onto the separating axis
			var r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
			// project all 3 vertices of the triangle onto the separating axis
			var p0 = v0.dot(_testAxis);
			var p1 = v1.dot(_testAxis);
			var p2 = v2.dot(_testAxis);
			// actual test, basically see if either of the most extreme of the triangle points intersects r
			if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
				// points of the projected triangle are outside the projected half-length of the aabb
				// the axis is separating and we can exit
				return false;
			}
		}
		return true;
	}

	/**
	 * Color3 Class.
	 * @memberof t3d
	 */
	var Color3 = /*#__PURE__*/function () {
		/**
		 * @param {Number} r - (optional) If arguments g and b are defined, the red component of the color.
		 * 						If they are not defined, it can be a hexadecimal triplet (recommended).
		 * @param {Number} g - (optional) If it is defined, the green component of the color.
		 * @param {Number} b - (optional) If it is defined, the blue component of the color.
		 */
		function Color3(r, g, b) {
			this.r = 0;
			this.g = 0;
			this.b = 0;
			if (g === undefined && b === undefined) {
				return this.setHex(r);
			}
			this.setRGB(r, g, b);
		}

		/**
		 * Sets this color to be the color linearly interpolated
		 * between color1 and color2 where ratio is the percent distance along the line connecting the two colors
		 * - ratio = 0 will be color1, and ratio = 1 will be color2.
				* @param {t3d.Color3} c1 - the starting Color.
				* @param {t3d.Color3} c2 - Color to interpolate towards.
				* @param {Number} ratio - interpolation factor, typically in the closed interval [0, 1].
				*/
		var _proto = Color3.prototype;
		_proto.lerpColors = function lerpColors(c1, c2, ratio) {
			this.r = ratio * (c2.r - c1.r) + c1.r;
			this.g = ratio * (c2.g - c1.g) + c1.g;
			this.b = ratio * (c2.b - c1.b) + c1.b;
		}

		/**
		 * Linearly interpolates this color's RGB values toward the RGB values of the passed argument.
		 * The ratio argument can be thought of as the ratio between the two colors,
		 * where 0.0 is this color and 1.0 is the first argument.
				* @param {t3d.Color3} c - color to converge on.
				* @param {Number} ratio - interpolation factor in the closed interval [0, 1].
				*/;
		_proto.lerp = function lerp(c, ratio) {
			this.lerpColors(this, c, ratio);
		}

		/**
				* Returns a new Color with the same r, g and b values as this one.
		 * @return {t3d.Color3}
				*/;
		_proto.clone = function clone() {
			return new Color3(this.r, this.g, this.b);
		}

		/**
		 * Copies the r, g and b parameters from v in to this color.
				* @param {t3d.Color3} v
		 * @return {t3d.Color3}
				*/;
		_proto.copy = function copy(v) {
			this.r = v.r;
			this.g = v.g;
			this.b = v.b;
			return this;
		}

		/**
				* Set from hex.
		 * @param {Number} hex - hexadecimal triplet format.
		 * @return {t3d.Color3}
				*/;
		_proto.setHex = function setHex(hex) {
			hex = Math.floor(hex);
			this.r = (hex >> 16 & 255) / 255;
			this.g = (hex >> 8 & 255) / 255;
			this.b = (hex & 255) / 255;
			return this;
		}

		/**
				* Returns the hexadecimal value of this color.
		 * @return {Number}
				*/;
		_proto.getHex = function getHex() {
			return clamp$1(this.r * 255, 0, 255) << 16 ^ clamp$1(this.g * 255, 0, 255) << 8 ^ clamp$1(this.b * 255, 0, 255) << 0;
		}

		/**
				* Sets this color from RGB values.
		 * @param {Number} r - Red channel value between 0.0 and 1.0.
		 * @param {Number} g - Green channel value between 0.0 and 1.0.
		 * @param {Number} b - Blue channel value between 0.0 and 1.0.
		 * @return {t3d.Color3}
				*/;
		_proto.setRGB = function setRGB(r, g, b) {
			this.r = r;
			this.g = g;
			this.b = b;
			return this;
		}

		/**
				* Set from HSL.
		 * @param {Number} h - hue value between 0.0 and 1.0
		 * @param {Number} s - saturation value between 0.0 and 1.0
		 * @param {Number} l - lightness value between 0.0 and 1.0
		 * @return {t3d.Color3}
				*/;
		_proto.setHSL = function setHSL(h, s, l) {
			// h,s,l ranges are in 0.0 - 1.0
			h = euclideanModulo(h, 1);
			s = Math.max(0, Math.min(1, s));
			l = Math.max(0, Math.min(1, l));
			if (s === 0) {
				this.r = this.g = this.b = l;
			} else {
				var p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
				var q = 2 * l - p;
				this.r = hue2rgb(q, p, h + 1 / 3);
				this.g = hue2rgb(q, p, h);
				this.b = hue2rgb(q, p, h - 1 / 3);
			}
			return this;
		}

		/**
		 * Converts this color from sRGB space to linear space.
		 * @return {t3d.Color3}
		 */;
		_proto.convertSRGBToLinear = function convertSRGBToLinear() {
			this.r = SRGBToLinear(this.r);
			this.g = SRGBToLinear(this.g);
			this.b = SRGBToLinear(this.b);
			return this;
		}

		/**
		 * Converts this color from linear space to sRGB space.
		 * @return {t3d.Color3}
		 */;
		_proto.convertLinearToSRGB = function convertLinearToSRGB() {
			this.r = LinearToSRGB(this.r);
			this.g = LinearToSRGB(this.g);
			this.b = LinearToSRGB(this.b);
			return this;
		}

		/**
		 * Sets this color's components based on an array formatted like [ r, g, b ].
				* @param {Number[]} array - Array of floats in the form [ r, g, b ].
		 * @param {Number} [offset=0] - An offset into the array.
		 * @return {t3d.Color3}
				*/;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			this.r = array[offset];
			this.g = array[offset + 1];
			this.b = array[offset + 2];
			return this;
		}

		/**
		 * Returns an array of the form [ r, g, b ].
				* @param {Number[]} [array] - An array to store the color to.
		 * @param {Number} [offset=0] - An offset into the array.
		 * @return {Number[]}
				*/;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			array[offset] = this.r;
			array[offset + 1] = this.g;
			array[offset + 2] = this.b;
			return array;
		};
		return Color3;
	}();
	function euclideanModulo(n, m) {
		return (n % m + m) % m;
	}
	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
		return p;
	}
	function clamp$1(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
	function SRGBToLinear(c) {
		return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
	}
	function LinearToSRGB(c) {
		return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
	}

	var _matrix$1 = new Matrix4();

	/**
	 * Euler class.
	 * @memberof t3d
	 */
	var Euler = /*#__PURE__*/function () {
		/**
		 * @param {Number} [x=0]
		 * @param {Number} [y=0]
		 * @param {Number} [z=0]
		 * @param {String} [order=t3d.Euler.DefaultOrder]
		 */
		function Euler(x, y, z, order) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (order === void 0) {
				order = Euler.DefaultOrder;
			}
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;
		}

		/**
		 * @type {Number}
		 */
		var _proto = Euler.prototype;
		/**
				* Returns a new Euler with the same parameters as this one.
		 * @return {t3d.Euler}
				*/
		_proto.clone = function clone() {
			return new Euler(this._x, this._y, this._z, this._order);
		}

		/**
		 * Copies value of euler to this euler.
				* @param {t3d.Euler} euler
		 * @return {t3d.Euler}
				*/;
		_proto.copy = function copy(euler) {
			this._x = euler._x;
			this._y = euler._y;
			this._z = euler._z;
			this._order = euler._order;
			this.onChangeCallback();
			return this;
		}

		/**
				* @param {Number} x - the angle of the x axis in radians.
				* @param {Number} y - the angle of the y axis in radians.
				* @param {Number} z - the angle of the z axis in radians.
				* @param {String} order - (optional) a string representing the order that the rotations are applied.
		 * @return {t3d.Euler}
				*/;
		_proto.set = function set(x, y, z, order) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (order === void 0) {
				order = this._order;
			}
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;
			this.onChangeCallback();
			return this;
		}

		/**
		 * Sets the angles of this euler transform from a pure rotation matrix based on the orientation specified by order.
				* @param {t3d.Matrix4} m - a Matrix4 of which the upper 3x3 of matrix is a pure rotation matrix
				* @param {String} order - (optional) a string representing the order that the rotations are applied.
				* @param {Boolean} [update=true] - Whether to notify Euler angle has changed
		 * @return {t3d.Euler}
				*/;
		_proto.setFromRotationMatrix = function setFromRotationMatrix(m, order, update) {
			if (order === void 0) {
				order = this._order;
			}
			if (update === void 0) {
				update = true;
			}
			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

			var te = m.elements;
			var m11 = te[0],
				m12 = te[4],
				m13 = te[8];
			var m21 = te[1],
				m22 = te[5],
				m23 = te[9];
			var m31 = te[2],
				m32 = te[6],
				m33 = te[10];
			if (order === 'XYZ') {
				this._y = Math.asin(clamp(m13, -1, 1));
				if (Math.abs(m13) < 0.99999) {
					this._x = Math.atan2(-m23, m33);
					this._z = Math.atan2(-m12, m11);
				} else {
					this._x = Math.atan2(m32, m22);
					this._z = 0;
				}
			} else if (order === 'YXZ') {
				this._x = Math.asin(-clamp(m23, -1, 1));
				if (Math.abs(m23) < 0.99999) {
					this._y = Math.atan2(m13, m33);
					this._z = Math.atan2(m21, m22);
				} else {
					this._y = Math.atan2(-m31, m11);
					this._z = 0;
				}
			} else if (order === 'ZXY') {
				this._x = Math.asin(clamp(m32, -1, 1));
				if (Math.abs(m32) < 0.99999) {
					this._y = Math.atan2(-m31, m33);
					this._z = Math.atan2(-m12, m22);
				} else {
					this._y = 0;
					this._z = Math.atan2(m21, m11);
				}
			} else if (order === 'ZYX') {
				this._y = Math.asin(-clamp(m31, -1, 1));
				if (Math.abs(m31) < 0.99999) {
					this._x = Math.atan2(m32, m33);
					this._z = Math.atan2(m21, m11);
				} else {
					this._x = 0;
					this._z = Math.atan2(-m12, m22);
				}
			} else if (order === 'YZX') {
				this._z = Math.asin(clamp(m21, -1, 1));
				if (Math.abs(m21) < 0.99999) {
					this._x = Math.atan2(-m23, m22);
					this._y = Math.atan2(-m31, m11);
				} else {
					this._x = 0;
					this._y = Math.atan2(m13, m33);
				}
			} else if (order === 'XZY') {
				this._z = Math.asin(-clamp(m12, -1, 1));
				if (Math.abs(m12) < 0.99999) {
					this._x = Math.atan2(m32, m22);
					this._y = Math.atan2(m13, m11);
				} else {
					this._x = Math.atan2(-m23, m33);
					this._y = 0;
				}
			} else {
				console.warn('given unsupported order: ' + order);
			}
			this._order = order;
			if (update === true) this.onChangeCallback();
			return this;
		}

		/**
				* Sets the angles of this euler transform from a normalized quaternion based on the orientation specified by order.
		 * @param {t3d.Quaternion} q - a normalized quaternion.
		 * @param {String} order - (optional) a string representing the order that the rotations are applied.
		 * @param {Boolean} [update=true] - Whether to notify Euler angle has changed
		 * @return {t3d.Euler}
				*/;
		_proto.setFromQuaternion = function setFromQuaternion(q, order, update) {
			q.toMatrix4(_matrix$1);
			return this.setFromRotationMatrix(_matrix$1, order, update);
		}

		/**
		 * @param {Function} callback - When the Euler angle value changes, the callback method is triggered
		 * @return {t3d.Euler}
		 */;
		_proto.onChange = function onChange(callback) {
			this.onChangeCallback = callback;
			return this;
		};
		_proto.onChangeCallback = function onChangeCallback() {};
		_createClass(Euler, [{
			key: "x",
			get: function get() {
				return this._x;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._x = value;
				this.onChangeCallback();
			}

			/**
			 * @type {Number}
			 */
		}, {
			key: "y",
			get: function get() {
				return this._y;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._y = value;
				this.onChangeCallback();
			}

			/**
			 * @type {Number}
			 */
		}, {
			key: "z",
			get: function get() {
				return this._z;
			}

			/**
			 * @type {Number}
			 */,
			set: function set(value) {
				this._z = value;
				this.onChangeCallback();
			}

			/**
			 * @type {String}
			 */
		}, {
			key: "order",
			get: function get() {
				return this._order;
			}

			/**
			 * @type {String}
			 */,
			set: function set(value) {
				this._order = value;
				this.onChangeCallback();
			}
		}]);
		return Euler;
	}();
	/**
	 * The order in which to apply rotations.
	 * @readonly
	 */
	Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

	/**
		* The default order in which to apply rotations.
		* @readonly
		*/
	Euler.DefaultOrder = 'XYZ';
	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	/**
	 * The 3x3 matrix class.
	 * @memberof t3d
	 */
	var Matrix3 = /*#__PURE__*/function () {
		/**
		 * Create a 3x3 matrix.
		 */
		function Matrix3() {
			this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];
		}

		/**
		 * Sets the 3x3 matrix values to the given row-major sequence of values.
		 * @param {Number} n11 - value to put in row 1, col 1.
		 * @param {Number} n12 - value to put in row 1, col 2.
		 * @param {Number} n13 - value to put in row 1, col 3.
		 * @param {Number} n21 - value to put in row 2, col 1.
		 * @param {Number} n22 - value to put in row 2, col 2.
		 * @param {Number} n23 - value to put in row 2, col 3.
		 * @param {Number} n31 - value to put in row 3, col 1.
		 * @param {Number} n32 - value to put in row 3, col 2.
		 * @param {Number} n33 - value to put in row 3, col 3.
		 * @return {t3d.Matrix3}
		 */
		var _proto = Matrix3.prototype;
		_proto.set = function set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
			var ele = this.elements;
			ele[0] = n11;
			ele[3] = n12;
			ele[6] = n13;
			ele[1] = n21;
			ele[4] = n22;
			ele[7] = n23;
			ele[2] = n31;
			ele[5] = n32;
			ele[8] = n33;
			return this;
		}

		/**
		 * Resets this matrix to the 3x3 identity matrix
		 * @return {t3d.Matrix3}
		 */;
		_proto.identity = function identity() {
			return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
		}

		/**
		 * Take the inverse of this matrix
		 * @return {t3d.Matrix3}
		 */;
		_proto.inverse = function inverse() {
			return this.getInverse(this);
		}

		/**
		 * Take the inverse of the matrix
		 * @return {t3d.Matrix3}
		 */;
		_proto.getInverse = function getInverse(matrix) {
			var me = matrix.elements,
				te = this.elements,
				n11 = me[0],
				n21 = me[1],
				n31 = me[2],
				n12 = me[3],
				n22 = me[4],
				n32 = me[5],
				n13 = me[6],
				n23 = me[7],
				n33 = me[8],
				t11 = n33 * n22 - n32 * n23,
				t12 = n32 * n13 - n33 * n12,
				t13 = n23 * n12 - n22 * n13,
				det = n11 * t11 + n21 * t12 + n31 * t13;
			if (det === 0) {
				console.warn('Matrix3: .getInverse() can not invert matrix, determinant is 0');
				return this.identity();
			}
			var detInv = 1 / det;
			te[0] = t11 * detInv;
			te[1] = (n31 * n23 - n33 * n21) * detInv;
			te[2] = (n32 * n21 - n31 * n22) * detInv;
			te[3] = t12 * detInv;
			te[4] = (n33 * n11 - n31 * n13) * detInv;
			te[5] = (n31 * n12 - n32 * n11) * detInv;
			te[6] = t13 * detInv;
			te[7] = (n21 * n13 - n23 * n11) * detInv;
			te[8] = (n22 * n11 - n21 * n12) * detInv;
			return this;
		}

		/**
		 * Transposes this matrix in place.
		 * @return {t3d.Matrix3}
		 */;
		_proto.transpose = function transpose() {
			var tmp;
			var m = this.elements;
			tmp = m[1];
			m[1] = m[3];
			m[3] = tmp;
			tmp = m[2];
			m[2] = m[6];
			m[6] = tmp;
			tmp = m[5];
			m[5] = m[7];
			m[7] = tmp;
			return this;
		}

		/**
		 * Sets the elements of this matrix based on an array in column-major format.
		 * @param {Number[]} array
		 * @param {Number} [offset=0]
		 * @return {t3d.Matrix3}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			for (var i = 0; i < 9; i++) {
				this.elements[i] = array[i + offset];
			}
			return this;
		}

		/**
		 * Writes the elements of this matrix to an array in column-major format.
		 * @param {Number[]} [array]
		 * @param {Number} [offset=0]
		 * @return {Number[]}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			var te = this.elements;
			array[offset] = te[0];
			array[offset + 1] = te[1];
			array[offset + 2] = te[2];
			array[offset + 3] = te[3];
			array[offset + 4] = te[4];
			array[offset + 5] = te[5];
			array[offset + 6] = te[6];
			array[offset + 7] = te[7];
			array[offset + 8] = te[8];
			return array;
		}

		/**
		 * Creates a new Matrix3 and with identical elements to this one.
		 * @return {t3d.Matrix3}
		 */;
		_proto.clone = function clone() {
			return new Matrix3().fromArray(this.elements);
		}

		/**
		 * Copies the elements of matrix m into this matrix.
		 * @param {t3d.Matrix3} m
		 * @return {t3d.Matrix3}
		 */;
		_proto.copy = function copy(m) {
			var te = this.elements;
			var me = m.elements;
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
			return this;
		}

		/**
		 * Post-multiplies this matrix by m.
		 * @param {t3d.Matrix3} m
		 * @return {t3d.Matrix3}
		 */;
		_proto.multiply = function multiply(m) {
			return this.multiplyMatrices(this, m);
		}

		/**
		 * Pre-multiplies this matrix by m.
		 * @param {t3d.Matrix3} m
		 * @return {t3d.Matrix3}
		 */;
		_proto.premultiply = function premultiply(m) {
			return this.multiplyMatrices(m, this);
		}

		/**
		 * Sets this matrix to a x b.
		 * @param {t3d.Matrix3} a
		 * @param {t3d.Matrix3} b
		 * @return {t3d.Matrix3}
		 */;
		_proto.multiplyMatrices = function multiplyMatrices(a, b) {
			var ae = a.elements;
			var be = b.elements;
			var te = this.elements;
			var a11 = ae[0],
				a12 = ae[3],
				a13 = ae[6];
			var a21 = ae[1],
				a22 = ae[4],
				a23 = ae[7];
			var a31 = ae[2],
				a32 = ae[5],
				a33 = ae[8];
			var b11 = be[0],
				b12 = be[3],
				b13 = be[6];
			var b21 = be[1],
				b22 = be[4],
				b23 = be[7];
			var b31 = be[2],
				b32 = be[5],
				b33 = be[8];
			te[0] = a11 * b11 + a12 * b21 + a13 * b31;
			te[3] = a11 * b12 + a12 * b22 + a13 * b32;
			te[6] = a11 * b13 + a12 * b23 + a13 * b33;
			te[1] = a21 * b11 + a22 * b21 + a23 * b31;
			te[4] = a21 * b12 + a22 * b22 + a23 * b32;
			te[7] = a21 * b13 + a22 * b23 + a23 * b33;
			te[2] = a31 * b11 + a32 * b21 + a33 * b31;
			te[5] = a31 * b12 + a32 * b22 + a33 * b32;
			te[8] = a31 * b13 + a32 * b23 + a33 * b33;
			return this;
		}

		/**
		 * Transform 2D
		 * @param {Number} x - position.x
		 * @param {Number} y - position.y
		 * @param {Number} scaleX - scale.x
		 * @param {Number} scaleY - scale.y
		 * @param {Number} rotation - rotation
		 * @param {Number} anchorX - anchor.x
		 * @param {Number} anchorY - anchor.y
		 * @return {t3d.Matrix3}
		 */;
		_proto.transform = function transform(x, y, scaleX, scaleY, rotation, anchorX, anchorY) {
			var te = this.elements;
			var cr = Math.cos(rotation);
			var sr = Math.sin(rotation);
			te[0] = cr * scaleX;
			te[3] = -sr * scaleY;
			te[6] = x;
			te[1] = sr * scaleX;
			te[4] = cr * scaleY;
			te[7] = y;
			te[2] = 0;
			te[5] = 0;
			te[8] = 1;
			if (anchorX || anchorY) {
				// prepend the anchor offset:
				te[6] -= anchorX * te[0] + anchorY * te[3];
				te[7] -= anchorX * te[1] + anchorY * te[4];
			}
			return this;
		}

		/**
		 * Set the transformation matrix of uv coordinates
		 * @param {Number} tx
		 * @param {Number} ty
		 * @param {Number} sx
		 * @param {Number} sy
		 * @param {Number} rotation
		 * @param {Number} cx
		 * @param {Number} cy
		 * @return {t3d.Matrix3}
		 */;
		_proto.setUvTransform = function setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
			var c = Math.cos(rotation);
			var s = Math.sin(rotation);
			return this.set(sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx, -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty, 0, 0, 1);
		}

		/**
		 * Sets the matri3 planes from the matrix4.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Matrix3}
		 */;
		_proto.setFromMatrix4 = function setFromMatrix4(m) {
			var me = m.elements;
			return this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);
		};
		return Matrix3;
	}();

	var _vec3_1$3 = new Vector3();
	var _mat4_1$3 = new Matrix3();

	/**
	 * A two dimensional surface that extends infinitely in 3d space,
	 * represented in Hessian normal form by a unit length normal vector and a constant.
	 * @memberof t3d
	 */
	var Plane = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector3} [normal=Vector3(1, 0, 0)] - A unit length Vector3 defining the normal of the plane.
		 * @param {Number} [constant=0] - The signed distance from the origin to the plane.
		 */
		function Plane(normal, constant) {
			if (normal === void 0) {
				normal = new Vector3(1, 0, 0);
			}
			if (constant === void 0) {
				constant = 0;
			}
			this.normal = normal;
			this.constant = constant;
		}

		/**
		 * Sets this plane's normal and constant properties by copying the values from the given normal.
		 * @param {t3d.Vector3} normal - a unit length Vector3 defining the normal of the plane.
		 * @param {Number} constant - the signed distance from the origin to the plane. Default is 0.
		 */
		var _proto = Plane.prototype;
		_proto.set = function set(normal, constant) {
			this.normal.copy(normal);
			this.constant = constant;
			return this;
		}

		/**
		 * Set the individual components that define the plane.
		 * @param {Number} x - x value of the unit length normal vector.
		 * @param {Number} y - y value of the unit length normal vector.
		 * @param {Number} z - z value of the unit length normal vector.
		 * @param {Number} w - the value of the plane's constant property.
		 * @return {t3d.Plane}
		 */;
		_proto.setComponents = function setComponents(x, y, z, w) {
			this.normal.set(x, y, z);
			this.constant = w;
			return this;
		}

		/**
		 * Sets the plane's properties as defined by a normal and an arbitrary coplanar point.
		 * @param {t3d.Vector3} normal - a unit length Vector3 defining the normal of the plane.
		 * @param {t3d.Vector3} point - Vector3
		 */;
		_proto.setFromNormalAndCoplanarPoint = function setFromNormalAndCoplanarPoint(normal, point) {
			this.normal.copy(normal);
			this.constant = -point.dot(this.normal);
			return this;
		}

		/**
		 * Normalizes the normal vector, and adjusts the constant value accordingly.
		 * @return {t3d.Plane}
		 */;
		_proto.normalize = function normalize() {
			// Note: will lead to a divide by zero if the plane is invalid.

			var inverseNormalLength = 1.0 / this.normal.getLength();
			this.normal.multiplyScalar(inverseNormalLength);
			this.constant *= inverseNormalLength;
			return this;
		}

		/**
		 * Returns the signed distance from the point to the plane.
		 * @param {t3d.Vector3} point
		 * @return {Number}
		 */;
		_proto.distanceToPoint = function distanceToPoint(point) {
			return this.normal.dot(point) + this.constant;
		}

		/**
		 * Returns a Vector3 coplanar to the plane, by calculating the projection of the normal vector at the origin onto the plane.
		 * @param {t3d.Vector3} [target]
		 * @return {t3d.Vector3}
		 */;
		_proto.coplanarPoint = function coplanarPoint(target) {
			if (target === void 0) {
				target = new Vector3();
			}
			return target.copy(this.normal).multiplyScalar(-this.constant);
		}

		/**
		 * Returns a new plane with the same normal and constant as this one.
		 * @return {t3d.Plane}
		 */;
		_proto.clone = function clone() {
			return new Plane().copy(this);
		}

		/**
		 * Copies the values of the passed plane's normal and constant properties to this plane.
		 * @param {t3d.Plane} plane
		 * @return {t3d.Plane}
		 */;
		_proto.copy = function copy(plane) {
			this.normal.copy(plane.normal);
			this.constant = plane.constant;
			return this;
		}

		/**
		 * Apply a Matrix4 to the plane. The matrix must be an affine, homogeneous transform.
		 * @param {t3d.Matrix4} matrix - the Matrix4 to apply.
		 * @param {t3d.Matrix3} [optionalNormalMatrix] - (optional) pre-computed normal Matrix3 of the Matrix4 being applied.
		 */;
		_proto.applyMatrix4 = function applyMatrix4(matrix, optionalNormalMatrix) {
			var normalMatrix = optionalNormalMatrix || _mat4_1$3.setFromMatrix4(matrix).inverse().transpose();
			var referencePoint = this.coplanarPoint(_vec3_1$3).applyMatrix4(matrix);
			var normal = this.normal.applyMatrix3(normalMatrix).normalize();
			this.constant = -referencePoint.dot(normal);
			return this;
		};
		return Plane;
	}();

	var _vec3_1$2 = new Vector3();

	/**
	 * Frustums are used to determine what is inside the camera's field of view.
	 * They help speed up the rendering process - objects which lie outside a camera's frustum can safely be excluded from rendering.
	 * @memberof t3d
	 */
	var Frustum = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Plane} p0 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p1 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p2 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p3 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p4 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p5 - (optional) defaults to a new Plane.
		 */
		function Frustum(p0, p1, p2, p3, p4, p5) {
			if (p0 === void 0) {
				p0 = new Plane();
			}
			if (p1 === void 0) {
				p1 = new Plane();
			}
			if (p2 === void 0) {
				p2 = new Plane();
			}
			if (p3 === void 0) {
				p3 = new Plane();
			}
			if (p4 === void 0) {
				p4 = new Plane();
			}
			if (p5 === void 0) {
				p5 = new Plane();
			}
			this.planes = [p0, p1, p2, p3, p4, p5];
		}

		/**
		 * Sets the frustum from the passed planes. No plane order is implied.
		 * @param {t3d.Plane} p0 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p1 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p2 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p3 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p4 - (optional) defaults to a new Plane.
		 * @param {t3d.Plane} p5 - (optional) defaults to a new Plane.
		 * @return {t3d.Frustum}
		 */
		var _proto = Frustum.prototype;
		_proto.set = function set(p0, p1, p2, p3, p4, p5) {
			var planes = this.planes;
			planes[0].copy(p0);
			planes[1].copy(p1);
			planes[2].copy(p2);
			planes[3].copy(p3);
			planes[4].copy(p4);
			planes[5].copy(p5);
			return this;
		}

		/**
		 * Sets the frustum planes from the matrix.
		 * @param {t3d.Matrix4} m - a Matrix4 used to set the planes
		 * @return {t3d.Frustum}
		 */;
		_proto.setFromMatrix = function setFromMatrix(m) {
			var planes = this.planes;
			var me = m.elements;
			var me0 = me[0],
				me1 = me[1],
				me2 = me[2],
				me3 = me[3];
			var me4 = me[4],
				me5 = me[5],
				me6 = me[6],
				me7 = me[7];
			var me8 = me[8],
				me9 = me[9],
				me10 = me[10],
				me11 = me[11];
			var me12 = me[12],
				me13 = me[13],
				me14 = me[14],
				me15 = me[15];
			planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
			planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
			planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
			planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
			planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
			planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
			return this;
		}

		/**
		 * Return true if sphere intersects with this frustum.
		 * @param {t3d.Sphere} sphere - Sphere to check for intersection.
		 * @return {Boolean}
		 */;
		_proto.intersectsSphere = function intersectsSphere(sphere) {
			var planes = this.planes;
			var center = sphere.center;
			var negRadius = -sphere.radius;
			for (var i = 0; i < 6; i++) {
				var distance = planes[i].distanceToPoint(center);
				if (distance < negRadius) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Return true if box intersects with this frustum.
		 * @param {t3d.Box3} box - Box3 to check for intersection.
		 * @return {Boolean}
		 */;
		_proto.intersectsBox = function intersectsBox(box) {
			var planes = this.planes;
			for (var i = 0; i < 6; i++) {
				var plane = planes[i];

				// corner at max distance

				_vec3_1$2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				_vec3_1$2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				_vec3_1$2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				// if both outside plane, no intersection

				if (plane.distanceToPoint(_vec3_1$2) < 0) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Return a new Frustum with the same parameters as this one.
		 * @return {t3d.Frustum}
		 */;
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copies the properties of the passed frustum into this one.
		 * @param {t3d.Frustum} frustum - The frustum to copy
		 * @return {t3d.Frustum}
		 */;
		_proto.copy = function copy(frustum) {
			var planes = this.planes;
			for (var i = 0; i < 6; i++) {
				planes[i].copy(frustum.planes[i]);
			}
			return this;
		};
		return Frustum;
	}();

	var _vec3_1$1 = new Vector3();
	var _diff = new Vector3();
	var _edge1 = new Vector3();
	var _edge2 = new Vector3();
	var _normal = new Vector3();

	/**
	 * A ray that emits from an origin in a certain direction.
	 * This is used by the Raycaster to assist with raycasting.
	 * Raycasting is used for mouse picking (working out what objects in the 3D space the mouse is over) amongst other things.
	 * @memberof t3d
	 */
	var Ray = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector3} [origin=] - the origin of the Ray.
		 * @param {t3d.Vector3} [direction=] - the direction of the Ray. This must be normalized (with Vector3.normalize) for the methods to operate properly.
		 */
		function Ray(origin, direction) {
			if (origin === void 0) {
				origin = new Vector3();
			}
			if (direction === void 0) {
				direction = new Vector3(0, 0, -1);
			}
			this.origin = origin;
			this.direction = direction;
		}

		/**
		 * Sets this ray's origin and direction properties by copying the values from the given objects.
		 * @param {t3d.Vector3} origin - the origin of the Ray.
		 * @param {t3d.Vector3} direction - the direction of the Ray. This must be normalized (with Vector3.normalize) for the methods to operate properly.
		 * @return {t3d.Ray}
		 */
		var _proto = Ray.prototype;
		_proto.set = function set(origin, direction) {
			this.origin.copy(origin);
			this.direction.copy(direction);
			return this;
		}

		/**
		 * Copies the origin and direction properties of ray into this ray.
		 * @param {t3d.Ray} ray
		 * @return {t3d.Ray}
		 */;
		_proto.copy = function copy(ray) {
			this.origin.copy(ray.origin);
			this.direction.copy(ray.direction);
			return this;
		}

		/**
		 * Transform this Ray by the Matrix4.
		 * @param {t3d.Matrix4} matrix4 - the Matrix4 to apply to this Ray.
		 * @return {t3d.Ray}
		 */;
		_proto.applyMatrix4 = function applyMatrix4(matrix4) {
			this.origin.applyMatrix4(matrix4);
			this.direction.transformDirection(matrix4);
			return this;
		}

		/**
		 * Get a Vector3 that is a given distance along this Ray.
		 * @param {Number} t - the distance along the Ray to retrieve a position for.
		 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		_proto.at = function at(t, optionalTarget) {
			if (optionalTarget === void 0) {
				optionalTarget = new Vector3();
			}
			return optionalTarget.copy(this.direction).multiplyScalar(t).add(this.origin);
		}

		/**
		 * Get the squared distance of the closest approach between the Ray and the Vector3.
		 * @param {t3d.Vector3} point - the Vector3 to compute a distance to.
		 * @return {Number}
		 */;
		_proto.distanceSqToPoint = function distanceSqToPoint(point) {
			var directionDistance = _vec3_1$1.subVectors(point, this.origin).dot(this.direction);
			if (directionDistance < 0) {
				return this.origin.distanceToSquared(point);
			}
			_vec3_1$1.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
			return _vec3_1$1.distanceToSquared(point);
		}

		/**
		 * Return true if this Ray intersects with the Box3.
		 * @param {t3d.Box3} box - the Box3 to intersect with.
		 * @return {Boolean}
		 */;
		_proto.intersectsBox = function intersectsBox(box) {
			return this.intersectBox(box, _vec3_1$1) !== null;
		}

		/**
		 * Intersect this Ray with a Box3, returning the intersection point or null if there is no intersection.
		 * @param {t3d.Box3} box - the Box3 to intersect with.
		 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		_proto.intersectBox = function intersectBox(box, optionalTarget) {
			var tmin, tmax, tymin, tymax, tzmin, tzmax;
			var invdirx = 1 / this.direction.x,
				invdiry = 1 / this.direction.y,
				invdirz = 1 / this.direction.z;
			var origin = this.origin;
			if (invdirx >= 0) {
				tmin = (box.min.x - origin.x) * invdirx;
				tmax = (box.max.x - origin.x) * invdirx;
			} else {
				tmin = (box.max.x - origin.x) * invdirx;
				tmax = (box.min.x - origin.x) * invdirx;
			}
			if (invdiry >= 0) {
				tymin = (box.min.y - origin.y) * invdiry;
				tymax = (box.max.y - origin.y) * invdiry;
			} else {
				tymin = (box.max.y - origin.y) * invdiry;
				tymax = (box.min.y - origin.y) * invdiry;
			}
			if (tmin > tymax || tymin > tmax) return null;

			// These lines also handle the case where tmin or tmax is NaN
			// (result of 0 * Infinity). x !== x returns true if x is NaN

			if (tymin > tmin || tmin !== tmin) tmin = tymin;
			if (tymax < tmax || tmax !== tmax) tmax = tymax;
			if (invdirz >= 0) {
				tzmin = (box.min.z - origin.z) * invdirz;
				tzmax = (box.max.z - origin.z) * invdirz;
			} else {
				tzmin = (box.max.z - origin.z) * invdirz;
				tzmax = (box.min.z - origin.z) * invdirz;
			}
			if (tmin > tzmax || tzmin > tmax) return null;
			if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
			if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

			// return point closest to the ray (positive side)

			if (tmax < 0) return null;
			return this.at(tmin >= 0 ? tmin : tmax, optionalTarget);
		}

		/**
		 * Return true if this Ray intersects with the Sphere.
		 * @param {t3d.Sphere} sphere - the Sphere to intersect with.
		 * @return {Boolean}
		 */;
		_proto.intersectsSphere = function intersectsSphere(sphere) {
			return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
		}

		/**
		 * Intersect this Ray with a Sphere, returning the intersection point or null if there is no intersection.
		 * @param {t3d.Sphere} sphere - the Sphere to intersect with.
		 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		_proto.intersectSphere = function intersectSphere(sphere, optionalTarget) {
			_vec3_1$1.subVectors(sphere.center, this.origin);
			var tca = _vec3_1$1.dot(this.direction);
			var d2 = _vec3_1$1.dot(_vec3_1$1) - tca * tca;
			var radius2 = sphere.radius * sphere.radius;
			if (d2 > radius2) {
				return null;
			}
			var thc = Math.sqrt(radius2 - d2);

			// t0 = first intersect point - entrance on front of sphere
			var t0 = tca - thc;

			// t1 = second intersect point - exit point on back of sphere
			var t1 = tca + thc;

			// test to see if both t0 and t1 are behind the ray - if so, return null
			if (t0 < 0 && t1 < 0) {
				return null;
			}

			// test to see if t0 is behind the ray:
			// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
			// in order to always return an intersect point that is in front of the ray.
			if (t0 < 0) {
				return this.at(t1, optionalTarget);
			}

			// else t0 is in front of the ray, so return the first collision point scaled by t0
			return this.at(t0, optionalTarget);
		}

		/**
		 * Intersect this Ray with a triangle, returning the intersection point or null if there is no intersection.
		 * @param {t3d.Vector3} a - The Vector3 point making up the triangle.
		 * @param {t3d.Vector3} b - The Vector3 point making up the triangle.
		 * @param {t3d.Vector3} c - The Vector3 point making up the triangle.
		 * @param {Boolean} backfaceCulling - whether to use backface culling.
		 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		_proto.intersectTriangle = function intersectTriangle(a, b, c, backfaceCulling, optionalTarget) {
			// Compute the offset origin, edges, and normal.

			// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

			_edge1.subVectors(b, a);
			_edge2.subVectors(c, a);
			_normal.crossVectors(_edge1, _edge2);

			// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//	 |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//	 |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//	 |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
			var DdN = this.direction.dot(_normal);
			var sign;
			if (DdN > 0) {
				if (backfaceCulling) return null;
				sign = 1;
			} else if (DdN < 0) {
				sign = -1;
				DdN = -DdN;
			} else {
				return null;
			}
			_diff.subVectors(this.origin, a);
			var DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

			// b1 < 0, no intersection
			if (DdQxE2 < 0) {
				return null;
			}
			var DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

			// b2 < 0, no intersection
			if (DdE1xQ < 0) {
				return null;
			}

			// b1+b2 > 1, no intersection
			if (DdQxE2 + DdE1xQ > DdN) {
				return null;
			}

			// Line intersects triangle, check if ray does.
			var QdN = -sign * _diff.dot(_normal);

			// t < 0, no intersection
			if (QdN < 0) {
				return null;
			}

			// Ray intersects triangle.
			return this.at(QdN / DdN, optionalTarget);
		};
		return Ray;
	}();

	var _box3_1 = new Box3();
	var _vec3_1 = new Vector3();

	/**
	 * A sphere defined by a center and radius.
	 * @memberof t3d
	 */
	var Sphere = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector3} [center=Vector3(0, 0, 0)] - center of the sphere.
		 * @param {Number} [radius=-1] - radius of the sphere.
		 */
		function Sphere(center, radius) {
			if (center === void 0) {
				center = new Vector3();
			}
			if (radius === void 0) {
				radius = -1;
			}
			this.center = center;
			this.radius = radius;
		}

		/**
		 * Sets the center and radius properties of this sphere.
		 * @param {t3d.Vector3} center - center of the sphere.
		 * @param {Number} radius - radius of the sphere.
		 * @return {t3d.Sphere}
		 */
		var _proto = Sphere.prototype;
		_proto.set = function set(center, radius) {
			this.center.copy(center);
			this.radius = radius;
			return this;
		}

		/**
		 * Computes the minimum bounding sphere for an array of points.
		 * @param {Number[]} array - an Array of Vector3 positions.
		 * @param {Number} [gap=3] - array gap.
		 * @param {Number} [offset=0] - array offset.
		 * @return {t3d.Sphere}
		 */;
		_proto.setFromArray = function setFromArray(array, gap, offset) {
			if (gap === void 0) {
				gap = 3;
			}
			if (offset === void 0) {
				offset = 0;
			}
			var center = this.center;
			_box3_1.setFromArray(array, gap).getCenter(center);
			var maxRadiusSq = 0;
			for (var i = 0, l = array.length; i < l; i += gap) {
				_vec3_1.fromArray(array, i + offset);
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vec3_1));
			}
			this.radius = Math.sqrt(maxRadiusSq);
			return this;
		}

		/**
		 * Transforms this sphere with the provided Matrix4.
		 * @param {t3d.Matrix4} matrix - the Matrix4 to apply
		 * @return {t3d.Matrix4}
		 */;
		_proto.applyMatrix4 = function applyMatrix4(matrix) {
			this.center.applyMatrix4(matrix);
			this.radius = this.radius * matrix.getMaxScaleOnAxis();
			return this;
		}

		/**
		 * Returns aMinimum Bounding Box for the sphere.
		 * @param {t3d.Box3} target — the result will be copied into this Box3.
		 * @return {t3d.Box3}
		 */;
		_proto.getBoundingBox = function getBoundingBox(target) {
			if (this.isEmpty()) {
				// Empty sphere produces empty bounding box
				target.makeEmpty();
				return target;
			}
			target.set(this.center, this.center);
			target.expandByScalar(this.radius);
			return target;
		}

		/**
		 * Checks to see if the sphere is empty (the radius set to a negative number).
		 * Spheres with a radius of 0 contain only their center point and are not considered to be empty.
		 * @return {Boolean}
		 */;
		_proto.isEmpty = function isEmpty() {
			return this.radius < 0;
		}

		/**
		 * Makes the sphere empty by setting center to (0, 0, 0) and radius to -1.
		 * @return {t3d.Sphere}
		 */;
		_proto.makeEmpty = function makeEmpty() {
			this.center.set(0, 0, 0);
			this.radius = -1;
			return this;
		}

		/**
		 * Expands the boundaries of this sphere to include point.
		 * @param {t3d.Vector3} point - The vector3 that should be included in the sphere.
		 * @return {t3d.Sphere}
		 */;
		_proto.expandByPoint = function expandByPoint(point) {
			if (this.isEmpty()) {
				this.center.copy(point);
				this.radius = 0;
				return this;
			}
			_vec3_1.subVectors(point, this.center);
			var lengthSq = _vec3_1.getLengthSquared();
			if (lengthSq > this.radius * this.radius) {
				// calculate the minimal sphere
				var length = Math.sqrt(lengthSq);
				var delta = (length - this.radius) * 0.5;
				this.center.addScaledVector(_vec3_1, delta / length);
				this.radius += delta;
			}
			return this;
		}

		/**
		 * Returns a new sphere with the same center and radius as this one.
		 * @return {t3d.Sphere}
		 */;
		_proto.clone = function clone() {
			return new Sphere().copy(this);
		}

		/**
		 * Copies the values of the passed sphere's center and radius properties to this sphere.
		 * @param {t3d.Sphere} sphere
		 * @return {t3d.Sphere}
		 */;
		_proto.copy = function copy(sphere) {
			this.center.copy(sphere.center);
			this.radius = sphere.radius;
			return this;
		};
		return Sphere;
	}();

	/**
	 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
	 *
	 * The poles (phi) are at the positive and negative y axis.
	 * The equator starts at positive z.
	 * @memberof t3d
	 */
	var Spherical = /*#__PURE__*/function () {
		/**
		 * @param {Number} [radius=1] - the radius, or the Euclidean distance (straight-line distance) from the point to the origin. Default is 1.0.
		 * @param {Number} [phi=0] - - polar angle in radians from the y (up) axis. Default is 0.
		 * @param {Number} [theta=0] - - equator angle in radians around the y (up) axis. Default is 0.
		 */
		function Spherical(radius, phi, theta) {
			if (radius === void 0) {
				radius = 1;
			}
			if (phi === void 0) {
				phi = 0;
			}
			if (theta === void 0) {
				theta = 0;
			}
			this.radius = radius;
			this.phi = phi; // up / down towards top and bottom pole
			this.theta = theta; // around the equator of the sphere
		}

		/**
		 * Sets values of this spherical's radius, phi and theta properties.
		 * @param {Number} radius
		 * @param {Number} phi
		 * @param {Number} theta
		 */
		var _proto = Spherical.prototype;
		_proto.set = function set(radius, phi, theta) {
			this.radius = radius;
			this.phi = phi;
			this.theta = theta;
			return this;
		}

		/**
		 * Copies the values of the passed Spherical's radius, phi and theta properties to this spherical.
		 * @param {t3d.Spherical} other
		 * @return {t3d.Spherical}
		 */;
		_proto.copy = function copy(other) {
			this.radius = other.radius;
			this.phi = other.phi;
			this.theta = other.theta;
			return this;
		}

		/**
		 * Returns a new spherical with the same radius, phi and theta properties as this one.
		 * @return {t3d.Spherical}
		 */;
		_proto.clone = function clone() {
			return new Spherical().copy(this);
		}

		/**
		 * Restrict phi to be betwee EPS and PI-EPS.
		 * @return {t3d.Spherical}
		 */;
		_proto.makeSafe = function makeSafe() {
			var EPS = 0.000001;
			this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
			return this;
		}

		/**
		 * Sets values of this spherical's radius, phi and theta properties from the Vector3.
		 * @param {t3d.Vector3} vec3
		 * @return {t3d.Spherical}
		 */;
		_proto.setFromVector3 = function setFromVector3(vec3) {
			this.radius = vec3.getLength();
			if (this.radius === 0) {
				this.theta = 0;
				this.phi = 0;
			} else {
				this.theta = Math.atan2(vec3.x, vec3.z); // equator angle around y-up axis
				this.phi = Math.acos(Math.min(1, Math.max(-1, vec3.y / this.radius))); // polar angle
			}

			return this;
		};
		return Spherical;
	}();

	/**
	 * Primary reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
	 * Secondary reference: https://www.ppsloan.org/publications/StupidSH36.pdf
	 * 3-band SH defined by 9 coefficients.
	 * @memberof t3d
	 */
	var SphericalHarmonics3 = /*#__PURE__*/function () {
		/**
		 * Creates a new instance of SphericalHarmonics3.
		 */
		function SphericalHarmonics3() {
			/**
			 * An array holding the (9) SH coefficients.
			 * A single coefficient is represented as an instance of Vector3.
			 * @type {Array}
			 */
			this.coefficients = [];
			for (var i = 0; i < 9; i++) {
				this.coefficients.push(new Vector3());
			}
		}

		/**
		 * Set this sphericalHarmonics3 value.
		 * @param {t3d.Vector3[]} coefficients An array of SH coefficients.
		 * @return {t3d.SphericalHarmonics3}
		 */
		var _proto = SphericalHarmonics3.prototype;
		_proto.set = function set(coefficients) {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].copy(coefficients[i]);
			}
			return this;
		}

		/**
		 * Sets all SH coefficients to 0.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.zero = function zero() {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].set(0, 0, 0);
			}
			return this;
		}

		/**
		 * Returns the radiance in the direction of the given normal.
		 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {t3d.Vector3} target - The result vector.
		 * @return {t3d.Vector3}
		 */;
		_proto.getAt = function getAt(normal, target) {
			// normal is assumed to be unit length

			var x = normal.x,
				y = normal.y,
				z = normal.z;
			var coeff = this.coefficients;

			// band 0
			target.copy(coeff[0]).multiplyScalar(0.282095);

			// band 1
			target.addScaledVector(coeff[1], 0.488603 * y);
			target.addScaledVector(coeff[2], 0.488603 * z);
			target.addScaledVector(coeff[3], 0.488603 * x);

			// band 2
			target.addScaledVector(coeff[4], 1.092548 * (x * y));
			target.addScaledVector(coeff[5], 1.092548 * (y * z));
			target.addScaledVector(coeff[6], 0.315392 * (3.0 * z * z - 1.0));
			target.addScaledVector(coeff[7], 1.092548 * (x * z));
			target.addScaledVector(coeff[8], 0.546274 * (x * x - y * y));
			return target;
		}

		/**
		 * Reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
		 * Returns the irradiance (radiance convolved with cosine lobe) in the direction of the given normal.
		 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {t3d.Vector3} target - The result vector.
		 * @return {t3d.Vector3}
		 */;
		_proto.getIrradianceAt = function getIrradianceAt(normal, target) {
			// normal is assumed to be unit length

			var x = normal.x,
				y = normal.y,
				z = normal.z;
			var coeff = this.coefficients;

			// band 0
			target.copy(coeff[0]).multiplyScalar(0.886227); // π * 0.282095

			// band 1
			target.addScaledVector(coeff[1], 2.0 * 0.511664 * y); // ( 2 * π / 3 ) * 0.488603
			target.addScaledVector(coeff[2], 2.0 * 0.511664 * z);
			target.addScaledVector(coeff[3], 2.0 * 0.511664 * x);

			// band 2
			target.addScaledVector(coeff[4], 2.0 * 0.429043 * x * y); // ( π / 4 ) * 1.092548
			target.addScaledVector(coeff[5], 2.0 * 0.429043 * y * z);
			target.addScaledVector(coeff[6], 0.743125 * z * z - 0.247708); // ( π / 4 ) * 0.315392 * 3
			target.addScaledVector(coeff[7], 2.0 * 0.429043 * x * z);
			target.addScaledVector(coeff[8], 0.429043 * (x * x - y * y)); // ( π / 4 ) * 0.546274

			return target;
		}

		/**
		 * Adds the given SH to this instance.
		 * @param {t3d.SphericalHarmonics3} sh - The SH to add.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.add = function add(sh) {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].add(sh.coefficients[i]);
			}
			return this;
		}

		/**
		 * A convenience method for performing .add() and .scale() at once.
		 * @param {t3d.SphericalHarmonics3} sh - The SH to add.
		 * @param {t3d.Vector3} s - The scale factor.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.addScaledSH = function addScaledSH(sh, s) {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].addScaledVector(sh.coefficients[i], s);
			}
			return this;
		}

		/**
		 * Multiply the s to this SphericalHarmonics3.
		 * @param {Number} s - The scale factor.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.scale = function scale(s) {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].multiplyScalar(s);
			}
			return this;
		}

		/**
		 * Linear interpolates between the given SH and this instance by the given alpha factor.
		 * Sets this coefficients vector to be the vector linearly interpolated between v1 and v2
		 * where alpha is the percent distance along the line connecting the two vectors
		 * - alpha = 0 will be v1, and alpha = 1 will be v2.
		 * @param {t3d.SphericalHarmonics3} sh - The SH to interpolate with.
		 * @param {Number} alpha - The alpha factor.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.lerp = function lerp(sh, alpha) {
			for (var i = 0; i < 9; i++) {
				this.coefficients[i].lerpVectors(this.coefficients[i], sh.coefficients[i], alpha);
			}
			return this;
		}

		/**
		 * Returns true if the given SH and this instance have equal coefficients.
		 * @param {t3d.SphericalHarmonics3} sh - The SH to compare with.
		 * @return {Boolean}
		 */;
		_proto.equals = function equals(sh) {
			for (var i = 0; i < 9; i++) {
				if (!this.coefficients[i].equals(sh.coefficients[i])) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Copies the given SH to this instance.
		 * @param {t3d.SphericalHarmonics3} sh - The SH to compare with.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.copy = function copy(sh) {
			return this.set(sh.coefficients);
		}

		/**
		 * Returns a new instance of SphericalHarmonics3 with equal coefficients.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Sets the coefficients of this instance from the given array.
		 * @param {Number[]} array - The array holding the numbers of the SH coefficients.
		 * @param {Number} [offset=0] - The array offset.
		 * @return {t3d.SphericalHarmonics3}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			var coefficients = this.coefficients;
			for (var i = 0; i < 9; i++) {
				coefficients[i].fromArray(array, offset + i * 3);
			}
			return this;
		}

		/**
		 * Returns an array with the coefficients, or copies them into the provided array.
		 * The coefficients are represented as numbers.
		 * @param {Number[]} [array] - The target array.
		 * @param {Number} [offset=0] - The array offset.
		 * @return {Number[]}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			var coefficients = this.coefficients;
			for (var i = 0; i < 9; i++) {
				coefficients[i].toArray(array, offset + i * 3);
			}
			return array;
		}

		/**
		 * Computes the SH basis for the given normal vector.
		 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {Number[]} array - The resulting SH basis.
		 */;
		SphericalHarmonics3.getBasisAt = function getBasisAt(normal, shBasis) {
			// normal is assumed to be unit length

			var x = normal.x,
				y = normal.y,
				z = normal.z;

			// band 0
			shBasis[0] = 0.282095;

			// band 1
			shBasis[1] = 0.488603 * y;
			shBasis[2] = 0.488603 * z;
			shBasis[3] = 0.488603 * x;

			// band 2
			shBasis[4] = 1.092548 * x * y;
			shBasis[5] = 1.092548 * y * z;
			shBasis[6] = 0.315392 * (3 * z * z - 1);
			shBasis[7] = 1.092548 * x * z;
			shBasis[8] = 0.546274 * (x * x - y * y);
		};
		return SphericalHarmonics3;
	}();

	var _v0 = new Vector3();
	var _v1 = new Vector3();
	var _v2 = new Vector3();
	var _v3 = new Vector3();

	/**
	 * A geometric triangle as defined by three Vector3s representing its three corners.
	 * @memberof t3d
	 */
	var Triangle = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Vector3} [a=] - the first corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 * @param {t3d.Vector3} [b=] - the second corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 * @param {t3d.Vector3} [c=] - the final corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 */
		function Triangle(a, b, c) {
			if (a === void 0) {
				a = new Vector3();
			}
			if (b === void 0) {
				b = new Vector3();
			}
			if (c === void 0) {
				c = new Vector3();
			}
			this.a = a;
			this.b = b;
			this.c = c;
		}

		/**
		 * Calculate the normal vector of the triangle.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @param {t3d.Vector3} c
		 * @param {t3d.Vector3} [optionalTarget]
		 * @return {t3d.Vector3}
		 */
		Triangle.normal = function normal(a, b, c, optionalTarget) {
			var result = optionalTarget || new Vector3();
			result.subVectors(c, b);
			_v0.subVectors(a, b);
			result.cross(_v0);
			var resultLengthSq = result.getLengthSquared();
			if (resultLengthSq > 0) {
				return result.multiplyScalar(1 / Math.sqrt(resultLengthSq));
			}
			return result.set(0, 0, 0);
		}

		/**
		 * static/instance method to calculate barycentric coordinates.
		 * based on: http://www.blackpawn.com/texts/pointinpoly/default.html
		 * @param {t3d.Vector3} point - Vector3
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @param {t3d.Vector3} c
		 * @param {t3d.Vector3} [target] - the result will be copied into this Vector3.
		 * @return {t3d.Vector3}
		 */;
		Triangle.barycoordFromPoint = function barycoordFromPoint(point, a, b, c, target) {
			_v0.subVectors(c, a);
			_v1.subVectors(b, a);
			_v2.subVectors(point, a);
			var dot00 = _v0.dot(_v0);
			var dot01 = _v0.dot(_v1);
			var dot02 = _v0.dot(_v2);
			var dot11 = _v1.dot(_v1);
			var dot12 = _v1.dot(_v2);
			var denom = dot00 * dot11 - dot01 * dot01;
			var result = target || new Vector3();

			// collinear or singular triangle
			if (denom === 0) {
				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return result.set(-2, -1, -1);
			}
			var invDenom = 1 / denom;
			var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

			// barycentric coordinates must always sum to 1
			return result.set(1 - u - v, v, u);
		}

		/**
		 * Returns true if the passed point, when projected onto the plane of the triangle, lies within the triangle.
		 * @param {t3d.Vector3} point
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @param {t3d.Vector3} c
		 * @return {t3d.Vector3}
		 */;
		Triangle.containsPoint = function containsPoint(point, a, b, c) {
			this.barycoordFromPoint(point, a, b, c, _v3);
			return _v3.x >= 0 && _v3.y >= 0 && _v3.x + _v3.y <= 1;
		}

		/**
		 * Sets the triangle's a, b and c properties to the passed vector3s.
		 * @param {t3d.Vector3} a
		 * @param {t3d.Vector3} b
		 * @param {t3d.Vector3} c
		 * @return {t3d.Triangle}
		 */;
		var _proto = Triangle.prototype;
		_proto.set = function set(a, b, c) {
			this.a.copy(a);
			this.b.copy(b);
			this.c.copy(c);
			return this;
		};
		return Triangle;
	}();

	/**
	 * The vector 4 class
	 * @memberof t3d
	 */
	var Vector4 = /*#__PURE__*/function () {
		/**
		 * @param {Number} [x=0] - the x value of this vector.
		 * @param {Number} [y=0] - the y value of this vector.
		 * @param {Number} [z=0] - the z value of this vector.
		 * @param {Number} [w=1] - the w value of this vector.
		 */
		function Vector4(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (w === void 0) {
				w = 1;
			}
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		/**
		 * Sets this vector to be the vector linearly interpolated between v1 and v2
		 * where ratio is the percent distance along the line connecting the two vectors
		 * - ratio = 0 will be v1, and ratio = 1 will be v2.
		 * @param {t3d.Vector4} v1 - the starting Vector4.
		 * @param {t3d.Vector4} v2 - Vector4 to interpolate towards.
		 * @param {Number} ratio - interpolation factor, typically in the closed interval [0, 1].
		 * @return {t3d.Vector4}
		 */
		var _proto = Vector4.prototype;
		_proto.lerpVectors = function lerpVectors(v1, v2, ratio) {
			return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
		}

		/**
		 * Sets the x, y, z and w components of this vector.
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} z
		 * @param {Number} w
		 * @return {t3d.Vector4}
		 */;
		_proto.set = function set(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}
			if (y === void 0) {
				y = 0;
			}
			if (z === void 0) {
				z = 0;
			}
			if (w === void 0) {
				w = 1;
			}
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
		 * @return {t3d.Vector4}
		 */;
		_proto.normalize = function normalize() {
			return this.multiplyScalar(1 / (this.getLength() || 1));
		}

		/**
		 * Multiplies this vector by scalar s.
		 * @param {Number} scalar
		 * @return {t3d.Vector4}
		 */;
		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			this.w *= scalar;
			return this;
		}

		/**
		 * Calculates the dot product of this vector and v.
		 * @param {t3d.Vector4} v
		 * @return {t3d.Vector4}
		 */;
		_proto.dot = function dot(v) {
			return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
		 * If you are comparing the lengths of vectors, you should compare the length squared instead
		 * as it is slightly more efficient to calculate.
		 * @return {Number}
		 */;
		_proto.getLengthSquared = function getLengthSquared() {
			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		}

		/**
		 * Computes the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
		 * @return {Number}
		 */;
		_proto.getLength = function getLength() {
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
		}

		/**
		 * Computes the {@link https://en.wikipedia.org/wiki/Taxicab_geometry|Manhattan length}	from (0, 0, 0, 0) to (x, y, z, w).
		 * @return {Number}
		 */;
		_proto.getManhattanLength = function getManhattanLength() {
			return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
		}

		/**
		 * Multiplies this vector by 4 x 4 m.
		 * @param {t3d.Matrix4} m
		 * @return {t3d.Vector4}
		 */;
		_proto.applyMatrix4 = function applyMatrix4(m) {
			var x = this.x,
				y = this.y,
				z = this.z,
				w = this.w;
			var e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
			this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
			this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
			this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
			return this;
		}

		/**
		 * Checks for strict equality of this vector and v.
		 * @param {t3d.Vector4} v
		 * @return {Boolean}
		 */;
		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
		}

		/**
		 * Adds v to this vector.
		 * @param {t3d.Vector4} v
		 * @return {t3d.Vector4}
		 */;
		_proto.add = function add(v) {
			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			this.w += v.w;
			return this;
		}

		/**
		 * Multiplies this vector by v.
		 * @param {t3d.Vector4} v
		 * @return {t3d.Vector4}
		 */;
		_proto.multiply = function multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			this.w *= v.w;
			return this;
		}

		/**
		 * Sets this vector to a - b.
		 * @param {t3d.Vector4} a
		 * @param {t3d.Vector4} b
		 * @return {t3d.Vector4}
		 */;
		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			this.w = a.w - b.w;
			return this;
		}

		/**
		 * Sets this vector's x value to be array[ offset + 0 ],
		 * y value to be array[ offset + 1 ] z value to be array[ offset + 2 ]
		 * and w value to be array[ offset + 3 ].
		 * @param {Number[]} array - the source array.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {t3d.Vector4}
		 */;
		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}
			this.x = array[offset];
			this.y = array[offset + 1];
			this.z = array[offset + 2];
			this.w = array[offset + 3];
			return this;
		}

		/**
		 * Returns an array [x, y, z, w], or copies x, y, z and w into the provided array.
		 * @param {Number[]} [array] - array to store this vector to. If this is not provided, a new array will be created.
		 * @param {Number} [offset=0] - offset into the array.
		 * @return {Number[]}
		 */;
		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}
			if (offset === void 0) {
				offset = 0;
			}
			array[offset] = this.x;
			array[offset + 1] = this.y;
			array[offset + 2] = this.z;
			array[offset + 3] = this.w;
			return array;
		}

		/**
		 * Returns a new Vector4 with the same x, y, z and w values as this one.
		 * @return {t3d.Vector4}
		 */;
		_proto.clone = function clone() {
			return new Vector4(this.x, this.y, this.z, this.w);
		}

		/**
		 * Copies the values of the passed Vector4's x, y, z and w properties to this Vector4.
		 * @param {t3d.Vector4} v
		 * @return {t3d.Vector4}
		 */;
		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			this.w = v.w !== undefined ? v.w : 1;
			return this;
		};
		return Vector4;
	}();

	var _lut = [];
	for (var i = 0; i < 256; i++) {
		_lut[i] = (i < 16 ? '0' : '') + i.toString(16);
	}

	/**
	 * Method for generate uuid.
	 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
	 * @method
	 * @name t3d.generateUUID
	 * @return {String} - The uuid.
	 */
	function generateUUID() {
		var d0 = Math.random() * 0xffffffff | 0;
		var d1 = Math.random() * 0xffffffff | 0;
		var d2 = Math.random() * 0xffffffff | 0;
		var d3 = Math.random() * 0xffffffff | 0;
		var uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' + _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' + _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] + _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

		// .toUpperCase() here flattens concatenated strings to save heap memory space.
		return uuid.toUpperCase();
	}

	/**
	 * Is this number a power of two.
	 * @method
	 * @name t3d.isPowerOfTwo
	 * @param {Number} value - The input number.
	 * @return {Boolean} - Is this number a power of two.
	 */
	function isPowerOfTwo(value) {
		return (value & value - 1) === 0 && value !== 0;
	}

	/**
	 * Return the nearest power of two number of this number.
	 * @method
	 * @name t3d.nearestPowerOfTwo
	 * @param {Number} value - The input number.
	 * @return {Number} - The result number.
	 */
	function nearestPowerOfTwo(value) {
		return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
	}

	/**
	 * Return the next power of two number of this number.
	 * @method
	 * @name t3d.nextPowerOfTwo
	 * @param {Number} value - The input number.
	 * @return {Number} - The result number.
	 */
	function nextPowerOfTwo(value) {
		value--;
		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		value++;
		return value;
	}

	/**
	 * Clone uniforms.
	 * @method
	 * @name t3d.cloneUniforms
	 * @param {Object} value - The input uniforms.
	 * @return {Object} - The output uniforms.
	 */
	function cloneUniforms(uniforms_src) {
		var uniforms_dst = {};
		for (var name in uniforms_src) {
			var uniform_src = uniforms_src[name];
			if (Array.isArray(uniform_src) || ArrayBuffer.isView(uniform_src)) {
				uniforms_dst[name] = uniform_src.slice();
			} else {
				uniforms_dst[name] = uniform_src;
			}
		}
		return uniforms_dst;
	}

	/**
	 * Clone json.
	 * This is faster than JSON.parse(JSON.stringify()).
	 * @method
	 * @name t3d.cloneJson
	 * @param {Object} obj - The input json.
	 * @return {Object} - The output json.
	 */
	function cloneJson(obj) {
		var newObj = Array.isArray(obj) ? [] : {};
		if (obj && typeof obj === 'object') {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					newObj[key] = obj[key] && typeof obj[key] === 'object' ? cloneJson(obj[key]) : obj[key];
				}
			}
		}
		return newObj;
	}

	var _object3DId = 0;
	var _mat4_1$2 = new Matrix4();

	/**
	 * This is the base class for most objects in t3d
	 * and provides a set of properties and methods for manipulating objects in 3D space.
	 * @memberof t3d
	 */
	var Object3D = /*#__PURE__*/function () {
		function Object3D() {
			/**
			 * Unique number for this object instance.
			 * @readonly
			 * @type {Number}
			 */
			this.id = _object3DId++;

			/**
			 * UUID of this object instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @type {String}
			 */
			this.uuid = generateUUID();

			/**
			 * Optional name of the object (doesn't need to be unique).
			 * @type {String}
			 * @default ""
			 */
			this.name = "";

			/**
			 * A Vector3 representing the object's local position.
			 * @type {t3d.Vector3}
			 * @default Vector3(0, 0, 0)
			 */
			this.position = new Vector3();

			/**
			 * The object's local scale.
			 * @type {t3d.Vector3}
			 * @default Vector3(1, 1, 1)
			 */
			this.scale = new Vector3(1, 1, 1);

			/**
			 * Object's local rotation as an {@link t3d.Euler}, in radians.
			 * @type {t3d.Euler}
			 * @default Euler(0, 0, 0)
			 */
			this.euler = new Euler();

			/**
			 * Object's local rotation as a {@link t3d.Quaternion}.
			 * @type {t3d.Quaternion}
			 * @default Quaternion(0, 0, 0, 1)
			 */
			this.quaternion = new Quaternion();

			// bind euler and quaternion
			var euler = this.euler,
				quaternion = this.quaternion;
			euler.onChange(function () {
				quaternion.setFromEuler(euler, false);
			});
			quaternion.onChange(function () {
				euler.setFromQuaternion(quaternion, undefined, false);
			});

			/**
			 * The local transform matrix.
			 * @type {t3d.Matrix4}
			 */
			this.matrix = new Matrix4();

			/**
			 * The global transform of the object.
			 * If the Object3D has no parent, then it's identical to the local transform {@link t3d.Object3D#matrix}.
			 * @type {t3d.Matrix4}
			 */
			this.worldMatrix = new Matrix4();

			/**
			 * Object's parent in the scene graph.
			 * An object can have at most one parent.
			 * @type {t3d.Object3D[]}
			 */
			this.children = new Array();

			/**
			 * Object's parent in the scene graph.
			 * An object can have at most one parent.
			 * @type {t3d.Object3D}
			 */
			this.parent = null;

			/**
			 * Whether the object gets rendered into shadow map.
			 * @type {Boolean}
			 * @default false
			 */
			this.castShadow = false;

			/**
			 * Whether the material receives shadows.
			 * @type {Boolean}
			 * @default false
			 */
			this.receiveShadow = false;

			/**
			 * Defines shadow map type.
			 * Note: In webgl1 or {@link t3d.Scene#disableShadowSampler} is true, soft shadow types will fallback to POISSON_SOFT without warning.
			 * Note: Point light only support POISSON_SOFT for now.
			 * @type {t3d.SHADOW_TYPE}
			 * @default SHADOW_TYPE.PCF3_SOFT
			 */
			this.shadowType = SHADOW_TYPE.PCF3_SOFT;

			/**
			 * When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
			 * Otherwise the object gets rendered every frame even if it isn't visible.
			 * @type {Boolean}
			 * @default true
			 */
			this.frustumCulled = true;

			/**
			 * Object gets rendered if true.
			 * @type {Boolean}
			 * @default true
			 */
			this.visible = true;

			/**
			 * This value allows the default rendering order of scene graph objects to be overridden although opaque and transparent objects remain sorted independently.
			 * Sorting is from lowest to highest renderOrder.
			 * @type {Number}
			 * @default 0
			 */
			this.renderOrder = 0;

			/**
			 * Render layer of this object.
			 * RenderQueue will dispatch all renderable objects to the corresponding RenderQueueLayer according to object.renderLayer.
			 * @type {Number}
			 * @default 0
			 */
			this.renderLayer = 0;

			/**
			 * Whether it can be collected into the Render Queue.
			 * @type {Boolean}
			 * @default true
			 */
			this.renderable = true;

			/**
			 * An object that can be used to store custom data about the {@link t3d.Object3D}.
			 * It should not hold references to functions as these will not be cloned.
			 * @type {Object}
			 * @default {}
			 */
			this.userData = {};

			/**
			 * When this is set, it calculates the matrix of position, (rotation or quaternion) and scale every frame and also recalculates the worldMatrix property.
			 * @type {Boolean}
			 * @default true
			 */
			this.matrixAutoUpdate = true;

			/**
			 * When this is set, it calculates the matrix in that frame and resets this property to false.
			 * @type {Boolean}
			 * @default true
			 */
			this.matrixNeedsUpdate = true;

			/**
			 * When this is set, it calculates the world matrix in that frame and resets this property to false.
			 * @type {Boolean}
			 * @default true
			 */
			this.worldMatrixNeedsUpdate = true;
		}

		/**
		 * An optional callback that is executed immediately before the Object3D is rendered.
		 */
		var _proto = Object3D.prototype;
		_proto.onBeforeRender = function onBeforeRender() {}

		/**
		 * An optional callback that is executed immediately after the Object3D is rendered.
		 */;
		_proto.onAfterRender = function onAfterRender() {}

		/**
		 * Add object as child of this object.
		 * @param {t3d.Object3D} object
		 */;
		_proto.add = function add(object) {
			if (object === this) {
				console.error("Object3D.add: object can't be added as a child of itself.", object);
				return;
			}
			if (object.parent !== null) {
				object.parent.remove(object);
			}
			object.parent = this;
			this.children.push(object);
			object.worldMatrixNeedsUpdate = true;
		}

		/**
		 * Remove object as child of this object.
		 * @param {t3d.Object3D} object
		 */;
		_proto.remove = function remove(object) {
			var index = this.children.indexOf(object);
			if (index !== -1) {
				object.parent = null;
				this.children.splice(index, 1);
				object.worldMatrixNeedsUpdate = true;
			}
		}

		/**
		 * Searches through the object's children and returns the first with a matching name.
		 * Note that for most objects the name is an empty string by default.
		 * You will have to set it manually to make use of this method.
		 * @param {String} name - String to match to the children's {@link t3d.Object3D#name} property.
		 * @return {t3d.Object3D}
		 */;
		_proto.getObjectByName = function getObjectByName(name) {
			return this.getObjectByProperty('name', name);
		}

		/**
		 * Searches through the object's children and returns the first with a property that matches the value given.
		 * @param {String} name - the property name to search for.
		 * @param {Number} value - value of the given property.
		 * @return {t3d.Object3D}
		 */;
		_proto.getObjectByProperty = function getObjectByProperty(name, value) {
			if (this[name] === value) return this;
			for (var i = 0, l = this.children.length; i < l; i++) {
				var child = this.children[i];
				var object = child.getObjectByProperty(name, value);
				if (object !== undefined) {
					return object;
				}
			}
			return undefined;
		}

		/**
		 * Update the local transform.
		 */;
		_proto.updateMatrix = function updateMatrix(force) {
			if (this.matrixAutoUpdate || this.matrixNeedsUpdate) {
				this.matrix.transform(this.position, this.scale, this.quaternion);
				this.matrixNeedsUpdate = false;
				this.worldMatrixNeedsUpdate = true;
			}
			if (this.worldMatrixNeedsUpdate || force) {
				this.worldMatrix.copy(this.matrix);
				if (this.parent) {
					var parentMatrix = this.parent.worldMatrix;
					this.worldMatrix.premultiply(parentMatrix);
				}
				this.worldMatrixNeedsUpdate = false;
				force = true;
			}
			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i].updateMatrix(force);
			}
		}

		/**
		 * Returns a vector representing the direction of object's positive z-axis in world space.
		 * This call must be after {@link t3d.Object3D#updateMatrix}.
		 * @param {Vector3} [optionalTarget=] — the result will be copied into this Vector3.
		 * @return {Vector3} - the result.
		 */;
		_proto.getWorldDirection = function getWorldDirection(optionalTarget) {
			if (optionalTarget === void 0) {
				optionalTarget = new Vector3();
			}
			var e = this.worldMatrix.elements;
			return optionalTarget.set(e[8], e[9], e[10]).normalize();
		}

		/**
		 * Rotates the object to face a point in local space.
		 * @param {Vector3} target - A vector representing a position in local space.
		 * @param {Vector3} up — A vector representing the up direction in local space.
		 */;
		_proto.lookAt = function lookAt(target, up) {
			_mat4_1$2.lookAtRH(target, this.position, up);
			this.quaternion.setFromRotationMatrix(_mat4_1$2);
		}

		/**
		 * Method to get intersections between a casted ray and this object.
		 * @abstract
		 * @param {Ray} ray - The {@link t3d.Ray} instance.
		 * @param {Array} intersects - output intersects array.
		 */;
		_proto.raycast = function raycast(ray, intersects) {}

		/**
		 * Executes the callback on this object and all descendants.
		 * @param {Function} callback - A function with as first argument an object3D object.
		 */;
		_proto.traverse = function traverse(callback) {
			callback(this);
			var children = this.children;
			for (var i = 0, l = children.length; i < l; i++) {
				children[i].traverse(callback);
			}
		}

		/**
		 * Returns a clone of this object and optionally all descendants.
		 * @param {Function} [recursive=true] - if true, descendants of the object are also cloned.
		 * @return {t3d.Object3D}
		 */;
		_proto.clone = function clone(recursive) {
			return new this.constructor().copy(this, recursive);
		}

		/**
		 * Copy the given object into this object.
		 * @param {t3d.Object3D} source - The object to be copied.
		 * @param {Boolean} [recursive=true] - if true, descendants of the object are also copied.
		 * @return {t3d.Object3D}
		 */;
		_proto.copy = function copy(source, recursive) {
			if (recursive === void 0) {
				recursive = true;
			}
			this.name = source.name;
			this.position.copy(source.position);
			this.quaternion.copy(source.quaternion);
			this.scale.copy(source.scale);
			this.matrix.copy(source.matrix);
			this.worldMatrix.copy(source.worldMatrix);
			this.castShadow = source.castShadow;
			this.receiveShadow = source.receiveShadow;
			this.shadowType = source.shadowType;
			this.frustumCulled = source.frustumCulled;
			this.visible = source.visible;
			this.renderOrder = source.renderOrder;
			this.renderLayer = source.renderLayer;
			this.renderable = source.renderable;
			this.userData = cloneJson(source.userData);
			if (recursive === true) {
				for (var i = 0; i < source.children.length; i++) {
					var child = source.children[i];
					this.add(child.clone());
				}
			}
			return this;
		};
		return Object3D;
	}();

	var helpVector3$1 = new Vector3();
	var tempDirectionalShadowMatrices = [];
	var tempPointShadowMatrices = [];
	var tempSpotShadowMatrices = [];
	var _lightDataId = 0;

	/**
	 * The LightData class is used to collect lights,
	 * and process them into a data format suitable for uploading to the GPU.
	 * @ignore
	 */
	var LightData = /*#__PURE__*/function () {
		function LightData() {
			this.id = _lightDataId++;
			this.version = 0;

			// Light collection array

			this.lights = [];

			// Data caches

			this.ambient = new Float32Array([0, 0, 0]);
			this.sh = new Float32Array(27);
			this.hemisphere = [];
			this.directional = [];
			this.directionalShadow = [];
			this.directionalShadowMap = [];
			this.directionalShadowDepthMap = [];
			this.directionalShadowMatrix = new Float32Array(0);
			this.point = [];
			this.pointShadow = [];
			this.pointShadowMap = [];
			this.pointShadowMatrix = new Float32Array(0);
			this.spot = [];
			this.spotShadow = [];
			this.spotShadowMap = [];
			this.spotShadowDepthMap = [];
			this.spotShadowMatrix = new Float32Array(0);

			// Status

			this.useAmbient = false;
			this.useSphericalHarmonics = false;
			this.hemisNum = 0;
			this.directsNum = 0;
			this.pointsNum = 0;
			this.spotsNum = 0;
			this.directShadowNum = 0;
			this.pointShadowNum = 0;
			this.spotShadowNum = 0;
			this.totalNum = 0;
			this.shadowsNum = 0;

			// Hash

			this.hash = new LightHash();
		}
		var _proto = LightData.prototype;
		_proto.begin = function begin() {
			this.totalNum = 0;
			this.shadowsNum = 0;
		};
		_proto.push = function push(light) {
			this.lights[this.totalNum++] = light;
			if (castShadow(light)) {
				this.shadowsNum++;
			}
		};
		_proto.end = function end(sceneData) {
			this.lights.length = this.totalNum;
			this.lights.sort(shadowCastingLightsFirst);
			this._setupCache(sceneData);
			this.hash.update(this);
			this.version++;
		};
		_proto._setupCache = function _setupCache(sceneData) {
			for (var i = 0; i < 3; i++) {
				this.ambient[i] = 0;
			}
			for (var _i = 0; _i < this.sh.length; _i++) {
				this.sh[_i] = 0;
			}
			this.useAmbient = false;
			this.useSphericalHarmonics = false;
			this.hemisNum = 0;
			this.directsNum = 0;
			this.pointsNum = 0;
			this.spotsNum = 0;
			this.directShadowNum = 0;
			this.pointShadowNum = 0;
			this.spotShadowNum = 0;

			// Setup Uniforms

			for (var _i2 = 0, l = this.lights.length; _i2 < l; _i2++) {
				var light = this.lights[_i2];
				if (light.isAmbientLight) {
					this._doAddAmbientLight(light);
				} else if (light.isHemisphereLight) {
					this._doAddHemisphereLight(light, sceneData);
				} else if (light.isDirectionalLight) {
					this._doAddDirectLight(light, sceneData);
				} else if (light.isPointLight) {
					this._doAddPointLight(light, sceneData);
				} else if (light.isSpotLight) {
					this._doAddSpotLight(light, sceneData);
				} else if (light.isSphericalHarmonicsLight) {
					this._doAddSphericalHarmonicsLight(light);
				}
			}
			var directShadowNum = this.directShadowNum;
			if (directShadowNum > 0) {
				this.directionalShadowMap.length = directShadowNum;
				this.directionalShadowDepthMap.length = directShadowNum;
				tempDirectionalShadowMatrices.length = directShadowNum;
				if (this.directionalShadowMatrix.length !== directShadowNum * 16) {
					this.directionalShadowMatrix = new Float32Array(directShadowNum * 16);
				}
				for (var _i3 = 0; _i3 < directShadowNum; _i3++) {
					tempDirectionalShadowMatrices[_i3].toArray(this.directionalShadowMatrix, _i3 * 16);
				}
			}
			var pointShadowNum = this.pointShadowNum;
			if (pointShadowNum > 0) {
				this.pointShadowMap.length = pointShadowNum;
				tempPointShadowMatrices.length = pointShadowNum;
				if (this.pointShadowMatrix.length !== pointShadowNum * 16) {
					this.pointShadowMatrix = new Float32Array(pointShadowNum * 16);
				}
				for (var _i4 = 0; _i4 < pointShadowNum; _i4++) {
					tempPointShadowMatrices[_i4].toArray(this.pointShadowMatrix, _i4 * 16);
				}
			}
			var spotShadowNum = this.spotShadowNum;
			if (spotShadowNum > 0) {
				this.spotShadowMap.length = spotShadowNum;
				this.spotShadowDepthMap.length = spotShadowNum;
				tempSpotShadowMatrices.length = spotShadowNum;
				if (this.spotShadowMatrix.length !== spotShadowNum * 16) {
					this.spotShadowMatrix = new Float32Array(spotShadowNum * 16);
				}
				for (var _i5 = 0; _i5 < spotShadowNum; _i5++) {
					tempSpotShadowMatrices[_i5].toArray(this.spotShadowMatrix, _i5 * 16);
				}
			}
		};
		_proto._doAddAmbientLight = function _doAddAmbientLight(object) {
			var intensity = object.intensity;
			var color = object.color;
			this.ambient[0] += color.r * intensity;
			this.ambient[1] += color.g * intensity;
			this.ambient[2] += color.b * intensity;
			this.useAmbient = true;
		};
		_proto._doAddSphericalHarmonicsLight = function _doAddSphericalHarmonicsLight(object) {
			var intensity = object.intensity;
			var sh = object.sh.coefficients;
			for (var i = 0; i < sh.length; i += 1) {
				this.sh[i * 3] += sh[i].x * intensity;
				this.sh[i * 3 + 1] += sh[i].y * intensity;
				this.sh[i * 3 + 2] += sh[i].z * intensity;
			}
			this.useSphericalHarmonics = true;
		};
		_proto._doAddHemisphereLight = function _doAddHemisphereLight(object, sceneData) {
			var intensity = object.intensity;
			var skyColor = object.color;
			var groundColor = object.groundColor;
			var useAnchorMatrix = sceneData.useAnchorMatrix;
			var cache = getLightCache(object);
			cache.skyColor[0] = skyColor.r * intensity;
			cache.skyColor[1] = skyColor.g * intensity;
			cache.skyColor[2] = skyColor.b * intensity;
			cache.groundColor[0] = groundColor.r * intensity;
			cache.groundColor[1] = groundColor.g * intensity;
			cache.groundColor[2] = groundColor.b * intensity;
			var e = object.worldMatrix.elements;
			var direction = helpVector3$1.set(e[4], e[5], e[6]).normalize();
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.toArray(cache.direction);
			this.hemisphere[this.hemisNum++] = cache;
		};
		_proto._doAddDirectLight = function _doAddDirectLight(object, sceneData) {
			var intensity = object.intensity;
			var color = object.color;
			var useAnchorMatrix = sceneData.useAnchorMatrix;
			var cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			var direction = object.getWorldDirection(helpVector3$1);
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.multiplyScalar(-1).toArray(cache.direction);
			if (object.castShadow) {
				var shadow = object.shadow;
				var shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;
				this.directionalShadow[this.directShadowNum++] = shadowCache;
				shadow.update(object);
				shadow.updateMatrix();
				if (useAnchorMatrix) {
					shadow.matrix.multiply(sceneData.anchorMatrix);
				}
				this.directionalShadowMap[this.directsNum] = shadow.map;
				this.directionalShadowDepthMap[this.directsNum] = shadow.depthMap;
				tempDirectionalShadowMatrices[this.directsNum] = shadow.matrix;
			}
			this.directional[this.directsNum++] = cache;
		};
		_proto._doAddPointLight = function _doAddPointLight(object, sceneData) {
			var intensity = object.intensity;
			var color = object.color;
			var distance = object.distance;
			var decay = object.decay;
			var useAnchorMatrix = sceneData.useAnchorMatrix;
			var cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			cache.distance = distance;
			cache.decay = decay;
			var position = helpVector3$1.setFromMatrixPosition(object.worldMatrix);
			if (useAnchorMatrix) {
				position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cache.position[0] = position.x;
			cache.position[1] = position.y;
			cache.position[2] = position.z;
			if (object.castShadow) {
				var shadow = object.shadow;
				var shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = 0;
				shadowCache.shadowCameraRange[0] = shadow.cameraNear;
				shadowCache.shadowCameraRange[1] = shadow.cameraFar;
				this.pointShadow[this.pointShadowNum++] = shadowCache;
				shadow.update(object, 0);
				shadow.matrix.makeTranslation(-position.x, -position.y, -position.z); // for point light

				this.pointShadowMap[this.pointsNum] = shadow.map;
				tempPointShadowMatrices[this.pointsNum] = shadow.matrix;
			}
			this.point[this.pointsNum++] = cache;
		};
		_proto._doAddSpotLight = function _doAddSpotLight(object, sceneData) {
			var intensity = object.intensity;
			var color = object.color;
			var distance = object.distance;
			var decay = object.decay;
			var useAnchorMatrix = sceneData.useAnchorMatrix;
			var cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			cache.distance = distance;
			cache.decay = decay;
			var position = helpVector3$1.setFromMatrixPosition(object.worldMatrix);
			if (useAnchorMatrix) {
				position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cache.position[0] = position.x;
			cache.position[1] = position.y;
			cache.position[2] = position.z;
			var direction = object.getWorldDirection(helpVector3$1);
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.multiplyScalar(-1).toArray(cache.direction);
			var coneCos = Math.cos(object.angle);
			var penumbraCos = Math.cos(object.angle * (1 - object.penumbra));
			cache.coneCos = coneCos;
			cache.penumbraCos = penumbraCos;
			if (object.castShadow) {
				var shadow = object.shadow;
				var shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;
				this.spotShadow[this.spotShadowNum++] = shadowCache;
				shadow.update(object);
				shadow.updateMatrix();
				if (useAnchorMatrix) {
					shadow.matrix.multiply(sceneData.anchorMatrix);
				}
				this.spotShadowMap[this.spotsNum] = shadow.map;
				this.spotShadowDepthMap[this.spotsNum] = shadow.depthMap;
				tempSpotShadowMatrices[this.spotsNum] = shadow.matrix;
			}
			this.spot[this.spotsNum++] = cache;
		};
		return LightData;
	}(); // Light caches
	var lightCaches = new WeakMap();
	function getLightCache(light) {
		if (lightCaches.has(light)) {
			return lightCaches.get(light);
		}
		var cache;
		if (light.isHemisphereLight) {
			cache = {
				direction: new Float32Array(3),
				skyColor: new Float32Array([0, 0, 0]),
				groundColor: new Float32Array([0, 0, 0])
			};
		} else if (light.isDirectionalLight) {
			cache = {
				direction: new Float32Array(3),
				color: new Float32Array([0, 0, 0])
			};
		} else if (light.isPointLight) {
			cache = {
				position: new Float32Array(3),
				color: new Float32Array([0, 0, 0]),
				distance: 0,
				decay: 0
			};
		} else if (light.isSpotLight) {
			cache = {
				position: new Float32Array(3),
				direction: new Float32Array(3),
				color: new Float32Array([0, 0, 0]),
				distance: 0,
				coneCos: 0,
				penumbraCos: 0,
				decay: 0
			};
		}
		lightCaches.set(light, cache);
		return cache;
	}

	// Shadow caches

	var shadowCaches = new WeakMap();
	function getShadowCache(light) {
		if (shadowCaches.has(light)) {
			return shadowCaches.get(light);
		}
		var cache;
		if (light.isDirectionalLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
			};
		} else if (light.isPointLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2),
				// [radius, 0]
				shadowCameraRange: new Float32Array(2) // [cameraNear, cameraFar]
			};
		} else if (light.isSpotLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
			};
		}

		shadowCaches.set(light, cache);
		return cache;
	}

	// Light hash
	var LightHash = /*#__PURE__*/function () {
		function LightHash() {
			this._factor = new Uint16Array(9);
		}
		var _proto2 = LightHash.prototype;
		_proto2.update = function update(lights) {
			this._factor[0] = lights.useAmbient ? 1 : 0;
			this._factor[1] = lights.useSphericalHarmonics ? 1 : 0;
			this._factor[2] = lights.hemisNum;
			this._factor[3] = lights.directsNum;
			this._factor[4] = lights.pointsNum;
			this._factor[5] = lights.spotsNum;
			this._factor[6] = lights.directShadowNum;
			this._factor[7] = lights.pointShadowNum;
			this._factor[8] = lights.spotShadowNum;
		};
		_proto2.compare = function compare(factor) {
			if (!factor) {
				return false;
			}
			for (var i = 0, l = factor.length; i < l; i++) {
				if (this._factor[i] !== factor[i]) {
					return false;
				}
			}
			return true;
		};
		_proto2.copyTo = function copyTo(factor) {
			if (!factor) {
				factor = new this._factor.constructor(this._factor.length);
			}
			factor.set(this._factor);
			return factor;
		};
		return LightHash;
	}();
	function shadowCastingLightsFirst(lightA, lightB) {
		var a = castShadow(lightA) ? 1 : 0;
		var b = castShadow(lightB) ? 1 : 0;
		return b - a;
	}
	function castShadow(light) {
		return light.shadow && light.castShadow;
	}

	/**
	 * RenderQueueLayer holds all the renderable objects.
	 * Now has an opaque list and a transparent list.
	 * @memberof t3d
	 */
	var RenderQueueLayer = /*#__PURE__*/function () {
		/**
		 * @param {Number} id - layer id.
		 */
		function RenderQueueLayer(id) {
			this.id = id;
			this.opaque = [];
			this.opaqueCount = 0;
			this.transparent = [];
			this.transparentCount = 0;
			this._cache = [];
			this._cacheIndex = 0;
			this._lastCacheIndex = 0;
			this.opaqueSortCompareFn = defaultOpaqueSortCompare;
			this.transparentSortCompareFn = defaultTransparentSortCompare;
		}
		var _proto = RenderQueueLayer.prototype;
		_proto.begin = function begin() {
			this._cacheIndex = 0;
			this.opaqueCount = 0;
			this.transparentCount = 0;
		};
		_proto.end = function end() {
			this.opaque.length = this.opaqueCount;
			this.transparent.length = this.transparentCount;

			// Clear references from inactive renderables in the list
			var cacheIndex = this._cacheIndex,
				lastCacheIndex = this._lastCacheIndex;
			if (lastCacheIndex > cacheIndex) {
				var cache = this._cache;
				for (var i = cacheIndex; i < lastCacheIndex; i++) {
					var renderable = cache[i];
					renderable.object = null;
					renderable.geometry = null;
					renderable.material = null;
					renderable.group = null;
				}
			}
			this._lastCacheIndex = cacheIndex;
		};
		_proto.addRenderable = function addRenderable(object, geometry, material, z, group) {
			var cache = this._cache;
			var renderable = cache[this._cacheIndex];
			if (renderable === undefined) {
				renderable = {
					object: object,
					geometry: geometry,
					material: material,
					z: z,
					renderOrder: object.renderOrder,
					group: group
				};
				cache[this._cacheIndex] = renderable;
			} else {
				renderable.object = object;
				renderable.geometry = geometry;
				renderable.material = material;
				renderable.z = z;
				renderable.renderOrder = object.renderOrder;
				renderable.group = group;
			}
			if (material.transparent) {
				this.transparent[this.transparentCount] = renderable;
				this.transparentCount++;
			} else {
				this.opaque[this.opaqueCount] = renderable;
				this.opaqueCount++;
			}
			this._cacheIndex++;
		};
		_proto.sort = function sort() {
			this.opaque.sort(this.opaqueSortCompareFn);
			quickSort(this.transparent, 0, this.transparent.length, this.transparentSortCompareFn);
		};
		return RenderQueueLayer;
	}();
	function defaultOpaqueSortCompare(a, b) {
		if (a.renderOrder !== b.renderOrder) {
			return a.renderOrder - b.renderOrder;
		} else if (a.material.id !== b.material.id) {
			return a.material.id - b.material.id;
		} else {
			return a.id - b.id;
		}
	}
	function defaultTransparentSortCompare(a, b) {
		if (a.renderOrder !== b.renderOrder) {
			return a.renderOrder - b.renderOrder;
		} else if (a.z !== b.z) {
			return b.z - a.z;
		} else if (a.material.id !== b.material.id) {
			// fix Unstable sort below chrome version 7.0
			// if render same object with different materials
			return a.material.id - b.material.id;
		} else {
			return a.id - b.id;
		}
	}

	// Reference github.com/ant-galaxy/oasis-engine/blob/main/packages/core/src/RenderPipeline/RenderQueue.ts
	// quickSort is faster when sorting highly randomized arrays,
	// but for sorting lowly randomized arrays, Array.prototype.sort is faster,
	// so quickSort is more suitable for transparent list sorting.

	function quickSort(a, from, to, compareFunc) {
		while (true) {
			// Insertion sort is faster for short arrays.
			if (to - from <= 10) {
				insertionSort(a, from, to, compareFunc);
				return;
			}
			var third_index = from + to >> 1;
			// Find a pivot as the median of first, last and middle element.
			var v0 = a[from];
			var v1 = a[to - 1];
			var v2 = a[third_index];
			var c01 = compareFunc(v0, v1);
			if (c01 > 0) {
				var tmp = v0;
				v0 = v1;
				v1 = tmp;
			}
			var c02 = compareFunc(v0, v2);
			if (c02 >= 0) {
				var _tmp = v0;
				v0 = v2;
				v2 = v1;
				v1 = _tmp;
			} else {
				var c12 = compareFunc(v1, v2);
				if (c12 > 0) {
					var _tmp2 = v1;
					v1 = v2;
					v2 = _tmp2;
				}
			}
			a[from] = v0;
			a[to - 1] = v2;
			var pivot = v1;
			var low_end = from + 1; // Upper bound of elements lower than pivot.
			var high_start = to - 1; // Lower bound of elements greater than pivot.
			a[third_index] = a[low_end];
			a[low_end] = pivot;

			// From low_end to i are elements equal to pivot.
			// From i to high_start are elements that haven't been compared yet.
			partition: for (var i = low_end + 1; i < high_start; i++) {
				var element = a[i];
				var order = compareFunc(element, pivot);
				if (order < 0) {
					a[i] = a[low_end];
					a[low_end] = element;
					low_end++;
				} else if (order > 0) {
					do {
						high_start--;
						if (high_start == i) break partition;
						var top_elem = a[high_start];
						order = compareFunc(top_elem, pivot);
					} while (order > 0);
					a[i] = a[high_start];
					a[high_start] = element;
					if (order < 0) {
						element = a[i];
						a[i] = a[low_end];
						a[low_end] = element;
						low_end++;
					}
				}
			}
			if (to - high_start < low_end - from) {
				quickSort(a, high_start, to, compareFunc);
				to = low_end;
			} else {
				quickSort(a, from, low_end, compareFunc);
				from = high_start;
			}
		}
	}
	function insertionSort(a, from, to, compareFunc) {
		for (var i = from + 1; i < to; i++) {
			var j = void 0;
			var element = a[i];
			for (j = i - 1; j >= from; j--) {
				var tmp = a[j];
				var order = compareFunc(tmp, element);
				if (order > 0) {
					a[j + 1] = tmp;
				} else {
					break;
				}
			}
			a[j + 1] = element;
		}
	}

	/**
	 * RenderQueue is used to collect renderable objects from the scene.
	 * And dispatch all renderable objects to the corresponding RenderQueueLayer according to object.renderLayer
	 * @memberof t3d
	 */
	var RenderQueue = /*#__PURE__*/function () {
		function RenderQueue() {
			this.layerMap = new Map();
			this.layerList = [];
			this._lastLayer = this.createLayer(0);
		}
		var _proto = RenderQueue.prototype;
		_proto.begin = function begin() {
			for (var i = 0, l = this.layerList.length; i < l; i++) {
				this.layerList[i].begin();
			}
		};
		_proto.end = function end() {
			for (var i = 0, l = this.layerList.length; i < l; i++) {
				this.layerList[i].end();
				this.layerList[i].sort();
			}
		};
		_proto.push = function push(object, camera) {
			// frustum test, only test bounding sphere
			if (object.frustumCulled && camera.frustumCulled) {
				helpSphere.copy(object.geometry.boundingSphere).applyMatrix4(object.worldMatrix);
				if (!camera.frustum.intersectsSphere(helpSphere)) {
					return;
				}
			}

			// calculate z
			helpVector3.setFromMatrixPosition(object.worldMatrix);
			helpVector3.applyMatrix4(camera.projectionViewMatrix); // helpVector3.project(camera);

			var layerId = object.renderLayer || 0;
			var layer = this._lastLayer;
			if (layer.id !== layerId) {
				layer = this.layerMap.get(layerId);
				if (!layer) {
					layer = this.createLayer(layerId);
				}
				this._lastLayer = layer;
			}
			if (Array.isArray(object.material)) {
				var groups = object.geometry.groups;
				for (var i = 0; i < groups.length; i++) {
					var group = groups[i];
					var groupMaterial = object.material[group.materialIndex];
					if (groupMaterial) {
						layer.addRenderable(object, object.geometry, groupMaterial, helpVector3.z, group);
					}
				}
			} else {
				layer.addRenderable(object, object.geometry, object.material, helpVector3.z);
			}
		}

		/**
				* Set a render queue layer.
		 * @param {Number} id - The layer id.
				* @param {t3d.RenderQueueLayer} layer - The layer to set.
				*/;
		_proto.setLayer = function setLayer(id, layer) {
			this.layerMap.set(id, layer);
			this.layerList.push(layer);
			this.layerList.sort(sortLayer);
		}

		/**
				* Create and set a render queue layer.
		 * @param {Number} id - The layer id.
		 * @return {t3d.RenderQueueLayer}
				*/;
		_proto.createLayer = function createLayer(id) {
			var layer = new RenderQueueLayer(id);
			this.setLayer(id, layer);
			return layer;
		}

		/**
				* Get the render queue layer.
		 * @param {Number} id - The layer id.
		 * @return {t3d.RenderQueueLayer}
				*/;
		_proto.getLayer = function getLayer(id) {
			return this.layerMap.get(id);
		}

		/**
				* Remove the render queue layer.
		 * @param {Number} id - The layer id.
				*/;
		_proto.removeLayer = function removeLayer(id) {
			var layer = this.layerMap.get(id);
			if (layer) {
				this.layerMap.delete(id);
				var index = this.layerList.indexOf(layer);
				if (index !== -1) {
					this.layerList.splice(index, 1);
				}
				if (this._lastLayer === id) {
					this._lastLayer = null;
				}
			}
		};
		return RenderQueue;
	}();
	var helpVector3 = new Vector3();
	var helpSphere = new Sphere();
	function sortLayer(a, b) {
		return a.id - b.id;
	}

	var _plane_1 = new Plane();
	var _sceneDataId = 0;

	/**
	 * SceneData collect all render states about scene, Including lights.
	 * @memberof t3d
	 */
	var SceneData = /*#__PURE__*/function () {
		function SceneData() {
			this.id = _sceneDataId++;
			this.version = 0;
			this.useAnchorMatrix = false;
			this.anchorMatrix = new Matrix4();
			this.anchorMatrixInverse = new Matrix4();
			this.disableShadowSampler = false;
			this.logarithmicDepthBuffer = false;
			this.fog = null;
			this.environment = null;
			this.environmentLightIntensity = 1;
			this.clippingPlanesData = new Float32Array([]);
			this.numClippingPlanes = 0;
		}

		/**
		 * Update scene data.
		 * @param {t3d.Scene}
		 */
		var _proto = SceneData.prototype;
		_proto.update = function update(scene) {
			this.useAnchorMatrix = !scene.anchorMatrix.isIdentity();
			this.anchorMatrix.copy(scene.anchorMatrix);
			this.anchorMatrixInverse.getInverse(scene.anchorMatrix);
			this.disableShadowSampler = scene.disableShadowSampler;
			this.logarithmicDepthBuffer = scene.logarithmicDepthBuffer;
			this.fog = scene.fog;
			this.environment = scene.environment;
			this.environmentLightIntensity = scene.environmentLightIntensity;
			if (this.clippingPlanesData.length < scene.clippingPlanes.length * 4) {
				this.clippingPlanesData = new Float32Array(scene.clippingPlanes.length * 4);
			}
			this.setClippingPlanesData(scene.clippingPlanes, this.clippingPlanesData);
			this.numClippingPlanes = scene.clippingPlanes.length;
			this.version++;
		};
		_proto.setClippingPlanesData = function setClippingPlanesData(clippingPlanes, clippingPlanesData) {
			for (var i = 0; i < clippingPlanes.length; i++) {
				_plane_1.copy(clippingPlanes[i]);
				if (this.useAnchorMatrix) {
					_plane_1.applyMatrix4(this.anchorMatrixInverse);
				}
				clippingPlanesData[i * 4 + 0] = _plane_1.normal.x;
				clippingPlanesData[i * 4 + 1] = _plane_1.normal.y;
				clippingPlanesData[i * 4 + 2] = _plane_1.normal.z;
				clippingPlanesData[i * 4 + 3] = _plane_1.constant;
			}
			return clippingPlanesData;
		};
		return SceneData;
	}();

	function _isPerspectiveMatrix(m) {
		return m.elements[11] === -1.0;
	}
	var _cameraDataId = 0;

	/**
	 * RenderStates collect all render states about scene and camera.
	 * @memberof t3d
	 */
	var RenderStates = /*#__PURE__*/function () {
		function RenderStates(sceneData, lightsData) {
			this.scene = sceneData;
			this.lights = lightsData;
			this.camera = {
				id: _cameraDataId++,
				version: 0,
				near: 0,
				far: 0,
				position: new Vector3(),
				logDepthCameraNear: 0,
				logDepthBufFC: 0,
				viewMatrix: new Matrix4(),
				projectionMatrix: new Matrix4(),
				projectionViewMatrix: new Matrix4(),
				rect: new Vector4(0, 0, 1, 1)
			};
			this.gammaFactor = 2.0;
			this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
		}

		/**
		 * Update render states about camera.
		 * @param {t3d.Camera}
		 */
		var _proto = RenderStates.prototype;
		_proto.updateCamera = function updateCamera(camera) {
			var sceneData = this.scene;
			var cameraData = this.camera;
			var projectionMatrix = camera.projectionMatrix;
			var cameraNear = 0,
				cameraFar = 0;
			if (_isPerspectiveMatrix(projectionMatrix)) {
				cameraNear = projectionMatrix.elements[14] / (projectionMatrix.elements[10] - 1);
				cameraFar = projectionMatrix.elements[14] / (projectionMatrix.elements[10] + 1);
			} else {
				cameraNear = (projectionMatrix.elements[14] + 1) / projectionMatrix.elements[10];
				cameraFar = (projectionMatrix.elements[14] - 1) / projectionMatrix.elements[10];
			}
			cameraData.near = cameraNear;
			cameraData.far = cameraFar;
			if (sceneData.logarithmicDepthBuffer) {
				cameraData.logDepthCameraNear = cameraNear;
				cameraData.logDepthBufFC = 2.0 / (Math.log(cameraFar - cameraNear + 1.0) * Math.LOG2E);
			} else {
				cameraData.logDepthCameraNear = 0;
				cameraData.logDepthBufFC = 0;
			}
			cameraData.position.setFromMatrixPosition(camera.worldMatrix);
			if (sceneData.useAnchorMatrix) {
				cameraData.position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cameraData.viewMatrix.copy(camera.viewMatrix);
			if (sceneData.useAnchorMatrix) {
				cameraData.viewMatrix.multiply(sceneData.anchorMatrix);
			}
			cameraData.projectionMatrix.copy(projectionMatrix);
			cameraData.projectionViewMatrix.copy(projectionMatrix).multiply(cameraData.viewMatrix);
			cameraData.rect.copy(camera.rect);
			cameraData.version++;
			this.gammaFactor = camera.gammaFactor;
			this.outputEncoding = camera.outputEncoding;
		};
		return RenderStates;
	}();

	/**
	 * Scenes allow you to set up what and where is to be rendered by t3d.
	 * This is where you place objects, lights and cameras.
	 * @constructor
	 * @memberof t3d
	 * @extends t3d.Object3D
	 */
	var Scene = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Scene, _Object3D);
		/**
		 * Create a scene.
		 */
		function Scene() {
			var _this;
			_this = _Object3D.call(this) || this;

			/**
			 * A {@link t3d.Fog} instance defining the type of fog that affects everything rendered in the scene.
			 * @type {t3d.Fog}
			 * @default null
			 */
			_this.fog = null;

			/**
			 * If not null, this texture is set as the environment map for all materials in the scene.
			 * However, it's not possible to overwrite an existing texture assigned to Material.envMap.
			 * @type {t3d.TextureCube | Null}
			 * @default null
			 */
			_this.environment = null;

			/**
			 * The Intensity of IBL (image based lighting) witch is generated by the environment map.
			 * @type {Number}
			 * @default 1
			 */
			_this.environmentLightIntensity = 1;

			/**
			 * User-defined clipping planes specified as {@link t3d.Plane} objects in world space.
			 * These planes apply to the scene.
			 * Points in space whose dot product with the plane is negative are cut away.
			 * @type {t3d.Plane[]}
			 * @default []
			 */
			_this.clippingPlanes = [];

			/**
			 * Defines whether disable shadow sampler feature.
			 * Shader with sampler2DShadow uniforms may cause unknown error on some android phones, set disableShadowSampler to true to avoid these bugs.
			 * When this property is set to true, soft shadow types will fallback to POISSON_SOFT without warning.
			 * @type {Boolean}
			 * @default false
			 */
			_this.disableShadowSampler = false;

			/**
			 * whether to use a logarithmic depth buffer. It may be neccesary to use this if dealing with huge differences in scale in a single scene.
			 * Note that this setting uses gl_FragDepth if available which disables the Early Fragment Test optimization and can cause a decrease in performance.
			 * @type {Boolean}
			 * @default false
			 */
			_this.logarithmicDepthBuffer = false;

			/**
			 * The anchor matrix of the world coordinate system.
			 * If it is not an identity matrix, the actual lighting calculating and the world position in the shader, will be in the anchor coordinate system.
			 * By setting this property, you can solve the floating point precision problem caused by the rendering object far away from the origin of the world coordinate system.
			 * In addition, by setting the rotation, it can also repair the direction of the reflection.
			 * @type {t3d.Matrix4}
			 */
			_this.anchorMatrix = new Matrix4();
			_this._sceneData = new SceneData();
			_this._lightData = new LightData();
			_this._skeletons = new Set();
			_this._renderQueueMap = new WeakMap();
			_this._renderStatesMap = new WeakMap();
			return _this;
		}

		/**
		 * Update {@link t3d.RenderStates} for the scene and camera.
		 * The light data in RenderStates will be empty unless calling {@link t3d.Scene#updateRenderQueue}.
		 * @param {t3d.Camera} camera - The camera.
		 * @param {Boolean} [updateScene=true] - Whether to update scene data.
		 * @return {t3d.RenderStates} - The result render states.
		 */
		var _proto = Scene.prototype;
		_proto.updateRenderStates = function updateRenderStates(camera, updateScene) {
			updateScene = updateScene !== undefined ? updateScene : true;
			if (!this._renderStatesMap.has(camera)) {
				this._renderStatesMap.set(camera, new RenderStates(this._sceneData, this._lightData));
			}
			var renderStates = this._renderStatesMap.get(camera);
			if (updateScene) {
				this._sceneData.update(this);
			}
			renderStates.updateCamera(camera);
			return renderStates;
		}

		/**
		 * Get {@link t3d.RenderStates} for the scene and camera.
		 * The RenderStates will be updated by calling {@link t3d.Scene#updateRenderStates}.
		 * The light data in RenderStates will be empty unless calling {@link t3d.Scene#updateRenderQueue}.
		 * @param {t3d.Camera} camera - The camera.
		 * @return {t3d.RenderQueue} - The target render queue.
		 */;
		_proto.getRenderStates = function getRenderStates(camera) {
			return this._renderStatesMap.get(camera);
		}

		/**
		 * Update {@link t3d.RenderQueue} for the scene and camera.
		 * Collect all visible meshes (and lights) from scene graph, and push meshes to render queue.
		 * Light data will be stored in RenderStates.
		 * @param {t3d.Camera} camera - The camera.
		 * @param {Boolean} [collectLights=true] - Whether to collect light data.
		 * @param {Boolean} [updateSkeletons=true] - Whether to update skeletons.
		 * @return {t3d.RenderQueue} - The result render queue.
		 */;
		_proto.updateRenderQueue = function updateRenderQueue(camera, collectLights, updateSkeletons) {
			collectLights = collectLights !== undefined ? collectLights : true;
			updateSkeletons = updateSkeletons !== undefined ? updateSkeletons : true;
			if (!this._renderQueueMap.has(camera)) {
				this._renderQueueMap.set(camera, new RenderQueue());
			}
			var renderQueue = this._renderQueueMap.get(camera);
			if (updateSkeletons) {
				this._skeletons.clear();
			}
			renderQueue.begin();
			if (collectLights) {
				this._lightData.begin();
				this._doPushObject(this, camera, renderQueue, updateSkeletons);
				this._lightData.end(this._sceneData);
			} else {
				this._doPushMesh(this, camera, renderQueue, updateSkeletons);
			}
			renderQueue.end();

			// Since skeletons may be referenced by different mesh, it is necessary to collect skeletons in the scene in order to avoid repeated updates.
			// For IOS platform, we should try to avoid repeated texture updates within one frame, otherwise the performance will be seriously degraded.
			if (updateSkeletons) {
				for (var _iterator = _createForOfIteratorHelperLoose(this._skeletons), _step; !(_step = _iterator()).done;) {
					var skeleton = _step.value;
					skeleton.updateBones(this._sceneData);
				}
			}
			return renderQueue;
		}

		/**
		 * Get {@link t3d.RenderQueue} for the scene and camera.
		 * The RenderQueue will be updated by calling {@link t3d.Scene#updateRenderQueue}.
		 * @param {t3d.Camera} camera - The camera.
		 * @return {t3d.RenderQueue} - The target render queue.
		 */;
		_proto.getRenderQueue = function getRenderQueue(camera) {
			return this._renderQueueMap.get(camera);
		};
		_proto._doPushMesh = function _doPushMesh(object, camera, renderQueue, updateSkeletons) {
			if (!object.visible) {
				return;
			}
			if (!!object.geometry && !!object.material && object.renderable) {
				renderQueue.push(object, camera);
				if (updateSkeletons && !!object.skeleton) {
					this._skeletons.add(object.skeleton);
				}
			}
			var children = object.children;
			for (var i = 0, l = children.length; i < l; i++) {
				this._doPushMesh(children[i], camera, renderQueue, updateSkeletons);
			}
		};
		_proto._doPushObject = function _doPushObject(object, camera, renderQueue, updateSkeletons) {
			if (!object.visible) {
				return;
			}
			if (!!object.geometry && !!object.material && object.renderable) {
				renderQueue.push(object, camera);
				if (updateSkeletons && !!object.skeleton) {
					this._skeletons.add(object.skeleton);
				}
			} else if (object.isLight) {
				this._lightData.push(object);
			}
			var children = object.children;
			for (var i = 0, l = children.length; i < l; i++) {
				this._doPushObject(children[i], camera, renderQueue, updateSkeletons);
			}
		};
		return Scene;
	}(Object3D);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Scene.prototype.isScene = true;

	/**
	 * The camera used for rendering a 3D scene.
	 * The camera's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed camera points down the -Z axis.
	 * @memberof t3d
	 * @extends t3d.Object3D
	 */
	var Camera = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Camera, _Object3D);
		/**
		 * Create a camera.
		 */
		function Camera() {
			var _this;
			_this = _Object3D.call(this) || this;

			/**
			 * This is the inverse of worldMatrix.
			 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
			 * @type {t3d.Matrix4}
			 */
			_this.viewMatrix = new Matrix4();

			/**
			 * This is the matrix which contains the projection.
			 * @type {t3d.Matrix4}
			 */
			_this.projectionMatrix = new Matrix4();

			/**
			 * This is the matrix which contains the projection.
			 * @type {t3d.Matrix4}
			 */
			_this.projectionMatrixInverse = new Matrix4();

			/**
			 * This is the matrix which contains the projection and view matrix.
			 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
			 * @type {t3d.Matrix4}
			 */
			_this.projectionViewMatrix = new Matrix4();

			/**
			 * The frustum of the camera.
			 * @type {t3d.Frustum}
			 */
			_this.frustum = new Frustum();

			/**
			 * The factor of gamma.
			 * @type {Number}
			 * @default 2.0
			 */
			_this.gammaFactor = 2.0;

			/**
			 * Output pixel encoding.
			 * @type {t3d.TEXEL_ENCODING_TYPE}
			 * @default t3d.TEXEL_ENCODING_TYPE.LINEAR
			 */
			_this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;

			/**
			 * Where on the screen is the camera rendered in normalized coordinates.
			 * The values in rect range from zero (left/bottom) to one (right/top).
			 * @type {t3d.Vector4}
			 * @default t3d.Vector4(0, 0, 1, 1)
			 */
			_this.rect = new Vector4(0, 0, 1, 1);

			/**
			 * When this is set, it checks every frame if objects are in the frustum of the camera before rendering objects.
			 * Otherwise objects gets rendered every frame even if it isn't visible.
			 * @type {Boolean}
			 * @default true
			 */
			_this.frustumCulled = true;
			return _this;
		}

		/**
		 * Set view by look at, this func will set quaternion of this camera.
		 * @method
		 * @param {t3d.Vector3} target - The target that the camera look at.
		 * @param {t3d.Vector3} up - The up direction of the camera.
		 */
		var _proto = Camera.prototype;
		_proto.lookAt = function lookAt(target, up) {
			_mat4_1$1.lookAtRH(this.position, target, up);
			this.quaternion.setFromRotationMatrix(_mat4_1$1);
		}

		/**
		 * Set orthographic projection matrix.
		 * @param {Number} left — Camera frustum left plane.
		 * @param {Number} right — Camera frustum right plane.
		 * @param {Number} bottom — Camera frustum bottom plane.
		 * @param {Number} top — Camera frustum top plane.
		 * @param {Number} near — Camera frustum near plane.
		 * @param {Number} far — Camera frustum far plane.
		 */;
		_proto.setOrtho = function setOrtho(left, right, bottom, top, near, far) {
			this.projectionMatrix.set(2 / (right - left), 0, 0, -(right + left) / (right - left), 0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom), 0, 0, -2 / (far - near), -(far + near) / (far - near), 0, 0, 0, 1);
			this.projectionMatrixInverse.getInverse(this.projectionMatrix);
		}

		/**
		 * Set perspective projection matrix.
		 * @param {Number} fov — Camera frustum vertical field of view.
		 * @param {Number} aspect — Camera frustum aspect ratio.
		 * @param {Number} near — Camera frustum near plane.
		 * @param {Number} far — Camera frustum far plane.
		 */;
		_proto.setPerspective = function setPerspective(fov, aspect, near, far) {
			this.projectionMatrix.set(1 / (aspect * Math.tan(fov / 2)), 0, 0, 0, 0, 1 / Math.tan(fov / 2), 0, 0, 0, 0, -(far + near) / (far - near), -2 * far * near / (far - near), 0, 0, -1, 0);
			this.projectionMatrixInverse.getInverse(this.projectionMatrix);
		};
		_proto.getWorldDirection = function getWorldDirection(optionalTarget) {
			if (optionalTarget === void 0) {
				optionalTarget = new Vector3();
			}
			var e = this.worldMatrix.elements;
			return optionalTarget.set(-e[8], -e[9], -e[10]).normalize();
		};
		_proto.updateMatrix = function updateMatrix(force) {
			Object3D.prototype.updateMatrix.call(this, force);
			this.viewMatrix.getInverse(this.worldMatrix); // update view matrix

			this.projectionViewMatrix.multiplyMatrices(this.projectionMatrix, this.viewMatrix); // get PV matrix
			this.frustum.setFromMatrix(this.projectionViewMatrix); // update frustum
		};
		_proto.copy = function copy(source, recursive) {
			Object3D.prototype.copy.call(this, source, recursive);
			this.viewMatrix.copy(source.viewMatrix);
			this.projectionMatrix.copy(source.projectionMatrix);
			this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
			this.frustum.copy(source.frustum);
			this.gammaFactor = source.gammaFactor;
			this.outputEncoding = source.outputEncoding;
			this.rect.copy(source.rect);
			this.frustumCulled = source.frustumCulled;
			return this;
		};
		return Camera;
	}(Object3D);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Camera.prototype.isCamera = true;
	var _mat4_1$1 = new Matrix4();

	var _sphere = new Sphere();
	var _inverseMatrix = new Matrix4();
	var _ray = new Ray();
	var _barycoord = new Vector3();
	var _vA = new Vector3();
	var _vB = new Vector3();
	var _vC = new Vector3();
	var _tempA = new Vector3();
	var _tempB = new Vector3();
	var _tempC = new Vector3();
	var _morphA = new Vector3();
	var _morphB = new Vector3();
	var _morphC = new Vector3();
	var _basePosition = new Vector3();
	var _skinIndex = new Vector4();
	var _skinWeight = new Vector4();
	var _vector$1 = new Vector3();
	var _matrix = new Matrix4();
	var _uvA = new Vector2();
	var _uvB = new Vector2();
	var _uvC = new Vector2();
	var _intersectionPoint = new Vector3();
	var _intersectionPointWorld = new Vector3();

	/**
	 * Class representing triangular polygon mesh based objects.
	 * Also serves as a base for other classes such as {@link t3d.SkinnedMesh}.
	 * @memberof t3d
	 * @extends t3d.Object3D
	 */
	var Mesh = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Mesh, _Object3D);
		/**
		 * @param {t3d.Geometry} geometry — an instance of {@link t3d.Geometry}.
		 * @param {t3d.Material} material - a single or an array of {@link t3d.Material}.
		 */
		function Mesh(geometry, material) {
			var _this;
			_this = _Object3D.call(this) || this;

			/**
			 * an instance of {@link t3d.Geometry}.
			 * @type {t3d.Geometry}
			 */
			_this.geometry = geometry;

			/**
			 * a single or an array of {@link t3d.Material}.
			 * @type {t3d.Material|t3d.Material[]}
			 */
			_this.material = material;

			/**
			 * An array of weights typically from 0-1 that specify how much of the morph is applied.
			 * @type {Number[]|null}
			 * @default null
			 */
			_this.morphTargetInfluences = null;
			return _this;
		}
		var _proto = Mesh.prototype;
		_proto.raycast = function raycast(ray, intersects) {
			var geometry = this.geometry;
			var worldMatrix = this.worldMatrix;
			_sphere.copy(geometry.boundingSphere);
			_sphere.applyMatrix4(worldMatrix);
			if (!ray.intersectsSphere(_sphere)) {
				return;
			}
			_inverseMatrix.getInverse(worldMatrix);
			_ray.copy(ray).applyMatrix4(_inverseMatrix);
			if (!_ray.intersectsBox(geometry.boundingBox)) {
				return;
			}
			var position = geometry.getAttribute("a_Position");
			if (!position) {
				return;
			}
			var uv = geometry.getAttribute("a_Uv");
			var morphPosition = geometry.morphAttributes.position;
			var intersection;
			if (geometry.index) {
				var index = geometry.index.buffer.array;
				for (var i = 0; i < index.length; i += 3) {
					var a = index[i];
					var b = index[i + 1];
					var c = index[i + 2];
					intersection = checkGeometryIntersection(this, ray, _ray, position, morphPosition, uv, a, b, c);
					if (intersection) {
						intersection.faceIndex = Math.floor(i / 3);
						intersects.push(intersection);
					}
				}
			} else {
				for (var _i = 0; _i < position.buffer.count; _i += 3) {
					var _a = _i;
					var _b = _i + 1;
					var _c = _i + 2;
					intersection = checkGeometryIntersection(this, ray, _ray, position, morphPosition, uv, _a, _b, _c);
					if (intersection) {
						intersection.faceIndex = Math.floor(_i / 3);
						intersects.push(intersection);
					}
				}
			}
		};
		_proto.copy = function copy(source) {
			_Object3D.prototype.copy.call(this, source);
			if (source.morphTargetInfluences) {
				this.morphTargetInfluences = source.morphTargetInfluences.slice();
			}
			return this;
		};
		_proto.clone = function clone() {
			return new this.constructor(this.geometry, this.material).copy(this);
		};
		return Mesh;
	}(Object3D);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Mesh.prototype.isMesh = true;
	function checkGeometryIntersection(object, ray, _ray, position, morphPosition, uv, a, b, c) {
		var array;
		var bufferStride;
		var attributeOffset;
		array = position.buffer.array;
		bufferStride = position.buffer.stride;
		attributeOffset = position.offset;
		_vA.fromArray(array, a * bufferStride + attributeOffset);
		_vB.fromArray(array, b * bufferStride + attributeOffset);
		_vC.fromArray(array, c * bufferStride + attributeOffset);
		var morphInfluences = object.morphTargetInfluences;
		if (morphPosition && morphInfluences) {
			_morphA.set(0, 0, 0);
			_morphB.set(0, 0, 0);
			_morphC.set(0, 0, 0);
			for (var i = 0; i < morphPosition.length; i++) {
				var influence = morphInfluences[i];
				var morphAttribute = morphPosition[i];
				if (influence === 0) continue;
				array = morphAttribute.buffer.array;
				bufferStride = morphAttribute.buffer.stride;
				attributeOffset = morphAttribute.offset;
				_tempA.fromArray(array, a * bufferStride + attributeOffset);
				_tempB.fromArray(array, b * bufferStride + attributeOffset);
				_tempC.fromArray(array, c * bufferStride + attributeOffset);
				_morphA.addScaledVector(_tempA, influence);
				_morphB.addScaledVector(_tempB, influence);
				_morphC.addScaledVector(_tempC, influence);
			}
			_vA.add(_morphA);
			_vB.add(_morphB);
			_vC.add(_morphC);
		}

		// Skinning : only raycast in incorrect skinnedMesh boundingBox!

		if (object.isSkinnedMesh) {
			boneTransform(object, a, _vA);
			boneTransform(object, b, _vB);
			boneTransform(object, c, _vC);
		}
		var intersection = checkIntersection(object, ray, _ray, _vA, _vB, _vC, _intersectionPoint);
		if (intersection) {
			if (uv) {
				array = uv.buffer.array;
				bufferStride = uv.buffer.stride;
				attributeOffset = uv.offset;
				_uvA.fromArray(array, a * bufferStride + attributeOffset);
				_uvB.fromArray(array, b * bufferStride + attributeOffset);
				_uvC.fromArray(array, c * bufferStride + attributeOffset);
				intersection.uv = uvIntersection(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC);
			}
			var face = {
				a: a,
				b: b,
				c: c,
				normal: new Vector3()
			};
			Triangle.normal(_vA, _vB, _vC, face.normal);
			intersection.face = face;
		}
		return intersection;
	}
	function uvIntersection(point, p1, p2, p3, uv1, uv2, uv3) {
		Triangle.barycoordFromPoint(point, p1, p2, p3, _barycoord);
		uv1.multiplyScalar(_barycoord.x);
		uv2.multiplyScalar(_barycoord.y);
		uv3.multiplyScalar(_barycoord.z);
		uv1.add(uv2).add(uv3);
		return uv1.clone();
	}
	function checkIntersection(object, ray, localRay, pA, pB, pC, point) {
		var intersect;
		var material = object.material;
		if (material.side === DRAW_SIDE.BACK) {
			intersect = localRay.intersectTriangle(pC, pB, pA, true, point);
		} else {
			intersect = localRay.intersectTriangle(pA, pB, pC, material.side !== DRAW_SIDE.DOUBLE, point);
		}
		if (intersect === null) return null;
		_intersectionPointWorld.copy(point);
		_intersectionPointWorld.applyMatrix4(object.worldMatrix);
		var distance = ray.origin.distanceTo(_intersectionPointWorld);
		return {
			distance: distance,
			point: _intersectionPointWorld.clone(),
			object: object
		};
	}
	function boneTransform(object, index, target) {
		var skeleton = object.skeleton;
		var skinIndex = object.geometry.attributes['skinIndex'];
		var skinWeight = object.geometry.attributes['skinWeight'];
		_skinIndex.fromArray(skinIndex.buffer.array, index * skinIndex.size);
		_skinWeight.fromArray(skinWeight.buffer.array, index * skinWeight.size);
		_basePosition.copy(target).applyMatrix4(object.bindMatrix);
		target.set(0, 0, 0);
		for (var i = 0; i < 4; i++) {
			var weight = getComponent(_skinWeight, i);
			if (weight < Number.EPSILON) continue;
			var boneIndex = getComponent(_skinIndex, i);
			if (!skeleton.bones[boneIndex]) continue;
			_matrix.multiplyMatrices(skeleton.bones[boneIndex].worldMatrix, skeleton.boneInverses[boneIndex]);
			target.addScaledVector(_vector$1.copy(_basePosition).applyMatrix4(_matrix), weight);
		}
		return target.applyMatrix4(object.bindMatrixInverse);
	}
	function getComponent(vec, index) {
		switch (index) {
			case 0:
				return vec.x;
			case 1:
				return vec.y;
			case 2:
				return vec.z;
			case 3:
				return vec.w;
			default:
				throw new Error('index is out of range: ' + index);
		}
	}

	/**
	 * The Attribute add structural information to Buffer.
	 * This class stores data for an attribute (such as vertex positions, face indices, normals, colors, UVs, and any custom attributes ) associated with a Geometry, which allows for more efficient passing of data to the GPU.
	 * Data is stored as vectors of any length (defined by size).
	 * @memberof t3d
	 */
	var Attribute = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Buffer} buffer - The Buffer instance passed in the constructor.
				* @param {Number} [size=buffer.stride] - The number of values of the array that should be associated with a particular vertex. For instance, if this attribute is storing a 3-component vector (such as a position, normal, or color), then size should be 3.
				* @param {Number} [offset=0] - The offset in the underlying array buffer where an item starts.
		 * @param {Boolean} [normalized=false] - Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
		 */
		function Attribute(buffer, size, offset, normalized) {
			if (size === void 0) {
				size = buffer.stride;
			}
			if (offset === void 0) {
				offset = 0;
			}
			if (normalized === void 0) {
				normalized = false;
			}
			/**
						 * The Buffer instance passed in the constructor.
						 * @type {t3d.Buffer}
						 */
			this.buffer = buffer;

			/**
						 * The number of values of the buffer that should be associated with the attribute.
						 * @type {Number}
			 * @default buffer.stride
						 */
			this.size = size;

			/**
						 * The offset in the underlying buffer where an item starts.
						 * @type {Number}
						 * @default 0
						 */
			this.offset = offset;

			/**
						 * Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
						 * @type {Boolean}
						 * @default false
						 */
			this.normalized = normalized;

			/**
						 * Instance cadence, the number of instances drawn for each vertex in the buffer, non-instance attributes must be 0.
						 * @type {Number}
						 * @default 0
						 */
			this.divisor = 0;
		}

		/**
				* Copy the parameters from the passed attribute.
				* @param {t3d.Attribute} source - The attribute to be copied.
				* @return {t3d.Attribute}
				*/
		var _proto = Attribute.prototype;
		_proto.copy = function copy(source) {
			this.buffer = source.buffer;
			this.size = source.size;
			this.offset = source.offset;
			this.normalized = source.normalized;
			this.divisor = source.divisor;
			return this;
		}

		/**
				* Return a new attribute with the same parameters as this attribute.
		 * @param {Object} buffers - A WeakMap to save shared buffers.
				* @return {t3d.Attribute}
				*/;
		_proto.clone = function clone(buffers) {
			var attribute;
			if (!buffers) {
				console.warn('t3d.Attribute.clone(): now requires a WeakMap as an argument to save shared buffers.');
				attribute = new Attribute(this.buffer.clone(), this.size, this.offset, this.normalized);
				attribute.divisor = this.divisor;
				return attribute;
			}
			if (!buffers.has(this.buffer)) {
				buffers.set(this.buffer, this.buffer.clone());
			}
			attribute = new Attribute(buffers.get(this.buffer), this.size, this.offset, this.normalized);
			attribute.divisor = this.divisor;
			return attribute;
		};
		return Attribute;
	}();

	/**
	 * The Buffer contain the data that is used for the geometry of 3D models, animations, and skinning.
	 * @memberof t3d
	 */
	var Buffer = /*#__PURE__*/function () {
		/**
		 * @param {TypedArray} array -- A typed array with a shared buffer. Stores the geometry data.
				* @param {Number} stride -- The number of typed-array elements per vertex.
		 */
		function Buffer(array, stride) {
			/**
						 * A typed array with a shared buffer.
						 * Stores the geometry data.
						 * @type {TypedArray}
						 */
			this.array = array;

			/**
						 * The number of typed-array elements per vertex.
						 * @type {Number}
						 */
			this.stride = stride;

			/**
						 * Gives the total number of elements in the array.
						 * @type {Number}
						 */
			this.count = array !== undefined ? array.length / stride : 0;

			/**
						 * Defines the intended usage pattern of the data store for optimization purposes.
						 * Corresponds to the usage parameter of WebGLRenderingContext.bufferData().
						 * @type {t3d.BUFFER_USAGE}
						 * @default t3d.BUFFER_USAGE.STATIC_DRAW
						 */
			this.usage = BUFFER_USAGE.STATIC_DRAW;

			/**
						 * Object containing offset and count.
						 * @type {Object}
						 * @default { offset: 0, count: - 1 }
						 */
			this.updateRange = {
				offset: 0,
				count: -1
			};

			/**
						 * A version number, incremented every time the data is changed.
						 * @type {Number}
						 * @default 0
						 */
			this.version = 0;
		}

		/**
		 * A callback function that is executed after the Renderer has transferred the attribute array data to the GPU.
		 */
		var _proto = Buffer.prototype;
		_proto.onUploadCallback = function onUploadCallback() {}

		/**
		 * Copies another Buffer to this Buffer.
		 * @param {t3d.Buffer} source - The buffer to be copied.
		 * @return {t3d.Buffer}
		 */;
		_proto.copy = function copy(source) {
			this.array = new source.array.constructor(source.array);
			this.stride = source.stride;
			this.count = source.array.length / this.stride;
			this.usage = source.usage;
			return this;
		}

		/**
		 * Return a copy of this buffer.
		 * @return {t3d.Buffer}
		 */;
		_proto.clone = function clone() {
			var array = new this.array.constructor(this.array);
			var ib = new Buffer(array, this.stride);
			ib.usage = this.usage;
			return ib;
		};
		return Buffer;
	}();

	var _geometryId = 0;
	var _vector = new Vector3();
	var _offset = new Vector3();
	var _sum = new Vector3();
	var _box3 = new Box3();
	var _boxMorphTargets = new Box3();

	/**
	 * An efficient representation of mesh, line, or point geometry.
	 * Includes vertex positions, face indices, normals, colors, UVs, and custom attributes within buffers, reducing the cost of passing all this data to the GPU.
	 * To read and edit data in {@link t3d.Geometry#attributes}.
	 * @memberof t3d
	 * @extends t3d.EventDispatcher
	 */
	var Geometry = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(Geometry, _EventDispatcher);
		/**
		 * Create a geometry.
		 */
		function Geometry() {
			var _this;
			_this = _EventDispatcher.call(this) || this;

			/**
			 * Unique number for this geometry instance.
			 * @readonly
			 * @type {Number}
			 */
			_this.id = _geometryId++;

			/**
			 * UUID of this geometry instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @readonly
			 * @type {String}
			 */
			_this.uuid = generateUUID();

			/**
			 * This hashmap has as id the name of the attribute to be set and as value the buffer to set it to.
			 * Rather than accessing this property directly, use {@link t3d.Geometry#addAttribute} and {@link t3d.Geometry#getAttribute} to access attributes of this geometry.
			 * @type {Object}
			 */
			_this.attributes = {};

			/**
			 * Hashmap of Attributes Array for morph targets.
			 * @type {Object}
			 */
			_this.morphAttributes = {};

			/**
			 * Allows for vertices to be re-used across multiple triangles; this is called using "indexed triangles" and each triangle is associated with the indices of three vertices.
			 * This attribute therefore stores the index of each vertex for each triangular face.
			 * If this attribute is not set, the renderer assumes that each three contiguous positions represent a single triangle.
			 * @type {t3d.Attribute|Null}
			 */
			_this.index = null;

			/**
			 * Bounding box for the bufferGeometry, which can be calculated with {@link t3d.Geometry#computeBoundingBox}.
			 * @type {t3d.Box3}
			 * @default t3d.Box3()
			 */
			_this.boundingBox = new Box3();

			/**
			 * Bounding sphere for the bufferGeometry, which can be calculated with {@link t3d.Geometry#computeBoundingSphere}.
			 * @type {t3d.Sphere}
			 * @default t3d.Sphere()
			 */
			_this.boundingSphere = new Sphere();

			/**
			 * Split the geometry into groups, each of which will be rendered in a separate WebGL draw call. This allows an array of materials to be used with the geometry.
			 * Each group is an object of the form:
			 * { start: Integer, count: Integer, materialIndex: Integer }
			 * @type {Array}
			 * @default []
			 */
			_this.groups = [];

			/**
			 * @type {Number}
			 * @default -1
			 */
			_this.instanceCount = -1;

			/**
			 * A version number, incremented every time the attribute object or index object changes to mark VAO drity.
			 * @type {Number}
			 * @default 0
			 */
			_this.version = 0;
			return _this;
		}

		/**
		 * Adds an attribute to this geometry.
		 * Use this rather than the attributes property.
		 * @param {String} name
		 * @param {t3d.Attribute} attribute
		 */
		var _proto = Geometry.prototype;
		_proto.addAttribute = function addAttribute(name, attribute) {
			this.attributes[name] = attribute;
		}

		/**
		 * Returns the attribute with the specified name.
		 * @param {String} name
		 * @return {t3d.Attribute}
		 */;
		_proto.getAttribute = function getAttribute(name) {
			return this.attributes[name];
		}

		/**
		 * Removes the attribute with the specified name.
		 * @param {String} name
		 */;
		_proto.removeAttribute = function removeAttribute(name) {
			delete this.attributes[name];
		}

		/**
		 * Set the {@link t3d.Geometry#index} buffer.
		 * @param {Array|t3d.Attribute|Null} index
		 */;
		_proto.setIndex = function setIndex(index) {
			if (Array.isArray(index)) {
				var typedArray = new (arrayMax(index) > 65535 ? Uint32Array : Uint16Array)(index);
				this.index = new Attribute(new Buffer(typedArray, 1));
			} else {
				this.index = index;
			}
		}

		/**
		 * Adds a group to this geometry; see the {@link t3d.Geometry#groups} for details.
		 * @param {Number} start
		 * @param {Number} count
		 * @param {Number} [materialIndex=0]
		 */;
		_proto.addGroup = function addGroup(start, count, materialIndex) {
			if (materialIndex === void 0) {
				materialIndex = 0;
			}
			this.groups.push({
				start: start,
				count: count,
				materialIndex: materialIndex
			});
		}

		/**
		 * Clears all groups.
		 */;
		_proto.clearGroups = function clearGroups() {
			this.groups = [];
		}

		/**
		 * Computes bounding box of the geometry, updating {@link t3d.Geometry#boundingBox}.
		 * Bounding boxes aren't computed by default. They need to be explicitly computed.
		 */;
		_proto.computeBoundingBox = function computeBoundingBox() {
			var position = this.attributes["a_Position"] || this.attributes["position"];
			if (position) {
				this.boundingBox.setFromArray(position.buffer.array, position.buffer.stride, position.offset);
			}
			var morphAttributesPosition = this.morphAttributes.position;
			if (morphAttributesPosition) {
				for (var i = 0; i < morphAttributesPosition.length; i++) {
					var morphAttribute = morphAttributesPosition[i];
					_box3.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);
					_vector.addVectors(this.boundingBox.min, _box3.min);
					this.boundingBox.expandByPoint(_vector);
					_vector.addVectors(this.boundingBox.max, _box3.max);
					this.boundingBox.expandByPoint(_vector);
				}
			}
		}

		/**
		 * Computes bounding sphere of the geometry, updating {@link t3d.Geometry#boundingSphere}.
		 * Bounding spheres aren't computed by default. They need to be explicitly computed.
		 */;
		_proto.computeBoundingSphere = function computeBoundingSphere() {
			var position = this.attributes["a_Position"] || this.attributes["position"];
			var morphAttributesPosition = this.morphAttributes.position;
			if (!position) {
				return;
			}
			var bufferStride = position.buffer.stride;
			var positionOffset = position.offset;
			if (morphAttributesPosition) {
				_box3.setFromArray(position.buffer.array, bufferStride, positionOffset);
				for (var i = 0; i < morphAttributesPosition.length; i++) {
					var morphAttribute = morphAttributesPosition[i];
					_boxMorphTargets.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);
					_vector.addVectors(_box3.min, _boxMorphTargets.min);
					_box3.expandByPoint(_vector);
					_vector.addVectors(_box3.max, _boxMorphTargets.max);
					_box3.expandByPoint(_vector);
				}
				var center = this.boundingSphere.center;
				_box3.getCenter(center);
				var maxRadiusSq = 0;
				for (var _i = 0; _i < position.buffer.count; _i++) {
					_offset.fromArray(position.buffer.array, _i * bufferStride + positionOffset);
					maxRadiusSq = center.distanceToSquared(_offset);
					for (var j = 0; j < morphAttributesPosition.length; j++) {
						var _morphAttribute = morphAttributesPosition[j];
						_vector.fromArray(_morphAttribute.buffer.array, _i * _morphAttribute.buffer.stride + _morphAttribute.offset);
						_sum.addVectors(_offset, _vector);
						var offsetLengthSq = center.distanceToSquared(_sum);

						// TODO The maximum radius cannot be obtained here
						if (offsetLengthSq > maxRadiusSq) {
							maxRadiusSq = offsetLengthSq;
							_offset.add(_vector);
						}
					}
				}
				this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
			} else {
				this.boundingSphere.setFromArray(position.buffer.array, bufferStride, positionOffset);
			}
		}

		/**
		 * Disposes the object from memory.
		 * You need to call this when you want the BufferGeometry removed while the application is running.
		 */;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}

		/**
		 * Copies another Geometry to this Geometry.
		 * @param {t3d.Geometry} source - The geometry to be copied.
		 * @return {t3d.Geometry}
		 */;
		_proto.copy = function copy(source) {
			var name, i, l;

			// reset

			this.index = null;
			this.attributes = {};
			this.morphAttributes = {};
			this.groups = [];
			var buffers = new WeakMap(); // used for storing cloned, shared buffers

			// index

			var index = source.index;
			if (index !== null) {
				this.setIndex(index.clone(buffers));
			}

			// attributes

			var attributes = source.attributes;
			for (name in attributes) {
				var attribute = attributes[name];
				this.addAttribute(name, attribute.clone(buffers));
			}

			// morph attributes

			var morphAttributes = source.morphAttributes;
			for (name in morphAttributes) {
				var array = [];
				var morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

				for (i = 0, l = morphAttribute.length; i < l; i++) {
					array.push(morphAttribute[i].clone(buffers));
				}
				this.morphAttributes[name] = array;
			}

			// groups

			var groups = source.groups;
			for (i = 0, l = groups.length; i < l; i++) {
				var group = groups[i];
				this.addGroup(group.start, group.count, group.materialIndex);
			}

			// boundings
			this.boundingBox.copy(source.boundingBox);
			this.boundingSphere.copy(source.boundingSphere);

			// instance count
			this.instanceCount = source.instanceCount;
			return this;
		}

		/**
		 * Creates a clone of this Geometry.
		 * @return {t3d.Geometry}
		 */;
		_proto.clone = function clone() {
			return new Geometry().copy(this);
		};
		return Geometry;
	}(EventDispatcher);
	function arrayMax(array) {
		if (array.length === 0) return -Infinity;
		var max = array[0];
		for (var i = 1, l = array.length; i < l; ++i) {
			if (array[i] > max) max = array[i];
		}
		return max;
	}

	/**
	 * A class for generating plane geometries.
	 * @memberof t3d
	 * @extends t3d.Geometry
	 */
	var PlaneGeometry = /*#__PURE__*/function (_Geometry) {
		_inheritsLoose(PlaneGeometry, _Geometry);
		/**
		 * @param {Number} [width=1] — Width along the X axis.
		 * @param {Number} [height=1] — Height along the Y axis.
		 * @param {Number} [widthSegments=1]
		 * @param {Number} [heightSegments=1]
		 */
		function PlaneGeometry(width, height, widthSegments, heightSegments) {
			var _this;
			if (width === void 0) {
				width = 1;
			}
			if (height === void 0) {
				height = 1;
			}
			if (widthSegments === void 0) {
				widthSegments = 1;
			}
			if (heightSegments === void 0) {
				heightSegments = 1;
			}
			_this = _Geometry.call(this) || this;
			var width_half = width / 2;
			var height_half = height / 2;
			var gridX = Math.floor(widthSegments);
			var gridY = Math.floor(heightSegments);
			var gridX1 = gridX + 1;
			var gridY1 = gridY + 1;
			var segment_width = width / gridX;
			var segment_height = height / gridY;
			var ix, iy;

			// buffers

			var indices = [];
			var vertices = [];
			var normals = [];
			var uvs = [];

			// generate vertices, normals and uvs

			for (iy = 0; iy < gridY1; iy++) {
				var y = iy * segment_height - height_half;
				for (ix = 0; ix < gridX1; ix++) {
					var x = ix * segment_width - width_half;
					vertices.push(x, 0, y);
					normals.push(0, 1, 0);
					uvs.push(ix / gridX);
					uvs.push(1 - iy / gridY);
				}
			}

			// indices

			for (iy = 0; iy < gridY; iy++) {
				for (ix = 0; ix < gridX; ix++) {
					var a = ix + gridX1 * iy;
					var b = ix + gridX1 * (iy + 1);
					var c = ix + 1 + gridX1 * (iy + 1);
					var d = ix + 1 + gridX1 * iy;

					// faces

					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}

			// build geometry

			_this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			_this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			_this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			_this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			_this.computeBoundingBox();
			_this.computeBoundingSphere();
			return _this;
		}
		return PlaneGeometry;
	}(Geometry);

	var _materialId = 0;

	/**
	 * Abstract base class for materials.
	 * Materials describe the appearance of {@link t3d.Object3D}.
	 * They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.
	 * The following properties and methods are inherited by all other material types (although they may have different defaults).
	 * @abstract
	 * @extends t3d.EventDispatcher
	 * @memberof t3d
	 */
	var Material = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(Material, _EventDispatcher);
		function Material() {
			var _this;
			_this = _EventDispatcher.call(this) || this;

			/**
			 * Unique number for this material instance.
			 * @readonly
			 * @type {Number}
			 */
			_this.id = _materialId++;

			/**
			 * UUID of this material instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @type {String}
			 */
			_this.uuid = generateUUID();

			/**
			 * Type of the material.
			 * @type {t3d.MATERIAL_TYPE}
			 * @default t3d.MATERIAL_TYPE.SHADER
			 */
			_this.type = MATERIAL_TYPE.SHADER;

			/**
			 * Custom shader name. This naming can help ShaderMaterial to optimize the length of the index hash string.
			 * It is valid only when the material type is t3d.MATERIAL_TYPE.SHADER.
			 * Otherwise, if the material is a built-in type, the name of the shader will always be equal to the material type.
			 * @type {String}
			 * @default ""
			 */
			_this.shaderName = "";

			/**
			 * Custom defines of the shader.
			 * Only valid when the material type is t3d.MATERIAL_TYPE.SHADER.
			 * @type {Object}
			 * @default {}
			 */
			_this.defines = {};

			/**
			 * Custom uniforms of the shader.
			 * Only valid when the material type is t3d.MATERIAL_TYPE.SHADER.
			 * @type {Object}
			 * @default {}
			 */
			_this.uniforms = {};

			/**
			 * Custom GLSL code for vertex shader.
			 * Only valid when the material type is t3d.MATERIAL_TYPE.SHADER.
			 * @type {String}
			 * @default ""
			 */
			_this.vertexShader = "";

			/**
			 * Custom GLSL code for fragment shader.
			 * Only valid when the material type is t3d.MATERIAL_TYPE.SHADER.
			 * @type {String}
			 * @default ""
			 */
			_this.fragmentShader = "";

			/**
			 * Override the renderer's default precision for this material.
			 * Can be "highp", "mediump" or "lowp".
			 * @type {String}
			 * @default null
			 */
			_this.precision = null;

			/**
			 * Defines whether this material is transparent.
			 * This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
			 * When set to true, the extent to which the material is transparent is controlled by setting it's blending property.
			 * @type {Boolean}
			 * @default false
			 */
			_this.transparent = false;

			/**
			 * Which blending to use when displaying objects with this material.
			 * This must be set to t3d.BLEND_TYPE.CUSTOM to use custom blendSrc, blendDst or blendEquation.
			 * @type {t3d.BLEND_TYPE}
			 * @default t3d.BLEND_TYPE.NORMAL
			 */
			_this.blending = BLEND_TYPE.NORMAL;

			/**
			 * Blending source.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_FACTOR}
			 * @default t3d.BLEND_FACTOR.SRC_ALPHA
			 */
			_this.blendSrc = BLEND_FACTOR.SRC_ALPHA;

			/**
			 * Blending destination.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_FACTOR}
			 * @default t3d.BLEND_FACTOR.ONE_MINUS_SRC_ALPHA
			 */
			_this.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

			/**
			 * Blending equation to use when applying blending.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_EQUATION}
			 * @default t3d.BLEND_EQUATION.ADD
			 */
			_this.blendEquation = BLEND_EQUATION.ADD;

			/**
			 * The transparency of the {@link t3d.Material#blendSrc}.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_FACTOR}
			 * @default null
			 */
			_this.blendSrcAlpha = null;

			/**
			 * The transparency of the {@link t3d.Material#blendDst}.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_FACTOR}
			 * @default null
			 */
			_this.blendDstAlpha = null;

			/**
			 * The tranparency of the {@link t3d.Material#blendEquation}.
			 * The {@link t3d.Material#blending} must be set to t3d.BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {t3d.BLEND_EQUATION}
			 * @default null
			 */
			_this.blendEquationAlpha = null;

			/**
			 * Whether to premultiply the alpha (transparency) value.
			 * @type {Boolean}
			 * @default false
			 */
			_this.premultipliedAlpha = false;

			/**
			 * Defines whether vertex coloring is used.
			 * @type {t3d.VERTEX_COLOR}
			 * @default t3d.VERTEX_COLOR.NONE
			 */
			_this.vertexColors = VERTEX_COLOR.NONE;

			/**
			 * Defines whether precomputed vertex tangents, which must be provided in a vec4 "tangent" attribute, are used.
			 * When disabled, tangents are derived automatically.
			 * Using precomputed tangents will give more accurate normal map details in some cases, such as with mirrored UVs.
			 * @type {Boolean}
			 * @default false
			 */
			_this.vertexTangents = false;

			/**
			 * Float in the range of 0.0 - 1.0 indicating how transparent the material is.
			 * A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
			 * @type {Number}
			 * @default 1
			 */
			_this.opacity = 1;

			/**
			 * The diffuse color.
			 * @type {t3d.Color3}
			 * @default t3d.Color3(0xffffff)
			 */
			_this.diffuse = new Color3(0xffffff);

			/**
			 * The diffuse map.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.diffuseMap = null;

			/**
			 * Define the UV chanel for the diffuse map to use starting from 0 and defaulting to 0.
			 * @type {Number}
			 * @default 0
			 */
			_this.diffuseMapCoord = 0;

			/**
			 * The uv-transform matrix of diffuse map.
			 * This will also affect other maps that cannot be individually specified uv transform, such as normalMap, bumpMap, etc.
			 * @type {t3d.Matrix3}
			 * @default t3d.Matrix3()
			 */
			_this.diffuseMapTransform = new Matrix3();

			/**
			 * The alpha map.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.alphaMap = null;

			/**
			 * Define the UV chanel for the alpha map to use starting from 0 and defaulting to 0.
			 * @type {Number}
			 * @default 0
			 */
			_this.alphaMapCoord = 0;

			/**
			 * The uv-transform matrix of alpha map.
			 * @type {t3d.Matrix3}
			 * @default t3d.Matrix3()
			 */
			_this.alphaMapTransform = new Matrix3();

			/**
			 * Emissive (light) color of the material, essentially a solid color unaffected by other lighting.
			 * @type {t3d.Color3}
			 * @default t3d.Color3(0x000000)
			 */
			_this.emissive = new Color3(0x000000);

			/**
			 * Set emissive (glow) map.
			 * The emissive map color is modulated by the emissive color.
			 * If you have an emissive map, be sure to set the emissive color to something other than black.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.emissiveMap = null;

			/**
			 * Define the UV chanel for the emissive map to use starting from 0 and defaulting to 0.
			 * @type {Number}
			 * @default 0
			 */
			_this.emissiveMapCoord = 0;

			/**
			 * The uv-transform matrix of emissive map.
			 * @type {t3d.Matrix3}
			 * @default t3d.Matrix3()
			 */
			_this.emissiveMapTransform = new Matrix3();

			/**
			 * The red channel of this texture is used as the ambient occlusion map.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.aoMap = null;

			/**
			 * Intensity of the ambient occlusion effect.
			 * @type {Number}
			 * @default 1
			 */
			_this.aoMapIntensity = 1.0;

			/**
			 * Define the UV chanel for the ao map to use starting from 0 and defaulting to 0.
			 * @type {Number}
			 * @default 0
			 */
			_this.aoMapCoord = 0;

			/**
			 * The uv-transform matrix of ao map.
			 * @type {t3d.Matrix3}
			 * @default t3d.Matrix3()
			 */
			_this.aoMapTransform = new Matrix3();

			/**
			 * The normal map.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.normalMap = null;

			/**
			 * How much the normal map affects the material. Typical ranges are 0-1.
			 * @type {t3d.Vector2}
			 * @default t3d.Vector2(1,1)
			 */
			_this.normalScale = new Vector2(1, 1);

			/**
			 * The texture to create a bump map.
			 * The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.bumpMap = null;

			/**
			 * How much the bump map affects the material.
			 * Typical ranges are 0-1.
			 * @type {Number}
			 * @default 1
			 */
			_this.bumpScale = 1;

			/**
			 * The environment map.
			 * If set to undefined, then the material will not inherit envMap from scene.environment.
			 * @type {t3d.TextureCube|null|undefined}
			 * @default null
			 */
			_this.envMap = null;

			/**
			 * Scales the effect of the environment map by multiplying its color.
			 * @type {Number}
			 * @default 1
			 */
			_this.envMapIntensity = 1;

			/**
			 * How to combine the result of the surface's color with the environment map, if any.
			 * This has no effect in a {@link t3d.PBRMaterial}.
			 * @type {t3d.ENVMAP_COMBINE_TYPE}
			 * @default t3d.ENVMAP_COMBINE_TYPE.MULTIPLY
			 */
			_this.envMapCombine = ENVMAP_COMBINE_TYPE.MULTIPLY;

			/**
			 * Which depth function to use. See the {@link t3d.COMPARE_FUNC} constants for all possible values.
			 * @type {t3d.COMPARE_FUNC}
			 * @default t3d.COMPARE_FUNC.LEQUAL
			 */
			_this.depthFunc = COMPARE_FUNC.LEQUAL;

			/**
			 * Whether to have depth test enabled when rendering this material.
			 * @type {Boolean}
			 * @default true
			 */
			_this.depthTest = true;

			/**
			 * Whether rendering this material has any effect on the depth buffer.
			 * When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.
			 * @type {Boolean}
			 * @default true
			 */
			_this.depthWrite = true;

			/**
			 * Whether to render the material's color.
			 * This can be used in conjunction with a mesh's renderOrder property to create invisible objects that occlude other objects.
			 * @type {Boolean}
			 * @default true
			 */
			_this.colorWrite = true;

			/**
			 * Whether stencil operations are performed against the stencil buffer.
			 * In order to perform writes or comparisons against the stencil buffer this value must be true.
			 * @type {Boolean}
			 * @default false
			 */
			_this.stencilTest = false;

			/**
			 * The bit mask to use when writing to the stencil buffer.
			 * @type {Number}
			 * @default 0xFF
			 */
			_this.stencilWriteMask = 0xff;

			/**
			 * The stencil comparison function to use.
			 * See the {@link t3d.COMPARE_FUNC} constants for all possible values.
			 * @type {t3d.COMPARE_FUNC}
			 * @default t3d.COMPARE_FUNC.ALWAYS
			 */
			_this.stencilFunc = COMPARE_FUNC.ALWAYS;

			/**
			 * The value to use when performing stencil comparisons or stencil operations.
			 * @type {Number}
			 * @default 0
			 */
			_this.stencilRef = 0;

			/**
			 * The bit mask to use when comparing against the stencil buffer.
			 * @type {Number}
			 * @default 0xFF
			 */
			_this.stencilFuncMask = 0xff;

			/**
			 * Which stencil operation to perform when the comparison function returns false.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * @type {t3d.OPERATION}
			 * @default t3d.OPERATION.KEEP
			 */
			_this.stencilFail = OPERATION.KEEP;

			/**
			 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * @type {t3d.OPERATION}
			 * @default t3d.OPERATION.KEEP
			 */
			_this.stencilZFail = OPERATION.KEEP;

			/**
			 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * @type {t3d.OPERATION}
			 * @default t3d.OPERATION.KEEP
			 */
			_this.stencilZPass = OPERATION.KEEP;

			/**
			 * The stencil comparison function to use.
			 * See the {@link t3d.COMPARE_FUNC} constants for all possible values.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {t3d.COMPARE_FUNC|null}
			 * @default null
			 */
			_this.stencilFuncBack = null;

			/**
			 * The value to use when performing stencil comparisons or stencil operations.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {Number|null}
			 * @default null
			 */
			_this.stencilRefBack = null;

			/**
			 * The bit mask to use when comparing against the stencil buffer.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {Number|null}
			 * @default null
			 */
			_this.stencilFuncMaskBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns false.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {t3d.OPERATION|null}
			 * @default null
			 */
			_this.stencilFailBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {t3d.OPERATION|null}
			 * @default null
			 */
			_this.stencilZFailBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
			 * See the {@link t3d.OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {t3d.OPERATION|null}
			 * @default null
			 */
			_this.stencilZPassBack = null;

			/**
			 * User-defined clipping planes specified as t3d.Plane objects in world space.
			 * These planes apply to the objects this material is attached to.
			 * Points in space whose signed distance to the plane is negative are clipped (not rendered).
			 * @type {t3d.Plane[]}
			 * @default null
			 */
			_this.clippingPlanes = null;

			/**
			 * Sets the alpha value to be used when running an alpha test.
			 * The material will not be renderered if the opacity is lower than this value.
			 * @type {Number}
			 * @default 0
			 */
			_this.alphaTest = 0;

			/**
			 * Enables alpha to coverage.
			 * Can only be used when MSAA is enabled.
			 * @type {Boolean}
			 * @default false
			 */
			_this.alphaToCoverage = false;

			/**
			 * Defines which side of faces will be rendered - front, back or double.
			 * @type {t3d.DRAW_SIDE}
			 * @default t3d.DRAW_SIDE.FRONT
			 */
			_this.side = DRAW_SIDE.FRONT;

			/**
			 * Whether to use polygon offset.
			 * This corresponds to the GL_POLYGON_OFFSET_FILL WebGL feature.
			 * @type {Boolean}
			 * @default false
			 */
			_this.polygonOffset = false;

			/**
			 * Sets the polygon offset factor.
			 * @type {Number}
			 * @default 0
			 */
			_this.polygonOffsetFactor = 0;

			/**
			 * Sets the polygon offset units.
			 * @type {Number}
			 * @default 0
			 */
			_this.polygonOffsetUnits = 0;

			/**
			 * Define whether the material is rendered with flat shading or smooth shading.
			 * @type {t3d.SHADING_TYPE}
			 * @default t3d.SHADING_TYPE.SMOOTH_SHADING
			 */
			_this.shading = SHADING_TYPE.SMOOTH_SHADING;

			/**
			 * Whether to apply dithering to the color to remove the appearance of banding.
			 * @type {Boolean}
			 * @default false
			 */
			_this.dithering = false;

			/**
			 * Whether the material is affected by lights.
			 * If set true, renderer will try to upload light uniforms.
			 * @type {Boolean}
			 * @default false
			 */
			_this.acceptLight = false;

			/**
			 * Whether the material is affected by fog.
			 * @type {Boolean}
			 * @default true
			 */
			_this.fog = true;

			/**
			 * Determines how the mesh triangles are constructed from the vertices.
			 * @type {t3d.DRAW_MODE}
			 * @default t3d.DRAW_MODE.TRIANGLES
			 */
			_this.drawMode = DRAW_MODE.TRIANGLES;

			/**
			 * Specifies that the material needs to be recompiled.
			 * This property is automatically set to true when instancing a new material.
			 * @type {Boolean}
			 * @default true
			 */
			_this.needsUpdate = true;
			return _this;
		}

		/**
		 * Copy the parameters from the passed material into this material.
		 * @param {t3d.Material} source - The material to be copied.
		 * @return {t3d.Material}
		 */
		var _proto = Material.prototype;
		_proto.copy = function copy(source) {
			this.shaderName = source.shaderName;
			this.defines = Object.assign({}, source.defines);
			this.uniforms = cloneUniforms(source.uniforms);
			this.vertexShader = source.vertexShader;
			this.fragmentShader = source.fragmentShader;
			this.precision = source.precision;
			this.transparent = source.transparent;
			this.blending = source.blending;
			this.blendSrc = source.blendSrc;
			this.blendDst = source.blendDst;
			this.blendEquation = source.blendEquation;
			this.blendSrcAlpha = source.blendSrcAlpha;
			this.blendDstAlpha = source.blendDstAlpha;
			this.blendEquationAlpha = source.blendEquationAlpha;
			this.premultipliedAlpha = source.premultipliedAlpha;
			this.vertexColors = source.vertexColors;
			this.vertexTangents = source.vertexTangents;
			this.opacity = source.opacity;
			this.diffuse.copy(source.diffuse);
			this.diffuseMap = source.diffuseMap;
			this.diffuseMapCoord = source.diffuseMapCoord;
			this.diffuseMapTransform.copy(source.diffuseMapTransform);
			this.alphaMap = source.alphaMap;
			this.alphaMapCoord = source.alphaMapCoord;
			this.alphaMapTransform.copy(source.alphaMapTransform);
			this.emissive.copy(source.emissive);
			this.emissiveMap = source.emissiveMap;
			this.emissiveMapCoord = source.emissiveMapCoord;
			this.emissiveMapTransform.copy(source.emissiveMapTransform);
			this.aoMap = source.aoMap;
			this.aoMapIntensity = source.aoMapIntensity;
			this.aoMapCoord = source.aoMapCoord;
			this.aoMapTransform.copy(source.aoMapTransform);
			this.normalMap = source.normalMap;
			this.normalScale.copy(source.normalScale);
			this.bumpMap = source.bumpMap;
			this.bumpScale = source.bumpScale;
			this.envMap = source.envMap;
			this.envMapIntensity = source.envMapIntensity;
			this.envMapCombine = source.envMapCombine;
			this.depthFunc = source.depthFunc;
			this.depthTest = source.depthTest;
			this.depthWrite = source.depthWrite;
			this.colorWrite = source.colorWrite;
			this.stencilTest = source.stencilTest;
			this.stencilWriteMask = source.stencilWriteMask;
			this.stencilFunc = source.stencilFunc;
			this.stencilRef = source.stencilRef;
			this.stencilFuncMask = source.stencilFuncMask;
			this.stencilFail = source.stencilFail;
			this.stencilZFail = source.stencilZFail;
			this.stencilZPass = source.stencilZPass;
			this.stencilFuncBack = source.stencilFuncBack;
			this.stencilRefBack = source.stencilRefBack;
			this.stencilFuncMaskBack = source.stencilFuncMaskBack;
			this.stencilFailBack = source.stencilFailBack;
			this.stencilZFailBack = source.stencilZFailBack;
			this.stencilZPassBack = source.stencilZPassBack;
			this.clippingPlanes = source.clippingPlanes;
			this.alphaTest = source.alphaTest;
			this.alphaToCoverage = source.alphaToCoverage;
			this.side = source.side;
			this.polygonOffset = source.polygonOffset;
			this.polygonOffsetFactor = source.polygonOffsetFactor;
			this.polygonOffsetUnits = source.polygonOffsetUnits;
			this.shading = source.shading;
			this.dithering = source.dithering;
			this.acceptLight = source.acceptLight;
			this.fog = source.fog;
			this.drawMode = source.drawMode;
			return this;
		}

		/**
		 * Return a new material with the same parameters as this material.
		 * @return {t3d.Material}
		 */;
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * This disposes the material.
		 * Textures of a material don't get disposed. These needs to be disposed by Texture.
		 */;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		};
		return Material;
	}(EventDispatcher);

	/**
	 * A material rendered with custom shaders.
	 * A shader is a small program written in GLSL that runs on the GPU.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var ShaderMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(ShaderMaterial, _Material);
		/**
		 * @param {Object} shader - Shader object for the shader material.
		 * @param {String} shader.name - Name of the shader.
		 * @param {Object} shader.defines - Defines of the shader.
		 * @param {Object} shader.uniforms - Uniforms of the shader.
		 * @param {String} shader.vertexShader - Vertex shader GLSL code.
		 * @param {String} shader.fragmentShader - Fragment shader GLSL code.
		 */
		function ShaderMaterial(shader) {
			var _this;
			_this = _Material.call(this) || this;

			// Set values
			if (shader) {
				_this.shaderName = shader.name;
				Object.assign(_this.defines, shader.defines);
				_this.uniforms = cloneUniforms(shader.uniforms);
				_this.vertexShader = shader.vertexShader;
				_this.fragmentShader = shader.fragmentShader;
			}
			return _this;
		}
		return ShaderMaterial;
	}(Material);

	/**
	 * Shader post pass.
	 * @memberof t3d
	 */
	var ShaderPostPass = /*#__PURE__*/function () {
		/**
		 * @param {Object} shader - Shader object for the shader material.
		 * @param {String} shader.name - Name of the shader.
		 * @param {Object} shader.defines - Defines of the shader.
		 * @param {Object} shader.uniforms - Uniforms of the shader.
		 * @param {String} shader.vertexShader - Vertex shader GLSL code.
		 * @param {String} shader.fragmentShader - Fragment shader GLSL code.
		 */
		function ShaderPostPass(shader) {
			var scene = new Scene();
			var camera = this.camera = new Camera();
			camera.frustumCulled = false;
			camera.position.set(0, 1, 0);
			camera.lookAt(new Vector3(0, 0, 0), new Vector3(0, 0, -1));
			camera.setOrtho(-1, 1, -1, 1, 0.1, 2);
			scene.add(camera);
			var geometry = this.geometry = new PlaneGeometry(2, 2, 1, 1);
			var material = this.material = new ShaderMaterial(shader);
			this.uniforms = material.uniforms;
			var plane = new Mesh(geometry, material);
			plane.frustumCulled = false;
			scene.add(plane);

			// static scene

			scene.updateMatrix();
			this.renderStates = scene.updateRenderStates(camera);
			var renderQueue = scene.updateRenderQueue(camera, false, false);
			this.renderQueueLayer = renderQueue.layerList[0];
			this.renderConfig = {};
		}

		/**
		 * Render the post pass.
		 * @param {t3d.Renderer} renderer
		 */
		var _proto = ShaderPostPass.prototype;
		_proto.render = function render(renderer) {
			renderer.renderRenderableList(this.renderQueueLayer.opaque, this.renderStates, this.renderConfig);
		}

		/**
		 * Dispose the post pass.
		 */;
		_proto.dispose = function dispose() {
			this.geometry.dispose();
			this.material.dispose();
		};
		return ShaderPostPass;
	}();

	/**
	 * A material for drawing geometry by depth.
	 * Depth is based off of the camera near and far plane. White is nearest, black is farthest.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var DepthMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(DepthMaterial, _Material);
		/**
		 * Create a DepthMaterial.
		 */
		function DepthMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.DEPTH;

			/**
			 * Encoding for depth packing.
			 * @type {Boolean}
			 * @default false
			 */
			_this.packToRGBA = false;
			return _this;
		}
		return DepthMaterial;
	}(Material);

	/**
	 * A material for drawing geometry by distance.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var DistanceMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(DistanceMaterial, _Material);
		/**
		 * Create a DistanceMaterial.
		 */
		function DistanceMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.DISTANCE;
			return _this;
		}
		return DistanceMaterial;
	}(Material);

	/**
	 * Shadow map pass.
	 * @memberof t3d
	 */
	var ShadowMapPass = /*#__PURE__*/function () {
		function ShadowMapPass() {
			/**
			 * Get depth material function.
			 * Override this to use custom depth material.
			 * @type {Function}
			 */
			this.getDepthMaterial = _getDepthMaterial;

			/**
			 * Get distance material function.
			 * Override this to use custom distance material.
			 * @type {Function}
			 */
			this.getDistanceMaterial = _getDistanceMaterial;

			/**
			 * Define which render layers will produce shadows.
			 * If the value is Null, it means that all render layers will produce shadows.
			 * @type {Null|Array}
			 * @default null
			 */
			this.shadowLayers = null;

			/**
			 * Whether transparent objects can cast shadows.
			 * @type {Boolean}
			 * @default false
			 */
			this.transparentShadow = false;
			var state = {
				isPointLight: false,
				light: null
			};
			this._state = state;
			var that = this;
			this._renderOptions = {
				getGeometry: null,
				getMaterial: function getMaterial(renderable) {
					return state.isPointLight ? that.getDistanceMaterial(renderable, state.light) : that.getDepthMaterial(renderable, state.light);
				},
				ifRender: function ifRender(renderable) {
					return renderable.object.castShadow;
				}
			};
		}

		/**
		 * Get geometry function for shadow render options.
		 * @type {Null|Function}
		 */
		var _proto = ShadowMapPass.prototype;
		/**
		 * Render shadow map.
		 * @param {t3d.Renderer} renderer
		 * @param {t3d.Scene} scene
		 */
		_proto.render = function render(renderer, scene) {
			var renderPass = renderer.renderPass;
			oldClearColor.copy(renderPass.getClearColor());
			renderPass.setClearColor(1, 1, 1, 1);
			var lights = scene._lightData.lights;
			var shadowsNum = scene._lightData.shadowsNum;
			for (var i = 0; i < shadowsNum; i++) {
				var light = lights[i];
				var shadow = light.shadow;
				if (shadow.autoUpdate === false && shadow.needsUpdate === false) continue;
				var camera = shadow.camera;
				var shadowTarget = shadow.renderTarget;
				var isPointLight = light.isPointLight;
				var faces = isPointLight ? 6 : 1;
				this._state.isPointLight = isPointLight;
				this._state.light = light;
				var renderOptions = this._renderOptions;
				shadow.prepareDepthMap(!scene.disableShadowSampler, renderPass.capabilities);
				for (var j = 0; j < faces; j++) {
					if (isPointLight) {
						shadow.update(light, j);
						shadowTarget.activeCubeFace = j;
					}
					renderPass.setRenderTarget(shadowTarget);
					renderPass.clear(true, true);
					var renderStates = scene.updateRenderStates(camera, j === 0);
					var renderQueue = scene.updateRenderQueue(camera, false, false);
					for (var k = 0; k < renderQueue.layerList.length; k++) {
						var renderQueueLayer = renderQueue.layerList[k];
						if (this.shadowLayers !== null && this.shadowLayers.indexOf(renderQueueLayer.id) === -1) continue;
						renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderOptions);
						if (this.transparentShadow) {
							renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
						}
					}
				}

				// set generateMipmaps false
				// renderPass.updateRenderTargetMipmap(shadowTarget);

				shadow.needsUpdate = false;
			}
			renderPass.setClearColor(oldClearColor.x, oldClearColor.y, oldClearColor.z, oldClearColor.w);
		};
		_createClass(ShadowMapPass, [{
			key: "getGeometry",
			get: function get() {
				return this._renderOptions.getGeometry;
			}

			/**
			 * The if render function for shadow render options.
			 * @type {Function}
			 */,
			set: function set(func) {
				if (!!func) {
					this._renderOptions.getGeometry = func;
				} else {
					delete this._renderOptions.getGeometry;
				}
			}
		}, {
			key: "ifRender",
			get: function get() {
				return this._renderOptions.ifRender;
			},
			set: function set(func) {
				if (!!func) {
					this._renderOptions.ifRender = func;
				} else {
					delete this._renderOptions.ifRender;
				}
			}
		}]);
		return ShadowMapPass;
	}();
	var oldClearColor = new Vector4();
	var shadowSide = {
		"front": DRAW_SIDE.BACK,
		"back": DRAW_SIDE.FRONT,
		"double": DRAW_SIDE.DOUBLE
	};
	var depthMaterials = {};
	var distanceMaterials = {};
	function _getDepthMaterial(renderable, light) {
		var useSkinning = !!renderable.object.skeleton;
		var useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;
		var clippingPlanes = renderable.material.clippingPlanes;
		var numClippingPlanes = clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes.length : 0;
		var index = useMorphing << 0 | useSkinning << 1;
		var materials = depthMaterials[index];
		if (materials === undefined) {
			materials = {};
			depthMaterials[index] = materials;
		}
		var material = materials[numClippingPlanes];
		if (material === undefined) {
			material = new DepthMaterial();
			material.packToRGBA = true;
			materials[numClippingPlanes] = material;
		}
		material.side = shadowSide[renderable.material.side];
		material.clippingPlanes = renderable.material.clippingPlanes;
		material.drawMode = renderable.material.drawMode;
		return material;
	}
	function _getDistanceMaterial(renderable, light) {
		var useSkinning = !!renderable.object.skeleton;
		var useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;
		var clippingPlanes = renderable.material.clippingPlanes;
		var numClippingPlanes = clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes.length : 0;
		var index = useMorphing << 0 | useSkinning << 1;
		var materials = distanceMaterials[index];
		if (materials === undefined) {
			materials = {};
			distanceMaterials[index] = materials;
		}
		var material = materials[numClippingPlanes];
		if (material === undefined) {
			material = new DistanceMaterial();
			materials[numClippingPlanes] = material;
		}
		material.side = shadowSide[renderable.material.side];
		material.uniforms["nearDistance"] = light.shadow.cameraNear;
		material.uniforms["farDistance"] = light.shadow.cameraFar;
		material.clippingPlanes = renderable.material.clippingPlanes;
		material.drawMode = renderable.material.drawMode;
		return material;
	}

	var _textureId = 0;

	/**
	 * Create a texture to apply to a surface or as a reflection or refraction map.
	 * @memberof t3d
	 * @abstract
	 * @extends t3d.EventDispatcher
	 */
	var TextureBase = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(TextureBase, _EventDispatcher);
		function TextureBase() {
			var _this;
			_this = _EventDispatcher.call(this) || this;

			/**
			 * Unique number for this texture instance.
			 * @readonly
			 * @type {Number}
			 */
			_this.id = _textureId++;

			/**
			 * Array of user-specified mipmaps (optional).
			 * @type {HTMLImageElement[]|Object[]}
			 * @default []
			 */
			_this.mipmaps = [];

			/**
			 * WebGLTexture border.
			 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D WebGLTexture texImage2D()}.
			 * Must be zero.
			 * @type {Number}
			 */
			_this.border = 0;

			/**
			 * WebGLTexture texel data format.
			 * @type {t3d.PIXEL_FORMAT}
			 * @default t3d.PIXEL_FORMAT.RGBA
			 */
			_this.format = PIXEL_FORMAT.RGBA;

			/**
			 * The default value is null, the texture's internal format will be obtained using a combination of .format and .type.
			 * Users can also specify a specific internalFormat.
			 * @type {Null|t3d.PIXEL_FORMAT}
			 * @default null
			 */
			_this.internalformat = null;

			/**
			 * WebGLTexture texel data type.
			 * @type {t3d.PIXEL_TYPE}
			 * @default t3d.PIXEL_TYPE.UNSIGNED_BYTE
			 */
			_this.type = PIXEL_TYPE.UNSIGNED_BYTE;

			/**
			 * How the texture is sampled when a texel covers more than one pixel.
			 * @type {t3d.TEXTURE_FILTER}
			 * @default t3d.TEXTURE_FILTER.LINEAR
			 */
			_this.magFilter = TEXTURE_FILTER.LINEAR;

			/**
			 * How the texture is sampled when a texel covers less than one pixel.
			 * @type {t3d.TEXTURE_FILTER}
			 * @default t3d.TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR
			 */
			_this.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;

			/**
			 * This defines how the texture is wrapped horizontally and corresponds to U in UV mapping.
			 * @type {t3d.TEXTURE_WRAP}
			 * @default t3d.TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			_this.wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * This defines how the texture is wrapped vertically and corresponds to V in UV mapping.
			 * @type {t3d.TEXTURE_WRAP}
			 * @default t3d.TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			_this.wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * The number of samples taken along the axis through the pixel that has the highest density of texels.
			 * A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used.
			 * Use {@link WebGLcapabilities#maxAnisotropy} to find the maximum valid anisotropy value for the GPU; this value is usually a power of 2.
			 * @type {Number}
			 * @default 1
			 */
			_this.anisotropy = 1;

			/**
			 * Use for shadow sampler (WebGL 2.0 Only).
			 * @type {t3d.COMPARE_FUNC|Undefined}
			 * @default undefined
			 */
			_this.compare = undefined;

			/**
			 * Whether to generate mipmaps (if possible) for a texture.
			 * Set this to false if you are creating mipmaps manually.
			 * @type {Boolean}
			 * @default true
			 */
			_this.generateMipmaps = true;

			/**
			 * texture pixel encoding.
			 * @type {t3d.TEXEL_ENCODING_TYPE}
			 * @default t3d.TEXEL_ENCODING_TYPE.LINEAR
			 */
			_this.encoding = TEXEL_ENCODING_TYPE.LINEAR;

			/**
			 * If set to true, the texture is flipped along the vertical axis when uploaded to the GPU.
			 * Default is true to flips the image's Y axis to match the WebGL texture coordinate space.
			 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
			 * @type {Boolean}
			 * @default true
			 */
			_this.flipY = true;

			/**
			 * If set to true, the alpha channel, if present, is multiplied into the color channels when the texture is uploaded to the GPU.
			 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
			 * @type {Boolean}
			 * @default false
			 */
			_this.premultiplyAlpha = false;

			/**
			 * Specifies the alignment requirements for the start of each pixel row in memory.
			 * The allowable values are 1 (byte-alignment), 2 (rows aligned to even-numbered bytes), 4 (word-alignment), and 8 (rows start on double-word boundaries).
			 * @type {Number}
			 * @default 4
			 */
			_this.unpackAlignment = 4;

			/**
			 * version code increse if texture changed.
			 * if version is still 0, this texture will be skiped.
			 * @type {Number}
			 * @default 0
			 */
			_this.version = 0;
			return _this;
		}

		/**
		 * Returns a clone of this texture.
		 * @return {t3d.TextureBase}
		 */
		var _proto = TextureBase.prototype;
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copy the given texture into this texture.
		 * @param {t3d.TextureBase} source - The texture to be copied.
		 * @return {t3d.TextureBase}
		 */;
		_proto.copy = function copy(source) {
			this.mipmaps = source.mipmaps.slice(0);
			this.border = source.border;
			this.format = source.format;
			this.internalformat = source.internalformat;
			this.type = source.type;
			this.magFilter = source.magFilter;
			this.minFilter = source.minFilter;
			this.wrapS = source.wrapS;
			this.wrapT = source.wrapT;
			this.anisotropy = source.anisotropy;
			this.compare = source.compare;
			this.generateMipmaps = source.generateMipmaps;
			this.encoding = source.encoding;
			this.flipY = source.flipY;
			this.premultiplyAlpha = source.premultiplyAlpha;
			this.unpackAlignment = source.unpackAlignment;
			this.version = source.version;
			return this;
		}

		/**
		 * Dispatches a dispose event.
		 */;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
			this.version = 0;
		};
		return TextureBase;
	}(EventDispatcher);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	TextureBase.prototype.isTexture = true;

	/**
	 * Creates a 2d texture.
	 * @memberof t3d
	 * @extends t3d.TextureBase
	 */
	var Texture2D = /*#__PURE__*/function (_TextureBase) {
		_inheritsLoose(Texture2D, _TextureBase);
		function Texture2D() {
			var _this;
			_this = _TextureBase.call(this) || this;

			/**
			 * Image data for this texture.
			 * @type {null|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap|Object}
			 * @default null
			 */
			_this.image = null;
			return _this;
		}

		/**
		 * Copy the given 2d texture into this texture.
		 * @param {t3d.Texture2D} source - The 2d texture to be copied.
		 * @return {t3d.Texture2D}
		 */
		var _proto = Texture2D.prototype;
		_proto.copy = function copy(source) {
			_TextureBase.prototype.copy.call(this, source);
			this.image = source.image;
			return this;
		};
		return Texture2D;
	}(TextureBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Texture2D.prototype.isTexture2D = true;

	/**
	 * Creates a cube texture.
	 * @memberof t3d
	 * @extends t3d.TextureBase
	 */
	var TextureCube = /*#__PURE__*/function (_TextureBase) {
		_inheritsLoose(TextureCube, _TextureBase);
		function TextureCube() {
			var _this;
			_this = _TextureBase.call(this) || this;

			/**
			 * Images data for this texture.
			 * @type {HTMLImageElement[]}
			 * @default []
			 */
			_this.images = [];

			/**
			 * @default false
			 */
			_this.flipY = false;
			return _this;
		}

		/**
		 * Copy the given cube texture into this texture.
		 * @param {t3d.TextureCube} source - The cube texture to be copied.
		 * @return {t3d.TextureCube}
		 */
		var _proto = TextureCube.prototype;
		_proto.copy = function copy(source) {
			_TextureBase.prototype.copy.call(this, source);
			this.images = source.images.slice(0);
			return this;
		};
		return TextureCube;
	}(TextureBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	TextureCube.prototype.isTextureCube = true;

	/**
	 * Creates a 3D texture. (WebGL 2.0)
	 * @memberof t3d
	 * @extends t3d.TextureBase
	 */
	var Texture3D = /*#__PURE__*/function (_TextureBase) {
		_inheritsLoose(Texture3D, _TextureBase);
		function Texture3D() {
			var _this;
			_this = _TextureBase.call(this) || this;

			/**
						 * Image data for this texture.
						 * @type {Object}
						 */
			_this.image = {
				data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
				width: 2,
				height: 2,
				depth: 2
			};

			/**
			 * This defines how the texture is wrapped in the depth direction.
			 * @type {t3d.TEXTURE_WRAP}
			 * @default t3d.TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			_this.wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * @default t3d.PIXEL_FORMAT.RED
			 */
			_this.format = PIXEL_FORMAT.RED;

			/**
			 * @default t3d.PIXEL_TYPE.UNSIGNED_BYTE
			 */
			_this.type = PIXEL_TYPE.UNSIGNED_BYTE;

			/**
			 * @default t3d.TEXTURE_FILTER.NEAREST
			 */
			_this.magFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default t3d.TEXTURE_FILTER.NEAREST
			 */
			_this.minFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default false
			 */
			_this.generateMipmaps = false;

			/**
			 * @default false
			 */
			_this.flipY = false;

			/**
			 * @default 1
			 */
			_this.unpackAlignment = 1;
			return _this;
		}

		/**
		 * Copy the given 3d texture into this texture.
		 * @param {t3d.Texture3D} source - The 3d texture to be copied.
		 * @return {t3d.Texture3D}
		 */
		var _proto = Texture3D.prototype;
		_proto.copy = function copy(source) {
			_TextureBase.prototype.copy.call(this, source);
			this.image = source.image;
			return this;
		};
		return Texture3D;
	}(TextureBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Texture3D.prototype.isTexture3D = true;

	// Build-in uniforms

	var internalUniforms = {
		'u_Model': [1, null],
		'u_Projection': [2, function (cameraData) {
			this.set(cameraData.projectionMatrix.elements);
		}],
		'u_View': [2, function (cameraData) {
			this.set(cameraData.viewMatrix.elements);
		}],
		'u_ProjectionView': [2, function (cameraData) {
			this.set(cameraData.projectionViewMatrix.elements);
		}],
		'u_CameraPosition': [2, function (cameraData) {
			this.setValue(cameraData.position.x, cameraData.position.y, cameraData.position.z);
		}],
		'logDepthBufFC': [2, function (cameraData) {
			this.set(cameraData.logDepthBufFC);
		}],
		'logDepthCameraNear': [2, function (cameraData) {
			this.set(cameraData.logDepthCameraNear);
		}],
		'u_EnvMapLight_Intensity': [3, function (sceneData) {
			this.set(sceneData.environmentLightIntensity);
		}],
		'u_FogColor': [3, function (sceneData) {
			var color = sceneData.fog.color;
			this.setValue(color.r, color.g, color.b);
		}],
		'u_FogDensity': [3, function (sceneData) {
			this.set(sceneData.fog.density);
		}],
		'u_FogNear': [3, function (sceneData) {
			this.set(sceneData.fog.near);
		}],
		'u_FogFar': [3, function (sceneData) {
			this.set(sceneData.fog.far);
		}],
		'u_Color': [4, function (material, textures) {
			var color = material.diffuse;
			this.setValue(color.r, color.g, color.b);
		}],
		'u_Opacity': [4, function (material, textures) {
			this.set(material.opacity);
		}],
		'diffuseMap': [4, function (material, textures) {
			this.set(material.diffuseMap, textures);
		}],
		'alphaMap': [4, function (material, textures) {
			this.set(material.alphaMap, textures);
		}],
		'alphaMapUVTransform': [4, function (material, textures) {
			this.set(material.alphaMapTransform.elements);
		}],
		'normalMap': [4, function (material, textures) {
			this.set(material.normalMap, textures);
		}],
		'normalScale': [4, function (material, textures) {
			this.setValue(material.normalScale.x, material.normalScale.y);
		}],
		'bumpMap': [4, function (material, textures) {
			this.set(material.bumpMap, textures);
		}],
		'bumpScale': [4, function (material, textures) {
			this.set(material.bumpScale);
		}],
		'cubeMap': [4, function (material, textures) {
			this.set(material.cubeMap, textures);
		}],
		'u_EnvMap_Intensity': [4, function (material, textures) {
			this.set(material.envMapIntensity);
		}],
		'u_Specular': [4, function (material, textures) {
			this.set(material.shininess);
		}],
		'u_SpecularColor': [4, function (material, textures) {
			var color = material.specular;
			this.setValue(color.r, color.g, color.b);
		}],
		'specularMap': [4, function (material, textures) {
			this.set(material.specularMap, textures);
		}],
		'aoMap': [4, function (material, textures) {
			this.set(material.aoMap, textures);
		}],
		'aoMapIntensity': [4, function (material, textures) {
			this.set(material.aoMapIntensity);
		}],
		'aoMapUVTransform': [4, function (material, textures) {
			this.set(material.aoMapTransform.elements);
		}],
		'u_Roughness': [4, function (material, textures) {
			this.set(material.roughness);
		}],
		'roughnessMap': [4, function (material, textures) {
			this.set(material.roughnessMap, textures);
		}],
		'u_Metalness': [4, function (material, textures) {
			this.set(material.metalness);
		}],
		'metalnessMap': [4, function (material, textures) {
			this.set(material.metalnessMap, textures);
		}],
		'u_Clearcoat': [4, function (material, textures) {
			this.set(material.clearcoat);
		}],
		'u_ClearcoatRoughness': [4, function (material, textures) {
			this.set(material.clearcoatRoughness);
		}],
		'clearcoatMap': [4, function (material, textures) {
			this.set(material.clearcoatMap, textures);
		}],
		'clearcoatRoughnessMap': [4, function (material, textures) {
			this.set(material.clearcoatRoughnessMap, textures);
		}],
		'clearcoatNormalMap': [4, function (material, textures) {
			this.set(material.clearcoatNormalMap, textures);
		}],
		'clearcoatNormalScale': [4, function (material, textures) {
			this.setValue(material.clearcoatNormalScale.x, material.clearcoatNormalScale.y);
		}],
		'glossiness': [4, function (material, textures) {
			this.set(material.glossiness);
		}],
		'glossinessMap': [4, function (material, textures) {
			this.set(material.glossinessMap, textures);
		}],
		'emissive': [4, function (material, textures) {
			var color = material.emissive;
			this.setValue(color.r, color.g, color.b);
		}],
		'emissiveMap': [4, function (material, textures) {
			this.set(material.emissiveMap, textures);
		}],
		'emissiveMapUVTransform': [4, function (material, textures) {
			this.set(material.emissiveMapTransform.elements);
		}],
		'matcap': [4, function (material, textures) {
			this.set(material.matcap, textures);
		}],
		'uvTransform': [4, function (material, textures) {
			this.set(material.diffuseMapTransform.elements);
		}],
		'u_PointSize': [4, function (material, textures) {
			this.set(material.size);
		}],
		'u_PointScale': [5, null],
		'maxMipLevel': [5, function (envMap, textures) {
			this.set(textures.get(envMap).__maxMipLevel || 8);
		}],
		// TODO replace 8 with real mip level
		'envMap': [5, function (envMap, textures) {
			this.set(envMap, textures);
		}],
		'u_EnvMap_Flip': [5, function (envMap, textures) {
			this.set(envMap.images[0] && envMap.images[0].rtt ? 1 : -1);
		}]
	};

	// Empty textures

	var emptyTexture = new Texture2D();
	emptyTexture.image = {
		data: new Uint8Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]),
		width: 2,
		height: 2
	};
	emptyTexture.magFilter = TEXTURE_FILTER.NEAREST;
	emptyTexture.minFilter = TEXTURE_FILTER.NEAREST;
	emptyTexture.generateMipmaps = false;
	emptyTexture.version++;
	var emptyShadowTexture = new Texture2D();
	emptyShadowTexture.image = {
		data: null,
		width: 2,
		height: 2
	};
	emptyShadowTexture.version++;
	emptyShadowTexture.type = PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV;
	emptyShadowTexture.format = PIXEL_FORMAT.DEPTH_STENCIL;
	emptyShadowTexture.magFilter = TEXTURE_FILTER.NEAREST;
	emptyShadowTexture.minFilter = TEXTURE_FILTER.NEAREST;
	emptyShadowTexture.compare = COMPARE_FUNC.LESS;
	emptyShadowTexture.generateMipmaps = false;
	emptyShadowTexture.version++;
	var emptyTexture3d = new Texture3D();
	var emptyCubeTexture = new TextureCube();

	// Array helpers

	function arraysEqual(a, b) {
		if (a.length !== b.length) return false;
		for (var i = 0, l = a.length; i < l; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
	function copyArray(a, b) {
		for (var i = 0, l = b.length; i < l; i++) {
			a[i] = b[i];
		}
	}

	// Texture unit allocation

	var arrayCacheI32 = [];
	function allocTexUnits(textures, n) {
		var r = arrayCacheI32[n];
		if (r === undefined) {
			r = new Int32Array(n);
			arrayCacheI32[n] = r;
		}
		for (var i = 0; i !== n; ++i) {
			r[i] = textures.allocTexUnit();
		}
		return r;
	}

	// Helper to pick the right setter for uniform

	function generateSetter(uniform, pureArray) {
		var gl = uniform.gl;
		var type = uniform.type;
		var location = uniform.location;
		var cache = uniform.cache;
		switch (type) {
			case gl.FLOAT:
				uniform.setValue = function (value) {
					if (cache[0] === value) return;
					gl.uniform1f(location, value);
					cache[0] = value;
				};
				if (pureArray) {
					uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniform1fv(location, value);
						copyArray(cache, value);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_2D:
			case gl.SAMPLER_2D_SHADOW:
				uniform.setValue = function (value, textures) {
					var unit = textures.allocTexUnit();
					textures.setTexture2D(value || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						var n = value.length;
						var units = allocTexUnits(textures, n);
						for (var i = 0; i !== n; ++i) {
							textures.setTexture2D(value[i] || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_CUBE:
			case gl.SAMPLER_CUBE_SHADOW:
				uniform.setValue = function (value, textures) {
					var unit = textures.allocTexUnit();
					textures.setTextureCube(value || emptyCubeTexture, unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						var n = value.length;
						var units = allocTexUnits(textures, n);
						for (var i = 0; i !== n; ++i) {
							textures.setTextureCube(value[i] || emptyCubeTexture, units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_3D:
				uniform.setValue = function (value, textures) {
					var unit = textures.allocTexUnit();
					textures.setTexture3D(value || emptyTexture3d, unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						var n = value.length;
						var units = allocTexUnits(textures, n);
						for (var i = 0; i !== n; ++i) {
							textures.setTexture3D(value[i] || emptyTexture3d, units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.BOOL:
			case gl.INT:
				uniform.setValue = function (value) {
					if (cache[0] === value) return;
					gl.uniform1i(location, value);
					cache[0] = value;
				};
				if (pureArray) {
					uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniform1iv(location, value);
						copyArray(cache, value);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.FLOAT_VEC2:
				uniform.setValue = function (p1, p2) {
					if (cache[0] !== p1 || cache[1] !== p2) {
						gl.uniform2f(location, p1, p2);
						cache[0] = p1;
						cache[1] = p2;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform2fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC2:
			case gl.INT_VEC2:
				uniform.setValue = function (p1, p2) {
					if (cache[0] !== p1 || cache[1] !== p2) {
						gl.uniform2i(location, p1, p2);
						cache[0] = p1;
						cache[1] = p2;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform2iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_VEC3:
				uniform.setValue = function (p1, p2, p3) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
						gl.uniform3f(location, p1, p2, p3);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform3fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC3:
			case gl.INT_VEC3:
				uniform.setValue = function (p1, p2, p3) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
						gl.uniform3i(location, p1, p2, p3);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform3iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_VEC4:
				uniform.setValue = function (p1, p2, p3, p4) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
						gl.uniform4f(location, p1, p2, p3, p4);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
						cache[3] = p4;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform4fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC4:
			case gl.INT_VEC4:
				uniform.setValue = function (p1, p2, p3, p4) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
						gl.uniform4i(location, p1, p2, p3, p4);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
						cache[3] = p4;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform4iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_MAT2:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix2fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3]) {
							gl.uniformMatrix2fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
						}
					};
				}
				break;
			case gl.FLOAT_MAT3:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix3fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3] || cache[4] !== value[4] || cache[5] !== value[5] || cache[6] !== value[6] || cache[7] !== value[7] || cache[8] !== value[8]) {
							gl.uniformMatrix3fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
							cache[4] = value[4];
							cache[5] = value[5];
							cache[6] = value[6];
							cache[7] = value[7];
							cache[8] = value[8];
						}
					};
				}
				break;
			case gl.FLOAT_MAT4:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix4fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3] || cache[4] !== value[4] || cache[5] !== value[5] || cache[6] !== value[6] || cache[7] !== value[7] || cache[8] !== value[8] || cache[9] !== value[9] || cache[10] !== value[10] || cache[11] !== value[11] || cache[12] !== value[12] || cache[13] !== value[13] || cache[14] !== value[14] || cache[15] !== value[15]) {
							gl.uniformMatrix4fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
							cache[4] = value[4];
							cache[5] = value[5];
							cache[6] = value[6];
							cache[7] = value[7];
							cache[8] = value[8];
							cache[9] = value[9];
							cache[10] = value[10];
							cache[11] = value[11];
							cache[12] = value[12];
							cache[13] = value[13];
							cache[14] = value[14];
							cache[15] = value[15];
						}
					};
				}
				break;
		}
	}

	// --- Uniform Classes ---
	var SingleUniform = function SingleUniform(gl, id, activeInfo, location) {
		this.gl = gl;
		this.id = id;
		this.type = activeInfo.type;

		// this.size = activeInfo.size; // always be 1

		this.location = location;
		this.setValue = undefined;
		this.set = undefined;
		this.cache = [];
		generateSetter(this);

		// internal

		this.internalGroup = 0;
		this.internalFun = null;
		var internal = internalUniforms[id];
		if (internal) {
			this.internalGroup = internal[0];
			this.internalFun = internal[1];
		}
	};
	var PureArrayUniform = function PureArrayUniform(gl, id, activeInfo, location) {
		this.gl = gl;
		this.id = id;
		this.type = activeInfo.type;
		this.size = activeInfo.size;
		this.location = location;
		this.setValue = undefined;
		this.set = undefined;
		this.cache = [];
		generateSetter(this, true);
	};
	var UniformContainer = function UniformContainer() {
		this.seq = [];
		this.map = {};
	};
	var StructuredUniform = /*#__PURE__*/function (_UniformContainer) {
		_inheritsLoose(StructuredUniform, _UniformContainer);
		function StructuredUniform(id) {
			var _this;
			_this = _UniformContainer.call(this) || this;
			_this.id = id;
			return _this;
		}
		var _proto = StructuredUniform.prototype;
		_proto.set = function set(value, textures) {
			var seq = this.seq;
			for (var i = 0, n = seq.length; i !== n; ++i) {
				var u = seq[i];
				u.set(value[u.id], textures);
			}
		};
		return StructuredUniform;
	}(UniformContainer); // --- Top-level ---
	// Parser - builds up the property tree from the path strings
	var RePathPart = /(\w+)(\])?(\[|\.)?/g;

	// extracts
	// 	- the identifier (member name or array index)
	//	- followed by an optional right bracket (found when array index)
	//	- followed by an optional left bracket or dot (type of subscript)
	//
	// Note: These portions can be read in a non-overlapping fashion and
	// allow straightforward parsing of the hierarchy that WebGL encodes
	// in the uniform names.

	function addUniform(container, uniformObject) {
		container.seq.push(uniformObject);
		container.map[uniformObject.id] = uniformObject;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
	function parseUniform(gl, activeInfo, location, container) {
		var path = activeInfo.name,
			pathLength = path.length;

		// reset RegExp object, because of the early exit of a previous run
		RePathPart.lastIndex = 0;
		while (true) {
			var match = RePathPart.exec(path),
				matchEnd = RePathPart.lastIndex;
			var id = match[1];
			var idIsIndex = match[2] === ']',
				subscript = match[3];
			if (idIsIndex) id = id | 0; // convert to integer

			if (subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength) {
				// bare name or "pure" bottom-level array "[0]" suffix
				addUniform(container, subscript === undefined ? new SingleUniform(gl, id, activeInfo, location) : new PureArrayUniform(gl, id, activeInfo, location));
				break;
			} else {
				// step into inner node / create it in case it doesn't exist
				var map = container.map;
				var next = map[id];
				if (next === undefined) {
					next = new StructuredUniform(id);
					addUniform(container, next);
				}
				container = next;
			}
		}
	}

	// Root Container
	var WebGLUniforms = /*#__PURE__*/function (_UniformContainer2) {
		_inheritsLoose(WebGLUniforms, _UniformContainer2);
		function WebGLUniforms(gl, program) {
			var _this2;
			_this2 = _UniformContainer2.call(this) || this;
			var n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
			for (var i = 0; i < n; ++i) {
				var info = gl.getActiveUniform(program, i),
					addr = gl.getUniformLocation(program, info.name);
				parseUniform(gl, info, addr, _assertThisInitialized(_this2));
			}
			return _this2;
		}
		var _proto2 = WebGLUniforms.prototype;
		_proto2.set = function set(name, value, textures) {
			var u = this.map[name];
			if (u !== undefined) u.set(value, textures);
		};
		_proto2.has = function has(name) {
			return !!this.map[name];
		};
		return WebGLUniforms;
	}(UniformContainer);

	var WebGLAttribute = function WebGLAttribute(gl, program, attributeData) {
		this.gl = gl;
		this.name = attributeData.name;
		this.type = attributeData.type;
		this.size = attributeData.size;
		this.location = gl.getAttribLocation(program, this.name);
		this.count = getAttributeCount(gl, this.type);
		this.format = getAttributeFormat(gl, this.type);
		this.locationSize = 1;
		if (this.type === gl.FLOAT_MAT2) this.locationSize = 2;
		if (this.type === gl.FLOAT_MAT3) this.locationSize = 3;
		if (this.type === gl.FLOAT_MAT4) this.locationSize = 4;
	};
	function getAttributeCount(gl, type) {
		switch (type) {
			case gl.FLOAT:
			case gl.BYTE:
			case gl.UNSIGNED_BYTE:
			case gl.UNSIGNED_SHORT:
				return 1;
			case gl.FLOAT_VEC2:
				return 2;
			case gl.FLOAT_VEC3:
				return 3;
			case gl.FLOAT_VEC4:
				return 4;
			case gl.FLOAT_MAT2:
				return 4;
			case gl.FLOAT_MAT3:
				return 9;
			case gl.FLOAT_MAT4:
				return 16;
			default:
				return 0;
		}
	}
	function getAttributeFormat(gl, type) {
		switch (type) {
			case gl.FLOAT:
			case gl.FLOAT_VEC2:
			case gl.FLOAT_VEC3:
			case gl.FLOAT_VEC4:
			case gl.FLOAT_MAT2:
			case gl.FLOAT_MAT3:
			case gl.FLOAT_MAT4:
				return gl.FLOAT;
			case gl.UNSIGNED_BYTE:
				return gl.UNSIGNED_BYTE;
			case gl.UNSIGNED_SHORT:
				return gl.UNSIGNED_SHORT;
			case gl.BYTE:
				return gl.BYTE;
			default:
				return gl.FLOAT;
		}
	}

	var programIdCount = 0;
	var WebGLProgram = function WebGLProgram(gl, vshader, fshader) {
		this.gl = gl;
		this.vshaderSource = vshader;
		this.fshaderSource = fshader;
		this.id = programIdCount++;
		this.usedTimes = 1;
		this.code = "";
		this.lightId = -1;
		this.lightVersion = -1;
		this.cameraId = -1;
		this.cameraVersion = -1;
		this.sceneId = -1;
		this.sceneVersion = -1;
		this.program;

		// compile program

		var program;
		this.compile = function (checkErrors) {
			// create shaders

			var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
			var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

			// create a program object

			program = gl.createProgram();
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			// check errors

			if (checkErrors && gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
				var programLog = gl.getProgramInfoLog(program).trim();
				var vertexErrors = getShaderErrors(gl, vertexShader, 'VERTEX');
				var fragmentErrors = getShaderErrors(gl, fragmentShader, 'FRAGMENT');
				console.error('Shader Error ' + gl.getError() + ' - ' + 'VALIDATE_STATUS ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n\n' + 'Program Info Log: ' + programLog + '\n' + vertexErrors + '\n' + fragmentErrors);
			} else {
				this.program = program;
			}

			// here we can delete shaders,
			// according to the documentation: https://www.opengl.org/sdk/docs/man/html/glLinkProgram.xhtml

			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
		};

		// set up caching for uniforms

		var cachedUniforms;
		this.getUniforms = function () {
			if (cachedUniforms === undefined) {
				cachedUniforms = new WebGLUniforms(gl, program);
			}
			return cachedUniforms;
		};

		// set up caching for attributes

		var cachedAttributes;
		this.getAttributes = function () {
			if (cachedAttributes === undefined) {
				cachedAttributes = extractAttributes(gl, program);
			}
			return cachedAttributes;
		};

		// free program

		this.dispose = function () {
			gl.deleteProgram(program);
			this.program = undefined;
		};
	};
	function handleSource(string, errorLine) {
		var lines = string.split('\n');
		var lines2 = [];
		var from = Math.max(errorLine - 6, 0);
		var to = Math.min(errorLine + 6, lines.length);
		for (var i = from; i < to; i++) {
			var line = i + 1;
			lines2.push((line === errorLine ? '>' : ' ') + " " + line + ": " + lines[i]);
		}
		return lines2.join('\n');
	}
	function loadShader(gl, type, source) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}
	function getShaderErrors(gl, shader, type) {
		var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		var errors = gl.getShaderInfoLog(shader).trim();
		if (status && errors === '') return '';
		var errorMatches = /ERROR: 0:(\d+)/.exec(errors);
		if (errorMatches) {
			// --enable-privileged-webgl-extension
			// console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

			var errorLine = parseInt(errorMatches[1]);
			return type + '\n\n' + errors + '\n\n' + handleSource(gl.getShaderSource(shader), errorLine);
		} else {
			return errors;
		}
	}

	// extract attributes
	function extractAttributes(gl, program) {
		var attributes = {};
		var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (var i = 0; i < totalAttributes; i++) {
			var attribData = gl.getActiveAttrib(program, i);
			attributes[attribData.name] = new WebGLAttribute(gl, program, attribData);
		}
		return attributes;
	}

	var alphaTest_frag = "#ifdef ALPHATEST\n\tif ( outColor.a < ALPHATEST ) {\n\t\tdiscard;\n\t} else {\n\t\toutColor.a = u_Opacity;\n\t}\n#endif";

	var aoMap_pars_frag = "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n\tvarying vec2 vAOMapUV;\n#endif";

	var aoMap_pars_vert = "#ifdef USE_AOMAP\n\tuniform mat3 aoMapUVTransform;\n\tvarying vec2 vAOMapUV;\n#endif";

	var aoMap_vert = "#ifdef USE_AOMAP\n\t#if (USE_AOMAP == 2)\n				vAOMapUV = (aoMapUVTransform * vec3(a_Uv2, 1.)).xy;\n		#else\n				vAOMapUV = (aoMapUVTransform * vec3(a_Uv, 1.)).xy;\n		#endif\n#endif";

	var aoMap_frag = "\n#ifdef USE_AOMAP\n		float ambientOcclusion = (texture2D(aoMap, vAOMapUV).r - 1.0) * aoMapIntensity + 1.0;\n		\n		reflectedLight.indirectDiffuse *= ambientOcclusion;\n		#if defined(USE_ENV_MAP) && defined(USE_PBR)\n				float dotNV = saturate(dot(N, V));\n				reflectedLight.indirectSpecular *= computeSpecularOcclusion(dotNV, ambientOcclusion, roughness);\n		#endif\n#endif";

	var begin_frag = "vec4 outColor = vec4(u_Color, u_Opacity);";

	var begin_vert = "vec3 transformed = vec3(a_Position);\nvec3 objectNormal = vec3(a_Normal);\n#ifdef USE_TANGENT\n		vec3 objectTangent = vec3(a_Tangent.xyz);\n#endif";

	var bsdfs = "vec2 integrateSpecularBRDF( const in float dotNV, const in float roughness ) {\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\treturn vec2( -1.04, 1.04 ) * a004 + r.zw;\n}\nvec3 BRDF_Diffuse_Lambert(vec3 diffuseColor) {\n		return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n\tfloat fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n\treturn ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nvec3 F_Schlick_RoughnessDependent(const in vec3 F0, const in float dotNV, const in float roughness) {\n\tfloat fresnel = exp2( ( -5.55473 * dotNV - 6.98316 ) * dotNV );\n\tvec3 Fr = max( vec3( 1.0 - roughness ), F0 ) - F0;\n\treturn Fr * fresnel + F0;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nfloat G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nvec3 BRDF_Specular_BlinnPhong(vec3 specularColor, vec3 N, vec3 L, vec3 V, float shininess) {\n		vec3 H = normalize(L + V);\n		float dotNH = saturate(dot(N, H));\n		float dotLH = saturate(dot(L, H));\n		vec3 F = F_Schlick(specularColor, dotLH);\n		float G = G_BlinnPhong_Implicit( );\n		float D = D_BlinnPhong(shininess, dotNH);\n		return F * G * D;\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\tfloat gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\treturn 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nvec3 BRDF_Specular_GGX(vec3 specularColor, vec3 N, vec3 L, vec3 V, float roughness) {\n\tfloat alpha = pow2( roughness );\n\tvec3 H = normalize(L + V);\n\tfloat dotNL = saturate( dot(N, L) );\n\tfloat dotNV = saturate( dot(N, V) );\n\tfloat dotNH = saturate( dot(N, H) );\n\tfloat dotLH = saturate( dot(L, H) );\n\tvec3 F = F_Schlick( specularColor, dotLH );\n\tfloat G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * G * D;\n}\nvec3 BRDF_Specular_GGX_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness) {\n\tfloat dotNV = saturate(dot(N, V));\n\tvec2 brdf = integrateSpecularBRDF(dotNV, roughness);\n\treturn specularColor * brdf.x + brdf.y;\n}\nvoid BRDF_Specular_Multiscattering_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter) {\n\tfloat dotNV = saturate(dot(N, V));\n\tvec3 F = F_Schlick_RoughnessDependent(specularColor, dotNV, roughness);\n\tvec2 brdf = integrateSpecularBRDF(dotNV, roughness);\n\tvec3 FssEss = F * brdf.x + brdf.y;\n\tfloat Ess = brdf.x + brdf.y;\n\tfloat Ems = 1.0 - Ess;\n\tvec3 Favg = specularColor + (1.0 - specularColor) * 0.047619;\tvec3 Fms = FssEss * Favg / (1.0 - Ems * Favg);\n\tsingleScatter += FssEss;\n\tmultiScatter += Fms * Ems;\n}";

	var bumpMap_pars_frag = "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd(vec2 uv) {\n\t\tvec2 dSTdx = dFdx( uv );\n\t\tvec2 dSTdy = dFdy( uv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, uv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, uv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, uv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tfDet *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif";

	var clippingPlanes_frag = "\n#if NUM_CLIPPING_PLANES > 0\n		vec4 plane;\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_CLIPPING_PLANES; i++) {\n				plane = clippingPlanes[i];\n				if ( dot( -v_modelPos, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n#endif";

	var clippingPlanes_pars_frag = "#if NUM_CLIPPING_PLANES > 0\n		uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif";

	var color_frag = "#ifdef USE_VCOLOR_RGB\n		outColor.rgb *= v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		outColor *= v_Color;\n#endif";

	var color_pars_frag = "#ifdef USE_VCOLOR_RGB\n		varying vec3 v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		varying vec4 v_Color;\n#endif";

	var color_pars_vert = "#ifdef USE_VCOLOR_RGB\n		attribute vec3 a_Color;\n		varying vec3 v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		attribute vec4 a_Color;\n		varying vec4 v_Color;\n#endif";

	var color_vert = "#if defined(USE_VCOLOR_RGB) || defined(USE_VCOLOR_RGBA)\n		v_Color = a_Color;\n#endif";

	var common_frag = "uniform mat4 u_View;\nuniform float u_Opacity;\nuniform vec3 u_Color;\nuniform vec3 u_CameraPosition;\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};";

	var common_vert = "attribute vec3 a_Position;\nattribute vec3 a_Normal;\n#ifdef USE_TANGENT\n\tattribute vec4 a_Tangent;\n#endif\n#include <transpose>\n#include <inverse>\nuniform mat4 u_Projection;\nuniform mat4 u_View;\nuniform mat4 u_Model;\nuniform mat4 u_ProjectionView;\nuniform vec3 u_CameraPosition;\n#define EPSILON 1e-6\n#ifdef USE_MORPHTARGETS\n		attribute vec3 morphTarget0;\n		attribute vec3 morphTarget1;\n		attribute vec3 morphTarget2;\n		attribute vec3 morphTarget3;\n		#ifdef USE_MORPHNORMALS\n		\tattribute vec3 morphNormal0;\n		\tattribute vec3 morphNormal1;\n		\tattribute vec3 morphNormal2;\n		\tattribute vec3 morphNormal3;\n		#else\n		\tattribute vec3 morphTarget4;\n		\tattribute vec3 morphTarget5;\n		\tattribute vec3 morphTarget6;\n		\tattribute vec3 morphTarget7;\n		#endif\n#endif\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}";

	var diffuseMap_frag = "#ifdef USE_DIFFUSE_MAP\n		#if (USE_DIFFUSE_MAP == 2)\n				vec4 texelColor = texture2D(diffuseMap, v_Uv2);\n		#else \n				vec4 texelColor = texture2D(diffuseMap, v_Uv);\n		#endif\n		\n		texelColor = mapTexelToLinear(texelColor);\n		outColor *= texelColor;\n#endif";

	var diffuseMap_pars_frag = "#ifdef USE_DIFFUSE_MAP\n		uniform sampler2D diffuseMap;\n#endif";

	var emissiveMap_frag = "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUV);\n\temissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif";

	var emissiveMap_pars_frag = "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n\tvarying vec2 vEmissiveMapUV;\n#endif";

	var emissiveMap_vert = "#ifdef USE_EMISSIVEMAP\n\t#if (USE_EMISSIVEMAP == 2)\n				vEmissiveMapUV = (emissiveMapUVTransform * vec3(a_Uv2, 1.)).xy;\n		#else\n				vEmissiveMapUV = (emissiveMapUVTransform * vec3(a_Uv, 1.)).xy;\n		#endif\n#endif";

	var emissiveMap_pars_vert = "#ifdef USE_EMISSIVEMAP\n\tuniform mat3 emissiveMapUVTransform;\n\tvarying vec2 vEmissiveMapUV;\n#endif";

	var encodings_frag = "gl_FragColor = linearToOutputTexel( gl_FragColor );";

	var encodings_pars_frag = "\nvec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n\treturn vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n\treturn vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n\tfloat maxComponent = max( max( value.r, value.g ), value.b );\n\tfloat fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n\treturn vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.xyz * value.w * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat M			= clamp( maxRGB / maxRange, 0.0, 1.0 );\n\tM						= ceil( M * 255.0 ) / 255.0;\n\treturn vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n\treturn vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n\tfloat maxRGB = max( value.x, max( value.g, value.b ) );\n\tfloat D			= max( maxRange / maxRGB, 1.0 );\n\tD						= min( floor( D ) / 255.0, 1.0 );\n\treturn vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value )	{\n\tvec3 Xp_Y_XYZp = value.rgb * cLogLuvM;\n\tXp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));\n\tvec4 vResult;\n\tvResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n\tfloat Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n\tvResult.w = fract(Le);\n\tvResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;\n\treturn vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n\tfloat Le = value.z * 255.0 + value.w;\n\tvec3 Xp_Y_XYZp;\n\tXp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);\n\tXp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n\tXp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n\tvec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;\n\treturn vec4( max(vRGB, 0.0), 1.0 );\n}";

	var end_frag = "gl_FragColor = outColor;";

	var envMap_frag = "#ifdef USE_ENV_MAP\n		vec3 envDir;\n		#ifdef USE_VERTEX_ENVDIR\n				envDir = v_EnvDir;\n		#else\n				envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);\n		#endif\n		vec4 envColor = textureCube(envMap, vec3(u_EnvMap_Flip * envDir.x, envDir.yz));\n		envColor = envMapTexelToLinear( envColor );\n		#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutColor = mix(outColor, envColor * outColor, u_EnvMap_Intensity);\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutColor = mix(outColor, envColor, u_EnvMap_Intensity);\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutColor += envColor * u_EnvMap_Intensity;\n\t#endif\n#endif";

	var envMap_pars_frag = "#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				varying vec3 v_EnvDir;\n		#endif\n		uniform samplerCube envMap;\n		uniform float u_EnvMap_Flip;\n		uniform float u_EnvMap_Intensity;\n		uniform float u_EnvMapLight_Intensity;\n		uniform int maxMipLevel;\n#endif";

	var envMap_pars_vert = "#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				varying vec3 v_EnvDir;\n		#endif\n#endif";

	var envMap_vert = "\n#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				vec3 transformedNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n				transformedNormal = normalize(transformedNormal);\n				v_EnvDir = reflect(normalize(worldPosition.xyz - u_CameraPosition), transformedNormal);\n		#endif\n#endif";

	var fog_frag = "#ifdef USE_FOG\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n		#ifdef USE_EXP2_FOG\n				float fogFactor = 1.0 - exp(-u_FogDensity * u_FogDensity * depth * depth);\n		#else\n				float fogFactor = smoothstep(u_FogNear, u_FogFar, depth);\n		#endif\n		gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, fogFactor);\n#endif";

	var fog_pars_frag = "#ifdef USE_FOG\n		uniform vec3 u_FogColor;\n		#ifdef USE_EXP2_FOG\n				uniform float u_FogDensity;\n		#else\n				uniform float u_FogNear;\n				uniform float u_FogFar;\n		#endif\n#endif";

	var inverse = "mat4 inverseMat4(mat4 m) {\n		float\n		a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n		a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n		a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n		a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n		b00 = a00 * a11 - a01 * a10,\n		b01 = a00 * a12 - a02 * a10,\n		b02 = a00 * a13 - a03 * a10,\n		b03 = a01 * a12 - a02 * a11,\n		b04 = a01 * a13 - a03 * a11,\n		b05 = a02 * a13 - a03 * a12,\n		b06 = a20 * a31 - a21 * a30,\n		b07 = a20 * a32 - a22 * a30,\n		b08 = a20 * a33 - a23 * a30,\n		b09 = a21 * a32 - a22 * a31,\n		b10 = a21 * a33 - a23 * a31,\n		b11 = a22 * a33 - a23 * a32,\n		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n		return mat4(\n				a11 * b11 - a12 * b10 + a13 * b09,\n				a02 * b10 - a01 * b11 - a03 * b09,\n				a31 * b05 - a32 * b04 + a33 * b03,\n				a22 * b04 - a21 * b05 - a23 * b03,\n				a12 * b08 - a10 * b11 - a13 * b07,\n				a00 * b11 - a02 * b08 + a03 * b07,\n				a32 * b02 - a30 * b05 - a33 * b01,\n				a20 * b05 - a22 * b02 + a23 * b01,\n				a10 * b10 - a11 * b08 + a13 * b06,\n				a01 * b08 - a00 * b10 - a03 * b06,\n				a30 * b04 - a31 * b02 + a33 * b00,\n				a21 * b02 - a20 * b04 - a23 * b00,\n				a11 * b07 - a10 * b09 - a12 * b06,\n				a00 * b09 - a01 * b07 + a02 * b06,\n				a31 * b01 - a30 * b03 - a32 * b00,\n				a20 * b03 - a21 * b01 + a22 * b00) / det;\n}";

	var light_frag = "\n#if (defined(USE_PHONG) || defined(USE_PBR))\n		vec3 V = normalize(u_CameraPosition - v_modelPos);\n#endif\n#ifdef USE_PBR\n		#ifdef USE_PBR2\n				vec3 diffuseColor = outColor.xyz;\n				vec3 specularColor = specularFactor.xyz;\n				float roughness = max(1.0 - glossinessFactor, 0.0525);\n		#else\n				vec3 diffuseColor = outColor.xyz * (1.0 - metalnessFactor);\n				vec3 specularColor = mix(vec3(0.04), outColor.xyz, metalnessFactor);\n				float roughness = max(roughnessFactor, 0.0525);\n		#endif\n		vec3 dxy = max(abs(dFdx(geometryNormal)), abs(dFdy(geometryNormal)));\n		float geometryRoughness = max(max(dxy.x, dxy.y), dxy.z);\n		roughness += geometryRoughness;\n		roughness = min(roughness, 1.0);\n		#ifdef USE_CLEARCOAT\n				float clearcoat = u_Clearcoat;\n				float clearcoatRoughness = u_ClearcoatRoughness;\n				#ifdef USE_CLEARCOATMAP\n\t\t		clearcoat *= texture2D(clearcoatMap, v_Uv).x;\n				#endif\n				#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\t\t		clearcoatRoughness *= texture2D(clearcoatRoughnessMap, v_Uv).y;\n\t		#endif\n				clearcoat = saturate(clearcoat);\n				clearcoatRoughness = max(clearcoatRoughness, 0.0525);\n\t		clearcoatRoughness += geometryRoughness;\n\t		clearcoatRoughness = min(clearcoatRoughness, 1.0);\n		#endif\n#else\n		vec3 diffuseColor = outColor.xyz;\n		#ifdef USE_PHONG\n				vec3 specularColor = u_SpecularColor.xyz;\n				float shininess = u_Specular;\n		#endif\n#endif\n#ifdef USE_LIGHT\n		vec3 L;\n		float falloff;\n		float dotNL;\n		vec3 irradiance;\n		float clearcoatDHR;\n		#ifdef USE_CLEARCOAT\n				float ccDotNL;\n				vec3 ccIrradiance;\n		#endif\n		#if NUM_DIR_LIGHTS > 0\n				#pragma unroll_loop_start\n				for (int i = 0; i < NUM_DIR_LIGHTS; i++) {\n						L = normalize(-u_Directional[i].direction);\n						falloff = 1.0;\n						#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_DIR_SHADOWS)\n								#ifdef USE_PCSS_SOFT_SHADOW\n										falloff *= getShadowWithPCSS(directionalDepthMap[i], directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);\n								#else\n										falloff *= getShadow(directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);\n								#endif\n						#endif\n						dotNL = saturate(dot(N, L));\n						irradiance = u_Directional[i].color * falloff * dotNL * PI;\n						#ifdef USE_CLEARCOAT				\n								ccDotNL = saturate(dot(clearcoatNormal, L));\n								ccIrradiance = ccDotNL * u_Directional[i].color * falloff	* PI;\n								clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n								reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n						#else\n\t\t				clearcoatDHR = 0.0;\n\t				#endif\n						reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n						#ifdef USE_PHONG\n								reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n						#endif\n						#ifdef USE_PBR\n								reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n						#endif\n				}\n				#pragma unroll_loop_end\n		#endif\n		#if NUM_POINT_LIGHTS > 0\n				vec3 worldV;\n				#pragma unroll_loop_start\n				for (int i = 0; i < NUM_POINT_LIGHTS; i++) {\n						worldV = v_modelPos - u_Point[i].position;\n						L = -worldV;\n						falloff = pow(clamp(1. - length(L) / u_Point[i].distance, 0.0, 1.0), u_Point[i].decay);\n						L = normalize(L);\n						#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_POINT_SHADOWS)\n								falloff *= getPointShadow(pointShadowMap[i], vPointShadowCoord[i], u_PointShadow[i].shadowMapSize, u_PointShadow[i].shadowBias, u_PointShadow[i].shadowParams, u_PointShadow[i].shadowCameraRange);\n						#endif\n						dotNL = saturate(dot(N, L));\n						irradiance = u_Point[i].color * falloff * dotNL * PI;\n						#ifdef USE_CLEARCOAT				\n								ccDotNL = saturate(dot(clearcoatNormal, L));\n								ccIrradiance = ccDotNL *	u_Point[i].color * falloff	* PI;\n								clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n								reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n						#else\n\t\t				clearcoatDHR = 0.0;\n\t				#endif\n						reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n						#ifdef USE_PHONG\n								reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n						#endif\n						#ifdef USE_PBR\n								reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n						#endif\n				}\n				#pragma unroll_loop_end\n		#endif\n		#if NUM_SPOT_LIGHTS > 0\n				float lightDistance;\n				float angleCos;\n				#pragma unroll_loop_start\n				for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {\n						L = u_Spot[i].position - v_modelPos;\n						lightDistance = length(L);\n						L = normalize(L);\n						angleCos = dot(L, -normalize(u_Spot[i].direction));\n						falloff = smoothstep(u_Spot[i].coneCos, u_Spot[i].penumbraCos, angleCos);\n						falloff *= pow(clamp(1. - lightDistance / u_Spot[i].distance, 0.0, 1.0), u_Spot[i].decay);\n						#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_SPOT_SHADOWS)\n								#ifdef USE_PCSS_SOFT_SHADOW\n										falloff *= getShadowWithPCSS(spotDepthMap[i], spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);\n								#else\n										falloff *= getShadow(spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);\n								#endif\n						#endif\n						dotNL = saturate(dot(N, L));\n						irradiance = u_Spot[i].color * falloff * dotNL * PI;\n						#ifdef USE_CLEARCOAT				\n								ccDotNL = saturate(dot(clearcoatNormal, L));\n								ccIrradiance = ccDotNL *	u_Spot[i].color * falloff	* PI;\n								clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n								reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n						#else\n\t\t				clearcoatDHR = 0.0;\n\t				#endif\n						reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n						#ifdef USE_PHONG\n								reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n						#endif\n						#ifdef USE_PBR\n								reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n						#endif\n				}\n				#pragma unroll_loop_end\n		#endif\n		vec3 iblIrradiance = vec3(0., 0., 0.);\n		vec3 indirectIrradiance = vec3(0., 0., 0.);\n		vec3 indirectRadiance = vec3(0., 0., 0.);\n		vec3 clearcoatRadiance = vec3(0., 0., 0.);\n		#ifdef USE_AMBIENT_LIGHT\n				indirectIrradiance += u_AmbientLightColor * PI;\n		#endif\n		\n		#ifdef USE_SPHERICALHARMONICS_LIGHT\n				indirectIrradiance += getLightProbeIrradiance(u_SphericalHarmonicsLightData, N);\n		#endif\n		#if NUM_HEMI_LIGHTS > 0\n				float hemiDiffuseWeight;\n				#pragma unroll_loop_start\n				for (int i = 0; i < NUM_HEMI_LIGHTS; i++) {\n						L = normalize(u_Hemi[i].direction);\n						dotNL = dot(N, L);\n						hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n						indirectIrradiance += mix(u_Hemi[i].groundColor, u_Hemi[i].skyColor, hemiDiffuseWeight) * PI;\n				}\n				#pragma unroll_loop_end\n		#endif\n		#if defined(USE_ENV_MAP) && defined(USE_PBR)\n				vec3 envDir;\n				#ifdef USE_VERTEX_ENVDIR\n						envDir = v_EnvDir;\n				#else\n						envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);\n				#endif\n				iblIrradiance += getLightProbeIndirectIrradiance(maxMipLevel, N);\n				indirectRadiance += getLightProbeIndirectRadiance(roughness, maxMipLevel, N, envDir);\n				#ifdef USE_CLEARCOAT\n						vec3 clearcoatDir = reflect(normalize(v_modelPos - u_CameraPosition), clearcoatNormal);\n\t\t		clearcoatRadiance += getLightProbeIndirectRadiance(clearcoatRoughness, maxMipLevel, clearcoatNormal, clearcoatDir);\n\t		#endif\n		#endif\n		reflectedLight.indirectDiffuse += indirectIrradiance * BRDF_Diffuse_Lambert(diffuseColor);\n		#if defined(USE_ENV_MAP) && defined(USE_PBR)\n				#ifdef USE_CLEARCOAT\n						float ccDotNV = saturate(dot(clearcoatNormal, V));\n						reflectedLight.indirectSpecular += clearcoatRadiance * clearcoat * BRDF_Specular_GGX_Environment(clearcoatNormal, V, specularColor, clearcoatRoughness);\n						ccDotNL = ccDotNV;\n						clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n				#else\n						clearcoatDHR = 0.0;\n				#endif\n				float clearcoatInv = 1.0 - clearcoatDHR;\n				vec3 singleScattering = vec3(0.0);\n\t		vec3 multiScattering = vec3(0.0);\n				vec3 cosineWeightedIrradiance = iblIrradiance * RECIPROCAL_PI;\n				BRDF_Specular_Multiscattering_Environment(N, V, specularColor, roughness, singleScattering, multiScattering);\n				vec3 diffuse = diffuseColor * (1.0 - (singleScattering + multiScattering));\n				reflectedLight.indirectSpecular += clearcoatInv * indirectRadiance * singleScattering;\n				reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n				reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n		#endif\n#endif";

	var light_pars_frag = "#ifdef USE_AMBIENT_LIGHT\n		uniform vec3 u_AmbientLightColor;\n#endif\n#ifdef USE_SPHERICALHARMONICS_LIGHT\n		uniform vec3 u_SphericalHarmonicsLightData[9];\n#endif\n#ifdef USE_CLEARCOAT\n		float clearcoatDHRApprox(const in float roughness, const in float dotNL) {\n				return 0.04 + (1.0 - 0.16) * (pow(1.0 - dotNL, 5.0) * pow(1.0 - roughness, 2.0));\n		}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n		struct HemisphereLight {\n				vec3 direction;\n				vec3 skyColor;\n\t\tvec3 groundColor;\n		};\n		uniform HemisphereLight u_Hemi[NUM_HEMI_LIGHTS];\n#endif\n#if NUM_DIR_LIGHTS > 0\n		struct DirectLight {\n				vec3 direction;\n				vec3 color;\n		};\n		uniform DirectLight u_Directional[NUM_DIR_LIGHTS];\n#endif\n#if NUM_POINT_LIGHTS > 0\n		struct PointLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n		};\n		uniform PointLight u_Point[NUM_POINT_LIGHTS];\n#endif\n#if NUM_SPOT_LIGHTS > 0\n		struct SpotLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n				float coneCos;\n				float penumbraCos;\n				vec3 direction;\n		};\n		uniform SpotLight u_Spot[NUM_SPOT_LIGHTS];\n#endif\n#if defined(USE_PBR) && defined(USE_ENV_MAP)\n		vec3 getLightProbeIndirectIrradiance(const in int maxMIPLevel, const in vec3 N) {\n				vec3 coordVec = vec3(u_EnvMap_Flip * N.x, N.yz);\n		\t#ifdef TEXTURE_LOD_EXT\n		\t\tvec4 envMapColor = textureCubeLodEXT(envMap, coordVec, float(maxMIPLevel));\n		\t#else\n		\t\tvec4 envMapColor = textureCube(envMap, coordVec, float(maxMIPLevel));\n		\t#endif\n				envMapColor = envMapTexelToLinear(envMapColor);\n				return PI * envMapColor.rgb * u_EnvMap_Intensity * u_EnvMapLight_Intensity;\n		}\n		float getSpecularMIPLevel(const in float roughness, const in int maxMIPLevel) {\n		\tfloat maxMIPLevelScalar = float(maxMIPLevel);\n				float sigma = PI * roughness * roughness / (1.0 + roughness);\n				float desiredMIPLevel = maxMIPLevelScalar + log2(sigma);\n		\treturn clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);\n		}\n		vec3 getLightProbeIndirectRadiance(const in float roughness, const in int maxMIPLevel, const in vec3 normal, const in vec3 envDir) {\n				float specularMIPLevel = getSpecularMIPLevel(roughness, maxMIPLevel);\n				vec3 coordVec = normalize(mix(envDir, normal, roughness * roughness));\n				coordVec.x *= u_EnvMap_Flip;\n				#ifdef TEXTURE_LOD_EXT\n		\t\tvec4 envMapColor = textureCubeLodEXT(envMap, coordVec, specularMIPLevel);\n		\t#else\n		\t\tvec4 envMapColor = textureCube(envMap, coordVec, specularMIPLevel);\n		\t#endif\n				envMapColor = envMapTexelToLinear(envMapColor);\n				return envMapColor.rgb * u_EnvMap_Intensity;\n		}\n		float computeSpecularOcclusion(const in float dotNV, const in float ambientOcclusion, const in float roughness) {\n		\treturn saturate(pow(dotNV + ambientOcclusion, exp2(-16.0 * roughness - 1.0)) - 1.0 + ambientOcclusion);\n		}\n#endif\n#ifdef USE_SPHERICALHARMONICS_LIGHT\n		vec3 shGetIrradianceAt(in vec3 normal, in vec3 shCoefficients[9]) {\n				float x = normal.x, y = normal.y, z = normal.z;\n				vec3 result = shCoefficients[0] * 0.886227;\n				result += shCoefficients[1] * 2.0 * 0.511664 * y;\n				result += shCoefficients[2] * 2.0 * 0.511664 * z;\n				result += shCoefficients[3] * 2.0 * 0.511664 * x;\n				result += shCoefficients[4] * 2.0 * 0.429043 * x * y;\n				result += shCoefficients[5] * 2.0 * 0.429043 * y * z;\n				result += shCoefficients[6] * (0.743125 * z * z - 0.247708);\n				result += shCoefficients[7] * 2.0 * 0.429043 * x * z;\n				result += shCoefficients[8] * 0.429043 * (x * x - y * y);\n				return result;\n		}\n		vec3 getLightProbeIrradiance(const in vec3 lightProbe[9], const in vec3 normal) {\n				vec3 irradiance = shGetIrradianceAt(normal, lightProbe);\n				return irradiance;\n		}\n#endif";

	var alphamap_pars_frag = "#ifdef USE_ALPHA_MAP\n\tuniform sampler2D alphaMap;\n\tvarying vec2 vAlphaMapUV;\n#endif";

	var alphamap_frag = "#ifdef USE_ALPHA_MAP\n\toutColor.a *= texture2D(alphaMap, vAlphaMapUV).g;\n#endif";

	var alphamap_pars_vert = "#ifdef USE_ALPHA_MAP\n		uniform mat3 alphaMapUVTransform;\n\tvarying vec2 vAlphaMapUV;\n#endif";

	var alphamap_vert = "#ifdef USE_ALPHA_MAP\n\t#if (USE_ALPHA_MAP == 2)\n				vAlphaMapUV = (alphaMapUVTransform * vec3(a_Uv2, 1.)).xy;\n		#else\n				vAlphaMapUV = (alphaMapUVTransform * vec3(a_Uv, 1.)).xy;\n		#endif\n#endif";

	var normalMap_pars_frag = "#ifdef USE_NORMAL_MAP\n		uniform sampler2D normalMap;\n		uniform vec2 normalScale;\n#endif\n#if defined(USE_NORMAL_MAP) || defined(USE_CLEARCOAT_NORMALMAP)\n		#if defined(USE_TANGENT) && !defined(FLAT_SHADED)\n				#define USE_TBN\n		#else\n				#include <tsn>\n		#endif\n#endif";

	var normal_frag = "\n#ifdef FLAT_SHADED\n		vec3 fdx = dFdx(v_modelPos);\n		vec3 fdy = dFdy(v_modelPos);\n		vec3 N = normalize(cross(fdx, fdy));\n#else\n		vec3 N = normalize(v_Normal);\n		#ifdef DOUBLE_SIDED\n				N = N * (float(gl_FrontFacing) * 2.0 - 1.0);\n		#endif\n#endif\n#ifdef USE_TBN\n\tvec3 tangent = normalize(v_Tangent);\n\tvec3 bitangent = normalize(v_Bitangent);\n\t#ifdef DOUBLE_SIDED\n\t\ttangent = tangent * (float(gl_FrontFacing) * 2.0 - 1.0);\n\t\tbitangent = bitangent * (float(gl_FrontFacing) * 2.0 - 1.0);\n\t#endif\n\tmat3 tspace = mat3(tangent, bitangent, N);\n#endif\nvec3 geometryNormal = N;\n#ifdef USE_NORMAL_MAP\n		vec3 mapN = texture2D(normalMap, v_Uv).rgb * 2.0 - 1.0;\n		mapN.xy *= normalScale;\n		#ifdef USE_TBN\n				N = normalize(tspace * mapN);\n		#else\n				mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);\n				N = normalize(tsn(N, v_modelPos, v_Uv) * mapN);\n		#endif\n#elif defined(USE_BUMPMAP)\n		N = perturbNormalArb(v_modelPos, N, dHdxy_fwd(v_Uv));\n#endif\n#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal = geometryNormal;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tvec3 clearcoatMapN = texture2D(clearcoatNormalMap, v_Uv).xyz * 2.0 - 1.0;\n\tclearcoatMapN.xy *= clearcoatNormalScale;\n\t#ifdef USE_TBN\n\t\tclearcoatNormal = normalize(tspace * clearcoatMapN);\n\t#else\n\t\tclearcoatMapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);\n\t\tclearcoatNormal = normalize(tsn(clearcoatNormal, v_modelPos, v_Uv) * clearcoatMapN);\n\t#endif\n#endif";

	var normal_pars_frag = "#ifndef FLAT_SHADED\n		varying vec3 v_Normal;\n		#ifdef USE_TANGENT\n				varying vec3 v_Tangent;\n\t\tvarying vec3 v_Bitangent;\n		#endif\n#endif";

	var normal_pars_vert = "#ifndef FLAT_SHADED\n		varying vec3 v_Normal;\n		#ifdef USE_TANGENT\n				varying vec3 v_Tangent;\n\t\tvarying vec3 v_Bitangent;\n		#endif\n#endif";

	var normal_vert = "#ifndef FLAT_SHADED\n		v_Normal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n		#ifdef FLIP_SIDED\n		\tv_Normal = - v_Normal;\n		#endif\n		#ifdef USE_TANGENT\n				v_Tangent = (transposeMat4(inverseMat4(u_Model)) * vec4(objectTangent, 0.0)).xyz;\n				#ifdef FLIP_SIDED\n						v_Tangent = - v_Tangent;\n				#endif\n				v_Bitangent = normalize(cross(v_Normal, v_Tangent) * a_Tangent.w);\n		#endif\n#endif";

	var packing = "const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,	256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n		vec4 r = vec4( fract( v * PackFactors ), v );\n		r.yzw -= r.xyz * ShiftRight8;		return r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n		return dot( v, UnpackFactors );\n}";

	var premultipliedAlpha_frag = "#ifdef USE_PREMULTIPLIED_ALPHA\n		gl_FragColor.rgb = gl_FragColor.rgb * gl_FragColor.a;\n#endif";

	var pvm_vert = "vec4 worldPosition = u_Model * vec4(transformed, 1.0);\ngl_Position = u_ProjectionView * worldPosition;";

	var dithering_frag = "#if defined( DITHERING )\n\tgl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif";

	var dithering_pars_frag = "#if defined( DITHERING )\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif";

	var shadow = "#ifdef USE_SHADOW_SAMPLER\n		float computeShadow(sampler2DShadow shadowMap, vec3 shadowCoord) {\n				return texture2D( shadowMap, shadowCoord );\n		}\n#else\n		float computeShadow(sampler2D shadowMap, vec3 shadowCoord) {\n				return step(shadowCoord.z, unpackRGBAToDepth(texture2D(shadowMap, shadowCoord.xy)));\n		}\n#endif\nfloat computeShadowWithPoissonSampling(sampler2DShadow shadowMap, vec3 shadowCoord, float texelSize) {\n		vec3 poissonDisk[4];\n		poissonDisk[0] = vec3(-0.94201624, -0.39906216, 0);\n		poissonDisk[1] = vec3(0.94558609, -0.76890725, 0);\n		poissonDisk[2] = vec3(-0.094184101, -0.92938870, 0);\n		poissonDisk[3] = vec3(0.34495938, 0.29387760, 0);\n		return computeShadow(shadowMap, shadowCoord + poissonDisk[0] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[1] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[2] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[3] * texelSize) * 0.25;\n}\nfloat computeShadowWithPCF1(sampler2DShadow shadowSampler, vec3 shadowCoord) {\n		return computeShadow(shadowSampler, shadowCoord);\n}\nfloat computeShadowWithPCF3(sampler2DShadow shadowSampler, vec3 shadowCoord, vec2 shadowMapSizeAndInverse) {\n		vec2 uv = shadowCoord.xy * shadowMapSizeAndInverse.x;		uv += 0.5;		vec2 st = fract(uv);		vec2 base_uv = floor(uv) - 0.5;		base_uv *= shadowMapSizeAndInverse.y;\n		vec2 uvw0 = 3. - 2. * st;\n		vec2 uvw1 = 1. + 2. * st;\n		vec2 u = vec2((2. - st.x) / uvw0.x - 1., st.x / uvw1.x + 1.) * shadowMapSizeAndInverse.y;\n		vec2 v = vec2((2. - st.y) / uvw0.y - 1., st.y / uvw1.y + 1.) * shadowMapSizeAndInverse.y;\n		float shadow = 0.;\n		shadow += uvw0.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[0]), shadowCoord.z));\n		shadow += uvw1.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[0]), shadowCoord.z));\n		shadow += uvw0.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[1]), shadowCoord.z));\n		shadow += uvw1.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[1]), shadowCoord.z));\n		shadow = shadow / 16.;\n		return shadow;\n}\nfloat computeShadowWithPCF5(sampler2DShadow shadowSampler, vec3 shadowCoord, vec2 shadowMapSizeAndInverse) {\n		vec2 uv = shadowCoord.xy * shadowMapSizeAndInverse.x;		uv += 0.5;		vec2 st = fract(uv);		vec2 base_uv = floor(uv) - 0.5;		base_uv *= shadowMapSizeAndInverse.y;\n		vec2 uvw0 = 4. - 3. * st;\n		vec2 uvw1 = vec2(7.);\n		vec2 uvw2 = 1. + 3. * st;\n		vec3 u = vec3((3. - 2. * st.x) / uvw0.x - 2., (3. + st.x) / uvw1.x, st.x / uvw2.x + 2.) * shadowMapSizeAndInverse.y;\n		vec3 v = vec3((3. - 2. * st.y) / uvw0.y - 2., (3. + st.y) / uvw1.y, st.y / uvw2.y + 2.) * shadowMapSizeAndInverse.y;\n		float shadow = 0.;\n		shadow += uvw0.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[0]), shadowCoord.z));\n		shadow += uvw1.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[0]), shadowCoord.z));\n		shadow += uvw2.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[0]), shadowCoord.z));\n		shadow += uvw0.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[1]), shadowCoord.z));\n		shadow += uvw1.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[1]), shadowCoord.z));\n		shadow += uvw2.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[1]), shadowCoord.z));\n		shadow += uvw0.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[2]), shadowCoord.z));\n		shadow += uvw1.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[2]), shadowCoord.z));\n		shadow += uvw2.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[2]), shadowCoord.z));\n		shadow = shadow / 144.;\n		return shadow;\n}\nfloat computeFallOff(float value, vec2 clipSpace, float frustumEdgeFalloff) {\n		float mask = smoothstep(1.0 - frustumEdgeFalloff, 1.00000012, clamp(dot(clipSpace, clipSpace), 0., 1.));\n		return mix(value, 1.0, mask);\n}\nfloat getShadow(sampler2DShadow shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams) {\n		shadowCoord.xyz /= shadowCoord.w;\n		shadowCoord.z += shadowBias.x;\n		bvec4 inFrustumVec = bvec4 (shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0);\n		bool inFrustum = all(inFrustumVec);\n		bvec2 frustumTestVec = bvec2(inFrustum, shadowCoord.z <= 1.0);\n		bool frustumTest = all(frustumTestVec);\n		float shadow = 1.0;\n		if (frustumTest) {\n				#ifdef USE_HARD_SHADOW\n						shadow = computeShadow(shadowMap, shadowCoord.xyz);\n				#else\n						#ifdef USE_PCF3_SOFT_SHADOW\n								vec2 shadowMapSizeAndInverse = vec2(shadowMapSize.x, 1. / shadowMapSize.x);\n								shadow = computeShadowWithPCF3(shadowMap, shadowCoord.xyz, shadowMapSizeAndInverse);\n						#else\n								#ifdef USE_PCF5_SOFT_SHADOW\n										vec2 shadowMapSizeAndInverse = vec2(shadowMapSize.x, 1. / shadowMapSize.x);\n										shadow = computeShadowWithPCF5(shadowMap, shadowCoord.xyz, shadowMapSizeAndInverse);\n								#else\n										float texelSize = shadowParams.x / shadowMapSize.x;\n										shadow = computeShadowWithPoissonSampling(shadowMap, shadowCoord.xyz, texelSize);\n								#endif\n						#endif\n				#endif\n				shadow = computeFallOff(shadow, shadowCoord.xy * 2. - 1., shadowParams.y);\n		}\n		return shadow;\n}\nfloat textureCubeCompare(samplerCube depths, vec3 uv, float compare) {\n		return step(compare, unpackRGBAToDepth(textureCube(depths, uv)));\n}\nfloat getPointShadow(samplerCube shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams, vec2 shadowCameraRange) {\n		vec3 V = shadowCoord.xyz;\n		float depth = (length(V) - shadowCameraRange.x) / (shadowCameraRange.y - shadowCameraRange.x);		depth += shadowBias.x;\n		#ifdef USE_HARD_SHADOW\n				return textureCubeCompare(shadowMap, normalize(V), depth);\n		#else\n				float texelSize = shadowParams.x / shadowMapSize.x;\n				vec3 poissonDisk[4];\n				poissonDisk[0] = vec3(-1.0, 1.0, -1.0);\n				poissonDisk[1] = vec3(1.0, -1.0, -1.0);\n				poissonDisk[2] = vec3(-1.0, -1.0, -1.0);\n				poissonDisk[3] = vec3(1.0, -1.0, 1.0);\n				return textureCubeCompare(shadowMap, normalize(V) + poissonDisk[0] * texelSize, depth) * 0.25 +\n						textureCubeCompare(shadowMap, normalize(V) + poissonDisk[1] * texelSize, depth) * 0.25 +\n						textureCubeCompare(shadowMap, normalize(V) + poissonDisk[2] * texelSize, depth) * 0.25 +\n						textureCubeCompare(shadowMap, normalize(V) + poissonDisk[3] * texelSize, depth) * 0.25;\n		#endif\n}\n#ifdef USE_PCSS_SOFT_SHADOW\n		const vec3 PoissonSamplers32[64] = vec3[64](\n				vec3(0.06407013, 0.05409927, 0.),\n				vec3(0.7366577, 0.5789394, 0.),\n				vec3(-0.6270542, -0.5320278, 0.),\n				vec3(-0.4096107, 0.8411095, 0.),\n				vec3(0.6849564, -0.4990818, 0.),\n				vec3(-0.874181, -0.04579735, 0.),\n				vec3(0.9989998, 0.0009880066, 0.),\n				vec3(-0.004920578, -0.9151649, 0.),\n				vec3(0.1805763, 0.9747483, 0.),\n				vec3(-0.2138451, 0.2635818, 0.),\n				vec3(0.109845, 0.3884785, 0.),\n				vec3(0.06876755, -0.3581074, 0.),\n				vec3(0.374073, -0.7661266, 0.),\n				vec3(0.3079132, -0.1216763, 0.),\n				vec3(-0.3794335, -0.8271583, 0.),\n				vec3(-0.203878, -0.07715034, 0.),\n				vec3(0.5912697, 0.1469799, 0.),\n				vec3(-0.88069, 0.3031784, 0.),\n				vec3(0.5040108, 0.8283722, 0.),\n				vec3(-0.5844124, 0.5494877, 0.),\n				vec3(0.6017799, -0.1726654, 0.),\n				vec3(-0.5554981, 0.1559997, 0.),\n				vec3(-0.3016369, -0.3900928, 0.),\n				vec3(-0.5550632, -0.1723762, 0.),\n				vec3(0.925029, 0.2995041, 0.),\n				vec3(-0.2473137, 0.5538505, 0.),\n				vec3(0.9183037, -0.2862392, 0.),\n				vec3(0.2469421, 0.6718712, 0.),\n				vec3(0.3916397, -0.4328209, 0.),\n				vec3(-0.03576927, -0.6220032, 0.),\n				vec3(-0.04661255, 0.7995201, 0.),\n				vec3(0.4402924, 0.3640312, 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.)\n		);\n		const vec3 PoissonSamplers64[64] = vec3[64](\n				vec3(-0.613392, 0.617481, 0.),\n				vec3(0.170019, -0.040254, 0.),\n				vec3(-0.299417, 0.791925, 0.),\n				vec3(0.645680, 0.493210, 0.),\n				vec3(-0.651784, 0.717887, 0.),\n				vec3(0.421003, 0.027070, 0.),\n				vec3(-0.817194, -0.271096, 0.),\n				vec3(-0.705374, -0.668203, 0.),\n				vec3(0.977050, -0.108615, 0.),\n				vec3(0.063326, 0.142369, 0.),\n				vec3(0.203528, 0.214331, 0.),\n				vec3(-0.667531, 0.326090, 0.),\n				vec3(-0.098422, -0.295755, 0.),\n				vec3(-0.885922, 0.215369, 0.),\n				vec3(0.566637, 0.605213, 0.),\n				vec3(0.039766, -0.396100, 0.),\n				vec3(0.751946, 0.453352, 0.),\n				vec3(0.078707, -0.715323, 0.),\n				vec3(-0.075838, -0.529344, 0.),\n				vec3(0.724479, -0.580798, 0.),\n				vec3(0.222999, -0.215125, 0.),\n				vec3(-0.467574, -0.405438, 0.),\n				vec3(-0.248268, -0.814753, 0.),\n				vec3(0.354411, -0.887570, 0.),\n				vec3(0.175817, 0.382366, 0.),\n				vec3(0.487472, -0.063082, 0.),\n				vec3(-0.084078, 0.898312, 0.),\n				vec3(0.488876, -0.783441, 0.),\n				vec3(0.470016, 0.217933, 0.),\n				vec3(-0.696890, -0.549791, 0.),\n				vec3(-0.149693, 0.605762, 0.),\n				vec3(0.034211, 0.979980, 0.),\n				vec3(0.503098, -0.308878, 0.),\n				vec3(-0.016205, -0.872921, 0.),\n				vec3(0.385784, -0.393902, 0.),\n				vec3(-0.146886, -0.859249, 0.),\n				vec3(0.643361, 0.164098, 0.),\n				vec3(0.634388, -0.049471, 0.),\n				vec3(-0.688894, 0.007843, 0.),\n				vec3(0.464034, -0.188818, 0.),\n				vec3(-0.440840, 0.137486, 0.),\n				vec3(0.364483, 0.511704, 0.),\n				vec3(0.034028, 0.325968, 0.),\n				vec3(0.099094, -0.308023, 0.),\n				vec3(0.693960, -0.366253, 0.),\n				vec3(0.678884, -0.204688, 0.),\n				vec3(0.001801, 0.780328, 0.),\n				vec3(0.145177, -0.898984, 0.),\n				vec3(0.062655, -0.611866, 0.),\n				vec3(0.315226, -0.604297, 0.),\n				vec3(-0.780145, 0.486251, 0.),\n				vec3(-0.371868, 0.882138, 0.),\n				vec3(0.200476, 0.494430, 0.),\n				vec3(-0.494552, -0.711051, 0.),\n				vec3(0.612476, 0.705252, 0.),\n				vec3(-0.578845, -0.768792, 0.),\n				vec3(-0.772454, -0.090976, 0.),\n				vec3(0.504440, 0.372295, 0.),\n				vec3(0.155736, 0.065157, 0.),\n				vec3(0.391522, 0.849605, 0.),\n				vec3(-0.620106, -0.328104, 0.),\n				vec3(0.789239, -0.419965, 0.),\n				vec3(-0.545396, 0.538133, 0.),\n				vec3(-0.178564, -0.596057, 0.)\n		);\n		float getRand(vec2 seed) {\n				return fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453);\n		}\n		float computeShadowWithPCSS(sampler2D depthSampler, sampler2DShadow shadowSampler, vec3 shadowCoord, float shadowMapSizeInverse, float lightSizeUV, int searchTapCount, int pcfTapCount, vec3[64] poissonSamplers) {\n				float depthMetric = shadowCoord.z;\n				float blockerDepth = 0.0;\n				float sumBlockerDepth = 0.0;\n				float numBlocker = 0.0;\n				for (int i = 0; i < searchTapCount; i++) {\n						blockerDepth = unpackRGBAToDepth(texture(depthSampler, shadowCoord.xy + (lightSizeUV * shadowMapSizeInverse * PoissonSamplers32[i].xy)));\n						if (blockerDepth < depthMetric) {\n								sumBlockerDepth += blockerDepth;\n								numBlocker++;\n						}\n				}\n				if (numBlocker < 1.0) {\n						return 1.0;\n				}\n				float avgBlockerDepth = sumBlockerDepth / numBlocker;\n				float AAOffset = shadowMapSizeInverse * 10.;\n				float penumbraRatio = ((depthMetric - avgBlockerDepth) + AAOffset);\n				float filterRadius = penumbraRatio * lightSizeUV * shadowMapSizeInverse;\n				float random = getRand(shadowCoord.xy);				float rotationAngle = random * 3.1415926;\n				vec2 rotationVector = vec2(cos(rotationAngle), sin(rotationAngle));\n				float shadow = 0.;\n				for (int i = 0; i < pcfTapCount; i++) {\n						vec3 offset = poissonSamplers[i];\n						offset = vec3(offset.x * rotationVector.x - offset.y * rotationVector.y, offset.y * rotationVector.x + offset.x * rotationVector.y, 0.);\n						shadow += texture(shadowSampler, shadowCoord + offset * filterRadius);\n				}\n				shadow /= float(pcfTapCount);\n				shadow = mix(shadow, 1., depthMetric - avgBlockerDepth);\n				return shadow;\n		}\n		float getShadowWithPCSS(sampler2D depthSampler, sampler2DShadow shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams) {\n				shadowCoord.xyz /= shadowCoord.w;\n				shadowCoord.z += shadowBias.x;\n				bvec4 inFrustumVec = bvec4 (shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0);\n				bool inFrustum = all(inFrustumVec);\n				bvec2 frustumTestVec = bvec2(inFrustum, shadowCoord.z <= 1.0);\n				bool frustumTest = all(frustumTestVec);\n				float shadow = 1.0;\n				if (frustumTest) {\n						#ifdef USE_PCSS16_SOFT_SHADOW\n								shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 16, 16, PoissonSamplers32);\n						#else\n								#ifdef USE_PCSS32_SOFT_SHADOW\n										shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 16, 32, PoissonSamplers32);\n								#else\n										shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 32, 64, PoissonSamplers64);\n								#endif\n						#endif\n						shadow = computeFallOff(shadow, shadowCoord.xy * 2. - 1., shadowParams.y);\n				}\n				return shadow;\n		}\n#endif";

	var shadowMap_frag = "#ifdef USE_SHADOW\n#endif";

	var shadowMap_pars_frag = "#ifdef USE_SHADOW\n\t#if NUM_DIR_SHADOWS > 0\n\t\tuniform sampler2DShadow directionalShadowMap[NUM_DIR_SHADOWS];\n\t\tvarying vec4 vDirectionalShadowCoord[NUM_DIR_SHADOWS];\n\t\t#ifdef USE_PCSS_SOFT_SHADOW\n\t\t\tuniform sampler2D directionalDepthMap[NUM_DIR_SHADOWS];\n\t\t#endif\n\t\tstruct DirectLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform DirectLightShadow u_DirectionalShadow[NUM_DIR_SHADOWS];\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\tuniform samplerCube pointShadowMap[NUM_POINT_SHADOWS];\n\t\tvarying vec4 vPointShadowCoord[NUM_POINT_SHADOWS];\n\t\tstruct PointLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t\tvec2 shadowCameraRange;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow u_PointShadow[NUM_POINT_SHADOWS];\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\tuniform sampler2DShadow spotShadowMap[NUM_SPOT_SHADOWS];\n\t\tvarying vec4 vSpotShadowCoord[NUM_SPOT_SHADOWS];\n\t\t#ifdef USE_PCSS_SOFT_SHADOW\n\t\t\tuniform sampler2D spotDepthMap[NUM_SPOT_SHADOWS];\n\t\t#endif\n\t\tstruct SpotLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform SpotLightShadow u_SpotShadow[NUM_SPOT_SHADOWS];\n\t#endif\n\t#include <packing>\n\t#include <shadow>\n#endif";

	var shadowMap_pars_vert = "#ifdef USE_SHADOW\n\t#if NUM_DIR_SHADOWS > 0\n\t\tuniform mat4 directionalShadowMatrix[NUM_DIR_SHADOWS];\n\t\tvarying vec4 vDirectionalShadowCoord[NUM_DIR_SHADOWS];\n\t\tstruct DirectLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform DirectLightShadow u_DirectionalShadow[NUM_DIR_SHADOWS];\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\tuniform mat4 pointShadowMatrix[NUM_POINT_SHADOWS];\n\t\tvarying vec4 vPointShadowCoord[NUM_POINT_SHADOWS];\n\t\tstruct PointLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t\tvec2 shadowCameraRange;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow u_PointShadow[NUM_POINT_SHADOWS];\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\tuniform mat4 spotShadowMatrix[NUM_SPOT_SHADOWS];\n\t\tvarying vec4 vSpotShadowCoord[NUM_SPOT_SHADOWS];\n\t\tstruct SpotLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform SpotLightShadow u_SpotShadow[NUM_SPOT_SHADOWS];\n\t#endif\n#endif";

	var shadowMap_vert = "\n#ifdef USE_SHADOW\n\t#if NUM_DIR_SHADOWS > 0 || NUM_POINT_SHADOWS > 0 || NUM_SPOT_SHADOWS > 0\n\t\tvec3 shadowWorldNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n\t\tshadowWorldNormal = normalize(shadowWorldNormal);\n\t\tvec4 shadowWorldPosition;\n\t#endif\n\t#if NUM_DIR_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_DIR_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_DirectionalShadow[i].shadowBias[1], 0);\n\t\t\tvDirectionalShadowCoord[i] = directionalShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_POINT_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_PointShadow[i].shadowBias[1], 0);\n\t\t\tvPointShadowCoord[i] = pointShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_SPOT_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_SpotShadow[i].shadowBias[1], 0);\n\t\t\tvSpotShadowCoord[i] = spotShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif";

	var morphnormal_vert = "#ifdef USE_MORPHNORMALS\n\tobjectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n\tobjectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n\tobjectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n\tobjectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n#endif";

	var morphtarget_pars_vert = "#ifdef USE_MORPHTARGETS\n\t#ifndef USE_MORPHNORMALS\n\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif";

	var morphtarget_vert = "#ifdef USE_MORPHTARGETS\n\ttransformed += morphTarget0 * morphTargetInfluences[ 0 ];\n\ttransformed += morphTarget1 * morphTargetInfluences[ 1 ];\n\ttransformed += morphTarget2 * morphTargetInfluences[ 2 ];\n\ttransformed += morphTarget3 * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n				transformed += morphTarget4 * morphTargetInfluences[ 4 ];\n				transformed += morphTarget5 * morphTargetInfluences[ 5 ];\n				transformed += morphTarget6 * morphTargetInfluences[ 6 ];\n				transformed += morphTarget7 * morphTargetInfluences[ 7 ];\n\t#endif\n#endif";

	var skinning_pars_vert = "#ifdef USE_SKINNING\n		attribute vec4 skinIndex;\n\tattribute vec4 skinWeight;\n		uniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n		#ifdef BONE_TEXTURE\n				uniform sampler2D boneTexture;\n				uniform int boneTextureSize;\n				mat4 getBoneMatrix( const in float i ) {\n						float j = i * 4.0;\n						float x = mod( j, float( boneTextureSize ) );\n						float y = floor( j / float( boneTextureSize ) );\n						float dx = 1.0 / float( boneTextureSize );\n						float dy = 1.0 / float( boneTextureSize );\n						y = dy * ( y + 0.5 );\n						vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n						vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n						vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n						vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n						mat4 bone = mat4( v1, v2, v3, v4 );\n						return bone;\n				}\n		#else\n				uniform mat4 boneMatrices[MAX_BONES];\n				mat4 getBoneMatrix(const in float i) {\n						mat4 bone = boneMatrices[int(i)];\n						return bone;\n				}\n		#endif\n#endif";

	var skinning_vert = "#ifdef USE_SKINNING\n		mat4 boneMatX = getBoneMatrix( skinIndex.x );\n		mat4 boneMatY = getBoneMatrix( skinIndex.y );\n		mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n		mat4 boneMatW = getBoneMatrix( skinIndex.w );\n		vec4 skinVertex = bindMatrix * vec4(transformed, 1.0);\n		vec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\tskinned = bindMatrixInverse * skinned;\n		transformed = skinned.xyz / skinned.w;\n#endif";

	var skinnormal_vert = "#ifdef USE_SKINNING\n		mat4 skinMatrix = mat4( 0.0 );\n		skinMatrix += skinWeight.x * boneMatX;\n		skinMatrix += skinWeight.y * boneMatY;\n		skinMatrix += skinWeight.z * boneMatZ;\n		skinMatrix += skinWeight.w * boneMatW;\n		skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n		objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n		#ifdef USE_TANGENT\n\t\tobjectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#endif\n#endif";

	var specularMap_frag = "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, v_Uv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif";

	var specularMap_pars_frag = "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif";

	var transpose = "mat4 transposeMat4(mat4 inMatrix) {\n		vec4 i0 = inMatrix[0];\n		vec4 i1 = inMatrix[1];\n		vec4 i2 = inMatrix[2];\n		vec4 i3 = inMatrix[3];\n		mat4 outMatrix = mat4(\n				vec4(i0.x, i1.x, i2.x, i3.x),\n				vec4(i0.y, i1.y, i2.y, i3.y),\n				vec4(i0.z, i1.z, i2.z, i3.z),\n				vec4(i0.w, i1.w, i2.w, i3.w)\n		);\n		return outMatrix;\n}";

	var tsn = "mat3 tsn(vec3 N, vec3 V, vec2 uv) {\n		vec3 q0 = vec3(dFdx(V.x), dFdx(V.y), dFdx(V.z));\n		vec3 q1 = vec3(dFdy(V.x), dFdy(V.y), dFdy(V.z));\n		vec2 st0 = dFdx( uv.st );\n		vec2 st1 = dFdy( uv.st );\n		float scale = sign( st1.t * st0.s - st0.t * st1.s );\n		vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * scale );\n		vec3 T = normalize( ( -q0 * st1.s + q1 * st0.s ) * scale );\n		mat3 tsn = mat3( S, T, N );\n		return tsn;\n}";

	var uv_pars_frag = "#ifdef USE_UV1\n		varying vec2 v_Uv;\n#endif\n#ifdef USE_UV2\n		varying vec2 v_Uv2;\n#endif";

	var uv_pars_vert = "#if defined(USE_UV1) || defined(USE_UV2)\n		uniform mat3 uvTransform;\n#endif\n#ifdef USE_UV1\n		attribute vec2 a_Uv;\n		varying vec2 v_Uv;\n#endif\n#ifdef USE_UV2\n		attribute vec2 a_Uv2;\n		varying vec2 v_Uv2;\n#endif";

	var uv_vert = "#ifdef USE_UV1\n		v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;\n#endif\n#ifdef USE_UV2\n		v_Uv2 = (uvTransform * vec3(a_Uv2, 1.)).xy;\n#endif";

	var modelPos_pars_frag = "varying vec3 v_modelPos;";

	var modelPos_pars_vert = "varying vec3 v_modelPos;";

	var modelPos_vert = "\nv_modelPos = worldPosition.xyz;";

	var logdepthbuf_frag = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif";

	var logdepthbuf_pars_frag = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tuniform float logDepthBufFC;\n\tvarying float vFragDepth;\n\tvarying float vIsPerspective;\n#endif";

	var logdepthbuf_pars_vert = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tuniform float logDepthCameraNear;\n\t\tvarying float vFragDepth;\n\t\tvarying float vIsPerspective;\n\t#else\n\t\tuniform float logDepthBufFC;\n\t\tuniform float logDepthCameraNear;\n\t#endif\n#endif";

	var logdepthbuf_vert = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w - logDepthCameraNear;\n\t\tvIsPerspective = float( isPerspectiveMatrix( u_Projection ) );\n\t#else\n\t\tif ( isPerspectiveMatrix( u_Projection ) ) {\n\t\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w - logDepthCameraNear + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\t\tgl_Position.z *= gl_Position.w;\n\t\t}\n\t#endif\n#endif";

	var clearcoat_pars_frag = "#ifdef USE_CLEARCOAT\n\tuniform float u_Clearcoat;\n\tuniform float u_ClearcoatRoughness;\n#endif\n#ifdef USE_CLEARCOATMAP\n\tuniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform sampler2D clearcoatRoughnessMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform sampler2D clearcoatNormalMap;\n\tuniform vec2 clearcoatNormalScale;\n#endif";

	var ShaderChunk = {
		alphaTest_frag: alphaTest_frag,
		aoMap_pars_frag: aoMap_pars_frag,
		aoMap_pars_vert: aoMap_pars_vert,
		aoMap_vert: aoMap_vert,
		aoMap_frag: aoMap_frag,
		begin_frag: begin_frag,
		begin_vert: begin_vert,
		bsdfs: bsdfs,
		bumpMap_pars_frag: bumpMap_pars_frag,
		clippingPlanes_frag: clippingPlanes_frag,
		clippingPlanes_pars_frag: clippingPlanes_pars_frag,
		color_frag: color_frag,
		color_pars_frag: color_pars_frag,
		color_pars_vert: color_pars_vert,
		color_vert: color_vert,
		common_frag: common_frag,
		common_vert: common_vert,
		diffuseMap_frag: diffuseMap_frag,
		diffuseMap_pars_frag: diffuseMap_pars_frag,
		emissiveMap_frag: emissiveMap_frag,
		emissiveMap_pars_frag: emissiveMap_pars_frag,
		emissiveMap_vert: emissiveMap_vert,
		emissiveMap_pars_vert: emissiveMap_pars_vert,
		encodings_frag: encodings_frag,
		encodings_pars_frag: encodings_pars_frag,
		end_frag: end_frag,
		envMap_frag: envMap_frag,
		envMap_pars_frag: envMap_pars_frag,
		envMap_pars_vert: envMap_pars_vert,
		envMap_vert: envMap_vert,
		fog_frag: fog_frag,
		fog_pars_frag: fog_pars_frag,
		inverse: inverse,
		light_frag: light_frag,
		light_pars_frag: light_pars_frag,
		alphamap_pars_frag: alphamap_pars_frag,
		alphamap_frag: alphamap_frag,
		alphamap_pars_vert: alphamap_pars_vert,
		alphamap_vert: alphamap_vert,
		normalMap_pars_frag: normalMap_pars_frag,
		normal_frag: normal_frag,
		normal_pars_frag: normal_pars_frag,
		normal_pars_vert: normal_pars_vert,
		normal_vert: normal_vert,
		packing: packing,
		premultipliedAlpha_frag: premultipliedAlpha_frag,
		pvm_vert: pvm_vert,
		dithering_frag: dithering_frag,
		dithering_pars_frag: dithering_pars_frag,
		shadow: shadow,
		shadowMap_frag: shadowMap_frag,
		shadowMap_pars_frag: shadowMap_pars_frag,
		shadowMap_pars_vert: shadowMap_pars_vert,
		shadowMap_vert: shadowMap_vert,
		morphnormal_vert: morphnormal_vert,
		morphtarget_pars_vert: morphtarget_pars_vert,
		morphtarget_vert: morphtarget_vert,
		skinning_pars_vert: skinning_pars_vert,
		skinning_vert: skinning_vert,
		skinnormal_vert: skinnormal_vert,
		specularMap_frag: specularMap_frag,
		specularMap_pars_frag: specularMap_pars_frag,
		transpose: transpose,
		tsn: tsn,
		uv_pars_frag: uv_pars_frag,
		uv_pars_vert: uv_pars_vert,
		uv_vert: uv_vert,
		modelPos_pars_frag: modelPos_pars_frag,
		modelPos_pars_vert: modelPos_pars_vert,
		modelPos_vert: modelPos_vert,
		logdepthbuf_frag: logdepthbuf_frag,
		logdepthbuf_pars_frag: logdepthbuf_pars_frag,
		logdepthbuf_pars_vert: logdepthbuf_pars_vert,
		logdepthbuf_vert: logdepthbuf_vert,
		clearcoat_pars_frag: clearcoat_pars_frag
	};

	var basic_frag = "#include <common_frag>\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <modelPos_pars_frag>\n#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n		#include <normalMap_pars_frag>\n		#include <normal_pars_frag>		\n#endif\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <fog_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		reflectedLight.indirectDiffuse += vec3(1.0);\n		#include <aoMap_frag>\n		reflectedLight.indirectDiffuse *= outColor.xyz;\n		outColor.xyz = reflectedLight.indirectDiffuse;\n		#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n				#include <normal_frag>\n		#endif\n		#include <envMap_frag>\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n}";

	var basic_vert = "#include <common_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <modelPos_pars_vert>\n#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n		#include <normal_pars_vert>\n#endif\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <modelPos_vert>\n		#ifdef USE_ENV_MAP\n				#include <morphnormal_vert>\n				#include <skinnormal_vert>\n				#ifndef USE_VERTEX_ENVDIR\n						#include <normal_vert>\n				#endif	\n		#endif\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n}";

	var depth_frag = "#include <common_frag>\n#include <diffuseMap_pars_frag>\n#include <modelPos_pars_frag>\n#include <uv_pars_frag>\n#include <packing>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)\n				vec4 texelColor = texture2D( diffuseMap, v_Uv );\n				float alpha = texelColor.a * u_Opacity;\n				if(alpha < ALPHATEST) discard;\n		#endif\n		#include <logdepthbuf_frag>\n		\n		#ifdef DEPTH_PACKING_RGBA\n				gl_FragColor = packDepthToRGBA(gl_FragCoord.z);\n		#else\n				gl_FragColor = vec4( vec3( 1.0 - gl_FragCoord.z ), u_Opacity );\n		#endif\n}";

	var depth_vert = "#include <common_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <uv_pars_vert>\n#include <modelPos_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <uv_vert>\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n		#include <modelPos_vert>\n}";

	var distance_frag = "#include <common_frag>\nuniform float nearDistance;\nuniform float farDistance;\n#include <modelPos_pars_frag>\n#include <packing>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		\n		float dist = length( v_modelPos - u_CameraPosition );\n\tdist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n\tdist = saturate( dist );\n		gl_FragColor = packDepthToRGBA(dist);\n}";

	var distance_vert = "#include <common_vert>\n#include <modelPos_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <modelPos_vert>\n}";

	var lambert_frag = "#define USE_LAMBERT\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <normalMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n		#include <envMap_frag>\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var lambert_vert = "#define USE_LAMBERT\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var normaldepth_frag = "#include <common_frag>\n#include <diffuseMap_pars_frag>\n#include <uv_pars_frag>\n#include <packing>\n#include <normal_pars_frag>\n#include <logdepthbuf_pars_frag>\nvoid main() {\n		#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)\n				vec4 texelColor = texture2D( diffuseMap, v_Uv );\n				float alpha = texelColor.a * u_Opacity;\n				if(alpha < ALPHATEST) discard;\n		#endif\n		#include <logdepthbuf_frag>\n		vec4 packedNormalDepth;\n		packedNormalDepth.xyz = normalize(v_Normal) * 0.5 + 0.5;\n		packedNormalDepth.w = gl_FragCoord.z;\n		gl_FragColor = packedNormalDepth;\n}";

	var normaldepth_vert = "#include <common_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <uv_vert>\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <normal_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n}";

	var pbr_frag = "#define USE_PBR\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform float u_Metalness;\n#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif\nuniform float u_Roughness;\n#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <clearcoat_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		float roughnessFactor = u_Roughness;\n		#ifdef USE_ROUGHNESSMAP\n		\tvec4 texelRoughness = texture2D( roughnessMap, v_Uv );\n		\troughnessFactor *= texelRoughness.g;\n		#endif\n		float metalnessFactor = u_Metalness;\n		#ifdef USE_METALNESSMAP\n		\tvec4 texelMetalness = texture2D( metalnessMap, v_Uv );\n		\tmetalnessFactor *= texelMetalness.b;\n		#endif\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var pbr2_frag = "#define USE_PBR\n#define USE_PBR2\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform vec3 u_SpecularColor;\n#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif\nuniform float glossiness;\n#ifdef USE_GLOSSINESSMAP\n\tuniform sampler2D glossinessMap;\n#endif\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		vec3 specularFactor = u_SpecularColor;\n		#ifdef USE_SPECULARMAP\n				vec4 texelSpecular = texture2D(specularMap, v_Uv);\n				texelSpecular = sRGBToLinear(texelSpecular);\n				specularFactor *= texelSpecular.rgb;\n		#endif\n		float glossinessFactor = glossiness;\n		#ifdef USE_GLOSSINESSMAP\n				vec4 texelGlossiness = texture2D(glossinessMap, v_Uv);\n				glossinessFactor *= texelGlossiness.a;\n		#endif\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var pbr_vert = "#define USE_PBR\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var matcap_frag = "#define MATCAP\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common_frag>\n#include <dithering_pars_frag>\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <normalMap_pars_frag>\n#include <modelPos_pars_frag>\n#include <bumpMap_pars_frag>\n#include <normal_pars_frag>\n#include <fog_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		vec3 viewDir = normalize(vViewPosition);\n\tvec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));\n\tvec3 y = cross(viewDir, x);\n		vec3 viewN = (u_View * vec4(N, 0.0)).xyz;\n\tvec2 uv = vec2(dot(x, viewN), dot(y, viewN)) * 0.495 + 0.5;\n		#ifdef USE_MATCAP\n\t\tvec4 matcapColor = texture2D(matcap, uv);\n\t\tmatcapColor = matcapTexelToLinear(matcapColor);\n\t#else\n\t\tvec4 matcapColor = vec4(1.0);\n\t#endif\n\toutColor.rgb *= matcapColor.rgb;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var matcap_vert = "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <alphamap_pars_vert>\n#include <modelPos_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <alphamap_vert>\n		#include <modelPos_vert>\n		vec4 mvPosition = u_View * worldPosition;\n		vViewPosition = - mvPosition.xyz;\n}";

	var phong_frag = "#define USE_PHONG\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform float u_Specular;\nuniform vec3 u_SpecularColor;\n#include <specularMap_pars_frag>\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		#include <specularMap_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <envMap_frag>\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var phong_vert = "#define USE_PHONG\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var point_frag = "#include <common_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <fog_pars_frag>\n#include <logdepthbuf_pars_frag>\nvoid main() {\n		#include <begin_frag>\n		#include <color_frag>\n		#include <logdepthbuf_frag>\n		#ifdef USE_DIFFUSE_MAP\n				outColor *= texture2D(diffuseMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));\n		#endif\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n}";

	var point_vert = "#include <common_vert>\n#include <color_pars_vert>\n#include <logdepthbuf_pars_vert>\nuniform float u_PointSize;\nuniform float u_PointScale;\nvoid main() {\n		#include <begin_vert>\n		#include <pvm_vert>\n		#include <color_vert>\n		vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);\n		#ifdef USE_SIZEATTENUATION\n				gl_PointSize = u_PointSize * ( u_PointScale / - mvPosition.z );\n		#else\n				gl_PointSize = u_PointSize;\n		#endif\n		#include <logdepthbuf_vert>\n}";

	var ShaderLib = {
		basic_frag: basic_frag,
		basic_vert: basic_vert,
		depth_frag: depth_frag,
		depth_vert: depth_vert,
		distance_frag: distance_frag,
		distance_vert: distance_vert,
		lambert_frag: lambert_frag,
		lambert_vert: lambert_vert,
		normaldepth_frag: normaldepth_frag,
		normaldepth_vert: normaldepth_vert,
		pbr_frag: pbr_frag,
		pbr_vert: pbr_vert,
		pbr2_frag: pbr2_frag,
		pbr2_vert: pbr_vert,
		matcap_frag: matcap_frag,
		matcap_vert: matcap_vert,
		phong_frag: phong_frag,
		phong_vert: phong_vert,
		point_frag: point_frag,
		point_vert: point_vert
	};

	var WebGLPrograms = /*#__PURE__*/function () {
		function WebGLPrograms(gl, state, capabilities) {
			this._gl = gl;
			this._state = state;
			this._capabilities = capabilities;
			this._programs = [];
		}
		var _proto = WebGLPrograms.prototype;
		_proto.getProgram = function getProgram(material, object, renderStates, checkErrors) {
			var programs = this._programs;
			var props = generateProps(this._state, this._capabilities, material, object, renderStates);
			var code = generateProgramCode(props, material);
			var program;
			for (var p = 0, pl = programs.length; p < pl; p++) {
				var programInfo = programs[p];
				if (programInfo.code === code) {
					program = programInfo;
					++program.usedTimes;
					break;
				}
			}
			if (program === undefined) {
				var customDefines = generateDefines(material.defines);
				var vertexShader = ShaderLib[material.type + "_vert"] || material.vertexShader || ShaderLib.basic_vert;
				var fragmentShader = ShaderLib[material.type + "_frag"] || material.fragmentShader || ShaderLib.basic_frag;
				program = createProgram(this._gl, customDefines, props, vertexShader, fragmentShader);
				program.compile(checkErrors);
				program.code = code;
				programs.push(program);
			}
			return program;
		};
		_proto.releaseProgram = function releaseProgram(program) {
			if (--program.usedTimes === 0) {
				var programs = this._programs;

				// Remove from unordered set
				var index = programs.indexOf(program);
				programs[index] = programs[programs.length - 1];
				programs.pop();

				// Free WebGL resources
				program.dispose(this._gl);
			}
		};
		return WebGLPrograms;
	}(); // Program properties and code
	function generateProgramCode(props, material) {
		var code = "";
		for (var key in props) {
			code += props[key] + "_";
		}
		for (var name in material.defines) {
			code += name + "_" + material.defines[name] + "_";
		}

		// If the material type is SHADER and there is no shader Name,
		// use the entire shader code as part of the signature
		if (material.type === MATERIAL_TYPE.SHADER && !material.shaderName) {
			code += material.vertexShader;
			code += material.fragmentShader;
		}
		return code;
	}
	function generateDefines(defines) {
		var chunks = [];
		for (var name in defines) {
			var value = defines[name];
			if (value === false) continue;
			chunks.push('#define ' + name + ' ' + value);
		}
		return chunks.join('\n');
	}
	function generateProps(state, capabilities, material, object, renderStates) {
		var lights = material.acceptLight ? renderStates.lights : null;
		var fog = material.fog ? renderStates.scene.fog : null;
		var envMap = material.envMap !== undefined ? material.envMap || renderStates.scene.environment : null;
		var logarithmicDepthBuffer = renderStates.scene.logarithmicDepthBuffer;
		var disableShadowSampler = renderStates.scene.disableShadowSampler;
		var numClippingPlanes = material.clippingPlanes && material.clippingPlanes.length > 0 ? material.clippingPlanes.length : renderStates.scene.numClippingPlanes;
		var props = {}; // cache this props?

		props.shaderName = material.type === MATERIAL_TYPE.SHADER && material.shaderName ? material.shaderName : material.type;

		// capabilities
		props.version = capabilities.version;
		props.precision = material.precision || capabilities.maxPrecision;
		props.useStandardDerivatives = capabilities.version >= 2 || !!capabilities.getExtension('OES_standard_derivatives') || !!capabilities.getExtension('GL_OES_standard_derivatives');
		props.useShaderTextureLOD = capabilities.version >= 2 || !!capabilities.getExtension('EXT_shader_texture_lod');
		// maps
		props.useDiffuseMap = !!material.diffuseMap ? material.diffuseMapCoord + 1 : 0;
		props.useAlphaMap = !!material.alphaMap ? material.alphaMapCoord + 1 : 0;
		props.useEmissiveMap = !!material.emissiveMap ? material.emissiveMapCoord + 1 : 0;
		props.useAOMap = !!material.aoMap ? material.aoMapCoord + 1 : 0;
		props.useNormalMap = !!material.normalMap;
		props.useBumpMap = !!material.bumpMap;
		props.useSpecularMap = !!material.specularMap;
		props.useRoughnessMap = !!material.roughnessMap;
		props.useMetalnessMap = !!material.metalnessMap;
		props.useGlossinessMap = !!material.glossinessMap;
		props.useMatcap = !!material.matcap;
		props.useEnvMap = !!envMap;
		props.envMapCombine = material.envMapCombine;
		props.useClearcoat = material.clearcoat > 0;
		props.useClearcoatMap = props.useClearcoat && !!material.clearcoatMap;
		props.useClearcoatRoughnessMap = props.useClearcoat && !!material.clearcoatRoughnessMap;
		props.useClearcoatNormalMap = props.useClearcoat && !!material.clearcoatNormalMap;
		props.useUv1 = props.useDiffuseMap === 1 || props.useAlphaMap === 1 || props.useEmissiveMap === 1 || props.useAOMap === 1 || props.useNormalMap || props.useBumpMap || props.useSpecularMap || props.useRoughnessMap || props.useMetalnessMap || props.useGlossinessMap || props.useClearcoatMap || props.useClearcoatNormalMap || props.useClearcoatRoughnessMap;
		props.useUv2 = props.useDiffuseMap === 2 || props.useAlphaMap === 2 || props.useEmissiveMap === 2 || props.useAOMap === 2;

		// props.useVertexEnvDir = false;
		// lights
		props.useAmbientLight = !!lights && lights.useAmbient;
		props.useSphericalHarmonicsLight = !!lights && lights.useSphericalHarmonics;
		props.hemisphereLightNum = !!lights ? lights.hemisNum : 0;
		props.directLightNum = !!lights ? lights.directsNum : 0;
		props.pointLightNum = !!lights ? lights.pointsNum : 0;
		props.spotLightNum = !!lights ? lights.spotsNum : 0;
		props.directShadowNum = object.receiveShadow && !!lights ? lights.directShadowNum : 0;
		props.pointShadowNum = object.receiveShadow && !!lights ? lights.pointShadowNum : 0;
		props.spotShadowNum = object.receiveShadow && !!lights ? lights.spotShadowNum : 0;
		props.useShadow = object.receiveShadow && !!lights && lights.shadowsNum > 0;
		props.useShadowSampler = capabilities.version >= 2 && !disableShadowSampler;
		props.shadowType = props.useShadowSampler ? object.shadowType : SHADOW_TYPE.POISSON_SOFT;
		props.dithering = material.dithering;
		// encoding
		var currentRenderTarget = state.currentRenderTarget;
		props.gammaFactor = renderStates.gammaFactor;
		props.outputEncoding = !!currentRenderTarget.texture ? getTextureEncodingFromMap(currentRenderTarget.texture) : renderStates.outputEncoding;
		props.diffuseMapEncoding = getTextureEncodingFromMap(material.diffuseMap || material.cubeMap);
		props.envMapEncoding = getTextureEncodingFromMap(envMap);
		props.emissiveMapEncoding = getTextureEncodingFromMap(material.emissiveMap);
		props.matcapEncoding = getTextureEncodingFromMap(material.matcap);
		// other
		props.alphaTest = material.alphaTest;
		props.premultipliedAlpha = material.premultipliedAlpha;
		props.useVertexColors = material.vertexColors;
		props.useVertexTangents = !!material.normalMap && material.vertexTangents;
		props.numClippingPlanes = numClippingPlanes;
		props.flatShading = material.shading === SHADING_TYPE.FLAT_SHADING;
		props.fog = !!fog;
		props.fogExp2 = !!fog && fog.isFogExp2;
		props.sizeAttenuation = material.sizeAttenuation;
		props.doubleSided = material.side === DRAW_SIDE.DOUBLE;
		props.flipSided = material.side === DRAW_SIDE.BACK;
		props.packDepthToRGBA = material.packToRGBA;
		props.logarithmicDepthBuffer = !!logarithmicDepthBuffer;
		props.rendererExtensionFragDepth = capabilities.version >= 2 || !!capabilities.getExtension('EXT_frag_depth');
		// morph targets
		props.morphTargets = !!object.morphTargetInfluences;
		props.morphNormals = !!object.morphTargetInfluences && object.geometry.morphAttributes.normal;
		// skinned mesh
		var useSkinning = object.isSkinnedMesh && object.skeleton;
		var maxVertexUniformVectors = capabilities.maxVertexUniformVectors;
		var useVertexTexture = capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2);
		var maxBones = 0;
		if (useVertexTexture) {
			maxBones = 1024;
		} else {
			maxBones = object.skeleton ? object.skeleton.bones.length : 0;
			if (maxBones * 16 > maxVertexUniformVectors) {
				console.warn("Program: too many bones (" + maxBones + "), current cpu only support " + Math.floor(maxVertexUniformVectors / 16) + " bones!!");
				maxBones = Math.floor(maxVertexUniformVectors / 16);
			}
		}
		props.useSkinning = useSkinning;
		props.bonesNum = maxBones;
		props.useVertexTexture = useVertexTexture;
		return props;
	}

	// Create program

	function getTextureEncodingFromMap(map) {
		var encoding;
		if (!map) {
			encoding = TEXEL_ENCODING_TYPE.LINEAR;
		} else if (map.encoding) {
			encoding = map.encoding;
		}
		return encoding;
	}
	function getEncodingComponents(encoding) {
		switch (encoding) {
			case TEXEL_ENCODING_TYPE.LINEAR:
				return ['Linear', '(value)'];
			case TEXEL_ENCODING_TYPE.SRGB:
				return ['sRGB', '(value)'];
			case TEXEL_ENCODING_TYPE.RGBE:
				return ['RGBE', '(value)'];
			case TEXEL_ENCODING_TYPE.RGBM7:
				return ['RGBM', '(value, 7.0)'];
			case TEXEL_ENCODING_TYPE.RGBM16:
				return ['RGBM', '(value, 16.0)'];
			case TEXEL_ENCODING_TYPE.RGBD:
				return ['RGBD', '(value, 256.0)'];
			case TEXEL_ENCODING_TYPE.GAMMA:
				return ['Gamma', '(value, float(GAMMA_FACTOR))'];
			default:
				console.error('unsupported encoding: ' + encoding);
		}
	}
	function getTexelDecodingFunction(functionName, encoding) {
		var components = getEncodingComponents(encoding);
		return "vec4 " + functionName + "(vec4 value) { return " + components[0] + "ToLinear" + components[1] + "; }";
	}
	function getTexelEncodingFunction(functionName, encoding) {
		var components = getEncodingComponents(encoding);
		return "vec4 " + functionName + "(vec4 value) { return LinearTo" + components[0] + components[1] + "; }";
	}
	function createProgram(gl, defines, props, vertex, fragment) {
		var prefixVertex = ['precision ' + props.precision + ' float;', 'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;', '#define SHADER_NAME ' + props.shaderName, defines, props.version >= 2 ? '#define WEBGL2' : '', props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '', props.useMetalnessMap ? '#define USE_METALNESSMAP' : '', props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '', props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '', props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '', props.pointLightNum > 0 || props.directLightNum > 0 || props.useAmbientLight || props.useSphericalHarmonicsLight || props.hemisphereLightNum > 0 || props.spotLightNum > 0 ? '#define USE_LIGHT' : '', props.useNormalMap ? '#define USE_NORMAL_MAP' : '', props.useBumpMap ? '#define USE_BUMPMAP' : '', props.useSpecularMap ? '#define USE_SPECULARMAP' : '', props.useEmissiveMap ? '#define USE_EMISSIVEMAP ' + props.useEmissiveMap : '', props.useShadow ? '#define USE_SHADOW' : '', props.flatShading ? '#define FLAT_SHADED' : '', props.flipSided ? '#define FLIP_SIDED' : '', props.useDiffuseMap ? '#define USE_DIFFUSE_MAP ' + props.useDiffuseMap : '', props.useAlphaMap ? '#define USE_ALPHA_MAP ' + props.useAlphaMap : '', props.useEnvMap ? '#define USE_ENV_MAP' : '', props.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '', props.useAOMap ? '#define USE_AOMAP ' + props.useAOMap : '', props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '', props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '', props.useVertexTangents ? '#define USE_TANGENT' : '', props.useUv1 ? '#define USE_UV1' : '', props.useUv2 ? '#define USE_UV2' : '',
		// (props.useVertexEnvDir && !props.useNormalMap && !props.useBumpMap) ? '#define USE_VERTEX_ENVDIR' : '',

		props.fog ? '#define USE_FOG' : '', props.morphTargets ? '#define USE_MORPHTARGETS' : '', props.morphNormals && props.flatShading === false ? '#define USE_MORPHNORMALS' : '', props.useSkinning ? '#define USE_SKINNING' : '', props.bonesNum > 0 ? '#define MAX_BONES ' + props.bonesNum : '', props.useVertexTexture ? '#define BONE_TEXTURE' : '', props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '', '\n'].filter(filterEmptyLine).join("\n");
		var prefixFragment = [
		// use dfdx and dfdy must enable OES_standard_derivatives
		props.useStandardDerivatives && props.version < 2 ? '#extension GL_OES_standard_derivatives : enable' : '', props.useShaderTextureLOD && props.version < 2 ? '#extension GL_EXT_shader_texture_lod : enable' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth && props.version < 2 ? '#extension GL_EXT_frag_depth : enable' : '', 'precision ' + props.precision + ' float;', 'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;', props.version >= 2 ? 'precision ' + props.precision + ' sampler2DShadow;' : '', props.version >= 2 ? 'precision ' + props.precision + ' samplerCubeShadow;' : '', '#define SHADER_NAME ' + props.shaderName, '#define PI 3.14159265359', '#define EPSILON 1e-6', 'float pow2(const in float x) { return x * x; }', '#define LOG2 1.442695', '#define RECIPROCAL_PI 0.31830988618', '#define saturate(a) clamp(a, 0.0, 1.0)', '#define whiteCompliment(a) (1.0 - saturate(a))',
		// expects values in the range of [0,1] x [0,1], returns values in the [0,1] range.
		// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
		'highp float rand(const in vec2 uv) {', '	const highp float a = 12.9898, b = 78.233, c = 43758.5453;', '	highp float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);', '	return fract(sin(sn) * c);', '}', defines, props.version >= 2 ? '#define WEBGL2' : '', props.useShadowSampler ? '#define USE_SHADOW_SAMPLER' : '#define sampler2DShadow sampler2D', props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '', props.useMetalnessMap ? '#define USE_METALNESSMAP' : '', props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '', props.useClearcoat ? '#define USE_CLEARCOAT' : '', props.useClearcoatMap ? '#define USE_CLEARCOATMAP' : '', props.useClearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '', props.useClearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '', props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '', props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '', props.pointLightNum > 0 || props.directLightNum > 0 || props.useAmbientLight || props.useSphericalHarmonicsLight || props.hemisphereLightNum > 0 || props.spotLightNum > 0 ? '#define USE_LIGHT' : '', props.useNormalMap ? '#define USE_NORMAL_MAP' : '', props.useBumpMap ? '#define USE_BUMPMAP' : '', props.useSpecularMap ? '#define USE_SPECULARMAP' : '', props.useEmissiveMap ? '#define USE_EMISSIVEMAP ' + props.useEmissiveMap : '', props.useShadow ? '#define USE_SHADOW' : '', props.shadowType === SHADOW_TYPE.HARD ? '#define USE_HARD_SHADOW' : '', props.shadowType === SHADOW_TYPE.POISSON_SOFT ? '#define USE_POISSON_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCF3_SOFT ? '#define USE_PCF3_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCF5_SOFT ? '#define USE_PCF5_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS16_SOFT ? '#define USE_PCSS16_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS32_SOFT ? '#define USE_PCSS32_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS64_SOFT ? '#define USE_PCSS64_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS16_SOFT || props.shadowType === SHADOW_TYPE.PCSS32_SOFT || props.shadowType === SHADOW_TYPE.PCSS64_SOFT ? '#define USE_PCSS_SOFT_SHADOW' : '', props.flatShading ? '#define FLAT_SHADED' : '', props.doubleSided ? '#define DOUBLE_SIDED' : '', props.useShaderTextureLOD ? '#define TEXTURE_LOD_EXT' : '', props.useDiffuseMap ? '#define USE_DIFFUSE_MAP ' + props.useDiffuseMap : '', props.useAlphaMap ? '#define USE_ALPHA_MAP ' + props.useAlphaMap : '', props.useEnvMap ? '#define USE_ENV_MAP' : '', props.useAOMap ? '#define USE_AOMAP ' + props.useAOMap : '', props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '', props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '', props.useVertexTangents ? '#define USE_TANGENT' : '', props.premultipliedAlpha ? '#define USE_PREMULTIPLIED_ALPHA' : '', props.fog ? '#define USE_FOG' : '', props.fogExp2 ? '#define USE_EXP2_FOG' : '', props.alphaTest ? '#define ALPHATEST ' + props.alphaTest : '', props.useEnvMap ? '#define ' + props.envMapCombine : '', '#define GAMMA_FACTOR ' + props.gammaFactor, props.useMatcap ? '#define USE_MATCAP' : '', props.useUv1 ? '#define USE_UV1' : '', props.useUv2 ? '#define USE_UV2' : '',
		// (props.useVertexEnvDir && !props.useNormalMap && !props.useBumpMap) ? '#define USE_VERTEX_ENVDIR' : '',

		props.dithering ? '#define DITHERING' : '', ShaderChunk["encodings_pars_frag"], getTexelDecodingFunction("mapTexelToLinear", props.diffuseMapEncoding), props.useEnvMap ? getTexelDecodingFunction("envMapTexelToLinear", props.envMapEncoding) : '', props.useEmissiveMap ? getTexelDecodingFunction("emissiveMapTexelToLinear", props.emissiveMapEncoding) : '', props.useMatcap ? getTexelDecodingFunction("matcapTexelToLinear", props.matcapEncoding) : '', getTexelEncodingFunction("linearToOutputTexel", props.outputEncoding), props.packDepthToRGBA ? '#define DEPTH_PACKING_RGBA' : '', props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '', '\n'].filter(filterEmptyLine).join("\n");
		var vshader = vertex;
		var fshader = fragment;
		vshader = parseIncludes(vshader);
		fshader = parseIncludes(fshader);
		vshader = replaceLightNums(vshader, props);
		fshader = replaceLightNums(fshader, props);
		vshader = replaceClippingPlaneNums(vshader, props);
		fshader = replaceClippingPlaneNums(fshader, props);
		vshader = unrollLoops(vshader);
		fshader = unrollLoops(fshader);

		// support glsl version 300 es for webgl ^2.0
		if (props.version > 1) {
			prefixVertex = ['#version 300 es\n', '#define attribute in', '#define varying out', '#define texture2D texture'].join('\n') + '\n' + prefixVertex;
			fshader = fshader.replace("#extension GL_EXT_draw_buffers : require", "");

			// replace gl_FragData by layout
			var i = 0;
			var layout = [];
			while (fshader.indexOf("gl_FragData[" + i + "]") > -1) {
				fshader = fshader.replace("gl_FragData[" + i + "]", "pc_fragData" + i);
				layout.push("layout(location = " + i + ") out highp vec4 pc_fragData" + i + ";");
				i++;
			}
			prefixFragment = ['#version 300 es\n', '#define varying in', fshader.indexOf("layout") > -1 || layout.length > 0 ? '' : 'out highp vec4 pc_fragColor;', '#define gl_FragColor pc_fragColor', '#define gl_FragDepthEXT gl_FragDepth', '#define texture2D texture', '#define textureCube texture', '#define texture2DProj textureProj', '#define texture2DLodEXT textureLod', '#define texture2DProjLodEXT textureProjLod', '#define textureCubeLodEXT textureLod', '#define texture2DGradEXT textureGrad', '#define texture2DProjGradEXT textureProjGrad', '#define textureCubeGradEXT textureGrad', layout.join('\n')].join('\n') + '\n' + prefixFragment;
		}
		vshader = prefixVertex + vshader;
		fshader = prefixFragment + fshader;
		return new WebGLProgram(gl, vshader, fshader);
	}
	var parseIncludes = function parseIncludes(string) {
		var pattern = /#include +<([\w\d.]+)>/g;
		function replace(match, include) {
			var replace = ShaderChunk[include];
			if (replace === undefined) {
				throw new Error('Can not resolve #include <' + include + '>');
			}
			return parseIncludes(replace);
		}
		return string.replace(pattern, replace);
	};
	function filterEmptyLine(string) {
		return string !== '';
	}
	function replaceLightNums(string, parameters) {
		return string.replace(/NUM_HEMI_LIGHTS/g, parameters.hemisphereLightNum).replace(/NUM_DIR_LIGHTS/g, parameters.directLightNum).replace(/NUM_SPOT_LIGHTS/g, parameters.spotLightNum).replace(/NUM_POINT_LIGHTS/g, parameters.pointLightNum).replace(/NUM_DIR_SHADOWS/g, parameters.directShadowNum).replace(/NUM_SPOT_SHADOWS/g, parameters.spotShadowNum).replace(/NUM_POINT_SHADOWS/g, parameters.pointShadowNum);
	}
	function replaceClippingPlaneNums(string, parameters) {
		return string.replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes);
	}
	var unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
	function loopReplacer(match, start, end, snippet) {
		var string = '';
		for (var i = parseInt(start); i < parseInt(end); i++) {
			string += snippet.replace(/\[\s*i\s*\]/g, '[' + i + ']').replace(/UNROLLED_LOOP_INDEX/g, i);
		}
		return string;
	}
	function unrollLoops(string) {
		return string.replace(unrollLoopPattern, loopReplacer);
	}

	var WebGLCapabilities = /*#__PURE__*/function () {
		function WebGLCapabilities(gl) {
			this._gl = gl;
			this._extensions = {};

			// webgl version

			this.version = parseFloat(/^WebGL\ (\d)/.exec(gl.getParameter(gl.VERSION))[1]);

			// texture filter anisotropic extension
			// this extension is available to both, WebGL1 and WebGL2 contexts.

			var anisotropyExt = this.getExtension('EXT_texture_filter_anisotropic');
			this.anisotropyExt = anisotropyExt;
			this.maxAnisotropy = anisotropyExt !== null ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;

			// query extension

			var timerQuery = null,
				canUseTimestamp = false;
			try {
				if (this.version > 1) {
					timerQuery = this.getExtension('EXT_disjoint_timer_query_webgl2');
					if (timerQuery) {
						var _gl$getQuery;
						canUseTimestamp = ((_gl$getQuery = gl.getQuery(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT)) != null ? _gl$getQuery : 0) > 0;
					}
				} else {
					timerQuery = this.getExtension('EXT_disjoint_timer_query');
					if (timerQuery) {
						var _timerQuery$getQueryE;
						canUseTimestamp = ((_timerQuery$getQueryE = timerQuery.getQueryEXT(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT)) != null ? _timerQuery$getQueryE : 0) > 0;
					}
				}
			} catch (err) {
				console.warn(err);
			}
			this.timerQuery = timerQuery;
			this.canUseTimestamp = canUseTimestamp;

			// others

			this.maxPrecision = getMaxPrecision(gl, 'highp');
			this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
			this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
			this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
			this.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
			this.maxSamples = this.version > 1 ? gl.getParameter(gl.MAX_SAMPLES) : 1;
			this.lineWidthRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
		}
		var _proto = WebGLCapabilities.prototype;
		_proto.getExtension = function getExtension(name) {
			var gl = this._gl;
			var extensions = this._extensions;
			if (extensions[name] !== undefined) {
				return extensions[name];
			}
			var ext = null;
			for (var _iterator = _createForOfIteratorHelperLoose(vendorPrefixes), _step; !(_step = _iterator()).done;) {
				var prefix = _step.value;
				ext = gl.getExtension(prefix + name);
				if (ext) {
					break;
				}
			}
			extensions[name] = ext;
			return ext;
		};
		return WebGLCapabilities;
	}();
	var vendorPrefixes = ['', 'WEBKIT_', 'MOZ_'];
	function getMaxPrecision(gl, precision) {
		if (precision === 'highp') {
			if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
				return 'highp';
			}
			precision = 'mediump';
		}
		if (precision === 'mediump') {
			if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
				return 'mediump';
			}
		}
		return 'lowp';
	}

	var WebGLConstants = /*#__PURE__*/function () {
		function WebGLConstants(gl, capabilities) {
			this._gl = gl;
			this._capabilities = capabilities;
		}
		var _proto = WebGLConstants.prototype;
		_proto.getGLType = function getGLType(type) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var isWebGL2 = capabilities.version >= 2;
			if (type === PIXEL_TYPE.UNSIGNED_BYTE) return gl.UNSIGNED_BYTE;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_6_5) return gl.UNSIGNED_SHORT_5_6_5;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_4_4_4_4) return gl.UNSIGNED_SHORT_4_4_4_4;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_5_5_1) return gl.UNSIGNED_SHORT_5_5_5_1;
			var extension;
			if (!isWebGL2) {
				if (type === PIXEL_TYPE.UNSIGNED_SHORT || type === PIXEL_TYPE.UNSIGNED_INT || type === PIXEL_TYPE.UNSIGNED_INT_24_8) {
					extension = capabilities.getExtension('WEBGL_depth_texture');
					if (extension) {
						if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
						if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
						if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return extension.UNSIGNED_INT_24_8_WEBGL;
					} else {
						console.warn('extension WEBGL_depth_texture is not support.');
						return null;
					}
				}
				if (type === PIXEL_TYPE.FLOAT) {
					extension = capabilities.getExtension('OES_texture_float');
					if (extension) {
						return gl.FLOAT;
					} else {
						console.warn('extension OES_texture_float is not support.');
						return null;
					}
				}
				if (type === PIXEL_TYPE.HALF_FLOAT) {
					extension = capabilities.getExtension('OES_texture_half_float');
					if (extension) {
						return extension.HALF_FLOAT_OES;
					} else {
						console.warn('extension OES_texture_half_float is not support.');
						return null;
					}
				}
			} else {
				if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
				if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
				if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return gl.UNSIGNED_INT_24_8;
				if (type === PIXEL_TYPE.FLOAT) return gl.FLOAT;
				if (type === PIXEL_TYPE.HALF_FLOAT) return gl.HALF_FLOAT;
				if (type === PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV) return gl.FLOAT_32_UNSIGNED_INT_24_8_REV;
				if (type === PIXEL_TYPE.BYTE) return gl.BYTE;
				if (type === PIXEL_TYPE.SHORT) return gl.SHORT;
				if (type === PIXEL_TYPE.INT) return gl.INT;

				// does not include:
				// UNSIGNED_INT_2_10_10_10_REV
				// UNSIGNED_INT_10F_11F_11F_REV
				// UNSIGNED_INT_5_9_9_9_REV
			}

			return gl[type] !== undefined ? gl[type] : type;
		};
		_proto.getGLFormat = function getGLFormat(format) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			if (format === PIXEL_FORMAT.RGB) return gl.RGB;
			if (format === PIXEL_FORMAT.RGBA) return gl.RGBA;
			if (format === PIXEL_FORMAT.ALPHA) return gl.ALPHA;
			if (format === PIXEL_FORMAT.LUMINANCE) return gl.LUMINANCE;
			if (format === PIXEL_FORMAT.LUMINANCE_ALPHA) return gl.LUMINANCE_ALPHA;
			if (format === PIXEL_FORMAT.DEPTH_COMPONENT) return gl.DEPTH_COMPONENT;
			if (format === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;
			if (format === PIXEL_FORMAT.RED) return gl.RED;
			if (format === PIXEL_FORMAT.RED_INTEGER) return gl.RED_INTEGER;
			if (format === PIXEL_FORMAT.RG) return gl.RG;
			if (format === PIXEL_FORMAT.RG_INTEGER) return gl.RG_INTEGER;
			if (format === PIXEL_FORMAT.RGB_INTEGER) return gl.RGB_INTEGER;
			if (format === PIXEL_FORMAT.RGBA_INTEGER) return gl.RGBA_INTEGER;
			var extension;

			// S3TC
			if (format === PIXEL_FORMAT.RGB_S3TC_DXT1 || format === PIXEL_FORMAT.RGBA_S3TC_DXT1 || format === PIXEL_FORMAT.RGBA_S3TC_DXT3 || format === PIXEL_FORMAT.RGBA_S3TC_DXT5) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_s3tc');
				if (extension) {
					if (format === PIXEL_FORMAT.RGB_S3TC_DXT1) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT1) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT3) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT5) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
				} else {
					console.warn('extension WEBGL_compressed_texture_s3tc is not support.');
					return null;
				}
			}

			// PVRTC
			if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1 || format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_pvrtc');
				if (extension) {
					if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
				} else {
					console.warn('extension WEBGL_compressed_texture_pvrtc is not support.');
					return null;
				}
			}

			// ETC1
			if (format === PIXEL_FORMAT.RGB_ETC1) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_etc1');
				if (extension) {
					return extension.COMPRESSED_RGB_ETC1_WEBGL;
				} else {
					console.warn('extension WEBGL_compressed_texture_etc1 is not support.');
					return null;
				}
			}

			// ASTC
			if (format === PIXEL_FORMAT.RGBA_ASTC_4x4) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_astc');
				if (extension) {
					return extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
				} else {
					console.warn('extension WEBGL_compressed_texture_astc is not support.');
					return null;
				}
			}

			// BPTC
			if (format === PIXEL_FORMAT.RGBA_BPTC) {
				extension = capabilities.getExtension('EXT_texture_compression_bptc');
				if (extension) {
					return extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
				} else {
					console.warn('extension EXT_texture_compression_bptc is not support.');
					return null;
				}
			}
			return gl[format] !== undefined ? gl[format] : format;
		};
		_proto.getGLInternalFormat = function getGLInternalFormat(internalFormat) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var isWebGL2 = capabilities.version >= 2;
			if (internalFormat === PIXEL_FORMAT.RGBA4) return gl.RGBA4;
			if (internalFormat === PIXEL_FORMAT.RGB5_A1) return gl.RGB5_A1;
			if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT16) return gl.DEPTH_COMPONENT16;
			if (internalFormat === PIXEL_FORMAT.STENCIL_INDEX8) return gl.STENCIL_INDEX8;
			if (internalFormat === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;

			// does not include:
			// RGB565

			var extension;
			if (!isWebGL2) {
				if (internalFormat === PIXEL_FORMAT.RGBA32F || internalFormat === PIXEL_FORMAT.RGB32F) {
					extension = capabilities.getExtension('WEBGL_color_buffer_float');
					if (extension) {
						if (internalFormat === PIXEL_FORMAT.RGBA32F) return extension.RGBA32F_EXT;
						if (internalFormat === PIXEL_FORMAT.RGB32F) return extension.RGB32F_EXT;
					} else {
						console.warn('extension WEBGL_color_buffer_float is not support.');
						return null;
					}
				}
			} else {
				if (internalFormat === PIXEL_FORMAT.R8) return gl.R8;
				if (internalFormat === PIXEL_FORMAT.RG8) return gl.RG8;
				if (internalFormat === PIXEL_FORMAT.RGB8) return gl.RGB8;
				if (internalFormat === PIXEL_FORMAT.RGBA8) return gl.RGBA8;
				if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT24) return gl.DEPTH_COMPONENT24;
				if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT32F) return gl.DEPTH_COMPONENT32F;
				if (internalFormat === PIXEL_FORMAT.DEPTH24_STENCIL8) return gl.DEPTH24_STENCIL8;
				if (internalFormat === PIXEL_FORMAT.DEPTH32F_STENCIL8) return gl.DEPTH32F_STENCIL8;

				// does not include:
				// R8UI R8I R16UI R16I R32UI R32I RG8UI RG8I RG16UI RG16I RG32UI RG32I SRGB8_ALPHA8
				// RGB10_A2 RGBA8UI RGBA8I RGB10_A2UI RGBA16UI RGBA16I RGBA32I RGBA32UI

				if (internalFormat === PIXEL_FORMAT.R16F || internalFormat === PIXEL_FORMAT.RG16F || internalFormat === PIXEL_FORMAT.RGB16F || internalFormat === PIXEL_FORMAT.RGBA16F || internalFormat === PIXEL_FORMAT.R32F || internalFormat === PIXEL_FORMAT.RG32F || internalFormat === PIXEL_FORMAT.RGB32F || internalFormat === PIXEL_FORMAT.RGBA32F) {
					extension = capabilities.getExtension('EXT_color_buffer_float');
					if (extension) {
						if (internalFormat === PIXEL_FORMAT.R16F) return gl.R16F;
						if (internalFormat === PIXEL_FORMAT.RG16F) return gl.RG16F;
						if (internalFormat === PIXEL_FORMAT.RGB16F) return gl.RGB16F;
						if (internalFormat === PIXEL_FORMAT.RGBA16F) return gl.RGBA16F;
						if (internalFormat === PIXEL_FORMAT.R32F) return gl.R32F;
						if (internalFormat === PIXEL_FORMAT.RG32F) return gl.RG32F;
						if (internalFormat === PIXEL_FORMAT.RGB32F) return gl.RGB32F;
						if (internalFormat === PIXEL_FORMAT.RGBA32F) return gl.RGBA32F;
						// does not include:
						// R11F_G11F_B10F
					} else {
						console.warn('extension EXT_color_buffer_float is not support.');
						return null;
					}
				}
			}
			return gl[internalFormat] !== undefined ? gl[internalFormat] : internalFormat;
		};
		return WebGLConstants;
	}();

	function createTexture(gl, type, target, count) {
		var data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
		var texture = gl.createTexture();
		gl.bindTexture(type, texture);
		gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		for (var i = 0; i < count; i++) {
			gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
		}
		return texture;
	}
	function ColorBuffer(gl) {
		var locked = false;
		var color = new Vector4();
		var currentColorMask = null;
		var currentColorClear = new Vector4(0, 0, 0, 0);
		return {
			setMask: function setMask(colorMask) {
				if (currentColorMask !== colorMask && !locked) {
					gl.colorMask(colorMask, colorMask, colorMask, colorMask);
					currentColorMask = colorMask;
				}
			},
			setLocked: function setLocked(lock) {
				locked = lock;
			},
			setClear: function setClear(r, g, b, a, premultipliedAlpha) {
				if (premultipliedAlpha === true) {
					r *= a;
					g *= a;
					b *= a;
				}
				color.set(r, g, b, a);
				if (currentColorClear.equals(color) === false) {
					gl.clearColor(r, g, b, a);
					currentColorClear.copy(color);
				}
			},
			getClear: function getClear() {
				return currentColorClear;
			},
			reset: function reset() {
				locked = false;
				currentColorMask = null;
				currentColorClear.set(-1, 0, 0, 0); // set to invalid state
			}
		};
	}

	function DepthBuffer(gl, state) {
		var locked = false;
		var currentDepthMask = null;
		var currentDepthFunc = null;
		var currentDepthClear = null;
		return {
			setTest: function setTest(depthTest) {
				if (depthTest) {
					state.enable(gl.DEPTH_TEST);
				} else {
					state.disable(gl.DEPTH_TEST);
				}
			},
			setMask: function setMask(depthMask) {
				if (currentDepthMask !== depthMask && !locked) {
					gl.depthMask(depthMask);
					currentDepthMask = depthMask;
				}
			},
			setFunc: function setFunc(depthFunc) {
				if (currentDepthFunc !== depthFunc) {
					gl.depthFunc(depthFunc);
					currentDepthFunc = depthFunc;
				}
			},
			setLocked: function setLocked(lock) {
				locked = lock;
			},
			setClear: function setClear(depth) {
				if (currentDepthClear !== depth) {
					gl.clearDepth(depth);
					currentDepthClear = depth;
				}
			},
			reset: function reset() {
				locked = false;
				currentDepthMask = null;
				currentDepthFunc = null;
				currentDepthClear = null;
			}
		};
	}
	function StencilBuffer(gl, state) {
		var locked = false;
		var currentStencilMask = null;
		var currentStencilFunc = null;
		var currentStencilRef = null;
		var currentStencilFuncMask = null;
		var currentStencilFail = null;
		var currentStencilZFail = null;
		var currentStencilZPass = null;
		var currentStencilFuncBack = null;
		var currentStencilRefBack = null;
		var currentStencilFuncMaskBack = null;
		var currentStencilFailBack = null;
		var currentStencilZFailBack = null;
		var currentStencilZPassBack = null;
		var currentStencilClear = null;
		return {
			setTest: function setTest(stencilTest) {
				if (stencilTest) {
					state.enable(gl.STENCIL_TEST);
				} else {
					state.disable(gl.STENCIL_TEST);
				}
			},
			setMask: function setMask(stencilMask) {
				if (currentStencilMask !== stencilMask && !locked) {
					gl.stencilMask(stencilMask);
					currentStencilMask = stencilMask;
				}
			},
			setFunc: function setFunc(stencilFunc, stencilRef, stencilMask, stencilFuncBack, stencilRefBack, stencilMaskBack) {
				if (currentStencilFunc !== stencilFunc || currentStencilRef !== stencilRef || currentStencilFuncMask !== stencilMask || currentStencilFuncBack !== stencilFuncBack || currentStencilRefBack !== stencilRefBack || currentStencilFuncMaskBack !== stencilMaskBack) {
					if (stencilFuncBack === null || stencilRefBack === null || stencilMaskBack === null) {
						gl.stencilFunc(stencilFunc, stencilRef, stencilMask);
					} else {
						gl.stencilFuncSeparate(gl.FRONT, stencilFunc, stencilRef, stencilMask);
						gl.stencilFuncSeparate(gl.BACK, stencilFuncBack, stencilRefBack, stencilMaskBack);
					}
					currentStencilFunc = stencilFunc;
					currentStencilRef = stencilRef;
					currentStencilFuncMask = stencilMask;
					currentStencilFuncBack = stencilFuncBack;
					currentStencilRefBack = stencilRefBack;
					currentStencilFuncMaskBack = stencilMaskBack;
				}
			},
			setOp: function setOp(stencilFail, stencilZFail, stencilZPass, stencilFailBack, stencilZFailBack, stencilZPassBack) {
				if (currentStencilFail !== stencilFail || currentStencilZFail !== stencilZFail || currentStencilZPass !== stencilZPass || currentStencilFailBack !== stencilFailBack || currentStencilZFailBack !== stencilZFailBack || currentStencilZPassBack !== stencilZPassBack) {
					if (stencilFailBack === null || stencilZFailBack === null || stencilZPassBack === null) {
						gl.stencilOp(stencilFail, stencilZFail, stencilZPass);
					} else {
						gl.stencilOpSeparate(gl.FRONT, stencilFail, stencilZFail, stencilZPass);
						gl.stencilOpSeparate(gl.BACK, stencilFailBack, stencilZFailBack, stencilZPassBack);
					}
					currentStencilFail = stencilFail;
					currentStencilZFail = stencilZFail;
					currentStencilZPass = stencilZPass;
					currentStencilFailBack = stencilFailBack;
					currentStencilZFailBack = stencilZFailBack;
					currentStencilZPassBack = stencilZPassBack;
				}
			},
			setLocked: function setLocked(lock) {
				locked = lock;
			},
			setClear: function setClear(stencil) {
				if (currentStencilClear !== stencil) {
					gl.clearStencil(stencil);
					currentStencilClear = stencil;
				}
			},
			reset: function reset() {
				locked = false;
				currentStencilMask = null;
				currentStencilFunc = null;
				currentStencilRef = null;
				currentStencilFuncMask = null;
				currentStencilFail = null;
				currentStencilZFail = null;
				currentStencilZPass = null;
				currentStencilFuncBack = null;
				currentStencilRefBack = null;
				currentStencilFuncMaskBack = null;
				currentStencilFailBack = null;
				currentStencilZFailBack = null;
				currentStencilZPassBack = null;
				currentStencilClear = null;
			}
		};
	}
	var WebGLState = /*#__PURE__*/function () {
		function WebGLState(gl, capabilities) {
			var _this$blendEquationTo, _this$blendFactorToGL;
			this.gl = gl;
			this.capabilities = capabilities;
			this.colorBuffer = new ColorBuffer(gl);
			this.depthBuffer = new DepthBuffer(gl, this);
			this.stencilBuffer = new StencilBuffer(gl, this);
			this.states = {};
			this.currentBlending = null;
			this.currentBlendEquation = null;
			this.currentBlendSrc = null;
			this.currentBlendDst = null;
			this.currentBlendEquationAlpha = null;
			this.currentBlendSrcAlpha = null;
			this.currentBlendDstAlpha = null;
			this.currentPremultipliedAlpha = null;
			this.currentFlipSided = false;
			this.currentCullFace = null;
			var viewportParam = gl.getParameter(gl.VIEWPORT);
			this.currentViewport = new Vector4().fromArray(viewportParam);
			this.currentLineWidth = null;
			this.currentPolygonOffsetFactor = null;
			this.currentPolygonOffsetUnits = null;
			this.currentProgram = null;
			this.currentBoundBuffers = {};
			this.currentRenderTarget = null; // used in WebGLRenderTargets

			this.currentTextureSlot = null;
			this.currentBoundTextures = {};
			this.emptyTextures = {};
			this.emptyTextures[gl.TEXTURE_2D] = createTexture(gl, gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
			this.emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(gl, gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);
			this.blendEquationToGL = (_this$blendEquationTo = {}, _this$blendEquationTo[BLEND_EQUATION.ADD] = gl.FUNC_ADD, _this$blendEquationTo[BLEND_EQUATION.SUBTRACT] = gl.FUNC_SUBTRACT, _this$blendEquationTo[BLEND_EQUATION.REVERSE_SUBTRACT] = gl.FUNC_REVERSE_SUBTRACT, _this$blendEquationTo);
			this.blendFactorToGL = (_this$blendFactorToGL = {}, _this$blendFactorToGL[BLEND_FACTOR.ZERO] = gl.ZERO, _this$blendFactorToGL[BLEND_FACTOR.ONE] = gl.ONE, _this$blendFactorToGL[BLEND_FACTOR.SRC_COLOR] = gl.SRC_COLOR, _this$blendFactorToGL[BLEND_FACTOR.SRC_ALPHA] = gl.SRC_ALPHA, _this$blendFactorToGL[BLEND_FACTOR.SRC_ALPHA_SATURATE] = gl.SRC_ALPHA_SATURATE, _this$blendFactorToGL[BLEND_FACTOR.DST_COLOR] = gl.DST_COLOR, _this$blendFactorToGL[BLEND_FACTOR.DST_ALPHA] = gl.DST_ALPHA, _this$blendFactorToGL[BLEND_FACTOR.ONE_MINUS_SRC_COLOR] = gl.ONE_MINUS_SRC_COLOR, _this$blendFactorToGL[BLEND_FACTOR.ONE_MINUS_SRC_ALPHA] = gl.ONE_MINUS_SRC_ALPHA, _this$blendFactorToGL[BLEND_FACTOR.ONE_MINUS_DST_COLOR] = gl.ONE_MINUS_DST_COLOR, _this$blendFactorToGL[BLEND_FACTOR.ONE_MINUS_DST_ALPHA] = gl.ONE_MINUS_DST_ALPHA, _this$blendFactorToGL);

			// init

			this.colorBuffer.setClear(0, 0, 0, 1);
			this.depthBuffer.setClear(1);
			this.stencilBuffer.setClear(0);
			this.depthBuffer.setTest(true);
			this.depthBuffer.setFunc(COMPARE_FUNC.LEQUAL);
			this.setFlipSided(false);
			this.setCullFace(CULL_FACE_TYPE.BACK);
		}
		var _proto = WebGLState.prototype;
		_proto.enable = function enable(id) {
			if (this.states[id] !== true) {
				this.gl.enable(id);
				this.states[id] = true;
			}
		};
		_proto.disable = function disable(id) {
			if (this.states[id] !== false) {
				this.gl.disable(id);
				this.states[id] = false;
			}
		};
		_proto.setBlending = function setBlending(blend, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha) {
			var gl = this.gl;
			if (blend === BLEND_TYPE.NONE) {
				this.disable(gl.BLEND);
				return;
			}
			this.enable(gl.BLEND);
			if (blend !== BLEND_TYPE.CUSTOM) {
				if (blend !== this.currentBlending || premultipliedAlpha !== this.currentPremultipliedAlpha) {
					if (this.currentBlendEquation !== BLEND_EQUATION.ADD || this.currentBlendEquationAlpha !== BLEND_EQUATION.ADD) {
						gl.blendEquation(gl.FUNC_ADD);
						this.currentBlendEquation = BLEND_EQUATION.ADD;
						this.currentBlendEquationAlpha = BLEND_EQUATION.ADD;
					}
					if (blend === BLEND_TYPE.NORMAL) {
						if (premultipliedAlpha) {
							gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
						} else {
							gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
						}
					} else if (blend === BLEND_TYPE.ADD) {
						if (premultipliedAlpha) {
							gl.blendFunc(gl.ONE, gl.ONE);
						} else {
							gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
						}
					} else if (blend === BLEND_TYPE.SUB) {
						gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
					} else if (blend === BLEND_TYPE.MUL) {
						if (premultipliedAlpha) {
							gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
						} else {
							gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
						}
					} else {
						console.error('WebGLState: Invalid blending: ', blend);
					}
				}
				this.currentBlendSrc = null;
				this.currentBlendDst = null;
				this.currentBlendSrcAlpha = null;
				this.currentBlendDstAlpha = null;
			} else {
				blendEquationAlpha = blendEquationAlpha || blendEquation;
				blendSrcAlpha = blendSrcAlpha || blendSrc;
				blendDstAlpha = blendDstAlpha || blendDst;
				var equationToGL = this.blendEquationToGL;
				var factorToGL = this.blendFactorToGL;
				if (blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha) {
					gl.blendEquationSeparate(equationToGL[blendEquation], equationToGL[blendEquationAlpha]);
					this.currentBlendEquation = blendEquation;
					this.currentBlendEquationAlpha = blendEquationAlpha;
				}
				if (blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha) {
					gl.blendFuncSeparate(factorToGL[blendSrc], factorToGL[blendDst], factorToGL[blendSrcAlpha], factorToGL[blendDstAlpha]);
					this.currentBlendSrc = blendSrc;
					this.currentBlendDst = blendDst;
					this.currentBlendSrcAlpha = blendSrcAlpha;
					this.currentBlendDstAlpha = blendDstAlpha;
				}
			}
			this.currentBlending = blend;
			this.currentPremultipliedAlpha = premultipliedAlpha;
		};
		_proto.setFlipSided = function setFlipSided(flipSided) {
			var gl = this.gl;
			if (this.currentFlipSided !== flipSided) {
				if (flipSided) {
					gl.frontFace(gl.CW);
				} else {
					gl.frontFace(gl.CCW);
				}
				this.currentFlipSided = flipSided;
			}
		};
		_proto.setCullFace = function setCullFace(cullFace) {
			var gl = this.gl;
			if (cullFace !== CULL_FACE_TYPE.NONE) {
				this.enable(gl.CULL_FACE);
				if (cullFace !== this.currentCullFace) {
					if (cullFace === CULL_FACE_TYPE.BACK) {
						gl.cullFace(gl.BACK);
					} else if (cullFace === CULL_FACE_TYPE.FRONT) {
						gl.cullFace(gl.FRONT);
					} else {
						gl.cullFace(gl.FRONT_AND_BACK);
					}
				}
			} else {
				this.disable(gl.CULL_FACE);
			}
			this.currentCullFace = cullFace;
		};
		_proto.viewport = function viewport(x, y, width, height) {
			var currentViewport = this.currentViewport;
			if (currentViewport.x !== x || currentViewport.y !== y || currentViewport.z !== width || currentViewport.w !== height) {
				var gl = this.gl;
				gl.viewport(x, y, width, height);
				currentViewport.set(x, y, width, height);
			}
		};
		_proto.setLineWidth = function setLineWidth(width) {
			if (width !== this.currentLineWidth) {
				var lineWidthRange = this.capabilities.lineWidthRange;
				if (lineWidthRange[0] <= width && width <= lineWidthRange[1]) {
					this.gl.lineWidth(width);
				} else {
					console.warn("GL_ALIASED_LINE_WIDTH_RANGE is [" + lineWidthRange[0] + "," + lineWidthRange[1] + "], but set to " + width + ".");
				}
				this.currentLineWidth = width;
			}
		};
		_proto.setPolygonOffset = function setPolygonOffset(polygonOffset, factor, units) {
			var gl = this.gl;
			if (polygonOffset) {
				this.enable(gl.POLYGON_OFFSET_FILL);
				if (this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units) {
					gl.polygonOffset(factor, units);
					this.currentPolygonOffsetFactor = factor;
					this.currentPolygonOffsetUnits = units;
				}
			} else {
				this.disable(gl.POLYGON_OFFSET_FILL);
			}
		};
		_proto.setProgram = function setProgram(program) {
			if (this.currentProgram !== program) {
				this.gl.useProgram(program.program);
				this.currentProgram = program;
			}
		};
		_proto.bindBuffer = function bindBuffer(type, buffer) {
			var gl = this.gl;
			var boundBuffer = this.currentBoundBuffers[type];
			if (boundBuffer !== buffer) {
				gl.bindBuffer(type, buffer);
				this.currentBoundBuffers[type] = buffer;
			}
		};
		_proto.activeTexture = function activeTexture(slot) {
			var gl = this.gl;
			if (slot === undefined) {
				slot = gl.TEXTURE0 + this.capabilities.maxTextures - 1;
			}
			if (this.currentTextureSlot !== slot) {
				gl.activeTexture(slot);
				this.currentTextureSlot = slot;
			}
		};
		_proto.bindTexture = function bindTexture(type, texture) {
			var gl = this.gl;
			if (this.currentTextureSlot === null) {
				this.activeTexture();
			}
			var boundTexture = this.currentBoundTextures[this.currentTextureSlot];
			if (boundTexture === undefined) {
				boundTexture = {
					type: undefined,
					texture: undefined
				};
				this.currentBoundTextures[this.currentTextureSlot] = boundTexture;
			}
			if (boundTexture.type !== type || boundTexture.texture !== texture) {
				gl.bindTexture(type, texture || this.emptyTextures[type]);
				boundTexture.type = type;
				boundTexture.texture = texture;
			}
		};
		_proto.reset = function reset() {
			var gl = this.gl;
			gl.colorMask(true, true, true, true);
			gl.clearColor(0, 0, 0, 0);
			gl.depthMask(true);
			gl.depthFunc(gl.LESS);
			gl.clearDepth(1);
			gl.stencilMask(0xffffffff);
			gl.stencilFunc(gl.ALWAYS, 0, 0xffffffff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
			gl.clearStencil(0);
			gl.disable(gl.BLEND);
			gl.disable(gl.CULL_FACE);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.POLYGON_OFFSET_FILL);
			gl.disable(gl.SCISSOR_TEST);
			gl.disable(gl.STENCIL_TEST);
			gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
			gl.blendEquation(gl.FUNC_ADD);
			gl.blendFunc(gl.ONE, gl.ZERO);
			gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
			gl.cullFace(gl.BACK);
			gl.frontFace(gl.CCW);

			// gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.lineWidth(1);
			gl.polygonOffset(0, 0);
			gl.useProgram(null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.activeTexture(gl.TEXTURE0);
			this.colorBuffer.reset();
			this.depthBuffer.reset();
			this.stencilBuffer.reset();
			this.states = {};
			this.currentBlending = null;
			this.currentBlendEquation = null;
			this.currentBlendSrc = null;
			this.currentBlendDst = null;
			this.currentBlendEquationAlpha = null;
			this.currentBlendSrcAlpha = null;
			this.currentBlendDstAlpha = null;
			this.currentPremultipliedAlpha = null;
			this.currentFlipSided = false;
			this.currentCullFace = null;
			this.currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height);
			this.currentLineWidth = null;
			this.currentPolygonOffsetFactor = null;
			this.currentPolygonOffsetUnits = null;
			this.currentProgram = null;
			this.currentBoundBuffers = {};
			this.currentRenderTarget = null; // used in WebGLRenderTargets

			this.currentTextureSlot = null;
			this.currentBoundTextures = {};
		};
		_proto.setMaterial = function setMaterial(material, frontFaceCW) {
			this.setCullFace(material.side === DRAW_SIDE.DOUBLE ? CULL_FACE_TYPE.NONE : CULL_FACE_TYPE.BACK);
			var flipSided = material.side === DRAW_SIDE.BACK;
			if (frontFaceCW) flipSided = !flipSided;
			this.setFlipSided(flipSided);
			if (material.blending === BLEND_TYPE.NORMAL && material.transparent === false) {
				this.setBlending(BLEND_TYPE.NONE);
			} else {
				this.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha);
			}
			this.depthBuffer.setFunc(material.depthFunc);
			this.depthBuffer.setTest(material.depthTest);
			this.depthBuffer.setMask(material.depthWrite);
			this.colorBuffer.setMask(material.colorWrite);
			var stencilTest = material.stencilTest;
			this.stencilBuffer.setTest(stencilTest);
			if (stencilTest) {
				this.stencilBuffer.setMask(material.stencilWriteMask);
				this.stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask, material.stencilFuncBack, material.stencilRefBack, material.stencilFuncMaskBack);
				this.stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass, material.stencilFailBack, material.stencilZFailBack, material.stencilZPassBack);
			}
			this.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);
			if (material.lineWidth !== undefined) {
				this.setLineWidth(material.lineWidth);
			}
			material.alphaToCoverage === true ? this.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE) : this.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
		};
		return WebGLState;
	}();

	var WebGLProperties = /*#__PURE__*/function () {
		function WebGLProperties(passId) {
			this._key = '__webgl$' + passId;
			this._count = 0;
		}
		var _proto = WebGLProperties.prototype;
		_proto.get = function get(object) {
			var key = this._key;
			var properties = object[key];
			if (properties === undefined) {
				properties = {};
				object[key] = properties;
				this._count++;
			}
			return properties;
		};
		_proto.delete = function _delete(object) {
			var key = this._key;
			var properties = object[key];
			if (properties) {
				this._count--;
				delete object[key];
			}
		};
		_proto.size = function size() {
			return this._count;
		};
		return WebGLProperties;
	}();

	var WebGLTextures = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLTextures, _WebGLProperties);
		function WebGLTextures(passId, gl, state, capabilities, constants) {
			var _this$_wrappingToGL, _this$_filterToGL;
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._state = state;
			_this._capabilities = capabilities;
			_this._constants = constants;
			_this._usedTextureUnits = 0;
			var that = _assertThisInitialized(_this);
			function onTextureDispose(event) {
				var texture = event.target;
				var textureProperties = that.get(texture);
				texture.removeEventListener('dispose', onTextureDispose);
				if (textureProperties.__webglTexture && !textureProperties.__external) {
					gl.deleteTexture(textureProperties.__webglTexture);
				}
				that.delete(texture);
			}
			_this._onTextureDispose = onTextureDispose;
			_this._wrappingToGL = (_this$_wrappingToGL = {}, _this$_wrappingToGL[TEXTURE_WRAP.REPEAT] = gl.REPEAT, _this$_wrappingToGL[TEXTURE_WRAP.CLAMP_TO_EDGE] = gl.CLAMP_TO_EDGE, _this$_wrappingToGL[TEXTURE_WRAP.MIRRORED_REPEAT] = gl.MIRRORED_REPEAT, _this$_wrappingToGL);
			_this._filterToGL = (_this$_filterToGL = {}, _this$_filterToGL[TEXTURE_FILTER.NEAREST] = gl.NEAREST, _this$_filterToGL[TEXTURE_FILTER.LINEAR] = gl.LINEAR, _this$_filterToGL[TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST] = gl.NEAREST_MIPMAP_NEAREST, _this$_filterToGL[TEXTURE_FILTER.LINEAR_MIPMAP_NEAREST] = gl.LINEAR_MIPMAP_NEAREST, _this$_filterToGL[TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR] = gl.NEAREST_MIPMAP_LINEAR, _this$_filterToGL[TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR] = gl.LINEAR_MIPMAP_LINEAR, _this$_filterToGL);
			return _this;
		}
		var _proto = WebGLTextures.prototype;
		_proto.allocTexUnit = function allocTexUnit() {
			var textureUnit = this._usedTextureUnits++;
			if (textureUnit >= this._capabilities.maxTextures) {
				console.warn('trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this._capabilities.maxTextures);
			}
			return textureUnit;
		};
		_proto.resetTextureUnits = function resetTextureUnits() {
			this._usedTextureUnits = 0;
		};
		_proto.setTexture2D = function setTexture2D(texture, slot) {
			var gl = this._gl;
			var state = this._state;
			var capabilities = this._capabilities;
			var constants = this._constants;
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			var textureProperties = this.get(texture);
			if (texture.image && textureProperties.__version !== texture.version && (!texture.image.rtt || slot === undefined) && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);
				var image = texture.image;
				var isDom = domCheck(image);
				if (isDom) {
					image = clampToMaxSize(image, capabilities.maxTextureSize);
					if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo$1(image) === false && capabilities.version < 2) {
						image = makePowerOf2(image);
					}
				}
				var needFallback = !_isPowerOfTwo$1(image) && capabilities.version < 2;
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
				gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
				this._setTextureParameters(texture, needFallback);
				var glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				var mipmaps = texture.mipmaps;
				var mipmap;
				if (isDom) {
					if (mipmaps.length > 0 && !needFallback) {
						for (var i = 0, il = mipmaps.length; i < il; i++) {
							mipmap = mipmaps[i];
							gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
						}
						texture.generateMipmaps = false;
						textureProperties.__maxMipLevel = mipmaps.length - 1;
					} else {
						gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
						textureProperties.__maxMipLevel = 0;
					}
				} else {
					if (mipmaps.length > 0 && !needFallback) {
						var isCompressed = image.isCompressed;
						for (var _i = 0, _il = mipmaps.length; _i < _il; _i++) {
							mipmap = mipmaps[_i];
							isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_2D, _i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : gl.texImage2D(gl.TEXTURE_2D, _i, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
						}
						texture.generateMipmaps = false;
						textureProperties.__maxMipLevel = mipmaps.length - 1;
					} else {
						gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
						textureProperties.__maxMipLevel = 0;
					}
				}
				if (texture.generateMipmaps && !needFallback) {
					this._generateMipmap(gl.TEXTURE_2D, texture, image.width, image.height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);
			return textureProperties;
		};
		_proto.setTextureCube = function setTextureCube(texture, slot) {
			var gl = this._gl;
			var state = this._state;
			var capabilities = this._capabilities;
			var constants = this._constants;
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			var textureProperties = this.get(texture);
			if (texture.images.length === 6 && textureProperties.__version !== texture.version && (!texture.images[0].rtt || slot === undefined) && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
				var images = [];
				var needFallback = false;
				for (var i = 0; i < 6; i++) {
					var image = texture.images[i];
					var isDom = domCheck(image);
					if (isDom) {
						image = clampToMaxSize(image, capabilities.maxTextureSize);
						if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo$1(image) === false && capabilities.version < 2) {
							image = makePowerOf2(image);
						}
					}
					if (!_isPowerOfTwo$1(image) && capabilities.version < 2) {
						needFallback = true;
					}
					images[i] = image;
					image.__isDom = isDom;
				}
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
				gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
				this._setTextureParameters(texture, needFallback);
				var glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				var mipmaps = texture.mipmaps;
				var mipmap;
				for (var _i2 = 0; _i2 < 6; _i2++) {
					var _image = images[_i2];
					var _isDom = _image.__isDom;
					if (_isDom) {
						if (mipmaps.length > 0 && !needFallback) {
							for (var j = 0, jl = mipmaps.length; j < jl; j++) {
								mipmap = mipmaps[j][_i2];
								gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + _i2, 0, glInternalFormat, glFormat, glType, mipmap);
							}
							textureProperties.__maxMipLevel = mipmaps.length - 1;
							texture.generateMipmaps = false;
						} else {
							gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + _i2, 0, glInternalFormat, glFormat, glType, _image);
							textureProperties.__maxMipLevel = 0;
						}
					} else {
						if (mipmaps.length > 0 && !needFallback) {
							var isCompressed = _image.isCompressed;
							for (var _j = 0, _jl = mipmaps.length; _j < _jl; _j++) {
								mipmap = mipmaps[_j][_i2];
								isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + _i2, _j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + _i2, _j, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
							}
							textureProperties.__maxMipLevel = mipmaps.length - 1;
							texture.generateMipmaps = false;
						} else {
							gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + _i2, 0, glInternalFormat, _image.width, _image.height, texture.border, glFormat, glType, _image.data);
							textureProperties.__maxMipLevel = 0;
						}
					}
				}
				if (texture.generateMipmaps && !needFallback) {
					this._generateMipmap(gl.TEXTURE_CUBE_MAP, texture, images[0].width, images[0].height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
			return textureProperties;
		};
		_proto.setTexture3D = function setTexture3D(texture, slot) {
			var gl = this._gl;
			var state = this._state;
			var capabilities = this._capabilities;
			var constants = this._constants;
			if (capabilities.version < 2) {
				console.warn("Try to use Texture3D but browser not support WebGL2.0");
				return;
			}
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			var textureProperties = this.get(texture);
			if (texture.image && textureProperties.__version !== texture.version && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);
				var image = texture.image;
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
				gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
				this._setTextureParameters(texture, false);
				var glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				gl.texImage3D(gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);
				if (texture.generateMipmaps) {
					this._generateMipmap(gl.TEXTURE_3D, texture, image.width, image.height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);
			return textureProperties;
		};
		_proto.setTextureExternal = function setTextureExternal(texture, webglTexture) {
			var gl = this._gl;
			var textureProperties = this.get(texture);
			if (!textureProperties.__external) {
				if (textureProperties.__webglTexture) {
					gl.deleteTexture(textureProperties.__webglTexture);
				} else {
					texture.addEventListener('dispose', this._onTextureDispose);
				}
			}
			textureProperties.__webglTexture = webglTexture;
			textureProperties.__external = true;
		};
		_proto._setTextureParameters = function _setTextureParameters(texture, needFallback) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var wrappingToGL = this._wrappingToGL;
			var filterToGL = this._filterToGL;
			var textureType = gl.TEXTURE_2D;
			if (texture.isTextureCube) textureType = gl.TEXTURE_CUBE_MAP;
			if (texture.isTexture3D) textureType = gl.TEXTURE_3D;
			var parameters = getTextureParameters(texture, needFallback);
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, wrappingToGL[parameters[0]]);
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, wrappingToGL[parameters[1]]);
			if (texture.isTexture3D) {
				gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, wrappingToGL[parameters[2]]);
			}
			gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, filterToGL[parameters[3]]);
			gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, filterToGL[parameters[4]]);

			// anisotropy if EXT_texture_filter_anisotropic exist
			var extension = capabilities.anisotropyExt;
			if (extension) {
				gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(parameters[5], capabilities.maxAnisotropy));
			}
			if (capabilities.version >= 2) {
				if (parameters[6] !== undefined) {
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_FUNC, parameters[6]);
				} else {
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.NONE);
				}
			}
		};
		_proto._generateMipmap = function _generateMipmap(target, texture, width, height) {
			var gl = this._gl;
			gl.generateMipmap(target);
			var textureProperties = this.get(texture);
			// Note: Math.log( x ) * Math.LOG2E used instead of Math.log2( x ) which is not supported by IE11
			textureProperties.__maxMipLevel = Math.log(Math.max(width, height)) * Math.LOG2E;
		};
		return WebGLTextures;
	}(WebGLProperties);
	function textureNeedsPowerOfTwo(texture) {
		return texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR;
	}
	function filterFallback(filter) {
		if (filter === TEXTURE_FILTER.NEAREST || filter === TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR || filter === TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST) {
			return TEXTURE_FILTER.NEAREST;
		}
		return TEXTURE_FILTER.LINEAR;
	}
	function _isPowerOfTwo$1(image) {
		return isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
	}
	function makePowerOf2(image) {
		if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
			var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = nearestPowerOfTwo(image.width);
			canvas.height = nearestPowerOfTwo(image.height);
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			console.warn('image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
			return canvas;
		}
		return image;
	}
	function clampToMaxSize(image, maxSize) {
		if (image.width > maxSize || image.height > maxSize) {
			// console.warn('image is too big (' + image.width + 'x' + image.height + '). max size is ' + maxSize + 'x' + maxSize, image);
			// return image;

			// Warning: Scaling through the canvas will only work with images that use
			// premultiplied alpha.

			var scale = maxSize / Math.max(image.width, image.height);
			var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = Math.floor(image.width * scale);
			canvas.height = Math.floor(image.height * scale);
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
			console.warn('image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
			return canvas;
		}
		return image;
	}
	function getTextureParameters(texture, needFallback) {
		var wrapS = texture.wrapS,
			wrapT = texture.wrapT,
			wrapR = texture.wrapR,
			magFilter = texture.magFilter,
			minFilter = texture.minFilter;
		var anisotropy = texture.anisotropy,
			compare = texture.compare;

		// fix for non power of 2 image in WebGL 1.0
		if (needFallback) {
			wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;
			wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;
			if (texture.isTexture3D) {
				wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;
			}
			if (texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE) {
				console.warn('Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to t3d.TEXTURE_WRAP.CLAMP_TO_EDGE.', texture);
			}
			magFilter = filterFallback(texture.magFilter);
			minFilter = filterFallback(texture.minFilter);
			if (texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR || texture.magFilter !== TEXTURE_FILTER.NEAREST && texture.magFilter !== TEXTURE_FILTER.LINEAR) {
				console.warn('Texture is not power of two. Texture.minFilter and Texture.magFilter should be set to t3d.TEXTURE_FILTER.NEAREST or t3d.TEXTURE_FILTER.LINEAR.', texture);
			}
		}
		return [wrapS, wrapT, wrapR, magFilter, minFilter, anisotropy, compare];
	}
	function getGLInternalFormat(gl, capabilities, glFormat, glType) {
		var isWebGL2 = capabilities.version >= 2;
		if (isWebGL2 === false) return glFormat;
		var glInternalFormat = glFormat;
		if (glFormat === gl.RED) {
			if (glType === gl.FLOAT) glInternalFormat = gl.R32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.R16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.R8;
		}
		if (glFormat === gl.RG) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RG32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RG16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RG8;
		}
		if (glFormat === gl.RGB) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RGB32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGB16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGB8;
		}
		if (glFormat === gl.RGBA) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RGBA32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGBA16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGBA8;
			if (glType === gl.UNSIGNED_SHORT_4_4_4_4) glInternalFormat = gl.RGBA4;
			if (glType === gl.UNSIGNED_SHORT_5_5_5_1) glInternalFormat = gl.RGB5_A1;
		}
		if (glFormat === gl.DEPTH_COMPONENT || glFormat === gl.DEPTH_STENCIL) {
			glInternalFormat = gl.DEPTH_COMPONENT16;
			if (glType === gl.FLOAT) glInternalFormat = gl.DEPTH_COMPONENT32F;
			if (glType === gl.UNSIGNED_INT) glInternalFormat = gl.DEPTH_COMPONENT24;
			if (glType === gl.UNSIGNED_INT_24_8) glInternalFormat = gl.DEPTH24_STENCIL8;
			if (glType === gl.FLOAT_32_UNSIGNED_INT_24_8_REV) glInternalFormat = gl.DEPTH32F_STENCIL8;
		}
		if (glInternalFormat === gl.R16F || glInternalFormat === gl.R32F || glInternalFormat === gl.RG16F || glInternalFormat === gl.RG32F || glInternalFormat === gl.RGB16F || glInternalFormat === gl.RGB32F || glInternalFormat === gl.RGBA16F || glInternalFormat === gl.RGBA32F) {
			capabilities.getExtension('EXT_color_buffer_float');
		}
		return glInternalFormat;
	}
	function domCheck(image) {
		return typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement || typeof HTMLVideoElement !== 'undefined' && image instanceof HTMLVideoElement || typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap;
	}

	var WebGLRenderBuffers = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLRenderBuffers, _WebGLProperties);
		function WebGLRenderBuffers(passId, gl, capabilities, constants) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._capabilities = capabilities;
			_this._constants = constants;
			var that = _assertThisInitialized(_this);
			function onRenderBufferDispose(event) {
				var renderBuffer = event.target;
				renderBuffer.removeEventListener('dispose', onRenderBufferDispose);
				var renderBufferProperties = that.get(renderBuffer);
				if (renderBufferProperties.__webglRenderbuffer && !renderBufferProperties.__external) {
					gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
				}
				that.delete(renderBuffer);
			}
			_this._onRenderBufferDispose = onRenderBufferDispose;
			return _this;
		}
		var _proto = WebGLRenderBuffers.prototype;
		_proto.setRenderBuffer = function setRenderBuffer(renderBuffer) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var constants = this._constants;
			var renderBufferProperties = this.get(renderBuffer);
			if (renderBufferProperties.__webglRenderbuffer === undefined) {
				renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);
				renderBufferProperties.__webglRenderbuffer = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
				var glFormat = constants.getGLInternalFormat(renderBuffer.format);
				if (renderBuffer.multipleSampling > 0) {
					if (capabilities.version < 2) {
						console.error("render buffer multipleSampling is not support in webgl 1.0.");
					}
					gl.renderbufferStorageMultisample(gl.RENDERBUFFER, Math.min(renderBuffer.multipleSampling, capabilities.maxSamples), glFormat, renderBuffer.width, renderBuffer.height);
				} else {
					gl.renderbufferStorage(gl.RENDERBUFFER, glFormat, renderBuffer.width, renderBuffer.height);
				}
			} else {
				gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
			}
			return renderBufferProperties;
		};
		_proto.setRenderBufferExternal = function setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
			var gl = this._gl;
			var renderBufferProperties = this.get(renderBuffer);
			if (!renderBufferProperties.__external) {
				if (renderBufferProperties.__webglRenderbuffer) {
					gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
				} else {
					renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);
				}
			}
			renderBufferProperties.__webglRenderbuffer = webglRenderbuffer;
			renderBufferProperties.__external = true;
		};
		return WebGLRenderBuffers;
	}(WebGLProperties);

	var _attachTargetToGL;
	var WebGLRenderTargets = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLRenderTargets, _WebGLProperties);
		function WebGLRenderTargets(passId, gl, state, capabilities, textures, renderBuffers, constants) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._state = state;
			_this._capabilities = capabilities;
			_this._textures = textures;
			_this._renderBuffers = renderBuffers;
			_this._constants = constants;
			var that = _assertThisInitialized(_this);
			function onRenderTargetDispose(event) {
				var renderTarget = event.target;
				renderTarget.removeEventListener('dispose', onRenderTargetDispose);
				var renderTargetProperties = that.get(renderTarget);
				if (renderTargetProperties.__webglFramebuffer) {
					gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
				}
				that.delete(renderTarget);
				if (state.currentRenderTarget === renderTarget) {
					state.currentRenderTarget = null;
				}
			}
			_this._onRenderTargetDispose = onRenderTargetDispose;
			return _this;
		}
		var _proto = WebGLRenderTargets.prototype;
		_proto._setupRenderTarget = function _setupRenderTarget(renderTarget) {
			var gl = this._gl;
			var state = this._state;
			var textures = this._textures;
			var renderBuffers = this._renderBuffers;
			var capabilities = this._capabilities;
			var renderTargetProperties = this.get(renderTarget);
			renderTarget.addEventListener('dispose', this._onRenderTargetDispose);
			var glFrameBuffer = gl.createFramebuffer();
			var drawBuffers = [];
			renderTargetProperties.__webglFramebuffer = glFrameBuffer;
			renderTargetProperties.__drawBuffers = drawBuffers;
			if (renderTarget.isRenderTargetCube) {
				renderTargetProperties.__currentActiveCubeFace = renderTarget.activeCubeFace;
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
			for (var attachTarget in renderTarget._attachments) {
				var glAttachTarget = attachTargetToGL[attachTarget];
				if (glAttachTarget === gl.DEPTH_ATTACHMENT || glAttachTarget === gl.DEPTH_STENCIL_ATTACHMENT) {
					if (capabilities.version < 2 && !capabilities.getExtension('WEBGL_depth_texture')) {
						console.warn("WebGLRenderTargets: extension WEBGL_depth_texture is not support.");
					}
				} else if (glAttachTarget !== gl.STENCIL_ATTACHMENT) {
					drawBuffers.push(glAttachTarget);
				}
				var attachment = renderTarget._attachments[attachTarget];
				if (attachment.isTexture2D) {
					var textureProperties = textures.setTexture2D(attachment);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_2D, textureProperties.__webglTexture, 0);
					state.bindTexture(gl.TEXTURE_2D, null);
				} else if (attachment.isTextureCube) {
					var _textureProperties = textures.setTextureCube(attachment);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, _textureProperties.__webglTexture, 0);
					state.bindTexture(gl.TEXTURE_CUBE_MAP, null);
				} else {
					var renderBufferProperties = renderBuffers.setRenderBuffer(attachment);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachTarget, gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
				}
			}
			drawBuffers.sort(drawBufferSort);
			if (capabilities.version >= 2) {
				gl.drawBuffers(drawBuffers);
			} else if (capabilities.getExtension('WEBGL_draw_buffers')) {
				capabilities.getExtension('WEBGL_draw_buffers').drawBuffersWEBGL(drawBuffers);
			}
		};
		_proto.setRenderTarget = function setRenderTarget(renderTarget) {
			var gl = this._gl;
			var state = this._state;
			var textures = this._textures;
			var renderTargetProperties;
			if (state.currentRenderTarget !== renderTarget) {
				if (renderTarget.isRenderTargetBack) {
					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				} else {
					renderTargetProperties = this.get(renderTarget);
					if (renderTargetProperties.__webglFramebuffer === undefined) {
						this._setupRenderTarget(renderTarget);
					} else {
						gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
					}
				}
				state.currentRenderTarget = renderTarget;
			}
			if (renderTarget.isRenderTargetCube) {
				renderTargetProperties = this.get(renderTarget);
				var activeCubeFace = renderTarget.activeCubeFace;
				if (renderTargetProperties.__currentActiveCubeFace !== activeCubeFace) {
					for (var attachTarget in renderTarget._attachments) {
						var attachment = renderTarget._attachments[attachTarget];
						if (attachment.isTextureCube) {
							var textureProperties = textures.get(attachment);
							gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, 0);
						}
					}
					renderTargetProperties.__currentActiveCubeFace = activeCubeFace;
				}
			}
		};
		_proto.blitRenderTarget = function blitRenderTarget(read, draw, color, depth, stencil) {
			if (color === void 0) {
				color = true;
			}
			if (depth === void 0) {
				depth = true;
			}
			if (stencil === void 0) {
				stencil = true;
			}
			var gl = this._gl;
			var capabilities = this._capabilities;
			if (capabilities.version < 2) {
				console.warn("WebGLRenderTargets: blitFramebuffer not support by WebGL" + capabilities.version);
				return;
			}
			var readBuffer = this.get(read).__webglFramebuffer;
			var drawBuffer = this.get(draw).__webglFramebuffer;
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer);
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawBuffer);
			var mask = 0;
			if (color) mask |= gl.COLOR_BUFFER_BIT;
			if (depth) mask |= gl.DEPTH_BUFFER_BIT;
			if (stencil) mask |= gl.STENCIL_BUFFER_BIT;

			// gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);

			gl.blitFramebuffer(0, 0, read.width, read.height, 0, 0, draw.width, draw.height, mask, gl.NEAREST);
		};
		_proto.readRenderTargetPixels = function readRenderTargetPixels(x, y, width, height, buffer) {
			var gl = this._gl;
			var state = this._state;
			var constants = this._constants;
			var renderTarget = state.currentRenderTarget;
			if (renderTarget && renderTarget.texture) {
				if (x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height) {
					var glType = constants.getGLType(renderTarget.texture.type);
					var glFormat = constants.getGLFormat(renderTarget.texture.format);
					gl.readPixels(x, y, width, height, glFormat, glType, buffer);
				}
			} else {
				console.warn('WebGLRenderTargets.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not bound or texture not attached.');
			}
		};
		_proto.updateRenderTargetMipmap = function updateRenderTargetMipmap(renderTarget) {
			var gl = this._gl;
			var state = this._state;
			var capabilities = this._capabilities;
			var texture = renderTarget.texture;
			if (texture.generateMipmaps && texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR && (_isPowerOfTwo(renderTarget) || capabilities.version >= 2)) {
				var glTarget = gl.TEXTURE_2D;
				if (texture.isTextureCube) glTarget = gl.TEXTURE_CUBE_MAP;
				if (texture.isTexture3D) glTarget = gl.TEXTURE_3D;
				var webglTexture = this._textures.get(texture).__webglTexture;
				state.bindTexture(glTarget, webglTexture);
				gl.generateMipmap(glTarget);
				state.bindTexture(glTarget, null);
			}
		};
		return WebGLRenderTargets;
	}(WebGLProperties);
	var attachTargetToGL = (_attachTargetToGL = {}, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT0] = 0x8CE0, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT1] = 0x8CE1, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT2] = 0x8CE2, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT3] = 0x8CE3, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT4] = 0x8CE4, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT5] = 0x8CE5, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT6] = 0x8CE6, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT7] = 0x8CE7, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT8] = 0x8CE8, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT9] = 0x8CE9, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT10] = 0x8CEA, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT11] = 0x8CEB, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT12] = 0x8CEC, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT13] = 0x8CED, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT14] = 0x8CEE, _attachTargetToGL[ATTACHMENT.COLOR_ATTACHMENT15] = 0x8CEF, _attachTargetToGL[ATTACHMENT.DEPTH_ATTACHMENT] = 0x8D00, _attachTargetToGL[ATTACHMENT.STENCIL_ATTACHMENT] = 0x8D20, _attachTargetToGL[ATTACHMENT.DEPTH_STENCIL_ATTACHMENT] = 0x821A, _attachTargetToGL);
	function drawBufferSort(a, b) {
		return a - b;
	}
	function _isPowerOfTwo(renderTarget) {
		return isPowerOfTwo(renderTarget.width) && isPowerOfTwo(renderTarget.height);
	}

	var WebGLBuffers = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLBuffers, _WebGLProperties);
		function WebGLBuffers(passId, gl, capabilities) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._capabilities = capabilities;
			return _this;
		}
		var _proto = WebGLBuffers.prototype;
		_proto.setBuffer = function setBuffer(buffer, bufferType, vertexArrayBindings) {
			var bufferProperties = this.get(buffer);
			var needCreate = bufferProperties.glBuffer === undefined;
			if (!needCreate && bufferProperties.version === buffer.version) return;

			// Avoid polluting the binding state
			if (!!vertexArrayBindings) {
				vertexArrayBindings.reset();
			}
			if (needCreate || bufferProperties.__external) {
				// Because Buffer does not have a dispose interface at present,
				// when the version increases, the external is automatically closed
				this._createGLBuffer(bufferProperties, buffer, bufferType);
			} else {
				this._updateGLBuffer(bufferProperties.glBuffer, buffer, bufferType);
				bufferProperties.version = buffer.version;
			}
		};
		_proto.removeBuffer = function removeBuffer(buffer) {
			var gl = this._gl;
			var bufferProperties = this.get(buffer);
			if (bufferProperties.glBuffer && !bufferProperties.__external) {
				gl.deleteBuffer(bufferProperties.glBuffer);
			}
			this.delete(buffer);
		};
		_proto.setBufferExternal = function setBufferExternal(buffer, webglBuffer) {
			var gl = this._gl;
			var bufferProperties = this.get(buffer);
			if (!bufferProperties.__external) {
				if (bufferProperties.glBuffer) {
					gl.deleteBuffer(bufferProperties.glBuffer);
				}
			}
			var type = getBufferType(gl, buffer.array);
			bufferProperties.glBuffer = webglBuffer;
			bufferProperties.type = type;
			bufferProperties.bytesPerElement = buffer.array.BYTES_PER_ELEMENT;
			bufferProperties.version = buffer.version;
			bufferProperties.__external = true;
		};
		_proto._createGLBuffer = function _createGLBuffer(bufferProperties, buffer, bufferType) {
			var gl = this._gl;
			var array = buffer.array;
			var usage = buffer.usage;
			var glBuffer = gl.createBuffer();
			gl.bindBuffer(bufferType, glBuffer);
			gl.bufferData(bufferType, array, usage);
			buffer.onUploadCallback();
			var type = getBufferType(gl, array);
			bufferProperties.glBuffer = glBuffer;
			bufferProperties.type = type;
			bufferProperties.bytesPerElement = array.BYTES_PER_ELEMENT;
			bufferProperties.version = buffer.version;
			bufferProperties.__external = false;
		};
		_proto._updateGLBuffer = function _updateGLBuffer(glBuffer, buffer, bufferType) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var array = buffer.array;
			var updateRange = buffer.updateRange;
			gl.bindBuffer(bufferType, glBuffer);
			if (updateRange.count === -1) {
				// Not using update ranges
				gl.bufferSubData(bufferType, 0, array);
			} else {
				if (capabilities.version >= 2) {
					gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT, array, updateRange.offset, updateRange.count);
				} else {
					gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT, array.subarray(updateRange.offset, updateRange.offset + updateRange.count));
				}
				updateRange.count = -1; // reset range
			}
		};
		return WebGLBuffers;
	}(WebGLProperties);
	function getBufferType(gl, array) {
		var type;
		if (array instanceof Float32Array) {
			type = gl.FLOAT;
		} else if (array instanceof Float64Array) {
			console.warn('Unsupported data buffer format: Float64Array.');
		} else if (array instanceof Uint16Array) {
			type = gl.UNSIGNED_SHORT;
		} else if (array instanceof Int16Array) {
			type = gl.SHORT;
		} else if (array instanceof Uint32Array) {
			type = gl.UNSIGNED_INT;
		} else if (array instanceof Int32Array) {
			type = gl.INT;
		} else if (array instanceof Int8Array) {
			type = gl.BYTE;
		} else if (array instanceof Uint8Array) {
			type = gl.UNSIGNED_BYTE;
		} else {
			type = gl.FLOAT;
		}
		return type;
	}

	// This class handles buffer creation and updating for geometries.
	var WebGLGeometries = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLGeometries, _WebGLProperties);
		function WebGLGeometries(passId, gl, buffers, vertexArrayBindings) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._buffers = buffers;
			_this._vertexArrayBindings = vertexArrayBindings;
			var that = _assertThisInitialized(_this);
			function onGeometryDispose(event) {
				var geometry = event.target;
				var geometryProperties = that.get(geometry);
				geometry.removeEventListener('dispose', onGeometryDispose);
				if (geometry.index !== null) {
					buffers.removeBuffer(geometry.index.buffer);
				}
				for (var name in geometry.attributes) {
					buffers.removeBuffer(geometry.attributes[name].buffer);
				}
				for (var _name in geometry.morphAttributes) {
					var array = geometry.morphAttributes[_name];
					for (var i = 0, l = array.length; i < l; i++) {
						buffers.removeBuffer(array[i].buffer);
					}
				}
				vertexArrayBindings.releaseByGeometry(geometry);
				geometryProperties.created = false;
				that.delete(geometry);
			}
			_this._onGeometryDispose = onGeometryDispose;
			return _this;
		}
		var _proto = WebGLGeometries.prototype;
		_proto.setGeometry = function setGeometry(geometry) {
			var gl = this._gl;
			var buffers = this._buffers;
			var geometryProperties = this.get(geometry);
			if (!geometryProperties.created) {
				geometry.addEventListener('dispose', this._onGeometryDispose);
				geometryProperties.created = true;
			}
			if (geometry.index !== null) {
				buffers.setBuffer(geometry.index.buffer, gl.ELEMENT_ARRAY_BUFFER, this._vertexArrayBindings);
			}
			for (var name in geometry.attributes) {
				buffers.setBuffer(geometry.attributes[name].buffer, gl.ARRAY_BUFFER);
			}
			for (var _name2 in geometry.morphAttributes) {
				var array = geometry.morphAttributes[_name2];
				for (var i = 0, l = array.length; i < l; i++) {
					buffers.setBuffer(array[i].buffer, gl.ARRAY_BUFFER);
				}
			}
			return geometryProperties;
		};
		return WebGLGeometries;
	}(WebGLProperties);

	var WebGLMaterials = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLMaterials, _WebGLProperties);
		function WebGLMaterials(passId, programs, vertexArrayBindings) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			var that = _assertThisInitialized(_this);
			function onMaterialDispose(event) {
				var material = event.target;
				var materialProperties = that.get(material);
				material.removeEventListener('dispose', onMaterialDispose);
				var program = materialProperties.program;
				if (program !== undefined) {
					vertexArrayBindings.releaseByProgram(program);
					programs.releaseProgram(program);
				}
				that.delete(material);
			}
			_this._onMaterialDispose = onMaterialDispose;
			return _this;
		}
		var _proto = WebGLMaterials.prototype;
		_proto.setMaterial = function setMaterial(material) {
			var materialProperties = this.get(material);
			if (materialProperties.program === undefined) {
				material.addEventListener('dispose', this._onMaterialDispose);
			}

			// Set program in render pass

			return materialProperties;
		};
		return WebGLMaterials;
	}(WebGLProperties);

	var emptyString = "";
	var WebGLVertexArrayBindings = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLVertexArrayBindings, _WebGLProperties);
		function WebGLVertexArrayBindings(passId, gl, capabilities, buffers) {
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._capabilities = capabilities;
			_this._buffers = buffers;
			_this._isWebGL2 = capabilities.version >= 2;
			_this._vaoExt = capabilities.getExtension("OES_vertex_array_object");
			_this._vaoCache = {}; // save vao cache here for releaseByProgram() method
			_this._currentGeometryProgram = "";
			_this._currentVAO = null;
			return _this;
		}
		var _proto = WebGLVertexArrayBindings.prototype;
		_proto.setup = function setup(object, geometry, program) {
			if (object.morphTargetInfluences) {
				this.reset();
				this._setupVertexAttributes(program, geometry);
				this._currentGeometryProgram = emptyString;
			} else if (this._isWebGL2 || this._vaoExt) {
				// use VAO
				var geometryProperties = this.get(geometry);
				if (geometryProperties._vaos === undefined) {
					geometryProperties._vaos = {};
					this._vaoCache[geometry.id] = geometryProperties._vaos;
				}
				var vao = geometryProperties._vaos[program.id];
				if (!vao) {
					vao = geometryProperties._vaos[program.id] = {
						version: -1,
						object: this._createVAO()
					};
				}
				this._bindVAO(vao.object);
				if (vao.version !== geometry.version) {
					this._setupVertexAttributes(program, geometry);
					vao.version = geometry.version;
				}
			} else {
				var geometryProgram = program.id + "_" + geometry.id + "_" + geometry.version;
				if (geometryProgram !== this._currentGeometryProgram) {
					this._setupVertexAttributes(program, geometry);
					this._currentGeometryProgram = geometryProgram;
				}
			}
		};
		_proto.releaseByGeometry = function releaseByGeometry(geometry) {
			var geometryProperties = this.get(geometry);
			var vaos = geometryProperties._vaos;
			if (vaos) {
				for (var programId in vaos) {
					var vao = vaos[programId];
					if (!vao) continue;
					this._disposeVAO(vao.object);
				}
				delete geometryProperties._vaos;
				delete this._vaoCache[geometry.id];
			}
		};
		_proto.releaseByProgram = function releaseByProgram(program) {
			for (var geometryId in this._vaoCache) {
				var vaos = this._vaoCache[geometryId];
				if (vaos) {
					var vao = vaos[program.id];
					if (!vao) continue;
					this._disposeVAO(vao.object);
					delete vaos[program.id];
				}
			}
		};
		_proto.reset = function reset(force) {
			if (this._currentVAO !== null || force) {
				if (this._isWebGL2) {
					this._gl.bindVertexArray(null);
				} else if (this._vaoExt) {
					this._vaoExt.bindVertexArrayOES(null);
				}
				this._currentVAO = null;
			}
			if (this._currentGeometryProgram !== emptyString) {
				this._currentGeometryProgram = emptyString;
			}
		};
		_proto._createVAO = function _createVAO() {
			if (this._isWebGL2) {
				return this._gl.createVertexArray();
			} else if (this._vaoExt) {
				return this._vaoExt.createVertexArrayOES();
			}
			return null;
		};
		_proto._bindVAO = function _bindVAO(vao) {
			if (this._currentVAO !== vao) {
				if (this._isWebGL2) {
					this._gl.bindVertexArray(vao);
				} else if (this._vaoExt) {
					this._vaoExt.bindVertexArrayOES(vao);
				}
				this._currentVAO = vao;
			}
		};
		_proto._disposeVAO = function _disposeVAO(vao) {
			if (this._isWebGL2) {
				this._gl.deleteVertexArray(vao);
			} else if (this._vaoExt) {
				this._vaoExt.deleteVertexArrayOES(vao);
			}
		};
		_proto._setupVertexAttributes = function _setupVertexAttributes(program, geometry) {
			var gl = this._gl;
			var isWebGL2 = this._isWebGL2;
			var attributes = program.getAttributes();
			var capabilities = this._capabilities;
			var buffers = this._buffers;
			for (var key in attributes) {
				var programAttribute = attributes[key];
				var geometryAttribute = geometry.getAttribute(key);
				if (geometryAttribute) {
					var size = geometryAttribute.size;
					if (programAttribute.count !== size) {
						console.warn("WebGLVertexArrayBindings: attribute " + key + " size not match! " + programAttribute.count + " : " + size);
					}
					var buffer = geometryAttribute.buffer;
					var bufferProperties = buffers.get(buffer);
					var type = bufferProperties.type;
					if (programAttribute.format !== type) ;
					for (var i = 0, l = programAttribute.locationSize; i < l; i++) {
						gl.enableVertexAttribArray(programAttribute.location + i);
					}
					if (geometryAttribute.divisor > 0) {
						// use instancing
						for (var _i = 0, _l = programAttribute.locationSize; _i < _l; _i++) {
							if (isWebGL2) {
								gl.vertexAttribDivisor(programAttribute.location + _i, geometryAttribute.divisor);
							} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
								capabilities.getExtension('ANGLE_instanced_arrays').vertexAttribDivisorANGLE(programAttribute.location + _i, geometryAttribute.divisor);
							} else {
								console.warn("vertexAttribDivisor not supported");
							}
						}
					}
					var bytesPerElement = bufferProperties.bytesPerElement;
					var glBuffer = bufferProperties.glBuffer;
					var stride = buffer.stride;
					var offset = geometryAttribute.offset;
					var normalized = geometryAttribute.normalized;
					gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
					if (programAttribute.count === stride && programAttribute.locationSize === 1) {
						gl.vertexAttribPointer(programAttribute.location, programAttribute.count, type, normalized, 0, 0);
					} else {
						for (var _i2 = 0; _i2 < programAttribute.locationSize; _i2++) {
							gl.vertexAttribPointer(programAttribute.location + _i2, programAttribute.count / programAttribute.locationSize, type, normalized, bytesPerElement * stride, bytesPerElement * (offset + programAttribute.count / programAttribute.locationSize * _i2));
						}
					}
				}
			}

			// bind index if could
			if (geometry.index) {
				var indexBufferProperties = buffers.get(geometry.index.buffer);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferProperties.glBuffer);
			}
		};
		return WebGLVertexArrayBindings;
	}(WebGLProperties);

	var WebGLQueries = /*#__PURE__*/function (_WebGLProperties) {
		_inheritsLoose(WebGLQueries, _WebGLProperties);
		function WebGLQueries(passId, gl, capabilities) {
			var _this$_typeToGL;
			var _this;
			_this = _WebGLProperties.call(this, passId) || this;
			_this._gl = gl;
			_this._capabilities = capabilities;
			var timerQuery = capabilities.timerQuery;
			var that = _assertThisInitialized(_this);
			var onQueryDispose = function onQueryDispose(event) {
				var query = event.target;
				var queryProperties = that.get(query);
				query.removeEventListener('dispose', onQueryDispose);
				if (queryProperties._webglQuery) {
					if (capabilities.version > 1) {
						gl.deleteQuery(queryProperties._webglQuery);
					} else {
						timerQuery.deleteQueryEXT(queryProperties._webglQuery);
					}
				}
				that.delete(query);
			};
			_this._onQueryDispose = onQueryDispose;
			_this._typeToGL = (_this$_typeToGL = {}, _this$_typeToGL[QUERY_TYPE.ANY_SAMPLES_PASSED] = 0x8C2F, _this$_typeToGL[QUERY_TYPE.ANY_SAMPLES_PASSED_CONSERVATIVE] = 0x8D6A, _this$_typeToGL[QUERY_TYPE.TIME_ELAPSED] = 0x88BF, _this$_typeToGL);
			return _this;
		}
		var _proto = WebGLQueries.prototype;
		_proto._get = function _get(query) {
			var capabilities = this._capabilities;
			var queryProperties = this.get(query);
			if (queryProperties._webglQuery === undefined) {
				query.addEventListener('dispose', this._onQueryDispose);
				queryProperties._webglQuery = capabilities.version > 1 ? this._gl.createQuery() : capabilities.timerQuery.createQueryEXT();
				queryProperties._target = null;
				queryProperties._result = null;
			}
			return queryProperties;
		};
		_proto.begin = function begin(query, target) {
			var capabilities = this._capabilities;
			var typeToGL = this._typeToGL;
			var queryProperties = this._get(query);
			if (capabilities.version > 1) {
				this._gl.beginQuery(typeToGL[target], queryProperties._webglQuery);
			} else {
				capabilities.timerQuery.beginQueryEXT(typeToGL[target], queryProperties._webglQuery);
			}
			queryProperties._target = target;
			queryProperties._result = null; // clear the last result.
		};
		_proto.end = function end(query) {
			var capabilities = this._capabilities;
			var typeToGL = this._typeToGL;
			var queryProperties = this._get(query);
			if (capabilities.version > 1) {
				this._gl.endQuery(typeToGL[queryProperties._target]);
			} else {
				capabilities.timerQuery.endQueryEXT(typeToGL[queryProperties._target]);
			}
		};
		_proto.counter = function counter(query) {
			var timerQuery = this._capabilities.timerQuery;
			var queryProperties = this._get(query);
			timerQuery.queryCounterEXT(queryProperties._webglQuery, timerQuery.TIMESTAMP_EXT);
			queryProperties._target = timerQuery.TIMESTAMP_EXT;
			queryProperties._result = null; // clear the last result.
		};
		_proto.isResultAvailable = function isResultAvailable(query) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var timerQuery = capabilities.timerQuery;
			var queryProperties = this._get(query);
			var available;
			if (capabilities.version > 1) {
				available = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT_AVAILABLE);
			} else {
				available = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_AVAILABLE);
			}
			return available;
		};
		_proto.isTimerDisjoint = function isTimerDisjoint() {
			return this._gl.getParameter(this._capabilities.timerQuery.GPU_DISJOINT_EXT);
		};
		_proto.getResult = function getResult(query) {
			var gl = this._gl;
			var capabilities = this._capabilities;
			var timerQuery = capabilities.timerQuery;
			var queryProperties = this._get(query);
			if (queryProperties._result === null) {
				if (capabilities.version > 1) {
					queryProperties._result = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT);
				} else {
					queryProperties._result = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_EXT);
				}
			}
			return queryProperties._result;
		};
		return WebGLQueries;
	}(WebGLProperties);

	var helpVector4 = new Vector4();
	var helpMatrix4 = new Matrix4();
	var influencesList = new WeakMap();
	var morphInfluences = new Float32Array(8);
	var _clippingPlanesData = new Float32Array([]);
	function defaultGetGeometry(renderable) {
		return renderable.geometry;
	}
	function defaultGetMaterial(renderable) {
		return renderable.material;
	}
	function defaultIfRender(renderable) {
		return true;
	}
	function noop() {}
	var _renderPassId = 0;

	/**
	 * WebGL Render Pass
	 * @memberof t3d
	 */
	var WebGLRenderPass = /*#__PURE__*/function () {
		/**
		 * @param {WebGLRenderingContext} gl
		 */
		function WebGLRenderPass(gl) {
			var id = _renderPassId++;
			var capabilities = new WebGLCapabilities(gl);
			var constants = new WebGLConstants(gl, capabilities);
			var state = new WebGLState(gl, capabilities);
			var textures = new WebGLTextures(id, gl, state, capabilities, constants);
			var renderBuffers = new WebGLRenderBuffers(id, gl, capabilities, constants);
			var renderTargets = new WebGLRenderTargets(id, gl, state, capabilities, textures, renderBuffers, constants);
			var buffers = new WebGLBuffers(id, gl, capabilities);
			var vertexArrayBindings = new WebGLVertexArrayBindings(id, gl, capabilities, buffers);
			var geometries = new WebGLGeometries(id, gl, buffers, vertexArrayBindings);
			var programs = new WebGLPrograms(gl, state, capabilities);
			var materials = new WebGLMaterials(id, programs, vertexArrayBindings);
			var queries = new WebGLQueries(id, gl, capabilities);
			this.id = id;
			this.gl = gl;

			/**
			 * An object containing details about the capabilities of the current RenderingContext.
			 * @type {t3d.WebGLCapabilities}
			 */
			this.capabilities = capabilities;
			this._textures = textures;
			this._renderBuffers = renderBuffers;
			this._renderTargets = renderTargets;
			this._buffers = buffers;
			this._geometries = geometries;
			this._programs = programs;
			this._materials = materials;
			this._state = state;
			this._vertexArrayBindings = vertexArrayBindings;
			this._queries = queries;
		}

		/**
		 * Clear buffers.
		 * @param {Boolean} [color=false]
		 * @param {Boolean} [depth=false]
		 * @param {Boolean} [stencil=false]
		 */
		var _proto = WebGLRenderPass.prototype;
		_proto.clear = function clear(color, depth, stencil) {
			var gl = this.gl;
			var bits = 0;
			if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
			if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
			if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;
			if (bits > 0) {
				// Prevent warning when bits is equal to zero
				gl.clear(bits);
			}
		}

		/**
		 * Sets the clear color and opacity.
		 * @param {Number} r
		 * @param {Number} g
		 * @param {Number} b
		 * @param {Number} a
		 * @param {Number} premultipliedAlpha
		 */;
		_proto.setClearColor = function setClearColor(r, g, b, a, premultipliedAlpha) {
			this._state.colorBuffer.setClear(r, g, b, a, premultipliedAlpha);
		}

		/**
		 * Returns a Vector4 instance with the current clear color and alpha.
		 * Note: Do not modify the value of Vector4, it is read-only.
		 * @return {t3d.Vector4}
		 */;
		_proto.getClearColor = function getClearColor() {
			return this._state.colorBuffer.getClear();
		}

		/**
		 * This method sets the active rendertarget.
		 * @param {t3d.RenderTargetBase} renderTarget The renderTarget that needs to be activated.
		 */;
		_proto.setRenderTarget = function setRenderTarget(renderTarget) {
			this._renderTargets.setRenderTarget(renderTarget);
		}

		/**
		 * Returns the current RenderTarget if there are; returns null otherwise.
		 * @return {t3d.RenderTargetBase|Null}
		 */;
		_proto.getRenderTarget = function getRenderTarget() {
			return this._state.currentRenderTarget;
		}

		/**
		 * Copy a frame buffer to another.
		 * This copy process can be used to perform multi-sampling (MSAA).
		 * @param {t3d.RenderTargetBase} read
		 * @param {t3d.RenderTargetBase} draw
		 * @param {Boolean} [color=true]
		 * @param {Boolean} [depth=true]
		 * @param {Boolean} [stencil=true]
		 */;
		_proto.blitRenderTarget = function blitRenderTarget(read, draw, color, depth, stencil) {
			if (color === void 0) {
				color = true;
			}
			if (depth === void 0) {
				depth = true;
			}
			if (stencil === void 0) {
				stencil = true;
			}
			this._renderTargets.blitRenderTarget(read, draw, color, depth, stencil);
		}

		/**
		 * Reads the pixel data from the current renderTarget into the buffer you pass in.
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} width
		 * @param {Number} height
		 * @param {TypedArray} buffer Uint8Array is the only destination type supported in all cases, other types are renderTarget and platform dependent.
		 */;
		_proto.readRenderTargetPixels = function readRenderTargetPixels(x, y, width, height, buffer) {
			this._renderTargets.readRenderTargetPixels(x, y, width, height, buffer);
		}

		/**
		 * Generate mipmaps for the render target you pass in.
		 * @param {t3d.RenderTargetBase} renderTarget
		 */;
		_proto.updateRenderTargetMipmap = function updateRenderTargetMipmap(renderTarget) {
			this._renderTargets.updateRenderTargetMipmap(renderTarget);
		}

		/**
		 * Bind webglTexture to t3d's texture.
		 * @param {t3d.TextureBase} texture
		 * @param {WebGLTexture} webglTexture
		 */;
		_proto.setTextureExternal = function setTextureExternal(texture, webglTexture) {
			this._textures.setTextureExternal(texture, webglTexture);
		}

		/**
		 * Bind webglRenderbuffer to t3d's renderBuffer.
		 * @param {t3d.RenderBuffer} renderBuffer
		 * @param {WebGLRenderbuffer} webglRenderbuffer
		 */;
		_proto.setRenderBufferExternal = function setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
			this._renderBuffers.setRenderBufferExternal(renderBuffer, webglRenderbuffer);
		}

		/**
		 * Bind webglBuffer to t3d's buffer.
		 * @param {t3d.Buffer} buffer
		 * @param {WebGLBuffer} webglBuffer
		 */;
		_proto.setBufferExternal = function setBufferExternal(buffer, webglBuffer) {
			this._buffers.setBufferExternal(buffer, webglBuffer);
		}

		/**
		 * Reset vertex array object bindings.
		 * @param {Boolean} [force=false]
		 */;
		_proto.resetVertexArrayBindings = function resetVertexArrayBindings(force) {
			this._vertexArrayBindings.reset(force);
		}

		/**
		 * Reset all render states.
		 */;
		_proto.resetState = function resetState() {
			this._state.reset();
		}

		/**
		 * Begin a query instance.
		 * @param {t3d.Query} query
		 * @param {t3d.QUERY_TYPE} target
		 */;
		_proto.beginQuery = function beginQuery(query, target) {
			this._queries.begin(query, target);
		}

		/**
		 * End a query instance.
		 * @param {t3d.Query} query
		 */;
		_proto.endQuery = function endQuery(query) {
			this._queries.end(query);
		}

		/**
		 * Records the current time into the corresponding query object.
		 * @param {t3d.Query} query
		 */;
		_proto.queryCounter = function queryCounter(query) {
			this._queries.counter(query);
		}

		/**
		 * Returns true if the timer query was disjoint, indicating that timing results are invalid.
		 * This is rare and might occur, for example, if the GPU was throttled while timing.
		 * @param {t3d.Query} query
		 * @return {Boolean} Returns true if the timer query was disjoint.
		 */;
		_proto.isTimerQueryDisjoint = function isTimerQueryDisjoint(query) {
			return this._queries.isTimerDisjoint(query);
		}

		/**
		 * Check if the query result is available.
		 * @param {t3d.Query} query
		 * @return {Boolean} If query result is available.
		 */;
		_proto.isQueryResultAvailable = function isQueryResultAvailable(query) {
			return this._queries.isResultAvailable(query);
		}

		/**
		 * Get the query result.
		 * @param {t3d.Query} query
		 * @return {Number} The query result.
		 */;
		_proto.getQueryResult = function getQueryResult(query) {
			return this._queries.getResult(query);
		}

		/**
		 * Get the query result.
		 * @param {Object} renderable - The renderable item.
		 * @param {t3d.RenderStates} renderStates - The render states.
		 * @param {Object} [options=] - The render options.
		 */;
		_proto.renderRenderableItem = function renderRenderableItem(renderable, renderStates, options) {
			var state = this._state;
			var capabilities = this.capabilities;
			var vertexArrayBindings = this._vertexArrayBindings;
			var textures = this._textures;
			var getGeometry = options.getGeometry || defaultGetGeometry;
			var getMaterial = options.getMaterial || defaultGetMaterial;
			var beforeRender = options.beforeRender || noop;
			var afterRender = options.afterRender || noop;
			var ifRender = options.ifRender || defaultIfRender;
			var renderInfo = options.renderInfo;
			var sceneData = renderStates.scene;
			var lightData = renderStates.lights;
			var cameraData = renderStates.camera;
			var currentRenderTarget = state.currentRenderTarget;
			if (!ifRender(renderable)) {
				return;
			}
			var object = renderable.object;
			var material = getMaterial.call(this, renderable);
			var geometry = getGeometry.call(this, renderable);
			var group = renderable.group;
			var fog = material.fog ? sceneData.fog : null;
			var envMap = material.envMap !== undefined ? material.envMap || sceneData.environment : null;
			var clippingPlanesData = sceneData.clippingPlanesData;
			var numClippingPlanes = sceneData.numClippingPlanes;
			if (material.clippingPlanes && material.clippingPlanes.length > 0) {
				if (_clippingPlanesData.length < material.clippingPlanes.length * 4) {
					_clippingPlanesData = new Float32Array(material.clippingPlanes.length * 4);
				}
				clippingPlanesData = sceneData.setClippingPlanesData(material.clippingPlanes, _clippingPlanesData);
				numClippingPlanes = material.clippingPlanes.length;
			}
			object.onBeforeRender(renderable, material);
			beforeRender.call(this, renderable, material);

			// Check material version

			var materialProperties = this._materials.setMaterial(material);
			if (material.needsUpdate === false) {
				if (materialProperties.program === undefined) {
					material.needsUpdate = true;
				} else if (materialProperties.fog !== fog) {
					material.needsUpdate = true;
				} else if (materialProperties.envMap !== envMap) {
					material.needsUpdate = true;
				} else if (materialProperties.numClippingPlanes !== numClippingPlanes) {
					material.needsUpdate = true;
				} else if (materialProperties.logarithmicDepthBuffer !== sceneData.logarithmicDepthBuffer) {
					material.needsUpdate = true;
				} else if (renderStates.outputEncoding !== materialProperties.outputEncoding || renderStates.gammaFactor !== materialProperties.gammaFactor) {
					material.needsUpdate = true;
				} else if (capabilities.version > 1 && sceneData.disableShadowSampler !== materialProperties.disableShadowSampler) {
					material.needsUpdate = true;
				} else {
					var acceptLight = material.acceptLight && lightData.totalNum > 0;
					if (acceptLight !== materialProperties.acceptLight) {
						material.needsUpdate = true;
					} else if (acceptLight) {
						if (!lightData.hash.compare(materialProperties.lightsHash) || object.receiveShadow !== materialProperties.receiveShadow || object.shadowType !== materialProperties.shadowType) {
							material.needsUpdate = true;
						}
					}
				}
			}

			// Update program if needed.

			if (material.needsUpdate) {
				var oldProgram = materialProperties.program;
				materialProperties.program = this._programs.getProgram(material, object, renderStates, true);
				if (oldProgram) {
					// release after new program is created.
					vertexArrayBindings.releaseByProgram(oldProgram);
					this._programs.releaseProgram(oldProgram);
				}
				materialProperties.fog = fog;
				materialProperties.envMap = envMap;
				materialProperties.logarithmicDepthBuffer = sceneData.logarithmicDepthBuffer;
				materialProperties.acceptLight = material.acceptLight;
				materialProperties.lightsHash = lightData.hash.copyTo(materialProperties.lightsHash);
				materialProperties.receiveShadow = object.receiveShadow;
				materialProperties.shadowType = object.shadowType;
				materialProperties.numClippingPlanes = numClippingPlanes;
				materialProperties.outputEncoding = renderStates.outputEncoding;
				materialProperties.gammaFactor = renderStates.gammaFactor;
				materialProperties.disableShadowSampler = sceneData.disableShadowSampler;
				material.needsUpdate = false;
			}
			var program = materialProperties.program;
			if (program.program === undefined) return;
			state.setProgram(program);
			this._geometries.setGeometry(geometry);

			// update morph targets
			if (object.morphTargetInfluences) {
				this._updateMorphtargets(object, geometry, program);
			}
			vertexArrayBindings.setup(object, geometry, program);
			var refreshLights = false;
			if (program.lightId !== lightData.id || program.lightVersion !== lightData.version) {
				refreshLights = true;
				program.lightId = lightData.id;
				program.lightVersion = lightData.version;
			}
			var refreshCamera = false;
			if (program.cameraId !== cameraData.id || program.cameraVersion !== cameraData.version) {
				refreshCamera = true;
				program.cameraId = cameraData.id;
				program.cameraVersion = cameraData.version;
			}
			var refreshScene = false;
			if (program.sceneId !== sceneData.id || program.sceneVersion !== sceneData.version) {
				refreshScene = true;
				program.sceneId = sceneData.id;
				program.sceneVersion = sceneData.version;
			}
			var uniforms = program.getUniforms();

			// upload light uniforms
			if (material.acceptLight) {
				this._uploadLights(uniforms, lightData, sceneData.disableShadowSampler, refreshLights);
			}

			// upload bone matrices
			if (object.isSkinnedMesh) {
				this._uploadSkeleton(uniforms, object, sceneData);
			}

			// upload other uniforms
			for (var n = 0, ll = uniforms.seq.length; n < ll; n++) {
				var uniform = uniforms.seq[n];
				var key = uniform.id;
				var internalGroup = uniform.internalGroup;

				// upload custom uniforms
				if (material.uniforms && material.uniforms[key] !== undefined) {
					uniform.set(material.uniforms[key], textures);
					continue;
				}

				// u_Model: always upload this matrix
				if (internalGroup === 1) {
					var modelMatrix = object.worldMatrix;
					if (sceneData.useAnchorMatrix) {
						modelMatrix = helpMatrix4.copy(modelMatrix).premultiply(sceneData.anchorMatrixInverse);
					}
					uniform.set(modelMatrix.elements);
					continue;
				}

				// uniforms about camera data
				if (internalGroup === 2 && refreshCamera) {
					uniform.internalFun(cameraData);
					continue;
				}

				// uniforms about scene data
				if (internalGroup === 3 && refreshScene) {
					uniform.internalFun(sceneData);
					continue;
				}

				// uniforms about material
				if (internalGroup === 4) {
					uniform.internalFun(material, textures);
					continue;
				}

				// other internal uniforms
				if (internalGroup === 5) {
					if (key === 'u_PointScale') {
						var scale = currentRenderTarget.height * 0.5; // three.js do this
						uniform.set(scale);
					} else {
						uniform.internalFun(envMap, textures);
					}
					continue;
				}
				if (key === 'clippingPlanes') {
					uniform.set(clippingPlanesData);
				}
			}
			var frontFaceCW = object.worldMatrix.determinant() < 0;
			state.setMaterial(material, frontFaceCW);
			var viewport = helpVector4.set(currentRenderTarget.width, currentRenderTarget.height, currentRenderTarget.width, currentRenderTarget.height).multiply(cameraData.rect);
			viewport.z -= viewport.x;
			viewport.w -= viewport.y;
			viewport.x = Math.floor(viewport.x);
			viewport.y = Math.floor(viewport.y);
			viewport.z = Math.floor(viewport.z);
			viewport.w = Math.floor(viewport.w);
			state.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
			this._draw(geometry, material, group, renderInfo);
			textures.resetTextureUnits();

			// Ensure depth buffer writing is enabled so it can be cleared on next render

			state.depthBuffer.setTest(true);
			state.depthBuffer.setMask(true);
			state.colorBuffer.setMask(true);
			afterRender(renderable);
			object.onAfterRender(renderable);
		};
		_proto._uploadLights = function _uploadLights(uniforms, lights, disableShadowSampler, refresh) {
			var textures = this._textures;
			if (lights.useAmbient && refresh) {
				uniforms.set("u_AmbientLightColor", lights.ambient);
			}
			if (lights.useSphericalHarmonics && refresh) {
				uniforms.set("u_SphericalHarmonicsLightData", lights.sh);
			}
			if (lights.hemisNum > 0 && refresh) {
				uniforms.set("u_Hemi", lights.hemisphere);
			}
			if (lights.directsNum > 0) {
				if (refresh) uniforms.set("u_Directional", lights.directional);
				if (lights.directShadowNum > 0) {
					if (refresh) uniforms.set("u_DirectionalShadow", lights.directionalShadow);
					if (uniforms.has("directionalShadowMap")) {
						if (this.capabilities.version >= 2 && !disableShadowSampler) {
							uniforms.set("directionalShadowMap", lights.directionalShadowDepthMap, textures);
						} else {
							uniforms.set("directionalShadowMap", lights.directionalShadowMap, textures);
						}
						uniforms.set("directionalShadowMatrix", lights.directionalShadowMatrix);
					}
					if (uniforms.has("directionalDepthMap")) {
						uniforms.set("directionalDepthMap", lights.directionalShadowMap, textures);
					}
				}
			}
			if (lights.pointsNum > 0) {
				if (refresh) uniforms.set("u_Point", lights.point);
				if (lights.pointShadowNum > 0) {
					if (refresh) uniforms.set("u_PointShadow", lights.pointShadow);
					if (uniforms.has("pointShadowMap")) {
						uniforms.set("pointShadowMap", lights.pointShadowMap, textures);
						uniforms.set("pointShadowMatrix", lights.pointShadowMatrix);
					}
				}
			}
			if (lights.spotsNum > 0) {
				if (refresh) uniforms.set("u_Spot", lights.spot);
				if (lights.spotShadowNum > 0) {
					if (refresh) uniforms.set("u_SpotShadow", lights.spotShadow);
					if (uniforms.has("spotShadowMap")) {
						if (this.capabilities.version >= 2 && !disableShadowSampler) {
							uniforms.set("spotShadowMap", lights.spotShadowDepthMap, textures);
						} else {
							uniforms.set("spotShadowMap", lights.spotShadowMap, textures);
						}
						uniforms.set("spotShadowMatrix", lights.spotShadowMatrix);
					}
					if (uniforms.has("spotDepthMap")) {
						uniforms.set("spotDepthMap", lights.spotShadowMap, textures);
					}
				}
			}
		};
		_proto._uploadSkeleton = function _uploadSkeleton(uniforms, object, sceneData) {
			if (object.skeleton && object.skeleton.bones.length > 0) {
				var skeleton = object.skeleton;
				var capabilities = this.capabilities;
				if (capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2)) {
					if (skeleton.boneTexture === undefined) {
						skeleton.generateBoneTexture(capabilities.version >= 2);
					}
					uniforms.set("boneTexture", skeleton.boneTexture, this._textures);
					uniforms.set("boneTextureSize", skeleton.boneTexture.image.width);
				} else {
					uniforms.set("boneMatrices", skeleton.boneMatrices);
				}
				uniforms.set("bindMatrix", object.bindMatrix.elements);
				helpMatrix4.copy(object.bindMatrixInverse);
				if (sceneData.useAnchorMatrix) {
					helpMatrix4.multiply(sceneData.anchorMatrix); // convert to anchor space
				}

				uniforms.set("bindMatrixInverse", helpMatrix4.elements);
			}
		};
		_proto._updateMorphtargets = function _updateMorphtargets(object, geometry, program) {
			var objectInfluences = object.morphTargetInfluences;
			if (!influencesList.has(geometry)) {
				influencesList.set(geometry, objectInfluences.slice(0));
			}
			var morphTargets = geometry.morphAttributes.position;
			var morphNormals = geometry.morphAttributes.normal;

			// Remove current morphAttributes

			var influences = influencesList.get(geometry);
			for (var i = 0; i < influences.length; i++) {
				var influence = influences[i];
				if (influence !== 0) {
					if (morphTargets) geometry.removeAttribute('morphTarget' + i);
					if (morphNormals) geometry.removeAttribute('morphNormal' + i);
				}
			}

			// Collect influences

			for (var _i = 0; _i < objectInfluences.length; _i++) {
				influences[_i] = objectInfluences[_i];
			}
			influences.length = objectInfluences.length;

			// Add morphAttributes

			var count = 0;
			for (var _i2 = 0; _i2 < influences.length; _i2++) {
				var _influence = influences[_i2];
				if (_influence > 0) {
					if (morphTargets) geometry.addAttribute('morphTarget' + count, morphTargets[_i2]);
					if (morphNormals) geometry.addAttribute('morphNormal' + count, morphNormals[_i2]);
					morphInfluences[count] = _influence;
					count++;
				}
			}
			for (; count < 8; count++) {
				morphInfluences[count] = 0;
			}
			program.getUniforms().set('morphTargetInfluences', morphInfluences);
		};
		_proto._draw = function _draw(geometry, material, group, renderInfo) {
			var gl = this.gl;
			var capabilities = this.capabilities;
			var buffers = this._buffers;
			var useIndexBuffer = geometry.index !== null;
			var position = geometry.getAttribute("a_Position");
			var drawStart = 0;
			var drawCount = Infinity;
			if (useIndexBuffer) {
				drawCount = geometry.index.buffer.count;
			} else if (position) {
				drawCount = position.buffer.count;
			}
			var groupStart = group ? group.start : 0;
			var groupCount = group ? group.count : Infinity;
			drawStart = Math.max(drawStart, groupStart);
			drawCount = Math.min(drawCount, groupCount);
			if (drawCount < 0 || drawCount === Infinity) return;
			var instanceCount = geometry.instanceCount;
			var useInstancing = instanceCount >= 0;
			if (useIndexBuffer) {
				var indexBufferProperties = buffers.get(geometry.index.buffer);
				var bytesPerElement = indexBufferProperties.bytesPerElement;
				var type = indexBufferProperties.type;
				if (type === gl.UNSIGNED_INT) {
					if (capabilities.version < 2 && !capabilities.getExtension('OES_element_index_uint')) {
						console.warn("draw elements type not support UNSIGNED_INT!");
					}
				}
				if (useInstancing) {
					if (instanceCount > 0) {
						if (capabilities.version >= 2) {
							gl.drawElementsInstanced(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
						} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
							capabilities.getExtension('ANGLE_instanced_arrays').drawElementsInstancedANGLE(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
						} else {
							console.warn("no support instanced draw.");
							return;
						}
					}
				} else {
					gl.drawElements(material.drawMode, drawCount, type, drawStart * bytesPerElement);
				}
			} else {
				if (useInstancing) {
					if (instanceCount > 0) {
						if (capabilities.version >= 2) {
							gl.drawArraysInstanced(material.drawMode, drawStart, drawCount, instanceCount);
						} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
							capabilities.getExtension('ANGLE_instanced_arrays').drawArraysInstancedANGLE(material.drawMode, drawStart, drawCount, instanceCount);
						} else {
							console.warn("no support instanced draw.");
							return;
						}
					}
				} else {
					gl.drawArrays(material.drawMode, drawStart, drawCount);
				}
			}
			if (!!renderInfo) {
				renderInfo.update(drawCount, material.drawMode, instanceCount < 0 ? 1 : instanceCount);
			}
		};
		return WebGLRenderPass;
	}();

	/**
	 * Graph renderer.
	 * @memberof t3d
	 */
	var Renderer = /*#__PURE__*/function () {
		/**
				* @param {WebGLRenderingContext|WebGPURenderingContext} context - The Rendering Context privided by canvas. Only support WebGLRenderingContext for now.
				*/
		function Renderer(context) {
			/**
						 * Render Pass provides the core rendering method.
						 * @type {t3d.WebGLRenderPass|t3d.WebGPURenderPass}
						 */
			this.renderPass = new WebGLRenderPass(context);
		}

		/**
				* Render a scene.
				* This method will render all layers in scene's RenderQueue by default.
				* If you need a customized rendering process, it is recommended to use Renderer.renderRenderableList
				* @param {t3d.Scene} scene
				* @param {t3d.Camera} camera
				*/
		var _proto = Renderer.prototype;
		_proto.renderScene = function renderScene(scene, camera) {
			var renderStates = scene.getRenderStates(camera);
			var renderQueue = scene.getRenderQueue(camera);
			var renderQueueLayer;
			for (var i = 0, l = renderQueue.layerList.length; i < l; i++) {
				renderQueueLayer = renderQueue.layerList[i];
				this.renderRenderableList(renderQueueLayer.opaque, renderStates);
				this.renderRenderableList(renderQueueLayer.transparent, renderStates);
			}
		}

		/**
				* Render a single renderable list in camera in sequence.
				* @param {Array} renderables - Array of renderables.
				* @param {t3d.RenderStates} renderStates - Render states.
				* @param {Object} [options=] - The options for this render.
				* @param {Function} [options.getGeometry=] - Get renderable geometry.
		 * @param {Function} [options.getMaterial=] - Get renderable material.
				* @param {Function} [options.beforeRender=] - Before render each renderable.
				* @param {Function} [options.afterRender=] - After render each renderable
				* @param {Function} [options.ifRender=] - If render the renderable.
		 * @param {t3d.RenderInfo} [options.renderInfo=] - Render info for collect information.
				*/;
		_proto.renderRenderableList = function renderRenderableList(renderables, renderStates, options) {
			if (options === void 0) {
				options = {};
			}
			var renderPass = this.renderPass;
			for (var i = 0, l = renderables.length; i < l; i++) {
				renderPass.renderRenderableItem(renderables[i], renderStates, options);
			}
		};
		return Renderer;
	}();

	/**
	 * Render info collector.
	 * If you want to collect information about the rendering of this frame,
	 * pass an instance of RenderInfo to RenderOption when calling renderRenderableList.
	 * @memberof t3d
	 */
	var RenderInfo = function RenderInfo() {
		var render = {
			calls: 0,
			triangles: 0,
			lines: 0,
			points: 0
		};

		// A series of function use for collect information.
		var updateFuncs = [function updatePoints(instanceCount, count) {
			render.points += instanceCount * count;
		}, function updateLines(instanceCount, count) {
			render.lines += instanceCount * (count / 2);
		}, function updateLineLoop(instanceCount, count) {
			render.lines += instanceCount * count;
		}, function updateLineStrip(instanceCount, count) {
			render.lines += instanceCount * (count - 1);
		}, function updateTriangles(instanceCount, count) {
			render.triangles += instanceCount * (count / 3);
		}, function updateTriangleStrip(instanceCount, count) {
			render.triangles += instanceCount * (count - 2);
		}, function updateTriangleFan(instanceCount, count) {
			render.triangles += instanceCount * (count - 2);
		}];

		/**
		 * Method of update render info.
		 * This method will be executed after each draw.
		 * @private
		 * @param {Number} count
		 * @param {t3d.DRAW_MODE} mode
		 * @param {Number} instanceCount
		 */
		this.update = function (count, mode, instanceCount) {
			render.calls++;
			updateFuncs[mode](instanceCount, count);
		};

		/**
		 * Reset the render info.
		 * Call this method whenever you have finished to render a single frame.
		 */
		this.reset = function () {
			render.calls = 0;
			render.triangles = 0;
			render.lines = 0;
			render.points = 0;
		};

		/**
					 * A series of statistical information of rendering process, include calls, triangles, lines and points.
					 * @type {Object}
					 */
		this.render = render;
	};

	/**
	 * Linear fog.
	 * @memberof t3d
	 */
	var Fog =
	/**
	 * @param {Number} [color=0x000000] - The color of the fog.
	 * @param {Number} [near=1] - The near clip of the fog.
	 * @param {Number} [far=1000] - The far clip of the fog.
	 */
	function Fog(color, near, far) {
		if (color === void 0) {
			color = 0x000000;
		}
		if (near === void 0) {
			near = 1;
		}
		if (far === void 0) {
			far = 1000;
		}
		/**
		 * The color of the fog.
		 * @type {t3d.Color3}
		 * @default t3d.Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The near clip of the fog.
		 * @type {Number}
		 * @default 1
		 */
		this.near = near;

		/**
		 * The far clip of the fog.
		 * @type {Number}
		 * @default 1000
		 */
		this.far = far;
	};
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Fog.prototype.isFog = true;

	/**
	 * Exp2 fog.
	 * @memberof t3d
	 */
	var FogExp2 =
	/**
	 * @param {Number} [color=0x000000] - The color of the fog.
	 * @param {Number} [density=0.00025] - The density of the exp2 fog.
	 */
	function FogExp2(color, density) {
		if (color === void 0) {
			color = 0x000000;
		}
		if (density === void 0) {
			density = 0.00025;
		}
		/**
		 * The color of the fog.
		 * @type {t3d.Color3}
		 * @default t3d.Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The density of the exp2 fog.
		 * @type {Number}
		 * @default 0.00025
		 */
		this.density = density;
	};
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	FogExp2.prototype.isFogExp2 = true;

	/**
	 * BoxGeometry is the quadrilateral primitive geometry class.
	 * It is typically used for creating a cube or irregular quadrilateral of the dimensions provided with the 'width', 'height', and 'depth' constructor arguments.
	 * @memberof t3d
	 * @extends t3d.Geometry
	 */
	var BoxGeometry = /*#__PURE__*/function (_Geometry) {
		_inheritsLoose(BoxGeometry, _Geometry);
		/**
		 * @param {Number} [width=1] - Width of the sides on the X axis.
		 * @param {Number} [height=1] - Height of the sides on the Y axis.
		 * @param {Number} [depth=1] - Depth of the sides on the Z axis.
		 * @param {Number} [widthSegments=1] - Number of segmented faces along the width of the sides.
		 * @param {Number} [heightSegments=1] - Number of segmented faces along the height of the sides.
		 * @param {Number} [depthSegments=1] - Number of segmented faces along the depth of the sides.
		 */
		function BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments) {
			var _this;
			if (width === void 0) {
				width = 1;
			}
			if (height === void 0) {
				height = 1;
			}
			if (depth === void 0) {
				depth = 1;
			}
			if (widthSegments === void 0) {
				widthSegments = 1;
			}
			if (heightSegments === void 0) {
				heightSegments = 1;
			}
			if (depthSegments === void 0) {
				depthSegments = 1;
			}
			_this = _Geometry.call(this) || this;
			var scope = _assertThisInitialized(_this);

			// segments

			widthSegments = Math.floor(widthSegments);
			heightSegments = Math.floor(heightSegments);
			depthSegments = Math.floor(depthSegments);

			// buffers

			var indices = [];
			var vertices = [];
			var normals = [];
			var uvs = [];

			// helper variables

			var numberOfVertices = 0;
			var groupStart = 0;

			// build each side of the box geometry

			buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px
			buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx
			buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
			buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny
			buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz
			buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

			// build geometry

			_this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			_this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			_this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			_this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {
				var segmentWidth = width / gridX;
				var segmentHeight = height / gridY;
				var widthHalf = width / 2;
				var heightHalf = height / 2;
				var depthHalf = depth / 2;
				var gridX1 = gridX + 1;
				var gridY1 = gridY + 1;
				var vertexCounter = 0;
				var groupCount = 0;
				var vector = new Vector3();

				// generate vertices, normals and uvs

				for (var iy = 0; iy < gridY1; iy++) {
					var y = iy * segmentHeight - heightHalf;
					for (var ix = 0; ix < gridX1; ix++) {
						var x = ix * segmentWidth - widthHalf;

						// set values to correct vector component

						vector[u] = x * udir;
						vector[v] = y * vdir;
						vector[w] = depthHalf;

						// now apply vector to vertex buffer

						vertices.push(vector.x, vector.y, vector.z);

						// set values to correct vector component

						vector[u] = 0;
						vector[v] = 0;
						vector[w] = depth > 0 ? 1 : -1;

						// now apply vector to normal buffer

						normals.push(vector.x, vector.y, vector.z);

						// uvs

						uvs.push(ix / gridX);
						uvs.push(1 - iy / gridY);

						// counters

						vertexCounter += 1;
					}
				}

				// indices

				// 1. you need three indices to draw a single face
				// 2. a single segment consists of two faces
				// 3. so we need to generate six (2*3) indices per segment

				for (var _iy = 0; _iy < gridY; _iy++) {
					for (var _ix = 0; _ix < gridX; _ix++) {
						var a = numberOfVertices + _ix + gridX1 * _iy;
						var b = numberOfVertices + _ix + gridX1 * (_iy + 1);
						var c = numberOfVertices + (_ix + 1) + gridX1 * (_iy + 1);
						var d = numberOfVertices + (_ix + 1) + gridX1 * _iy;

						// faces

						indices.push(a, b, d);
						indices.push(b, c, d);

						// increase counter

						groupCount += 6;
					}
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, materialIndex);

				// calculate new start value for groups

				groupStart += groupCount;

				// update total number of vertices

				numberOfVertices += vertexCounter;
			}
			_this.computeBoundingBox();
			_this.computeBoundingSphere();
			return _this;
		}
		return BoxGeometry;
	}(Geometry);

	/**
	 * A class for generating cylinder geometries.
	 * @memberof t3d
	 * @extends t3d.Geometry
	 */
	var CylinderGeometry = /*#__PURE__*/function (_Geometry) {
		_inheritsLoose(CylinderGeometry, _Geometry);
		/**
		 * @param {Number} [radiusTop=1] — Radius of the cylinder at the top.
		 * @param {Number} [radiusBottom=1] — Radius of the cylinder at the bottom.
		 * @param {Number} [height=1] — Height of the cylinder.
		 * @param {Number} [radialSegments=8] — Number of segmented faces around the circumference of the cylinder.
		 * @param {Number} [heightSegments=1] — Number of rows of faces along the height of the cylinder.
		 * @param {Number} [openEnded=false] — A Boolean indicating whether the ends of the cylinder are open or capped. Default is false, meaning capped.
		 * @param {Number} [thetaStart=0] — Start angle for first segment, default = 0 (three o'clock position).
		 * @param {Number} [thetaLength=2*Pi] — The central angle, often called theta, of the circular sector. The default is 2*Pi, which makes for a complete cylinder.
		 */
		function CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
			var _this;
			if (radiusTop === void 0) {
				radiusTop = 1;
			}
			if (radiusBottom === void 0) {
				radiusBottom = 1;
			}
			if (height === void 0) {
				height = 1;
			}
			if (radialSegments === void 0) {
				radialSegments = 8;
			}
			if (heightSegments === void 0) {
				heightSegments = 1;
			}
			if (openEnded === void 0) {
				openEnded = false;
			}
			if (thetaStart === void 0) {
				thetaStart = 0;
			}
			if (thetaLength === void 0) {
				thetaLength = Math.PI * 2;
			}
			_this = _Geometry.call(this) || this;
			var scope = _assertThisInitialized(_this);
			radialSegments = Math.floor(radialSegments);
			heightSegments = Math.floor(heightSegments);

			// buffers

			var indices = [];
			var vertices = [];
			var normals = [];
			var uvs = [];

			// helper variables

			var index = 0;
			var indexArray = [];
			var halfHeight = height / 2;
			var groupStart = 0;

			// generate geometry

			generateTorso();
			if (openEnded === false) {
				if (radiusTop > 0) generateCap(true);
				if (radiusBottom > 0) generateCap(false);
			}

			// build geometry

			_this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			_this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			_this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			_this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			function generateTorso() {
				var normal = new Vector3();
				var vertex = new Vector3();
				var groupCount = 0;
				var x, y;

				// this will be used to calculate the normal
				var slope = (radiusBottom - radiusTop) / height;

				// generate vertices, normals and uvs

				for (y = 0; y <= heightSegments; y++) {
					var indexRow = [];
					var v = y / heightSegments;

					// calculate the radius of the current row

					var radius = v * (radiusBottom - radiusTop) + radiusTop;
					for (x = 0; x <= radialSegments; x++) {
						var u = x / radialSegments;
						var theta = u * thetaLength + thetaStart;
						var sinTheta = Math.sin(theta);
						var cosTheta = Math.cos(theta);

						// vertex

						vertex.x = radius * sinTheta;
						vertex.y = -v * height + halfHeight;
						vertex.z = radius * cosTheta;
						vertices.push(vertex.x, vertex.y, vertex.z);

						// normal

						normal.set(sinTheta, slope, cosTheta).normalize();
						normals.push(normal.x, normal.y, normal.z);

						// uv

						uvs.push(u, 1 - v);

						// save index of vertex in respective row

						indexRow.push(index++);
					}

					// now save vertices of the row in our index array

					indexArray.push(indexRow);
				}

				// generate indices

				for (x = 0; x < radialSegments; x++) {
					for (y = 0; y < heightSegments; y++) {
						// we use the index array to access the correct indices

						var a = indexArray[y][x];
						var b = indexArray[y + 1][x];
						var c = indexArray[y + 1][x + 1];
						var d = indexArray[y][x + 1];

						// faces

						indices.push(a, b, d);
						indices.push(b, c, d);

						// update group counter

						groupCount += 6;
					}
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, 0);

				// calculate new start value for groups

				groupStart += groupCount;
			}
			function generateCap(top) {
				// save the index of the first center vertex
				var centerIndexStart = index;
				var uv = new Vector2();
				var vertex = new Vector3();
				var groupCount = 0;
				var x;
				var radius = top === true ? radiusTop : radiusBottom;
				var sign = top === true ? 1 : -1;

				// first we generate the center vertex data of the cap.
				// because the geometry needs one set of uvs per face,
				// we must generate a center vertex per face/segment

				for (x = 1; x <= radialSegments; x++) {
					// vertex

					vertices.push(0, halfHeight * sign, 0);

					// normal

					normals.push(0, sign, 0);

					// uv

					uvs.push(0.5, 0.5);

					// increase index

					index++;
				}

				// save the index of the last center vertex
				var centerIndexEnd = index;

				// now we generate the surrounding vertices, normals and uvs

				for (x = 0; x <= radialSegments; x++) {
					var u = x / radialSegments;
					var theta = u * thetaLength + thetaStart;
					var cosTheta = Math.cos(theta);
					var sinTheta = Math.sin(theta);

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = halfHeight * sign;
					vertex.z = radius * cosTheta;
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normals.push(0, sign, 0);

					// uv

					uv.x = cosTheta * 0.5 + 0.5;
					uv.y = sinTheta * 0.5 * sign + 0.5;
					uvs.push(uv.x, uv.y);

					// increase index

					index++;
				}

				// generate indices

				for (x = 0; x < radialSegments; x++) {
					var c = centerIndexStart + x;
					var i = centerIndexEnd + x;
					if (top === true) {
						// face top
						indices.push(i, i + 1, c);
					} else {
						// face bottom
						indices.push(i + 1, i, c);
					}
					groupCount += 3;
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

				// calculate new start value for groups

				groupStart += groupCount;
			}
			_this.computeBoundingBox();
			_this.computeBoundingSphere();
			return _this;
		}
		return CylinderGeometry;
	}(Geometry);

	/**
	 * A class for generating sphere geometries.
	 * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep).
	 * Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
	 * @memberof t3d
	 * @extends t3d.Geometry
	 */
	var SphereGeometry = /*#__PURE__*/function (_Geometry) {
		_inheritsLoose(SphereGeometry, _Geometry);
		/**
		 * @param {Number} [radius=1] — sphere radius. Default is 1.
		 * @param {Number} [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
		 * @param {Number} [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
		 * @param {Number} [phiStart=0] — specify horizontal starting angle. Default is 0.
		 * @param {Number} [phiLength=Math.PI*2] — specify horizontal sweep angle size. Default is Math.PI * 2.
		 * @param {Number} [thetaStart=0] — specify vertical starting angle. Default is 0.
		 * @param {Number} [thetaLength=Math.PI] — specify vertical sweep angle size. Default is Math.PI.
		 */
		function SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength) {
			var _this;
			if (radius === void 0) {
				radius = 1;
			}
			if (widthSegments === void 0) {
				widthSegments = 8;
			}
			if (heightSegments === void 0) {
				heightSegments = 6;
			}
			if (phiStart === void 0) {
				phiStart = 0;
			}
			if (phiLength === void 0) {
				phiLength = Math.PI * 2;
			}
			if (thetaStart === void 0) {
				thetaStart = 0;
			}
			if (thetaLength === void 0) {
				thetaLength = Math.PI;
			}
			_this = _Geometry.call(this) || this;
			widthSegments = Math.max(3, Math.floor(widthSegments));
			heightSegments = Math.max(2, Math.floor(heightSegments));
			var thetaEnd = thetaStart + thetaLength;
			var ix, iy;
			var index = 0;
			var grid = [];
			var vertex = new Vector3();
			var normal = new Vector3();

			// buffers

			var indices = [];
			var vertices = [];
			var normals = [];
			var uvs = [];

			// generate vertices, normals and uvs

			for (iy = 0; iy <= heightSegments; iy++) {
				var verticesRow = [];
				var v = iy / heightSegments;

				// special case for the poles
				// https://github.com/mrdoob/three.js/pull/16043

				var uOffset = 0;
				if (iy == 0 && thetaStart == 0) {
					uOffset = 0.5 / widthSegments;
				} else if (iy == heightSegments && thetaEnd == Math.PI) {
					uOffset = -0.5 / widthSegments;
				}
				for (ix = 0; ix <= widthSegments; ix++) {
					var u = ix / widthSegments;

					// vertex

					vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
					vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
					vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normal.copy(vertex).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(u + uOffset, 1 - v);
					verticesRow.push(index++);
				}
				grid.push(verticesRow);
			}

			// indices

			for (iy = 0; iy < heightSegments; iy++) {
				for (ix = 0; ix < widthSegments; ix++) {
					var a = grid[iy][ix + 1];
					var b = grid[iy][ix];
					var c = grid[iy + 1][ix];
					var d = grid[iy + 1][ix + 1];
					if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
					if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
				}
			}
			_this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			_this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			_this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			_this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			_this.computeBoundingBox();
			_this.computeBoundingSphere();
			return _this;
		}
		return SphereGeometry;
	}(Geometry);

	/**
	 * Creates a torus knot, the particular shape of which is defined by a pair of coprime integers, p and q.
	 * If p and q are not coprime, the result will be a torus link.
	 * @memberof t3d
	 * @extends t3d.Geometry
	 */
	var TorusKnotGeometry = /*#__PURE__*/function (_Geometry) {
		_inheritsLoose(TorusKnotGeometry, _Geometry);
		/**
		 * @param {Number} [radius=1] — Radius of the torus. Default is 1.
		 * @param {Number} [tube=0.4] — Radius of the tube. Default is 0.4.
		 * @param {Number} [tubularSegments=64] — Default is 64.
		 * @param {Number} [radialSegments=8] — Default is 8.
		 * @param {Number} [p=2] — This value determines, how many times the geometry winds around its axis of rotational symmetry. Default is 2.
		 * @param {Number} [q=3] — This value determines, how many times the geometry winds around a circle in the interior of the torus. Default is 3.
		 */
		function TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q) {
			var _this;
			if (radius === void 0) {
				radius = 1;
			}
			if (tube === void 0) {
				tube = 0.4;
			}
			if (tubularSegments === void 0) {
				tubularSegments = 64;
			}
			if (radialSegments === void 0) {
				radialSegments = 8;
			}
			if (p === void 0) {
				p = 2;
			}
			if (q === void 0) {
				q = 3;
			}
			_this = _Geometry.call(this) || this;
			tubularSegments = Math.floor(tubularSegments);
			radialSegments = Math.floor(radialSegments);

			// buffers

			var indices = [];
			var vertices = [];
			var normals = [];
			var uvs = [];

			// helper variables

			var i, j;
			var vertex = new Vector3();
			var normal = new Vector3();
			var P1 = new Vector3();
			var P2 = new Vector3();
			var B = new Vector3();
			var T = new Vector3();
			var N = new Vector3();

			// generate vertices, normals and uvs

			for (i = 0; i <= tubularSegments; ++i) {
				// the radian "u" is used to calculate the position on the torus curve of the current tubular segement

				var u = i / tubularSegments * p * Math.PI * 2;

				// now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
				// these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

				calculatePositionOnCurve(u, p, q, radius, P1);
				calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

				// calculate orthonormal basis

				T.subVectors(P2, P1);
				N.addVectors(P2, P1);
				B.crossVectors(T, N);
				N.crossVectors(B, T);

				// normalize B, N. T can be ignored, we don't use it

				B.normalize();
				N.normalize();
				for (j = 0; j <= radialSegments; ++j) {
					// now calculate the vertices. they are nothing more than an extrusion of the torus curve.
					// because we extrude a shape in the xy-plane, there is no need to calculate a z-value.

					var v = j / radialSegments * Math.PI * 2;
					var cx = -tube * Math.cos(v);
					var cy = tube * Math.sin(v);

					// now calculate the final vertex position.
					// first we orient the extrusion with our basis vectos, then we add it to the current position on the curve

					vertex.x = P1.x + (cx * N.x + cy * B.x);
					vertex.y = P1.y + (cx * N.y + cy * B.y);
					vertex.z = P1.z + (cx * N.z + cy * B.z);
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)

					normal.subVectors(vertex, P1).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(i / tubularSegments);
					uvs.push(j / radialSegments);
				}
			}

			// generate indices

			for (j = 1; j <= tubularSegments; j++) {
				for (i = 1; i <= radialSegments; i++) {
					// indices

					var a = (radialSegments + 1) * (j - 1) + (i - 1);
					var b = (radialSegments + 1) * j + (i - 1);
					var c = (radialSegments + 1) * j + i;
					var d = (radialSegments + 1) * (j - 1) + i;

					// faces

					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}

			// build geometry

			_this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			_this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			_this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			_this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			_this.computeBoundingBox();
			_this.computeBoundingSphere();

			// this function calculates the current position on the torus curve

			function calculatePositionOnCurve(u, p, q, radius, position) {
				var cu = Math.cos(u);
				var su = Math.sin(u);
				var quOverP = q / p * u;
				var cs = Math.cos(quOverP);
				position.x = radius * (2 + cs) * 0.5 * cu;
				position.y = radius * (2 + cs) * su * 0.5;
				position.z = radius * Math.sin(quOverP) * 0.5;
			}
			return _this;
		}
		return TorusKnotGeometry;
	}(Geometry);

	/**
	 * A material for drawing geometries in a simple shaded (flat or wireframe) way.
	 * This material is not affected by lights.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var BasicMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(BasicMaterial, _Material);
		/**
		 * Create a BasicMaterial.
		 */
		function BasicMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.BASIC;
			return _this;
		}
		return BasicMaterial;
	}(Material);

	/**
	 * A material for non-shiny surfaces, without specular highlights.
	 * The material uses a non-physically based Lambertian model for calculating reflectance.
	 * This can simulate some surfaces (such as untreated wood or stone) well, but cannot simulate shiny surfaces with specular highlights (such as varnished wood).
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var LambertMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(LambertMaterial, _Material);
		/**
		 * Create a LambertMaterial.
		 */
		function LambertMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.LAMBERT;

			/**
			 * @default true
			 */
			_this.acceptLight = true;
			return _this;
		}
		return LambertMaterial;
	}(Material);

	/**
	 * A material for drawing wireframe-style geometries.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var LineMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(LineMaterial, _Material);
		/**
		 * Create a LineMaterial.
		 */
		function LineMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.LINE;

			/**
			 * Controls line thickness.
			 * Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.
			 * @type {Number}
			 * @default 1
			 */
			_this.lineWidth = 1;

			/**
			 * Set draw mode to LINES / LINE_LOOP / LINE_STRIP
			 * @type {t3d.DRAW_MODE}
			 * @default t3d.DRAW_MODE.LINES
			 */
			_this.drawMode = DRAW_MODE.LINES;
			return _this;
		}
		var _proto = LineMaterial.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.lineWidth = source.lineWidth;
			return this;
		};
		return LineMaterial;
	}(Material);

	/**
	 * MatcapMaterial is defined by a MatCap (or Lit Sphere) texture, which encodes the material color and shading.
	 * MatcapMaterial does not respond to lights since the matcap image file encodes baked lighting.
	 * It will cast a shadow onto an object that receives shadows (and shadow clipping works), but it will not self-shadow or receive shadows.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var MatcapMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(MatcapMaterial, _Material);
		/**
		 * Create a MatcapMaterial.
		 */
		function MatcapMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.MATCAP;

			/**
			 * The matcap map.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.matcap = null;
			return _this;
		}
		var _proto = MatcapMaterial.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.matcap = source.matcap;
			return this;
		};
		return MatcapMaterial;
	}(Material);

	/**
	 * A standard physically based material, using Specular-Glossiness workflow.
	 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
	 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
	 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var PBR2Material = /*#__PURE__*/function (_Material) {
		_inheritsLoose(PBR2Material, _Material);
		/**
		 * Create a PBR2Material.
		 */
		function PBR2Material() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.PBR2;

			/**
			 * Specular color of the material.
			 * @type {Number}
			 * @default 0.5
			 */
			_this.specular = new Color3(0x111111);

			/**
			 * Glossiness of the material.
			 * @type {Number}
			 * @default 0.5
			 */
			_this.glossiness = 0.5;

			/**
			 * The RGB channel of this texture is used to alter the specular of the material.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.specularMap = null;

			/**
			 * The A channel of this texture is used to alter the glossiness of the material.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.glossinessMap = null;

			/**
			 * @default true
			 */
			_this.acceptLight = true;
			return _this;
		}
		var _proto = PBR2Material.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.specular = source.specular;
			this.glossiness = source.glossiness;
			this.specularMap = source.specularMap;
			this.glossinessMap = source.glossinessMap;
			return this;
		};
		return PBR2Material;
	}(Material);

	/**
	 * A standard physically based material, using Metallic-Roughness workflow.
	 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
	 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
	 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var PBRMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(PBRMaterial, _Material);
		/**
		 * Create a PBRMaterial.
		 */
		function PBRMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.PBR;

			/**
			 * How rough the material appears. 0.0 means a smooth mirror reflection, 1.0 means fully diffuse.
			 * If roughnessMap is also provided, both values are multiplied.
			 * @type {Number}
			 * @default 0.5
			 */
			_this.roughness = 0.5;

			/**
			 * How much the material is like a metal.
			 * Non-metallic materials such as wood or stone use 0.0, metallic use 1.0, with nothing (usually) in between.
			 * A value between 0.0 and 1.0 could be used for a rusty metal look. If metalnessMap is also provided, both values are multiplied.
			 * @type {Number}
			 * @default 0.5
			 */
			_this.metalness = 0.5;

			/**
			 * The green channel of this texture is used to alter the roughness of the material.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.roughnessMap = null;

			/**
			 * The blue channel of this texture is used to alter the metalness of the material.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.metalnessMap = null;

			/**
			 * The strength of a clearcoat layer on a material surface.
			 * When clearcoatFactor is set to 0.0, it indicates that there is no clearcoat present.
			 * When it is set to 1.0, it indicates a very strong clearcoat that-
			 * will cause the reflection and refraction effects on the surface of the object to become more prominent.
			 * @type {Number}
			 * @default 0.0
			 */
			_this.clearcoat = 0.0;

			/**
			 * A texture property that allows for the modulation of the strength or roughness of the clearcoat layer.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.clearcoatMap = null;

			/**
			 * The roughness of a clearcoat layer on a material surface.
			 * When clearcoatRoughness is set to 0.0, the clearcoat layer will appear perfectly smooth and reflective-
			 * and 0.0 represents a rough, textured clearcoat layer.
			 * Adjusting the clearcoatRoughness can achieve a wide range of effects and create more realistic materials.
			 * @type {Number}
			 * @default 0.0
			 */
			_this.clearcoatRoughness = 0.0;

			/**
			 * A texture that will be applied to the clearcoat layer of a material to simulate the roughness of the surface.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.clearcoatRoughnessMap = null;

			/**
			 * Adjust the normal map's strength or intensity.
			 * Affect the amount of bumpiness or surface detail that is visible on the clearcoat layer.
			 * Typical ranges are 0-1.
			 * @type {Number}
			 * @default 1
			 */
			_this.clearcoatNormalScale = new Vector2(1, 1);

			/**
			 * The texture that modulates the clearcoat layer's surface normal.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.clearcoatNormalMap = null;

			/**
			 * @default true
			 */
			_this.acceptLight = true;
			return _this;
		}
		var _proto = PBRMaterial.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.roughness = source.roughness;
			this.metalness = source.metalness;
			this.roughnessMap = source.roughnessMap;
			this.metalnessMap = source.metalnessMap;
			this.clearcoat = source.clearcoat;
			this.clearcoatMap = source.clearcoatMap;
			this.clearcoatRoughness = source.clearcoatRoughness;
			this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
			this.clearcoatNormalScale.copy(source.clearcoatNormalScale);
			return this;
		};
		return PBRMaterial;
	}(Material);

	/**
	 * A material for shiny surfaces with specular highlights.
	 * The material uses a non-physically based Blinn-Phong model for calculating reflectance.
	 * Unlike the Lambertian model used in the {@link t3d.LambertMaterial} this can simulate shiny surfaces with specular highlights (such as varnished wood).
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var PhongMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(PhongMaterial, _Material);
		/**
		 * Create a PhongMaterial.
		 */
		function PhongMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.PHONG;

			/**
			 * How shiny the {@link t3d.PhongMaterial#specular} highlight is; a higher value gives a sharper highlight.
			 * @type {Number}
			 * @default 30
			 */
			_this.shininess = 30;

			/**
			 * Specular color of the material.
			 * This defines how shiny the material is and the color of its shine.
			 * @type {t3d.Color3}
			 * @default t3d.Color(0x111111)
			 */
			_this.specular = new Color3(0x111111);

			/**
			 * The specular map value affects both how much the specular surface highlight contributes and how much of the environment map affects the surface.
			 * @type {t3d.Texture2D}
			 * @default null
			 */
			_this.specularMap = null;

			/**
			 * @default true
			 */
			_this.acceptLight = true;
			return _this;
		}
		var _proto = PhongMaterial.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.shininess = source.shininess;
			this.specular.copy(source.specular);
			this.specularMap = source.specularMap;
			return this;
		};
		return PhongMaterial;
	}(Material);

	/**
	 * The default material used by Points.
	 * @extends t3d.Material
	 * @memberof t3d
	 */
	var PointsMaterial = /*#__PURE__*/function (_Material) {
		_inheritsLoose(PointsMaterial, _Material);
		/**
		 * Create a PointsMaterial.
		 */
		function PointsMaterial() {
			var _this;
			_this = _Material.call(this) || this;
			_this.type = MATERIAL_TYPE.POINT;

			/**
			 * Sets the size of the points.
			 * @type {Number}
			 * @default 1
			 */
			_this.size = 1;

			/**
			 * Specify whether points' size is attenuated by the camera depth. (Perspective camera only.)
			 * @type {Boolean}
			 * @default true
			 */
			_this.sizeAttenuation = true;

			/**
			 * Set draw mode to POINTS.
			 * @type {t3d.DRAW_MODE}
			 * @default t3d.DRAW_MODE.POINTS
			 */
			_this.drawMode = DRAW_MODE.POINTS;
			return _this;
		}
		var _proto = PointsMaterial.prototype;
		_proto.copy = function copy(source) {
			_Material.prototype.copy.call(this, source);
			this.size = source.size;
			this.sizeAttenuation = source.sizeAttenuation;
			return this;
		};
		return PointsMaterial;
	}(Material);

	/**
	 * Render Target is the wrapping class of gl.framebuffer.
	 * @memberof t3d
	 * @extends t3d.EventDispatcher
	 * @abstract
	 */
	var RenderTargetBase = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(RenderTargetBase, _EventDispatcher);
		/**
		 * @param {Number} width - The width of the render target.
		 * @param {Number} height - The height of the render target.
		 */
		function RenderTargetBase(width, height) {
			var _this;
			_this = _EventDispatcher.call(this) || this;

			/**
			 * The width of the render target.
			 * @type {Number}
			 */
			_this.width = width;

			/**
			 * The height of the render target.
			 * @type {Number}
			 */
			_this.height = height;
			return _this;
		}

		/**
		 * Resize the render target.
		 * @param {Number} width - The width of the render target.
		 * @param {Number} height - The height of the render target.
		 * @return {Boolean} - If size changed.
		 */
		var _proto = RenderTargetBase.prototype;
		_proto.resize = function resize(width, height) {
			if (this.width !== width || this.height !== height) {
				this.width = width;
				this.height = height;
				return true;
			}
			return false;
		}

		/**
		 * Dispatches a dispose event.
		 */;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		};
		return RenderTargetBase;
	}(EventDispatcher);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	RenderTargetBase.prototype.isRenderTarget = true;

	/**
	 * Render Buffer can be attached to RenderTarget.
	 * @memberof t3d
	 * @extends t3d.EventDispatcher
	 */
	var RenderBuffer = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(RenderBuffer, _EventDispatcher);
		/**
		 * @param {Number} width - The width of the render buffer.
		 * @param {Number} height - The height of the render buffer.
		 * @param {t3d.PIXEL_FORMAT} [format=t3d.PIXEL_FORMAT.RGBA8] - The internal format of the render buffer.
		 * @param {Number} [multipleSampling=0] - If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
		 */
		function RenderBuffer(width, height, format, multipleSampling) {
			var _this;
			if (format === void 0) {
				format = PIXEL_FORMAT.RGBA8;
			}
			if (multipleSampling === void 0) {
				multipleSampling = 0;
			}
			_this = _EventDispatcher.call(this) || this;

			/**
			 * The width of the render buffer.
			 * @type {Number}
			 */
			_this.width = width;

			/**
			 * The height of the render buffer.
			 * @type {Number}
			 */
			_this.height = height;

			/**
			 * Render buffer texel storage data format.
			 * DEPTH_COMPONENT16: for depth attachments.
			 * DEPTH_STENCIL: for depth stencil attachments.
			 * RGBA8：for multiple sampled color attachments.
			 * DEPTH_COMPONENT16: for multiple sampled depth attachments.
			 * DEPTH24_STENCIL8: for multiple sampled depth stencil attachments.
			 * @type {t3d.PIXEL_FORMAT}
			 * @default t3d.PIXEL_FORMAT.RGBA8
			 */
			_this.format = format;

			/**
			 * If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
			 * A Render Target's attachments must have the same multipleSampling value.
			 * Texture can't be attached to the same render target with a multiple sampled render buffer.
			 * Max support 8.
			 * @type {Number}
			 * @default 0
			 */
			_this.multipleSampling = multipleSampling;
			return _this;
		}

		/**
		 * Resize the render buffer.
		 * @param {Number} width - The width of the render buffer.
		 * @param {Number} height - The height of the render buffer.
		 * @return {Boolean} - If size changed.
		 */
		var _proto = RenderBuffer.prototype;
		_proto.resize = function resize(width, height) {
			if (this.width !== width || this.height !== height) {
				this.dispose();
				this.width = width;
				this.height = height;
				return true;
			}
			return false;
		}

		/**
		 * Returns a clone of this render buffer.
		 * @return {t3d.RenderBuffer}
		 */;
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copy the given render buffer into this render buffer.
		 * @param {t3d.RenderBuffer} source - The render buffer to be copied.
		 * @return {t3d.RenderBuffer}
		 */;
		_proto.copy = function copy(source) {
			this.format = source.format;
			this.multipleSampling = source.multipleSampling;
			return this;
		}

		/**
		 * Dispatches a dispose event.
		 */;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		};
		return RenderBuffer;
	}(EventDispatcher);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	RenderBuffer.prototype.isRenderBuffer = true;

	/**
	 * Render Target that render to 2d texture.
	 * @memberof t3d
	 * @extends t3d.RenderTargetBase
	 */
	var RenderTarget2D = /*#__PURE__*/function (_RenderTargetBase) {
		_inheritsLoose(RenderTarget2D, _RenderTargetBase);
		/**
		 * @param {Number} width - The width of the render target.
		 * @param {Number} height - The height of the render target.
		 */
		function RenderTarget2D(width, height) {
			var _this;
			_this = _RenderTargetBase.call(this, width, height) || this;
			_this._attachments = {};
			_this.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
			_this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
			return _this;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{t3d.Texture2D|t3d.RenderBuffer} target
		 * @param	{t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		var _proto = RenderTarget2D.prototype;
		_proto.attach = function attach(target, attachment) {
			if (attachment === void 0) {
				attachment = ATTACHMENT.COLOR_ATTACHMENT0;
			}
			if (target.isTexture) {
				if (target.image && target.image.rtt) {
					if (target.image.width !== this.width || target.image.height !== this.height) {
						target.version++;
						target.image.width = this.width;
						target.image.height = this.height;
					}
				} else {
					target.version++;
					target.image = {
						rtt: true,
						data: null,
						width: this.width,
						height: this.height
					};
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
		 */;
		_proto.detach = function detach(attachment) {
			if (attachment === void 0) {
				attachment = ATTACHMENT.COLOR_ATTACHMENT0;
			}
			delete this._attachments[attachment];
		}

		/**
		 * @override
		 */;
		_proto.resize = function resize(width, height) {
			var changed = _RenderTargetBase.prototype.resize.call(this, width, height);
			if (changed) {
				this.dispose(false);
				for (var attachment in this._attachments) {
					var target = this._attachments[attachment];
					if (target.isTexture) {
						target.image = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height
						};
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
			return changed;
		}

		/**
		 * Dispose the render target.
		 * @param {Boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
		 */;
		_proto.dispose = function dispose(disposeAttachments) {
			if (disposeAttachments === void 0) {
				disposeAttachments = true;
			}
			_RenderTargetBase.prototype.dispose.call(this);
			if (disposeAttachments) {
				for (var attachment in this._attachments) {
					this._attachments[attachment].dispose();
				}
			}
		};
		return RenderTarget2D;
	}(RenderTargetBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	RenderTarget2D.prototype.isRenderTarget2D = true;
	Object.defineProperties(RenderTarget2D.prototype, {
		texture: {
			set: function set(texture) {
				if (texture) {
					if (texture.isTexture) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function get() {
				var target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTexture ? target : null;
			}
		}
	});

	/**
	 * Render Target that render to canvas element.
	 * @memberof t3d
	 * @extends t3d.RenderTargetBase
	 */
	var RenderTargetBack = /*#__PURE__*/function (_RenderTargetBase) {
		_inheritsLoose(RenderTargetBack, _RenderTargetBase);
		/**
		 * @param {HTMLCanvasElement} view - The canvas element which the Render Target rendered to.
		 */
		function RenderTargetBack(view) {
			var _this;
			_this = _RenderTargetBase.call(this, view.width, view.height) || this;

			/**
			 * The canvas element which the Render Target rendered to.
			 * @type {HTMLCanvasElement}
			 */
			_this.view = view;
			return _this;
		}
		var _proto = RenderTargetBack.prototype;
		_proto.resize = function resize(width, height) {
			this.view.width = width;
			this.view.height = height;
			this.width = width;
			this.height = height;
		};
		_proto.dispose = function dispose() {
			// TODO dispose canvas?
		};
		return RenderTargetBack;
	}(RenderTargetBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	RenderTargetBack.prototype.isRenderTargetBack = true;

	/**
	 * Render Target that render to cube texture.
	 * @memberof t3d
	 * @extends t3d.RenderTargetBase
	 */
	var RenderTargetCube = /*#__PURE__*/function (_RenderTargetBase) {
		_inheritsLoose(RenderTargetCube, _RenderTargetBase);
		/**
		 * @param {Number} width - The width of the render target.
		 * @param {Number} height - The height of the render target.
		 */
		function RenderTargetCube(width, height) {
			var _this;
			_this = _RenderTargetBase.call(this, width, height) || this;
			_this._attachments = {};
			_this.attach(new TextureCube(), ATTACHMENT.COLOR_ATTACHMENT0);
			_this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

			/**
			 * The activeCubeFace property corresponds to a cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5).
			 * @type {Number}
			 * @default 0
			 */
			_this.activeCubeFace = 0;
			return _this;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{t3d.TextureCube|t3d.RenderBuffer} target
		 * @param	{t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		var _proto = RenderTargetCube.prototype;
		_proto.attach = function attach(target, attachment) {
			if (attachment === void 0) {
				attachment = ATTACHMENT.COLOR_ATTACHMENT0;
			}
			if (target.isTexture) {
				var changed = false;
				for (var i = 0; i < 6; i++) {
					if (target.images[i] && target.images[i].rtt) {
						if (target.images[i].width !== this.width || target.images[i].height !== this.height) {
							target.images[i].width = this.width;
							target.images[i].height = this.height;
							changed = true;
						}
					} else {
						target.images[i] = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height
						};
						changed = true;
					}
				}
				if (changed) {
					target.version++;
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
		 */;
		_proto.detach = function detach(attachment) {
			if (attachment === void 0) {
				attachment = ATTACHMENT.COLOR_ATTACHMENT0;
			}
			delete this._attachments[attachment];
		}

		/**
		 * @override
		 */;
		_proto.resize = function resize(width, height) {
			var changed = _RenderTargetBase.prototype.resize.call(this, width, height);
			if (changed) {
				this.dispose(false);
				for (var attachment in this._attachments) {
					var target = this._attachments[attachment];
					if (target.isTexture) {
						for (var i = 0; i < 6; i++) {
							target.images[i] = {
								rtt: true,
								data: null,
								width: this.width,
								height: this.height
							};
						}
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
		}

		/**
		 * Dispose the render target.
		 * @param {Boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
		 */;
		_proto.dispose = function dispose(disposeAttachments) {
			if (disposeAttachments === void 0) {
				disposeAttachments = true;
			}
			_RenderTargetBase.prototype.dispose.call(this);
			if (disposeAttachments) {
				for (var attachment in this._attachments) {
					this._attachments[attachment].dispose();
				}
			}
		};
		return RenderTargetCube;
	}(RenderTargetBase);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	RenderTargetCube.prototype.isRenderTargetCube = true;
	Object.defineProperties(RenderTargetCube.prototype, {
		texture: {
			set: function set(texture) {
				if (texture) {
					if (texture.isTexture) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function get() {
				var target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTexture ? target : null;
			}
		}
	});

	var _queryId = 0;

	/**
	 * A Query object provides single unified API for using WebGL asynchronus queries,
	 * which include query objects ('Occlusion' and 'Transform Feedback') and timer queries.
	 * @memberof t3d
	 * @extends t3d.EventDispatcher
	 */
	var Query = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(Query, _EventDispatcher);
		function Query() {
			var _this;
			_this = _EventDispatcher.call(this) || this;
			_this.id = _queryId++;
			return _this;
		}

		/**
				* Disposes the Query object.
		 * Rejects any pending query.
				*/
		var _proto = Query.prototype;
		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		};
		return Query;
	}(EventDispatcher);

	var _offsetMatrix = new Matrix4();

	/**
	 * Use an array of bones to create a skeleton that can be used by a {@link t3d.SkinnedMesh}.
	 * @memberof t3d
	 */
	var Skeleton = /*#__PURE__*/function () {
		/**
		 * @param {t3d.Bone[]} bones
		 * @param {t3d.Matrix4[]} bones
		 */
		function Skeleton(bones, boneInverses) {
			/**
			 * The array of bones.
			 * @type {t3d.Bone[]}
			 */
			this.bones = bones.slice(0);

			/**
			 * An array of Matrix4s that represent the inverse of the worldMatrix of the individual bones.
			 * @type {t3d.Matrix4[]}
			 */
			this.boneInverses = boneInverses;

			/**
			 * The array buffer holding the bone data.
			 * @type {Float32Array}
			 */
			this.boneMatrices = new Float32Array(16 * this.bones.length);

			/**
			 * The {@link t3d.Texture2D} holding the bone data when using a vertex texture.
			 * Use vertex texture to update boneMatrices, by that way, we can use more bones on phone.
			 * @type {t3d.Texture2D|undefined}
			 * @default undefined
			 */
			this.boneTexture = undefined;
		}

		/**
		 * Returns the skeleton to the base pose.
		 */
		var _proto = Skeleton.prototype;
		_proto.pose = function pose() {
			var boneInverses = this.boneInverses;
			for (var i = 0; i < this.bones.length; i++) {
				var bone = this.bones[i];
				bone.worldMatrix.getInverse(boneInverses[i]);
			}
			for (var _i = 0; _i < this.bones.length; _i++) {
				var _bone = this.bones[_i];
				if (_bone.parent && _bone.parent.type == "bone") {
					_bone.matrix.getInverse(_bone.parent.worldMatrix);
					_bone.matrix.multiply(_bone.worldMatrix);
				} else {
					_bone.matrix.copy(_bone.worldMatrix);
				}
				_bone.matrix.decompose(_bone.position, _bone.quaternion, _bone.scale);
			}
		}

		/**
		 * Clone skeleton.
		 * @return {t3d.Skeleton}
		 */;
		_proto.clone = function clone() {
			return new Skeleton(this.bones, this.boneInverses);
		}

		/**
		 * Updates the boneMatrices and boneTexture after changing the bones.
		 * This is called automatically if the skeleton is used with a SkinnedMesh.
		 * @ignore
		 */;
		_proto.updateBones = function updateBones(sceneData) {
			var useAnchorMatrix = sceneData.useAnchorMatrix;
			var anchorMatrixInverse = sceneData.anchorMatrixInverse;
			var boneInverses = this.boneInverses;
			for (var i = 0; i < this.bones.length; i++) {
				var bone = this.bones[i];
				_offsetMatrix.multiplyMatrices(bone.worldMatrix, boneInverses[i]);
				if (useAnchorMatrix) {
					_offsetMatrix.premultiply(anchorMatrixInverse);
				}
				_offsetMatrix.toArray(this.boneMatrices, i * 16);
			}
			if (this.boneTexture !== undefined) {
				this.boneTexture.version++;
			}
		};
		_proto.generateBoneTexture = function generateBoneTexture() {
			var size = Math.sqrt(this.bones.length * 4);
			size = nextPowerOfTwo(Math.ceil(size));
			size = Math.max(4, size);
			var boneMatrices = new Float32Array(size * size * 4);
			boneMatrices.set(this.boneMatrices);
			var boneTexture = new Texture2D();
			boneTexture.image = {
				data: boneMatrices,
				width: size,
				height: size
			};
			boneTexture.format = PIXEL_FORMAT.RGBA;
			boneTexture.type = PIXEL_TYPE.FLOAT;
			boneTexture.magFilter = TEXTURE_FILTER.NEAREST;
			boneTexture.minFilter = TEXTURE_FILTER.NEAREST;
			boneTexture.generateMipmaps = false;
			boneTexture.flipY = false;
			this.boneMatrices = boneMatrices;
			this.boneTexture = boneTexture;
		};
		return Skeleton;
	}();

	/**
	 * Abstract base class for lights
	 * - The light's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed light points down the -Z axis.
	 * - all other light types inherit the properties and methods described here.
	 * @abstract
	 * @memberof t3d
	 * @extends t3d.Object3D
	 */
	var Light = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Light, _Object3D);
		/**
		 * @param {Number} [color=0xffffff]
		 * @param {Number} [intensity=1]
		 */
		function Light(color, intensity) {
			var _this;
			if (color === void 0) {
				color = 0xffffff;
			}
			if (intensity === void 0) {
				intensity = 1;
			}
			_this = _Object3D.call(this) || this;

			/**
			 * Color of the light.
			 * @type {t3d.Color3}
			 * @default t3d.Color3(0xffffff)
			 */
			_this.color = new Color3(color);

			/**
			 * The light's intensity, or strength.
			 * @type {Number}
			 * @default 1
			 */
			_this.intensity = intensity;
			return _this;
		}

		/**
				* Set light direction, this func will set quaternion of this light.
				* @param {t3d.Vector3} target - The target that the light look at.
				* @param {t3d.Vector3} up - The up direction of the light.
				*/
		var _proto = Light.prototype;
		_proto.lookAt = function lookAt(target, up) {
			_mat4_1.lookAtRH(this.position, target, up);
			this.quaternion.setFromRotationMatrix(_mat4_1);
		}

		/**
				* Copies properties from the source light into this one.
				* @param {t3d.Light} source - The source light.
				* @return {t3d.Light} - This light.
				*/;
		_proto.copy = function copy(source) {
			_Object3D.prototype.copy.call(this, source);
			this.color.copy(source.color);
			this.intensity = source.intensity;
			return this;
		};
		return Light;
	}(Object3D);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Light.prototype.isLight = true;
	var _mat4_1 = new Matrix4();

	/**
	 * This light globally illuminates all objects in the scene equally.
	 * This light cannot be used to cast shadows as it does not have a direction.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var AmbientLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(AmbientLight, _Light);
		/**
		 * @param {Number} [color=0xffffff]
		 * @param {Number} [intensity=1]
		 */
		function AmbientLight(color, intensity) {
			return _Light.call(this, color, intensity) || this;
		}
		return AmbientLight;
	}(Light);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	AmbientLight.prototype.isAmbientLight = true;

	/**
	 * Serves as a base class for the other shadow classes.
	 * @abstract
	 * @memberof t3d
	 */
	var LightShadow = /*#__PURE__*/function () {
		function LightShadow() {
			/**
			 * The light's view of the world.
			 * This is used to generate a depth map of the scene; objects behind other objects from the light's perspective will be in shadow.
			 * @type {t3d.Camera}
			 */
			this.camera = new Camera();

			/**
			 * Model to shadow camera space, to compute location and depth in shadow map. Stored in a {@link t3d.Matrix4}.
			 * This is computed internally during rendering.
			 * @type {t3d.Matrix4}
			 */
			this.matrix = new Matrix4();

			/**
			 * Shadow map bias, how much to add or subtract from the normalized depth when deciding whether a surface is in shadow.
			 * Very tiny adjustments here (in the order of 0.0001) may help reduce artefacts in shadows.
			 * @type {Number}
			 * @default 0
			 */
			this.bias = 0;

			/**
			 * Defines how much the position used to query the shadow map is offset along the object normal.
			 * Increasing this value can be used to reduce shadow acne especially in large scenes where light shines onto geometry at a shallow angle.
			 * The cost is that shadows may appear distorted.
			 * @type {Number}
			 * @default 0
			 */
			this.normalBias = 0;

			/**
			 * Setting this to values greater than 1 will blur the edges of the shadow.
			 * High values will cause unwanted banding effects in the shadows - a greater mapSize will allow for a higher value to be used here before these effects become visible.
			 * Note that this has no effect if the {@link @t3d.Object3D#shadowType} is set to PCF or PCSS.
			 * @type {Number}
			 * @default 1
			 */
			this.radius = 1;

			/**
			 * Shadow camera near.
			 * @type {Number}
			 * @default 1
			 */
			this.cameraNear = 1;

			/**
			 * Shadow camera far.
			 * @type {Number}
			 * @default 500
			 */
			this.cameraFar = 500;

			/**
			 * A {@link t3d.Vector2} defining the width and height of the shadow map.
			 * Higher values give better quality shadows at the cost of computation time.
			 * Values must be powers of 2.
			 * @type {t3d.Vector2}
			 * @default t3d.Vector2(512, 512)
			 */
			this.mapSize = new Vector2(512, 512);

			/**
			 * Enables automatic updates of the light's shadow.
			 * If you do not require dynamic lighting / shadows, you may set this to false.
			 * @type {Boolean}
			 * @default true
			 */
			this.autoUpdate = true;

			/**
			 * When set to true, shadow maps will be updated in the next ShadowMapPass.render call.
			 * If you have set .autoUpdate to false, you will need to set this property to true and then make a ShadowMapPass.render call to update the light's shadow.
			 * @type {Boolean}
			 * @default false
			 */
			this.needsUpdate = false;
			this.renderTarget = null;
			this.map = null;
			this.depthMap = null;
		}
		var _proto = LightShadow.prototype;
		_proto.update = function update(light, face) {};
		_proto.updateMatrix = function updateMatrix() {
			var matrix = this.matrix;
			var camera = this.camera;

			// matrix * 0.5 + 0.5, after identity, range is 0 ~ 1 instead of -1 ~ 1
			matrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
			matrix.multiply(camera.projectionMatrix);
			matrix.multiply(camera.viewMatrix);
		};
		_proto.copy = function copy(source) {
			this.camera.copy(source.camera);
			this.matrix.copy(source.matrix);
			this.bias = source.bias;
			this.normalBias = source.normalBias;
			this.radius = source.radius;
			this.cameraNear = source.cameraNear;
			this.cameraFar = source.cameraFar;
			this.mapSize.copy(source.mapSize);
			return this;
		};
		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};
		_proto.prepareDepthMap = function prepareDepthMap(_enable, _capabilities) {};
		return LightShadow;
	}();

	/**
	 * This is used internally by DirectionalLights for calculating shadows.
	 * @memberof t3d
	 * @extends t3d.LightShadow
	 */
	var DirectionalLightShadow = /*#__PURE__*/function (_LightShadow) {
		_inheritsLoose(DirectionalLightShadow, _LightShadow);
		function DirectionalLightShadow() {
			var _this;
			_this = _LightShadow.call(this) || this;

			/**
			 * The cast shadow window size.
			 * @type {Number}
			 * @default 500
			 */
			_this.windowSize = 500;

			/**
			 * Controls the extent to which the shadows fade out at the edge of the frustum.
			 * @type {Number}
			 * @default 0
			 */
			_this.frustumEdgeFalloff = 0.0;

			// direct light is just a direction
			// we would not do camera frustum cull, because this light could be any where
			_this.camera.frustumCulled = false;
			_this.renderTarget = new RenderTarget2D(_this.mapSize.x, _this.mapSize.y);
			var map = _this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.LINEAR;
			var depthTexture = new Texture2D();
			depthTexture.type = PIXEL_TYPE.UNSIGNED_INT;
			depthTexture.format = PIXEL_FORMAT.DEPTH_COMPONENT;
			depthTexture.magFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.minFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.compare = COMPARE_FUNC.LESS;
			depthTexture.generateMipmaps = false;
			var depthBuffer = new RenderBuffer(_this.mapSize.x, _this.mapSize.y, PIXEL_FORMAT.DEPTH_COMPONENT16);
			_this.renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
			_this.renderTarget.attach(depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			_this.map = map;
			_this.depthMap = depthTexture;
			_this._depthBuffer = depthBuffer;
			_this._lookTarget = new Vector3();
			_this._up = new Vector3(0, 1, 0);
			return _this;
		}
		var _proto = DirectionalLightShadow.prototype;
		_proto.update = function update(light) {
			this._updateCamera(light);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		};
		_proto._updateCamera = function _updateCamera(light) {
			var camera = this.camera;
			var lookTarget = this._lookTarget;

			// set camera position and lookAt(rotation)
			light.getWorldDirection(lookTarget);
			camera.position.setFromMatrixPosition(light.worldMatrix);
			lookTarget.multiplyScalar(-1).add(camera.position);
			camera.lookAt(lookTarget, this._up);

			// update view matrix
			camera.updateMatrix();

			// update projection
			var halfWindowSize = this.windowSize / 2;
			camera.setOrtho(-halfWindowSize, halfWindowSize, -halfWindowSize, halfWindowSize, this.cameraNear, this.cameraFar);
		};
		_proto.copy = function copy(source) {
			_LightShadow.prototype.copy.call(this, source);
			this.windowSize = source.windowSize;
			this.frustumEdgeFalloff = source.frustumEdgeFalloff;
			return this;
		};
		_proto.prepareDepthMap = function prepareDepthMap(enable, capabilities) {
			var useDepthMap = enable && capabilities.version >= 2;
			var renderTarget = this.renderTarget;
			var attachments = renderTarget._attachments;
			var depthMapAttached = attachments[ATTACHMENT.DEPTH_ATTACHMENT] === this.depthMap;
			if (useDepthMap === depthMapAttached) return;
			if (useDepthMap) {
				if (capabilities.getExtension('OES_texture_float_linear')) {
					this.depthMap.type = PIXEL_TYPE.FLOAT;
				}
				renderTarget.dispose();
				renderTarget.attach(this.depthMap, ATTACHMENT.DEPTH_ATTACHMENT);
			} else {
				renderTarget.dispose();
				renderTarget.attach(this._depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			}
		};
		return DirectionalLightShadow;
	}(LightShadow);

	/**
	 * A light that gets emitted in a specific direction.
	 * This light will behave as though it is infinitely far away and the rays produced from it are all parallel.
	 * The common use case for this is to simulate daylight; the sun is far enough away that its position can be considered to be infinite, and all light rays coming from it are parallel.
	 * This light can cast shadows - see the {@link t3d.DirectionalLightShadow} page for details.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var DirectionalLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(DirectionalLight, _Light);
		/**
		 * @param {Number} [color=0xffffff]
		 * @param {Number} [intensity=1]
		 */
		function DirectionalLight(color, intensity) {
			var _this;
			_this = _Light.call(this, color, intensity) || this;

			/**
			 * A {@link t3d.DirectionalLightShadow} used to calculate shadows for this light.
			 * @type {t3d.DirectionalLightShadow}
			 * @default t3d.DirectionalLightShadow()
			 */
			_this.shadow = new DirectionalLightShadow();
			return _this;
		}
		var _proto = DirectionalLight.prototype;
		_proto.copy = function copy(source) {
			_Light.prototype.copy.call(this, source);
			this.shadow.copy(source.shadow);
			return this;
		};
		return DirectionalLight;
	}(Light);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	DirectionalLight.prototype.isDirectionalLight = true;

	/**
	 * A light source positioned directly above the scene, with color fading from the sky color to the ground color.
	 * This light cannot be used to cast shadows.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var HemisphereLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(HemisphereLight, _Light);
		/**
		 * @param {Number} [skyColor=0xffffff] - Hexadecimal color of the sky.
		 * @param {Number} [groundColor=0xffffff] - Hexadecimal color of the ground.
		 * @param {Number} [intensity=1] - numeric value of the light's strength/intensity.
		 */
		function HemisphereLight(skyColor, groundColor, intensity) {
			var _this;
			_this = _Light.call(this, skyColor, intensity) || this;

			/**
			 * Color of the ground.
			 * @type {t3d.Color3}
				 	 * @default t3d.Color3(0xffffff)
			 */
			_this.groundColor = new Color3(groundColor !== undefined ? groundColor : 0xffffff);
			return _this;
		}
		var _proto = HemisphereLight.prototype;
		_proto.copy = function copy(source) {
			_Light.prototype.copy.call(this, source);
			this.groundColor.copy(source.groundColor);
		};
		return HemisphereLight;
	}(Light);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	HemisphereLight.prototype.isHemisphereLight = true;

	/**
	 * This is used internally by PointLights for calculating shadows.
	 * @memberof t3d
	 * @extends t3d.LightShadow
	 */
	var PointLightShadow = /*#__PURE__*/function (_LightShadow) {
		_inheritsLoose(PointLightShadow, _LightShadow);
		function PointLightShadow() {
			var _this;
			_this = _LightShadow.call(this) || this;
			_this.renderTarget = new RenderTargetCube(_this.mapSize.x, _this.mapSize.y);
			var map = _this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.LINEAR;
			_this.map = map;
			_this._targets = [new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)];
			_this._ups = [new Vector3(0, -1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(0, -1, 0)];
			_this._lookTarget = new Vector3();
			return _this;
		}
		var _proto = PointLightShadow.prototype;
		_proto.update = function update(light, face) {
			this._updateCamera(light, face);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		};
		_proto._updateCamera = function _updateCamera(light, face) {
			var camera = this.camera;
			var lookTarget = this._lookTarget;
			var targets = this._targets;
			var ups = this._ups;

			// set camera position and lookAt(rotation)
			camera.position.setFromMatrixPosition(light.worldMatrix);
			lookTarget.set(targets[face].x + camera.position.x, targets[face].y + camera.position.y, targets[face].z + camera.position.z);
			camera.lookAt(lookTarget, ups[face]);

			// update view matrix
			camera.updateMatrix();

			// update projection
			camera.setPerspective(90 / 180 * Math.PI, 1, this.cameraNear, this.cameraFar);
		};
		return PointLightShadow;
	}(LightShadow);

	/**
	 * A light that gets emitted from a single point in all directions.
	 * A common use case for this is to replicate the light emitted from a bare lightbulb.
	 * This light can cast shadows - see {@link t3d.PointLightShadow} page for details.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var PointLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(PointLight, _Light);
		/**
		 * @param {Number} [color=0xffffff]
		 * @param {Number} [intensity=1]
		 * @param {Number} [distance=200]
		 * @param {Number} [decay=1]
		 */
		function PointLight(color, intensity, distance, decay) {
			var _this;
			_this = _Light.call(this, color, intensity) || this;

			/**
			 * The amount the light dims along the distance of the light.
			 * @type {Number}
			 * @default 1
			 */
			_this.decay = decay !== undefined ? decay : 1;

			/**
			 * The distance from the light where the intensity is 0.
			 * @type {Number}
			 * @default 200
			 */
			_this.distance = distance !== undefined ? distance : 200;

			/**
			 * A {@link t3d.PointLightShadow} used to calculate shadows for this light.
			 * @type {t3d.PointLightShadow}
			 * @default t3d.PointLightShadow()
			 */
			_this.shadow = new PointLightShadow();
			return _this;
		}
		var _proto = PointLight.prototype;
		_proto.copy = function copy(source) {
			_Light.prototype.copy.call(this, source);
			this.shadow.copy(source.shadow);
			return this;
		};
		return PointLight;
	}(Light);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	PointLight.prototype.isPointLight = true;

	/**
	 * This light globally all objects in the scene equally.
	 * This light depends on spherical harmonics.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var SphericalHarmonicsLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(SphericalHarmonicsLight, _Light);
		/**
		 * Creates a new SphericalHarmonicsLight.
				* @param {SphericalHarmonics3} [sh =	new SphericalHarmonics3()]
				* @param {Number} [intensity = 1]
				*/
		function SphericalHarmonicsLight(sh, intensity) {
			var _this;
			if (sh === void 0) {
				sh = new SphericalHarmonics3();
			}
			if (intensity === void 0) {
				intensity = 1;
			}
			_this = _Light.call(this, undefined, intensity) || this;

			/**
			 * An instance of SphericalHarmonics3.
			 * @type {SphericalHarmonics3}
			 */
			_this.sh = sh;
			return _this;
		}
		var _proto = SphericalHarmonicsLight.prototype;
		_proto.copy = function copy(source) {
			_Light.prototype.copy.call(this, source);
			this.sh.copy(source.sh);
			return this;
		};
		return SphericalHarmonicsLight;
	}(Light);
	/**
	* Read-only flag to check if a given object is of type SphericalHarmonicsLight.
	* @type {Boolean}
	* @default true
	*/
	SphericalHarmonicsLight.prototype.isSphericalHarmonicsLight = true;

	/**
	 * This is used internally by SpotLights for calculating shadows.
	 * @memberof t3d
	 * @extends t3d.LightShadow
	 */
	var SpotLightShadow = /*#__PURE__*/function (_LightShadow) {
		_inheritsLoose(SpotLightShadow, _LightShadow);
		function SpotLightShadow() {
			var _this;
			_this = _LightShadow.call(this) || this;

			/**
			 * Controls the extent to which the shadows fade out at the edge of the frustum.
			 * @type {Number}
			 * @default 0
			 */
			_this.frustumEdgeFalloff = 0.0;
			_this.renderTarget = new RenderTarget2D(_this.mapSize.x, _this.mapSize.y);
			var map = _this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.LINEAR;
			var depthTexture = new Texture2D();
			depthTexture.type = PIXEL_TYPE.UNSIGNED_INT;
			depthTexture.format = PIXEL_FORMAT.DEPTH_COMPONENT;
			depthTexture.magFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.minFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.compare = COMPARE_FUNC.LESS;
			depthTexture.generateMipmaps = false;
			var depthBuffer = new RenderBuffer(_this.mapSize.x, _this.mapSize.y, PIXEL_FORMAT.DEPTH_COMPONENT16);
			_this.renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
			_this.renderTarget.attach(depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			_this.map = map;
			_this.depthMap = depthTexture;
			_this._depthBuffer = depthBuffer;
			_this._lookTarget = new Vector3();
			_this._up = new Vector3(0, 1, 0);
			return _this;
		}
		var _proto = SpotLightShadow.prototype;
		_proto.update = function update(light) {
			this._updateCamera(light);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		};
		_proto._updateCamera = function _updateCamera(light) {
			var camera = this.camera;
			var lookTarget = this._lookTarget;

			// set camera position and lookAt(rotation)
			light.getWorldDirection(lookTarget);
			camera.position.setFromMatrixPosition(light.worldMatrix);
			lookTarget.multiplyScalar(-1).add(camera.position);
			camera.lookAt(lookTarget, this._up);

			// update view matrix
			camera.updateMatrix();

			// update projection
			// TODO distance should be custom?
			camera.setPerspective(light.angle * 2, 1, this.cameraNear, this.cameraFar);
		};
		_proto.copy = function copy(source) {
			_LightShadow.prototype.copy.call(this, source);
			this.frustumEdgeFalloff = source.frustumEdgeFalloff;
			return this;
		};
		_proto.prepareDepthMap = function prepareDepthMap(enable, capabilities) {
			var useDepthMap = enable && capabilities.version >= 2;
			var renderTarget = this.renderTarget;
			var attachments = renderTarget._attachments;
			var depthMapAttached = attachments[ATTACHMENT.DEPTH_ATTACHMENT] === this.depthMap;
			if (useDepthMap === depthMapAttached) return;
			if (useDepthMap) {
				if (capabilities.getExtension('OES_texture_float_linear')) {
					this.depthMap.type = PIXEL_TYPE.FLOAT;
				}
				renderTarget.dispose();
				renderTarget.attach(this.depthMap, ATTACHMENT.DEPTH_ATTACHMENT);
			} else {
				renderTarget.dispose();
				renderTarget.attach(this._depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			}
		};
		return SpotLightShadow;
	}(LightShadow);

	/**
	 * This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets.
	 * This light can cast shadows - see the {@link t3d.SpotLightShadow} page for details.
	 * @memberof t3d
	 * @extends t3d.Light
	 */
	var SpotLight = /*#__PURE__*/function (_Light) {
		_inheritsLoose(SpotLight, _Light);
		/**
		 * @param {Number} [color=0xffffff]
		 * @param {Number} [intensity=1]
		 * @param {Number} [distance=200]
		 * @param {Number} [angle=Math.PI/6]
		 * @param {Number} [penumbra=0]
		 * @param {Number} [decay=1]
		 */
		function SpotLight(color, intensity, distance, angle, penumbra, decay) {
			var _this;
			_this = _Light.call(this, color, intensity) || this;

			/**
			 * The amount the light dims along the distance of the light.
			 * @type {Number}
			 * @default 1
			 */
			_this.decay = decay !== undefined ? decay : 1;

			/**
			 * The distance from the light where the intensity is 0.
			 * @type {Number}
			 * @default 200
			 */
			_this.distance = distance !== undefined ? distance : 200;

			/**
			 * Percent of the spotlight cone that is attenuated due to penumbra.
			 * Takes values between zero and 1.
			 * @type {Number}
			 * @default 0
			 */
			_this.penumbra = penumbra !== undefined ? penumbra : 0;

			/**
			 * Maximum extent of the spotlight, in radians, from its direction.
			 * Should be no more than Math.PI/2.
			 * @type {Number}
			 * @default Math.PI/6
			 */
			_this.angle = angle !== undefined ? angle : Math.PI / 6;

			/**
			 * A {@link t3d.SpotLightShadow} used to calculate shadows for this light.
			 * @type {t3d.SpotLightShadow}
			 * @default t3d.SpotLightShadow()
			 */
			_this.shadow = new SpotLightShadow();
			return _this;
		}
		var _proto = SpotLight.prototype;
		_proto.copy = function copy(source) {
			_Light.prototype.copy.call(this, source);
			this.shadow.copy(source.shadow);
			return this;
		};
		return SpotLight;
	}(Light);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	SpotLight.prototype.isSpotLight = true;

	/**
	 * A bone which is part of a Skeleton.
	 * The skeleton in turn is used by the SkinnedMesh.
	 * Bones are almost identical to a blank Object3D.
	 * Bone acturely is a joint.
	 * The position means joint position.
	 * Mesh transform is based this joint space.
	 * @memberof t3d
	 * @extends t3d.Object3D
	 */
	var Bone = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Bone, _Object3D);
		function Bone() {
			return _Object3D.call(this) || this;
		}
		return Bone;
	}(Object3D);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	Bone.prototype.isBone = true;

	/**
	 * A mesh that has a {@link t3d.Skeleton} with bones that can then be used to animate the vertices of the geometry.
	 * The material must support skinning.
	 * @memberof t3d
	 * @extends t3d.Mesh
	 */
	var SkinnedMesh = /*#__PURE__*/function (_Mesh) {
		_inheritsLoose(SkinnedMesh, _Mesh);
		function SkinnedMesh(geometry, material) {
			var _this;
			_this = _Mesh.call(this, geometry, material) || this;

			/**
			 * Skeleton created from the bones of the Geometry.
			 * @type {t3d.Skeleton}
			 */
			_this.skeleton = undefined;

			/**
			 * Either "attached" or "detached".
			 * "attached" uses the {@link t3d.SkinnedMesh#worldMatrix} property for the base transform matrix of the bones.
			 * "detached" uses the {@link t3d.SkinnedMesh#bindMatrix}.
			 * @type {String}
			 * @default "attached"
			 */
			_this.bindMode = 'attached';

			/**
			 * The base matrix that is used for the bound bone transforms.
			 * @type {t3d.Matrix4}
			 */
			_this.bindMatrix = new Matrix4();

			/**
			 * The base matrix that is used for resetting the bound bone transforms.
			 * @type {t3d.Matrix4}
			 */
			_this.bindMatrixInverse = new Matrix4();
			return _this;
		}

		/**
		 * Bind a skeleton to the skinned mesh.
		 * The bindMatrix gets saved to .bindMatrix property and the .bindMatrixInverse gets calculated.
		 * @param {t3d.Skeleton} skeleton - Skeleton created from a Bones tree.
		 * @param {t3d.Matrix4} [bindMatrix=] - Matrix4 that represents the base transform of the skeleton.
		 */
		var _proto = SkinnedMesh.prototype;
		_proto.bind = function bind(skeleton, bindMatrix) {
			this.skeleton = skeleton;
			if (bindMatrix === undefined) {
				this.updateMatrix();
				bindMatrix = this.worldMatrix;
			}
			this.bindMatrix.copy(bindMatrix);
			this.bindMatrixInverse.getInverse(bindMatrix);
		};
		_proto.updateMatrix = function updateMatrix(force) {
			_Mesh.prototype.updateMatrix.call(this, force);
			if (this.bindMode === 'attached') {
				this.bindMatrixInverse.getInverse(this.worldMatrix);
			} else if (this.bindMode === 'detached') {
				this.bindMatrixInverse.getInverse(this.bindMatrix);
			} else {
				console.warn('t3d.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode);
			}
		};
		_proto.copy = function copy(source) {
			_Mesh.prototype.copy.call(this, source);
			this.bindMode = source.bindMode;
			this.bindMatrix.copy(source.bindMatrix);
			this.bindMatrixInverse.copy(source.bindMatrixInverse);
			this.skeleton = source.skeleton;
			return this;
		};
		return SkinnedMesh;
	}(Mesh);
	/**
	 * @readonly
	 * @type {Boolean}
	 * @default true
	 */
	SkinnedMesh.prototype.isSkinnedMesh = true;

	var Group = /*#__PURE__*/function (_Object3D) {
		_inheritsLoose(Group, _Object3D);
		function Group() {
			return _Object3D.call(this) || this; // console.warn("Group has been removed, use Object3D instead.");
		}
		return Group;
	}(Object3D);
	Group.prototype.isGroup = true;
	var EnvironmentMapPass = function EnvironmentMapPass() {
		console.error("EnvironmentMapPass has been removed, use ReflectionProbe(jsm) instead.");
	};
	Vector3.prototype.applyProjection = function (_m) {
		console.error("t3d.Vector3: .applyProjection has been removed. Use .applyMatrix4 instead.");
	};
	Object.defineProperties(Camera.prototype, {
		gammaInput: {
			configurable: true,
			get: function get() {
				console.warn("t3d.Camera: .gammaInput has been removed. Use texture.encoding instead.");
				return false;
			},
			set: function set(_value) {
				console.warn("t3d.Camera: .gammaInput has been removed. Use texture.encoding instead.");
			}
		},
		gammaOutput: {
			configurable: true,
			get: function get() {
				console.warn("t3d.Camera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
				return this.outputEncoding == TEXEL_ENCODING_TYPE.GAMMA;
			},
			set: function set(value) {
				console.warn("t3d.Camera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
				if (value) {
					this.outputEncoding = TEXEL_ENCODING_TYPE.GAMMA;
				} else {
					this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
				}
			}
		}
	});
	Object.defineProperties(Material.prototype, {
		emissiveIntensity: {
			configurable: true,
			get: function get() {
				console.warn("t3d.Material: .emissiveIntensity has been removed. Use material.emissive instead.");
				return false;
			},
			set: function set(_value) {
				console.warn("t3d.Material: .emissiveIntensity has been removed. Use material.emissive instead.");
			}
		}
	});
	Object.defineProperties(WebGLRenderPass.prototype, {
		textures: {
			configurable: true,
			get: function get() {
				console.warn("WebGLRenderPass: .textures has been deprecated. All methods are moved to WebGLRenderPass.");
				return this._textures;
			}
		},
		renderBuffers: {
			configurable: true,
			get: function get() {
				console.warn("WebGLRenderPass: .renderBuffers has been deprecated. All methods are moved to WebGLRenderPass.");
				return this._renderBuffers;
			}
		},
		renderTarget: {
			configurable: true,
			get: function get() {
				// console.warn("WebGLRenderPass: .renderTarget has been deprecated. All methods are moved to WebGLRenderPass.");
				return this._renderTargets;
			}
		},
		state: {
			configurable: true,
			get: function get() {
				// console.warn("WebGLRenderPass: .state has been deprecated. All methods are moved to WebGLRenderPass.");
				return this._state;
			}
		},
		vertexArrayBindings: {
			configurable: true,
			get: function get() {
				console.warn("WebGLRenderPass: .vertexArrayBindings has been deprecated. All methods are moved to WebGLRenderPass.");
				return this._vertexArrayBindings;
			}
		}
	});

	// since 0.1.6
	WebGLRenderPass.prototype.render = function (renderable, renderStates, options) {
		console.warn('WebGLRenderPass: .render() has been renamed to .renderRenderableItem().');
		this.renderRenderableItem(renderable, renderStates, options);
	};
	WebGLVertexArrayBindings.prototype.resetBinding = function () {
		console.error("WebGLVertexArrayBindings: .resetBinding() has been removed. Use WebGLRenderPass.resetVertexArrayBindings() instead.");
	};
	WebGLGeometries.prototype.setBufferExternal = function (buffer, webglBuffer) {
		console.warn("WebGLGeometries: .setBufferExternal has been removed. Use WebGLRenderPass.setBufferExternal instead.");
		this._buffers.setBufferExternal(buffer, webglBuffer);
	};

	// Enum for WebGL Texture Type.
	var WEBGL_TEXTURE_TYPE = {
		TEXTURE_2D: 0x0DE1,
		TEXTURE_CUBE_MAP: 0x8513,
		/** Only webgl2 */
		TEXTURE_3D: 0x806F
	};
	Object.defineProperties(TextureBase.prototype, {
		textureType: {
			configurable: true,
			get: function get() {
				console.warn("TextureBase: .textureType has been removed.");
				return "";
			},
			set: function set(_value) {
				console.warn("TextureBase: .textureType has been removed.");
			}
		}
	});
	Object.defineProperties(Texture2D, {
		textureType: {
			configurable: true,
			get: function get() {
				console.warn("Texture2D: .textureType has been removed.");
				return WEBGL_TEXTURE_TYPE.TEXTURE_2D;
			},
			set: function set(_value) {
				console.warn("Texture2D: .textureType has been removed.");
			}
		}
	});
	Object.defineProperties(Texture3D, {
		textureType: {
			configurable: true,
			get: function get() {
				console.warn("Texture3D: .textureType has been removed.");
				return WEBGL_TEXTURE_TYPE.TEXTURE_3D;
			},
			set: function set(_value) {
				console.warn("Texture3D: .textureType has been removed.");
			}
		}
	});
	Object.defineProperties(TextureCube, {
		textureType: {
			configurable: true,
			get: function get() {
				console.warn("TextureCube: .textureType has been removed.");
				return WEBGL_TEXTURE_TYPE.TEXTURE_CUBE_MAP;
			},
			set: function set(_value) {
				console.warn("TextureCube: .textureType has been removed.");
			}
		}
	});

	// Enum for light Type.
	var LIGHT_TYPE = {
		AMBIENT: "ambient",
		HEMISPHERE: "hemisphere",
		DIRECT: "direct",
		POINT: "point",
		SPOT: "spot"
	};
	Object.defineProperties(Light.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("Light: .lightType has been removed.");
				return "";
			},
			set: function set(_value) {
				console.warn("Light: .lightType has been removed.");
			}
		}
	});
	Object.defineProperties(AmbientLight.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("AmbientLight: .lightType has been removed.");
				return LIGHT_TYPE.AMBIENT;
			},
			set: function set(_value) {
				console.warn("AmbientLight: .lightType has been removed.");
			}
		}
	});
	Object.defineProperties(DirectionalLight.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("DirectionalLight: .lightType has been removed.");
				return LIGHT_TYPE.DIRECT;
			},
			set: function set(_value) {
				console.warn("DirectionalLight: .lightType has been removed.");
			}
		}
	});
	Object.defineProperties(HemisphereLight.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("HemisphereLight: .lightType has been removed.");
				return LIGHT_TYPE.HEMISPHERE;
			},
			set: function set(_value) {
				console.warn("HemisphereLight: .lightType has been removed.");
			}
		}
	});
	Object.defineProperties(PointLight.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("PointLight: .lightType has been removed.");
				return LIGHT_TYPE.POINT;
			},
			set: function set(_value) {
				console.warn("PointLight: .lightType has been removed.");
			}
		}
	});
	Object.defineProperties(SpotLight.prototype, {
		lightType: {
			configurable: true,
			get: function get() {
				console.warn("SpotLight: .lightType has been removed.");
				return LIGHT_TYPE.SPOT;
			},
			set: function set(_value) {
				console.warn("SpotLight: .lightType has been removed.");
			}
		}
	});

	// Enum for object Type.
	var OBJECT_TYPE = {
		MESH: "mesh",
		SKINNED_MESH: "skinned_mesh",
		LIGHT: "light",
		CAMERA: "camera",
		SCENE: "scene",
		GROUP: "group"
	};
	Object.defineProperties(Mesh.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("Mesh: .type has been removed, use .isMesh instead.");
				return OBJECT_TYPE.MESH;
			},
			set: function set(_value) {
				console.warn("Mesh: .type has been removed.");
			}
		}
	});
	Object.defineProperties(SkinnedMesh.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("SkinnedMesh: .type has been removed, use .isSkinnedMesh instead.");
				return OBJECT_TYPE.SKINNED_MESH;
			},
			set: function set(_value) {
				console.warn("SkinnedMesh: .type has been removed.");
			}
		}
	});
	Object.defineProperties(Light.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("Light: .type has been removed, use .isLight instead.");
				return OBJECT_TYPE.LIGHT;
			},
			set: function set(_value) {
				console.warn("Light: .type has been removed.");
			}
		}
	});
	Object.defineProperties(Camera.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("Camera: .type has been removed, use .isCamera instead.");
				return OBJECT_TYPE.CAMERA;
			},
			set: function set(_value) {
				console.warn("Camera: .type has been removed.");
			}
		}
	});
	Object.defineProperties(Scene.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("Scene: .type has been removed, use .isScene instead.");
				return OBJECT_TYPE.SCENE;
			},
			set: function set(_value) {
				console.warn("Scene: .type has been removed.");
			}
		}
	});
	Object.defineProperties(Group.prototype, {
		type: {
			configurable: true,
			get: function get() {
				console.warn("Group: .type has been removed, use .isGroup instead.");
				return OBJECT_TYPE.GROUP;
			},
			set: function set(_value) {
				console.warn("Group: .type has been removed.");
			}
		}
	});

	// Enum for fog Type.
	var FOG_TYPE = {
		NORMAL: "normal",
		EXP2: "exp2"
	};
	Object.defineProperties(Fog.prototype, {
		fogType: {
			configurable: true,
			get: function get() {
				console.warn("Fog: .fogType has been removed, use .isFog instead.");
				return FOG_TYPE.NORMAL;
			},
			set: function set(_value) {
				console.warn("Fog: .fogType has been removed.");
			}
		}
	});
	Object.defineProperties(FogExp2.prototype, {
		fogType: {
			configurable: true,
			get: function get() {
				console.warn("FogExp2: .fogType has been removed, use .isFogExp2 instead.");
				return FOG_TYPE.EXP2;
			},
			set: function set(_value) {
				console.warn("FogExp2: .fogType has been removed.");
			}
		}
	});
	Texture2D.fromImage = function (image) {
		console.warn("Texture2D.fromImage has been removed.");
		var texture = new Texture2D();
		texture.image = image;
		texture.version++;
		return texture;
	};
	Texture2D.fromSrc = function (src) {
		console.warn("Texture2D.fromSrc has been removed, use Texture2DLoader(jsm) instead.");
		var texture = new Texture2D();
		var loader = new ImageLoader();
		loader.load(src, function (image) {
			texture.image = image;
			texture.version++;
			texture.dispatchEvent({
				type: 'onload'
			});
		});
		return texture;
	};
	TextureCube.fromImage = function (imageArray) {
		console.warn("TextureCube.fromImage has been removed.");
		var texture = new TextureCube();
		var images = texture.images;
		for (var i = 0; i < 6; i++) {
			images[i] = imageArray[i];
		}
		texture.version++;
		return texture;
	};
	TextureCube.fromSrc = function (srcArray) {
		console.warn("TextureCube.fromSrc has been removed, use TextureCubeLoader(jsm) instead.");
		var texture = new TextureCube();
		var images = texture.images;
		var loader = new ImageLoader();
		var count = 0;
		function next(image) {
			if (image) {
				images.push(image);
				count++;
			}
			if (count >= 6) {
				loaded();
				return;
			}
			loader.load(srcArray[count], next);
		}
		next();
		function loaded() {
			texture.version++;
			texture.dispatchEvent({
				type: 'onload'
			});
		}
		return texture;
	};

	exports.ATTACHMENT = ATTACHMENT;
	exports.AmbientLight = AmbientLight;
	exports.AnimationAction = AnimationAction;
	exports.AnimationMixer = AnimationMixer;
	exports.Attribute = Attribute;
	exports.BLEND_EQUATION = BLEND_EQUATION;
	exports.BLEND_FACTOR = BLEND_FACTOR;
	exports.BLEND_TYPE = BLEND_TYPE;
	exports.BUFFER_USAGE = BUFFER_USAGE;
	exports.BasicMaterial = BasicMaterial;
	exports.Bone = Bone;
	exports.BooleanKeyframeTrack = BooleanKeyframeTrack;
	exports.Box2 = Box2;
	exports.Box3 = Box3;
	exports.BoxGeometry = BoxGeometry;
	exports.Buffer = Buffer;
	exports.COMPARE_FUNC = COMPARE_FUNC;
	exports.CULL_FACE_TYPE = CULL_FACE_TYPE;
	exports.Camera = Camera;
	exports.Color3 = Color3;
	exports.ColorKeyframeTrack = ColorKeyframeTrack;
	exports.CubeGeometry = BoxGeometry;
	exports.CylinderGeometry = CylinderGeometry;
	exports.DRAW_MODE = DRAW_MODE;
	exports.DRAW_SIDE = DRAW_SIDE;
	exports.DefaultLoadingManager = DefaultLoadingManager;
	exports.DepthMaterial = DepthMaterial;
	exports.DirectionalLight = DirectionalLight;
	exports.DirectionalLightShadow = DirectionalLightShadow;
	exports.DistanceMaterial = DistanceMaterial;
	exports.ENVMAP_COMBINE_TYPE = ENVMAP_COMBINE_TYPE;
	exports.EnvironmentMapPass = EnvironmentMapPass;
	exports.Euler = Euler;
	exports.EventDispatcher = EventDispatcher;
	exports.FOG_TYPE = FOG_TYPE;
	exports.FileLoader = FileLoader;
	exports.Fog = Fog;
	exports.FogExp2 = FogExp2;
	exports.Frustum = Frustum;
	exports.Geometry = Geometry;
	exports.Group = Group;
	exports.HemisphereLight = HemisphereLight;
	exports.ImageLoader = ImageLoader;
	exports.KeyframeClip = KeyframeClip;
	exports.KeyframeTrack = KeyframeTrack;
	exports.LIGHT_TYPE = LIGHT_TYPE;
	exports.LambertMaterial = LambertMaterial;
	exports.Light = Light;
	exports.LightData = LightData;
	exports.LightShadow = LightShadow;
	exports.LineMaterial = LineMaterial;
	exports.Loader = Loader;
	exports.LoadingManager = LoadingManager;
	exports.MATERIAL_TYPE = MATERIAL_TYPE;
	exports.MatcapMaterial = MatcapMaterial;
	exports.Material = Material;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4;
	exports.Mesh = Mesh;
	exports.NumberKeyframeTrack = NumberKeyframeTrack;
	exports.OBJECT_TYPE = OBJECT_TYPE;
	exports.OPERATION = OPERATION;
	exports.Object3D = Object3D;
	exports.PBR2Material = PBR2Material;
	exports.PBRMaterial = PBRMaterial;
	exports.PIXEL_FORMAT = PIXEL_FORMAT;
	exports.PIXEL_TYPE = PIXEL_TYPE;
	exports.PhongMaterial = PhongMaterial;
	exports.Plane = Plane;
	exports.PlaneGeometry = PlaneGeometry;
	exports.PointLight = PointLight;
	exports.PointLightShadow = PointLightShadow;
	exports.PointsMaterial = PointsMaterial;
	exports.PropertyBindingMixer = PropertyBindingMixer;
	exports.QUERY_TYPE = QUERY_TYPE;
	exports.Quaternion = Quaternion;
	exports.QuaternionKeyframeTrack = QuaternionKeyframeTrack;
	exports.Query = Query;
	exports.Ray = Ray;
	exports.RenderBuffer = RenderBuffer;
	exports.RenderInfo = RenderInfo;
	exports.RenderQueue = RenderQueue;
	exports.RenderQueueLayer = RenderQueueLayer;
	exports.RenderStates = RenderStates;
	exports.RenderTarget2D = RenderTarget2D;
	exports.RenderTargetBack = RenderTargetBack;
	exports.RenderTargetBase = RenderTargetBase;
	exports.RenderTargetCube = RenderTargetCube;
	exports.Renderer = Renderer;
	exports.SHADING_TYPE = SHADING_TYPE;
	exports.SHADOW_TYPE = SHADOW_TYPE;
	exports.Scene = Scene;
	exports.SceneData = SceneData;
	exports.ShaderChunk = ShaderChunk;
	exports.ShaderLib = ShaderLib;
	exports.ShaderMaterial = ShaderMaterial;
	exports.ShaderPostPass = ShaderPostPass;
	exports.ShadowMapPass = ShadowMapPass;
	exports.Skeleton = Skeleton;
	exports.SkinnedMesh = SkinnedMesh;
	exports.Sphere = Sphere;
	exports.SphereGeometry = SphereGeometry;
	exports.Spherical = Spherical;
	exports.SphericalHarmonics3 = SphericalHarmonics3;
	exports.SphericalHarmonicsLight = SphericalHarmonicsLight;
	exports.SpotLight = SpotLight;
	exports.SpotLightShadow = SpotLightShadow;
	exports.StringKeyframeTrack = StringKeyframeTrack;
	exports.TEXEL_ENCODING_TYPE = TEXEL_ENCODING_TYPE;
	exports.TEXTURE_FILTER = TEXTURE_FILTER;
	exports.TEXTURE_WRAP = TEXTURE_WRAP;
	exports.Texture2D = Texture2D;
	exports.Texture3D = Texture3D;
	exports.TextureBase = TextureBase;
	exports.TextureCube = TextureCube;
	exports.TorusKnotGeometry = TorusKnotGeometry;
	exports.Triangle = Triangle;
	exports.VERTEX_COLOR = VERTEX_COLOR;
	exports.Vector2 = Vector2;
	exports.Vector3 = Vector3;
	exports.Vector4 = Vector4;
	exports.VectorKeyframeTrack = VectorKeyframeTrack;
	exports.WEBGL_COMPARE_FUNC = COMPARE_FUNC;
	exports.WEBGL_OP = OPERATION;
	exports.WEBGL_PIXEL_FORMAT = PIXEL_FORMAT;
	exports.WEBGL_PIXEL_TYPE = PIXEL_TYPE;
	exports.WEBGL_TEXTURE_FILTER = TEXTURE_FILTER;
	exports.WEBGL_TEXTURE_TYPE = WEBGL_TEXTURE_TYPE;
	exports.WEBGL_TEXTURE_WRAP = TEXTURE_WRAP;
	exports.WebGLAttribute = WebGLAttribute;
	exports.WebGLCapabilities = WebGLCapabilities;
	exports.WebGLGeometries = WebGLGeometries;
	exports.WebGLProgram = WebGLProgram;
	exports.WebGLPrograms = WebGLPrograms;
	exports.WebGLProperties = WebGLProperties;
	exports.WebGLQueries = WebGLQueries;
	exports.WebGLRenderBuffers = WebGLRenderBuffers;
	exports.WebGLRenderPass = WebGLRenderPass;
	exports.WebGLState = WebGLState;
	exports.WebGLTextures = WebGLTextures;
	exports.WebGLUniforms = WebGLUniforms;
	exports.cloneJson = cloneJson;
	exports.cloneUniforms = cloneUniforms;
	exports.generateUUID = generateUUID;
	exports.isPowerOfTwo = isPowerOfTwo;
	exports.nearestPowerOfTwo = nearestPowerOfTwo;
	exports.nextPowerOfTwo = nextPowerOfTwo;

}));
