import { BLEND_TYPE, CULL_FACE_TYPE, DRAW_SIDE, COMPARE_FUNC, BLEND_EQUATION, BLEND_FACTOR } from '../const.js';
import { Vector4 } from '../math/Vector4.js';

function createTexture(gl, type, target, count) {
	const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
	const texture = gl.createTexture();

	gl.bindTexture(type, texture);
	gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	for (let i = 0; i < count; i++) {
		gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	}

	return texture;
}

function ColorBuffer(gl) {
	let locked = false;

	const color = new Vector4();
	let currentColorMask = null;
	const currentColorClear = new Vector4(0, 0, 0, 0);

	return {

		setMask: function(colorMask) {
			if (currentColorMask !== colorMask && !locked) {
				gl.colorMask(colorMask, colorMask, colorMask, colorMask);
				currentColorMask = colorMask;
			}
		},

		setLocked: function(lock) {
			locked = lock;
		},

		setClear: function(r, g, b, a, premultipliedAlpha) {
			if (premultipliedAlpha === true) {
				r *= a; g *= a; b *= a;
			}

			color.set(r, g, b, a);

			if (currentColorClear.equals(color) === false) {
				gl.clearColor(r, g, b, a);
				currentColorClear.copy(color);
			}
		},

		getClear: function() {
			return currentColorClear;
		},

		reset: function() {
			locked = false;

			currentColorMask = null;
			currentColorClear.set(-1, 0, 0, 0); // set to invalid state
		}

	};
}

function DepthBuffer(gl, state) {
	let locked = false;

	let currentDepthMask = null;
	let currentDepthFunc = null;
	let currentDepthClear = null;

	return {

		setTest: function(depthTest) {
			if (depthTest) {
				state.enable(gl.DEPTH_TEST);
			} else {
				state.disable(gl.DEPTH_TEST);
			}
		},

		setMask: function(depthMask) {
			if (currentDepthMask !== depthMask && !locked) {
				gl.depthMask(depthMask);
				currentDepthMask = depthMask;
			}
		},

		setFunc: function(depthFunc) {
			if (currentDepthFunc !== depthFunc) {
				gl.depthFunc(depthFunc);
				currentDepthFunc = depthFunc;
			}
		},

		setLocked: function(lock) {
			locked = lock;
		},

		setClear: function(depth) {
			if (currentDepthClear !== depth) {
				gl.clearDepth(depth);
				currentDepthClear = depth;
			}
		},

		reset: function() {
			locked = false;

			currentDepthMask = null;
			currentDepthFunc = null;
			currentDepthClear = null;
		}

	};
}

