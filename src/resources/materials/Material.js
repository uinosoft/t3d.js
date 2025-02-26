import { BLEND_TYPE, BLEND_EQUATION, BLEND_FACTOR, ENVMAP_COMBINE_TYPE, DRAW_SIDE, SHADING_TYPE, DRAW_MODE, COMPARE_FUNC, OPERATION, VERTEX_COLOR, MATERIAL_TYPE } from '../../const.js';
import { cloneUniforms } from '../../base.js';
import { EventDispatcher } from '../../EventDispatcher.js';
import { Color3 } from '../../math/Color3.js';
import { Vector2 } from '../../math/Vector2.js';
import { TransformUV } from '../TransformUV.js';
import { MathUtils } from '../../math/MathUtils.js';

let _materialId = 0;

/**
 * Abstract base class for materials.
 * Materials describe the appearance of {@link Object3D}.
 * They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.
 * The following properties and methods are inherited by all other material types (although they may have different defaults).
 * @abstract
 * @extends EventDispatcher
 */
class Material extends EventDispatcher {

	constructor() {
		super();

		/**
		 * Unique number for this material instance.
		 * @readonly
		 * @type {number}
		 */
		this.id = _materialId++;

		/**
		 * UUID of this material instance.
		 * This gets automatically assigned, so this shouldn't be edited.
		 * @type {string}
		 */
		this.uuid = MathUtils.generateUUID();

		/**
		 * Type of the material.
		 * @type {MATERIAL_TYPE}
		 * @default MATERIAL_TYPE.SHADER
		 */
		this.type = MATERIAL_TYPE.SHADER;

		/**
		 * Custom shader name. This naming can help ShaderMaterial to optimize the length of the index hash string.
		 * It is valid only when the material type is MATERIAL_TYPE.SHADER.
		 * Otherwise, if the material is a built-in type, the name of the shader will always be equal to the material type.
		 * @type {string}
		 * @default ""
		 */
		this.shaderName = '';

		/**
		 * Custom defines of the shader.
		 * Only valid when the material type is MATERIAL_TYPE.SHADER.
		 * @type {object}
		 * @default {}
		 */
		this.defines = {};

		/**
		 * Custom uniforms of the shader.
		 * Only valid when the material type is MATERIAL_TYPE.SHADER.
		 * @type {object}
		 * @default {}
		 */
		this.uniforms = {};

		/**
		 * Custom GLSL code for vertex shader.
		 * Only valid when the material type is MATERIAL_TYPE.SHADER.
		 * @type {string}
		 * @default ""
		 */
		this.vertexShader = '';

		/**
		 * Custom GLSL code for fragment shader.
		 * Only valid when the material type is MATERIAL_TYPE.SHADER.
		 * @type {string}
		 * @default ""
		 */
		this.fragmentShader = '';

		/**
		 * Override the renderer's default precision for this material.
		 * Can be "highp", "mediump" or "lowp".
		 * @type {string}
		 * @default null
		 */
		this.precision = null;

		/**
		 * The bitmask of UV coordinate channels to use for the external texture.
		 * This will be combined with the internal UV coordinate mask collected from the renderer by default.
		 * Finally, it will be used to determine which UV coordinate attribute to use and to generate the shader code.
		 * @type {number}
		 * @default 0
		 */
		this.extUvCoordMask = 0;

		/**
		 * Defines whether this material is transparent.
		 * This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
		 * When set to true, the extent to which the material is transparent is controlled by setting it's blending property.
		 * @type {boolean}
		 * @default false
		 */
		this.transparent = false;

		/**
		 * Which blending to use when displaying objects with this material.
		 * This must be set to BLEND_TYPE.CUSTOM to use custom blendSrc, blendDst or blendEquation.
		 * @type {BLEND_TYPE}
		 * @default BLEND_TYPE.NORMAL
		 */
		this.blending = BLEND_TYPE.NORMAL;

		/**
		 * Blending source.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_FACTOR}
		 * @default BLEND_FACTOR.SRC_ALPHA
		 */
		this.blendSrc = BLEND_FACTOR.SRC_ALPHA;

		/**
		 * Blending destination.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_FACTOR}
		 * @default BLEND_FACTOR.ONE_MINUS_SRC_ALPHA
		 */
		this.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

		/**
		 * Blending equation to use when applying blending.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_EQUATION}
		 * @default BLEND_EQUATION.ADD
		 */
		this.blendEquation = BLEND_EQUATION.ADD;

		/**
		 * The transparency of the {@link Material#blendSrc}.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_FACTOR}
		 * @default null
		 */
		this.blendSrcAlpha = null;

		/**
		 * The transparency of the {@link Material#blendDst}.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_FACTOR}
		 * @default null
		 */
		this.blendDstAlpha = null;

		/**
		 * The tranparency of the {@link Material#blendEquation}.
		 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
		 * @type {BLEND_EQUATION}
		 * @default null
		 */
		this.blendEquationAlpha = null;

		/**
		 * Whether to premultiply the alpha (transparency) value.
		 * @type {boolean}
		 * @default false
		 */
		this.premultipliedAlpha = false;

		/**
		 * Defines whether vertex coloring is used.
		 * @type {VERTEX_COLOR}
		 * @default VERTEX_COLOR.NONE
		 */
		this.vertexColors = VERTEX_COLOR.NONE;

		/**
		 * Defines whether precomputed vertex tangents, which must be provided in a vec4 "tangent" attribute, are used.
		 * When disabled, tangents are derived automatically.
		 * Using precomputed tangents will give more accurate normal map details in some cases, such as with mirrored UVs.
		 * @type {boolean}
		 * @default false
		 */
		this.vertexTangents = false;

		/**
		 * Float in the range of 0.0 - 1.0 indicating how transparent the material is.
		 * A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
		 * @type {number}
		 * @default 1
		 */
		this.opacity = 1;

		/**
		 * The diffuse color.
		 * @type {Color3}
		 * @default Color3(0xffffff)
		 */
		this.diffuse = new Color3(0xffffff);

		/**
		 * The diffuse map.
		 * @type {Texture2D}
		 * @default null
		 */
		this.diffuseMap = null;

		/**
		 * Define the UV chanel for the diffuse map to use starting from 0 and defaulting to 0.
		 * @type {number}
		 * @default 0
		 */
		this.diffuseMapCoord = 0;

		/**
		 * The uv-transform matrix of diffuse map.
		 * This will also affect other maps that cannot be individually specified uv transform, such as normalMap, bumpMap, etc.
		 * @type {TransformUV}
		 * @default TransformUV()
		 */
		this.diffuseMapTransform = new TransformUV();

		/**
		 * The alpha map.
		 * @type {Texture2D}
		 * @default null
		 */
		this.alphaMap = null;

		/**
		 * Define the UV chanel for the alpha map to use starting from 0 and defaulting to 0.
		 * @type {number}
		 * @default 0
		 */
		this.alphaMapCoord = 0;

		/**
		 * The uv-transform matrix of alpha map.
		 * @type {TransformUV}
		 * @default TransformUV()
		 */
		this.alphaMapTransform = new TransformUV();

		/**
		 * Emissive (light) color of the material, essentially a solid color unaffected by other lighting.
		 * @type {Color3}
		 * @default Color3(0x000000)
		 */
		this.emissive = new Color3(0x000000);

		/**
		 * Set emissive (glow) map.
		 * The emissive map color is modulated by the emissive color.
		 * If you have an emissive map, be sure to set the emissive color to something other than black.
		 * @type {Texture2D}
		 * @default null
		 */
		this.emissiveMap = null;

		/**
		 * Define the UV chanel for the emissive map to use starting from 0 and defaulting to 0.
		 * @type {number}
		 * @default 0
		 */
		this.emissiveMapCoord = 0;

		/**
		 * The uv-transform matrix of emissive map.
		 * @type {TransformUV}
		 * @default TransformUV()
		 */
		this.emissiveMapTransform = new TransformUV();

		/**
		 * The red channel of this texture is used as the ambient occlusion map.
		 * @type {Texture2D}
		 * @default null
		 */
		this.aoMap = null;

		/**
		 * Intensity of the ambient occlusion effect.
		 * @type {number}
		 * @default 1
		 */
		this.aoMapIntensity = 1.0;

		/**
		 * Define the UV chanel for the ao map to use starting from 0 and defaulting to 0.
		 * @type {number}
		 * @default 0
		 */
		this.aoMapCoord = 0;

		/**
		 * The uv-transform matrix of ao map.
		 * @type {TransformUV}
		 * @default TransformUV()
		 */
		this.aoMapTransform = new TransformUV();

		/**
		 * The normal map.
		 * @type {Texture2D}
		 * @default null
		 */
		this.normalMap = null;

		/**
		 * How much the normal map affects the material. Typical ranges are 0-1.
		 * @type {Vector2}
		 * @default Vector2(1,1)
		 */
		this.normalScale = new Vector2(1, 1);

		/**
		 * The texture to create a bump map.
		 * The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting.
		 * @type {Texture2D}
		 * @default null
		 */
		this.bumpMap = null;

		/**
		 * How much the bump map affects the material.
		 * Typical ranges are 0-1.
		 * @type {number}
		 * @default 1
		 */
		this.bumpScale = 1;

		/**
		 * The environment map.
		 * If set to undefined, then the material will not inherit envMap from scene.environment.
		 * @type {TextureCube|null|undefined}
		 * @default null
		 */
		this.envMap = null;

		/**
		 * Scales the effect of the environment map by multiplying its color.
		 * This can effect both the diffuse and specular components of environment map.
		 * @type {number}
		 * @default 1
		 */
		this.envMapIntensity = 1;

		/**
		 * How to combine the result of the surface's color with the environment map, if any.
		 * This has no effect in a {@link PBRMaterial}.
		 * @type {ENVMAP_COMBINE_TYPE}
		 * @default ENVMAP_COMBINE_TYPE.MULTIPLY
		 */
		this.envMapCombine = ENVMAP_COMBINE_TYPE.MULTIPLY;

		/**
		 * Which depth function to use. See the {@link COMPARE_FUNC} constants for all possible values.
		 * @type {COMPARE_FUNC}
		 * @default COMPARE_FUNC.LEQUAL
		 */
		this.depthFunc = COMPARE_FUNC.LEQUAL;

		/**
		 * Whether to have depth test enabled when rendering this material.
		 * @type {boolean}
		 * @default true
		 */
		this.depthTest = true;

		/**
		 * Whether rendering this material has any effect on the depth buffer.
		 * When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.
		 * @type {boolean}
		 * @default true
		 */
		this.depthWrite = true;

		/**
		 * Whether to render the material's color.
		 * This can be used in conjunction with a mesh's renderOrder property to create invisible objects that occlude other objects.
		 * @type {boolean}
		 * @default true
		 */
		this.colorWrite = true;

		/**
		 * Whether stencil operations are performed against the stencil buffer.
		 * In order to perform writes or comparisons against the stencil buffer this value must be true.
		 * @type {boolean}
		 * @default false
		 */
		this.stencilTest = false;

		/**
		 * The bit mask to use when writing to the stencil buffer.
		 * @type {number}
		 * @default 0xFF
		 */
		this.stencilWriteMask = 0xff;

		/**
		 * The stencil comparison function to use.
		 * See the {@link COMPARE_FUNC} constants for all possible values.
		 * @type {COMPARE_FUNC}
		 * @default COMPARE_FUNC.ALWAYS
		 */
		this.stencilFunc = COMPARE_FUNC.ALWAYS;

		/**
		 * The value to use when performing stencil comparisons or stencil operations.
		 * @type {number}
		 * @default 0
		 */
		this.stencilRef = 0;

		/**
		 * The bit mask to use when comparing against the stencil buffer.
		 * @type {number}
		 * @default 0xFF
		 */
		this.stencilFuncMask = 0xff;

		/**
		 * Which stencil operation to perform when the comparison function returns false.
		 * See the {@link OPERATION} constants for all possible values.
		 * @type {OPERATION}
		 * @default OPERATION.KEEP
		 */
		this.stencilFail = OPERATION.KEEP;

		/**
		 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
		 * See the {@link OPERATION} constants for all possible values.
		 * @type {OPERATION}
		 * @default OPERATION.KEEP
		 */
		this.stencilZFail = OPERATION.KEEP;

		/**
		 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
		 * See the {@link OPERATION} constants for all possible values.
		 * @type {OPERATION}
		 * @default OPERATION.KEEP
		 */
		this.stencilZPass = OPERATION.KEEP;

		/**
		 * The stencil comparison function to use.
		 * See the {@link COMPARE_FUNC} constants for all possible values.
		 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
		 * @type {COMPARE_FUNC|null}
		 * @default null
		 */
		this.stencilFuncBack = null;

		/**
		 * The value to use when performing stencil comparisons or stencil operations.
		 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
		 * @type {number | null}
		 * @default null
		 */
		this.stencilRefBack = null;

		/**
		 * The bit mask to use when comparing against the stencil buffer.
		 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
		 * @type {number | null}
		 * @default null
		 */
		this.stencilFuncMaskBack = null;

		/**
		 * Which stencil operation to perform when the comparison function returns false.
		 * See the {@link OPERATION} constants for all possible values.
		 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
		 * @type {OPERATION|null}
		 * @default null
		 */
		this.stencilFailBack = null;

		/**
		 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
		 * See the {@link OPERATION} constants for all possible values.
		 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
		 * @type {OPERATION|null}
		 * @default null
		 */
		this.stencilZFailBack = null;

		/**
		 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
		 * See the {@link OPERATION} constants for all possible values.
		 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
		 * @type {OPERATION|null}
		 * @default null
		 */
		this.stencilZPassBack = null;

		/**
		 * User-defined clipping planes specified as Plane objects in world space.
		 * These planes apply to the objects this material is attached to.
		 * Points in space whose signed distance to the plane is negative are clipped (not rendered).
		 * @type {Plane[]}
		 * @default null
		 */
		this.clippingPlanes = null;

		/**
		 * Sets the alpha value to be used when running an alpha test.
		 * The material will not be renderered if the opacity is lower than this value.
		 * @type {number}
		 * @default 0
		 */
		this.alphaTest = 0;

		/**
		 * Enables alpha to coverage.
		 * Can only be used when MSAA is enabled.
		 * @type {boolean}
		 * @default false
		 */
		this.alphaToCoverage = false;

		/**
		 * Defines which side of faces will be rendered - front, back or double.
		 * @type {DRAW_SIDE}
		 * @default DRAW_SIDE.FRONT
		 */
		this.side = DRAW_SIDE.FRONT;

		/**
		 * Whether to use polygon offset.
		 * This corresponds to the GL_POLYGON_OFFSET_FILL WebGL feature.
		 * @type {boolean}
		 * @default false
		 */
		this.polygonOffset = false;

		/**
		 * Sets the polygon offset factor.
		 * @type {number}
		 * @default 0
		 */
		this.polygonOffsetFactor = 0;

		/**
		 * Sets the polygon offset units.
		 * @type {number}
		 * @default 0
		 */
		this.polygonOffsetUnits = 0;

		/**
		 * Define whether the material is rendered with flat shading or smooth shading.
		 * @type {SHADING_TYPE}
		 * @default SHADING_TYPE.SMOOTH_SHADING
		 */
		this.shading = SHADING_TYPE.SMOOTH_SHADING;

		/**
		 * Whether to apply dithering to the color to remove the appearance of banding.
		 * @type {boolean}
		 * @default false
		 */
		this.dithering = false;

		/**
		 * Whether the material is affected by lights.
		 * If set true, renderer will try to upload light uniforms.
		 * @type {boolean}
		 * @default false
		 */
		this.acceptLight = false;

		/**
		 * The lighting group of the material.
		 * Used in conjunction with {@link Light#groupMask}.
		 * @type {number}
		 * @default 0
		 */
		this.lightingGroup = 0;

		/**
		 * Whether the material is affected by fog.
		 * @type {boolean}
		 * @default true
		 */
		this.fog = true;

		/**
		 * Determines how the mesh triangles are constructed from the vertices.
		 * @type {DRAW_MODE}
		 * @default DRAW_MODE.TRIANGLES
		 */
		this.drawMode = DRAW_MODE.TRIANGLES;

		/**
		 * Whether the material uniforms need to be updated every draw call.
		 * If set false, the material uniforms are only updated once per frame , this can help optimize performance.
		 * @type {boolean}
		 * @default true
		 */
		this.forceUpdateUniforms = true;

		/**
		 * Specifies that the material needs to be recompiled.
		 * This property is automatically set to true when instancing a new material.
		 * @type {boolean}
		 * @default true
		 */
		this.needsUpdate = true;
	}

	/**
	 * Copy the parameters from the passed material into this material.
	 * @param {Material} source - The material to be copied.
	 * @returns {Material}
	 */
	copy(source) {
		this.shaderName = source.shaderName;
		this.defines = Object.assign({}, source.defines);
		this.uniforms = cloneUniforms(source.uniforms);
		this.vertexShader = source.vertexShader;
		this.fragmentShader = source.fragmentShader;

		this.precision = source.precision;
		this.extUvCoordMask = source.extUvCoordMask;

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
		this.lightingGroup = source.lightingGroup;
		this.fog = source.fog;
		this.drawMode = source.drawMode;

		return this;
	}

	/**
	 * Return a new material with the same parameters as this material.
	 * @returns {Material}
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * This disposes the material.
	 * Textures of a material don't get disposed. These needs to be disposed by Texture.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

export { Material };