function StencilBuffer(gl, state) {
	let locked = false;

	let currentStencilMask = null;
	let currentStencilFunc = null;
	let currentStencilRef = null;
	let currentStencilFuncMask = null;
	let currentStencilFail = null;
	let currentStencilZFail = null;
	let currentStencilZPass = null;
	let currentStencilFuncBack = null;
	let currentStencilRefBack = null;
	let currentStencilFuncMaskBack = null;
	let currentStencilFailBack = null;
	let currentStencilZFailBack = null;
	let currentStencilZPassBack = null;
	let currentStencilClear = null;

	return {

		setTest: function(stencilTest) {
			if (stencilTest) {
				state.enable(gl.STENCIL_TEST);
			} else {
				state.disable(gl.STENCIL_TEST);
			}
		},

		setMask: function(stencilMask) {
			if (currentStencilMask !== stencilMask && !locked) {
				gl.stencilMask(stencilMask);
				currentStencilMask = stencilMask;
			}
		},

		setFunc: function(stencilFunc, stencilRef, stencilMask, stencilFuncBack, stencilRefBack, stencilMaskBack) {
			if (currentStencilFunc !== stencilFunc ||
				currentStencilRef !== stencilRef ||
				currentStencilFuncMask !== stencilMask ||
				currentStencilFuncBack !== stencilFuncBack ||
				currentStencilRefBack !== stencilRefBack ||
				currentStencilFuncMaskBack !== stencilMaskBack) {
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

		setOp: function(stencilFail, stencilZFail, stencilZPass, stencilFailBack, stencilZFailBack, stencilZPassBack) {
			if (currentStencilFail	 !== stencilFail 	||
				currentStencilZFail !== stencilZFail ||
				currentStencilZPass !== stencilZPass ||
				currentStencilFailBack	 !== stencilFailBack ||
				currentStencilZFailBack !== stencilZFailBack ||
				currentStencilZPassBack !== stencilZPassBack) {
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

		setLocked: function(lock) {
			locked = lock;
		},

		setClear: function(stencil) {
			if (currentStencilClear !== stencil) {
				gl.clearStencil(stencil);
				currentStencilClear = stencil;
			}
		},

		reset: function() {
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

class WebGLState {

	constructor(gl, capabilities) {
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

		const viewportParam = gl.getParameter(gl.VIEWPORT);
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

		this.blendEquationToGL = {
			[BLEND_EQUATION.ADD]: gl.FUNC_ADD,
			[BLEND_EQUATION.SUBTRACT]: gl.FUNC_SUBTRACT,
			[BLEND_EQUATION.REVERSE_SUBTRACT]: gl.FUNC_REVERSE_SUBTRACT,
			[BLEND_EQUATION.MIN]: gl.MIN,
			[BLEND_EQUATION.MAX]: gl.MAX
		};

		this.blendFactorToGL = {
			[BLEND_FACTOR.ZERO]: gl.ZERO,
			[BLEND_FACTOR.ONE]: gl.ONE,
			[BLEND_FACTOR.SRC_COLOR]: gl.SRC_COLOR,
			[BLEND_FACTOR.SRC_ALPHA]: gl.SRC_ALPHA,
			[BLEND_FACTOR.SRC_ALPHA_SATURATE]: gl.SRC_ALPHA_SATURATE,
			[BLEND_FACTOR.DST_COLOR]: gl.DST_COLOR,
			[BLEND_FACTOR.DST_ALPHA]: gl.DST_ALPHA,
			[BLEND_FACTOR.ONE_MINUS_SRC_COLOR]: gl.ONE_MINUS_SRC_COLOR,
			[BLEND_FACTOR.ONE_MINUS_SRC_ALPHA]: gl.ONE_MINUS_SRC_ALPHA,
			[BLEND_FACTOR.ONE_MINUS_DST_COLOR]: gl.ONE_MINUS_DST_COLOR,
			[BLEND_FACTOR.ONE_MINUS_DST_ALPHA]: gl.ONE_MINUS_DST_ALPHA
		};

		// init

		this.colorBuffer.setClear(0, 0, 0, 1);
		this.depthBuffer.setClear(1);
		this.stencilBuffer.setClear(0);

		this.depthBuffer.setTest(true);
		this.depthBuffer.setFunc(COMPARE_FUNC.LEQUAL);

		this.setFlipSided(false);
		this.setCullFace(CULL_FACE_TYPE.BACK);
	}

	enable(id) {
		if (this.states[id] !== true) {
			this.gl.enable(id);
			this.states[id] = true;
		}
	}

	disable(id) {
		if (this.states[id] !== false) {
			this.gl.disable(id);
			this.states[id] = false;
		}
	}

	setBlending(blend, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha) {
		const gl = this.gl;

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

			const equationToGL = this.blendEquationToGL;
			const factorToGL = this.blendFactorToGL;

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
	}

	setFlipSided(flipSided) {
		const gl = this.gl;

		if (this.currentFlipSided !== flipSided) {
			if (flipSided) {
				gl.frontFace(gl.CW);
			} else {
				gl.frontFace(gl.CCW);
			}

			this.currentFlipSided = flipSided;
		}
	}

	setCullFace(cullFace) {
		const gl = this.gl;

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
	}

	viewport(x, y, width, height) {
		const currentViewport = this.currentViewport;

		if (currentViewport.x !== x ||
            currentViewport.y !== y ||
            currentViewport.z !== width ||
            currentViewport.w !== height
		) {
			const gl = this.gl;
			gl.viewport(x, y, width, height);
			currentViewport.set(x, y, width, height);
		}
	}

	setLineWidth(width) {
		if (width !== this.currentLineWidth) {
			const lineWidthRange = this.capabilities.lineWidthRange;
			if (lineWidthRange[0] <= width && width <= lineWidthRange[1]) {
				this.gl.lineWidth(width);
			} else {
				console.warn('GL_ALIASED_LINE_WIDTH_RANGE is [' + lineWidthRange[0] + ',' + lineWidthRange[1] + '], but set to ' + width + '.');
			}
			this.currentLineWidth = width;
		}
	}

	setPolygonOffset(polygonOffset, factor, units) {
		const gl = this.gl;

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
	}

	setProgram(program) {
		if (this.currentProgram !== program) {
			this.gl.useProgram(program.program);
			this.currentProgram = program;
		}
	}

	bindBuffer(type, buffer) {
		const gl = this.gl;

		const boundBuffer = this.currentBoundBuffers[type];

		if (boundBuffer !== buffer) {
			gl.bindBuffer(type, buffer);
			this.currentBoundBuffers[type] = buffer;
		}
	}

	activeTexture(slot) {
		const gl = this.gl;

		if (slot === undefined) {
			slot = gl.TEXTURE0 + this.capabilities.maxTextures - 1;
		}

		if (this.currentTextureSlot !== slot) {
			gl.activeTexture(slot);
			this.currentTextureSlot = slot;
		}
	}

	bindTexture(type, texture) {
		const gl = this.gl;

		if (this.currentTextureSlot === null) {
			this.activeTexture();
		}

		let boundTexture = this.currentBoundTextures[this.currentTextureSlot];

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
	}

	reset() {
		const gl = this.gl;

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
	}

	setMaterial(material, frontFaceCW) {
		this.setCullFace(
			(material.side === DRAW_SIDE.DOUBLE) ? CULL_FACE_TYPE.NONE : CULL_FACE_TYPE.BACK
		);

		let flipSided = (material.side === DRAW_SIDE.BACK);
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

		const stencilTest = material.stencilTest;
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

		material.alphaToCoverage === true
			? this.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE)
			: this.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
	}

}

export { WebGLState };