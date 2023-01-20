/**
 * InstancedLine
 */

import {
	Mesh,
	Geometry,
	Vector3,
	Attribute,
	Buffer,
	ShaderMaterial
} from 't3d';

export class InstancedLine extends Mesh {

	constructor() {
		const geometry = new InstancedLineGeometry();
		const material = new InstancedLineMaterial();

		super(geometry, material);
	}

	raycast() {

	}

}

InstancedLine.prototype.isInstancedLine = true;

const positions = [
	-1, 1, 0,
	1, 1, 0,
	-1, -1, 0,
	1, -1, 0
];
const uvs = [
	0, 1,
	1, 1,
	0, 0,
	1, 0
];
const index = [
	0, 2, 1,
	2, 3, 1
];

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();

function setBox3FromBuffer(box, buffer) {
	let minX = +Infinity;
	let minY = +Infinity;
	let minZ = +Infinity;

	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;

	for (let i = 0, l = buffer.count + 2; i < l; i++) {
		const x = buffer.array[i * buffer.stride + 0];
		const y = buffer.array[i * buffer.stride + 1];
		const z = buffer.array[i * buffer.stride + 2];

		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (z < minZ) minZ = z;

		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
		if (z > maxZ) maxZ = z;
	}

	box.min.set(minX, minY, minZ);
	box.max.set(maxX, maxY, maxZ);

	return box;
}

export class InstancedLineGeometry extends Geometry {

	constructor() {
		super();

		this.setIndex(new Attribute(new Buffer(new Uint16Array(index), 1)));
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));
		this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
	}

	setFromPoints(points, breakIndices) {
		// Convert to flat array and add start/end point
		// 0   0---1---2---3---4   4

		const useBreak = breakIndices && breakIndices.length > 0;
		const bufferArray = [];
		const length = points.length;
		const isVectorArray = points[0] && (points[0].x !== undefined);

		let dist = 0, breakIndex = 0;

		points.forEach((p, i) => {
			let point = isVectorArray ? p : _vec3_1.fromArray(p);

			if (i > 0) {
				let prevPoint = isVectorArray ? points[i - 1] : _vec3_2.fromArray(points[i - 1]);
				dist += point.distanceTo(prevPoint);
			}

			if (useBreak) {
				let breakState = 0;
				if (breakIndices[breakIndex] === i) { // next segments start
					breakState = 1;
					breakIndex++;
					dist = 0;
				} else if (breakIndices[breakIndex] === (i + 1)) { // current segments end
					breakState = 1;
				}

				bufferArray.push(point.x, point.y, point.z, dist, breakState);
				if (i === 0 || i === length - 1) {
					bufferArray.push(point.x, point.y, point.z, dist, breakState);
				}
			} else {
				bufferArray.push(point.x, point.y, point.z, dist);
				if (i === 0 || i === length - 1) {
					bufferArray.push(point.x, point.y, point.z, dist);
				}
			}
		});

		// Convert to instance buffer
		// prev2---prev1---next1---next2

		let stride = useBreak ? 5 : 4;

		const instanceBuffer = new Buffer(new Float32Array(bufferArray), stride, 1);
		instanceBuffer.count = Math.max(0, instanceBuffer.count - 3); // fix count

		let attribute;

		attribute = new Attribute(instanceBuffer, 3, stride * 0);
		attribute.divisor = 1;
		this.addAttribute('instancePrev2', attribute);
		attribute = new Attribute(instanceBuffer, 3, stride * 1);
		attribute.divisor = 1;
		this.addAttribute('instancePrev1', attribute);
		attribute = new Attribute(instanceBuffer, 3, stride * 2);
		attribute.divisor = 1;
		this.addAttribute('instanceNext1', attribute);
		attribute = new Attribute(instanceBuffer, 3, stride * 3);
		attribute.divisor = 1;
		this.addAttribute('instanceNext2', attribute);

		attribute = new Attribute(instanceBuffer, 1, stride * 1 + 3);
		attribute.divisor = 1;
		this.addAttribute('instancePrevDist', attribute);
		attribute = new Attribute(instanceBuffer, 1, stride * 2 + 3);
		attribute.divisor = 1;
		this.addAttribute('instanceNextDist', attribute);

		if (useBreak) {
			attribute = new Attribute(instanceBuffer, 1, stride * 1 + 4);
			attribute.divisor = 1;
			this.addAttribute('instancePrevBreak', attribute);
			attribute = new Attribute(instanceBuffer, 1, stride * 2 + 4);
			attribute.divisor = 1;
			this.addAttribute('instanceNextBreak', attribute);
		}

		this.version++;

		this.instanceCount = instanceBuffer.count;

		this.computeBoundingBox();
		this.computeBoundingSphere();

		return this;
	}

	computeBoundingBox() {
		const instancePrev1 = this.attributes.instancePrev1;

		if (instancePrev1 !== undefined && instancePrev1.buffer.count > 0) {
			setBox3FromBuffer(this.boundingBox, instancePrev1.buffer);
		} else {
			this.boundingBox.makeEmpty();
		}
	}

	computeBoundingSphere() {
		this.computeBoundingBox();

		const instancePrev1 = this.attributes.instancePrev1;
		if (instancePrev1 !== undefined && instancePrev1.buffer.count > 0) {
			const center = this.boundingSphere.center;
			this.boundingBox.getCenter(center);

			let maxRadiusSq = 0;

			for (let i = 0, il = instancePrev1.buffer.count + 2; i < il; i++) {
				_vec3_1.fromArray(instancePrev1.buffer.array, i * instancePrev1.buffer.stride);
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vec3_1));
			}

			this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

			if (isNaN(this.boundingSphere.radius)) {
				console.error('InstancedLineGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);
			}
		} else {
			this.boundingSphere.makeEmpty();
		}
	}

}

const instancedLineShader = {
	name: "instanced_line",
	defines: {
		LINE_BREAK: false,
		DISABLE_CORNER_BROKEN: false,
		FLAT_W: false,
		SWAP_UV: false,
		SIMPLE_UV: false,
		SCREEN_UV: false // TODO
	},
	uniforms: {
		resolution: [512, 512],
		lineWidth: 5,
		cornerThreshold: 0.4
	},
	vertexShader: `
        #include <common_vert>
        #include <logdepthbuf_pars_vert>

        #ifdef USE_FOG
            varying float vDepth;
        #endif

        attribute vec2 a_Uv;
        #ifdef USE_DIFFUSE_MAP
            varying vec2 v_Uv;
            uniform mat3 uvTransform;
        #endif
        #include <alphamap_pars_vert>

        attribute vec3 instancePrev2;
        attribute vec3 instancePrev1;
        attribute vec3 instanceNext1;
        attribute vec3 instanceNext2;

        attribute float instancePrevDist;
        attribute float instanceNextDist;

        #ifdef LINE_BREAK
            attribute float instancePrevBreak;
            attribute float instanceNextBreak;

            varying float vDiscard;
        #endif

        uniform float lineWidth;
        uniform vec2 resolution;

        uniform float cornerThreshold;

        void trimSegment(const in vec4 start, inout vec4 end) {
            // trim end segment so it terminates between the camera plane and the near plane
        
            // conservative estimate of the near plane
            float a = u_Projection[2][2]; // 3nd entry in 3th column
            float b = u_Projection[3][2]; // 3nd entry in 4th column
            float nearEstimate = -0.5 * b / a;
        
            float alpha = (nearEstimate - start.z) / (end.z - start.z);
        
            end.xyz = mix(start.xyz, end.xyz, alpha);
        }

        void main() {
            vec3 position = a_Position;
            mat4 modelViewMatrix = u_View * u_Model;

            float aspect = resolution.x / resolution.y;
            float flagY = position.y * 0.5 + 0.5;

            // camera space
            vec4 prev = modelViewMatrix * vec4(mix(instancePrev2, instancePrev1, flagY), 1.0);
            vec4 curr = modelViewMatrix * vec4(mix(instancePrev1, instanceNext1, flagY), 1.0);
            vec4 next = modelViewMatrix * vec4(mix(instanceNext1, instanceNext2, flagY), 1.0);

            #ifdef LINE_BREAK
                vDiscard = instancePrevBreak * instanceNextBreak;
                if (position.y > 0.0 && instanceNextBreak > 0.5) {
                    next = curr;
                } else if (position.y < 0.0 && instancePrevBreak > 0.5) {
                    prev = curr;
                }
            #endif

            // special case for perspective projection, and segments that terminate either in, or behind, the camera plane
            bool perspective = (u_Projection[2][3] == -1.0); // 4th entry in the 3rd column

            if (perspective) {
                if (position.y < 0.) {
                    if (curr.z < 0.0 && next.z >= 0.0) {
                        trimSegment(curr, next);
                    } else if (next.z < 0.0 && curr.z >= 0.0) {
                        trimSegment(next, curr);
                    }

                    if (prev.z < 0.0 && curr.z >= 0.0) {
                        trimSegment(prev, curr);
                    } else if (curr.z < 0.0 && prev.z >= 0.0) {
                        trimSegment(curr, prev);
                    }
                } else {
                    if (prev.z < 0.0 && curr.z >= 0.0) {
                        trimSegment(prev, curr);
                    } else if (curr.z < 0.0 && prev.z >= 0.0) {
                        trimSegment(curr, prev);
                    }

                    if (curr.z < 0.0 && next.z >= 0.0) {
                        trimSegment(curr, next);
                    } else if (next.z < 0.0 && curr.z >= 0.0) {
                        trimSegment(next, curr);
                    }
                } 
            }

            // clip space
            vec4 clipPrev = u_Projection * prev;
            vec4 clipCurr = u_Projection * curr;
            vec4 clipNext = u_Projection * next;

            // ndc space
            vec2 ndcPrev = clipPrev.xy / clipPrev.w;
            vec2 ndcCurr = clipCurr.xy / clipCurr.w;
            vec2 ndcNext = clipNext.xy / clipNext.w;

            // direction
            vec2 dir, dir1, dir2;
            float w = 1.0;

            if (prev == curr) {
                dir = ndcNext - ndcCurr;
                dir.x *= aspect;
                dir = normalize(dir);
            } else if(curr == next) {
                dir = ndcCurr - ndcPrev;
                dir.x *= aspect;
                dir = normalize(dir);
            } else {
                dir1 = ndcCurr - ndcPrev;
                dir1.x *= aspect;
                
                dir2 = ndcNext - ndcCurr;
                dir2.x *= aspect;

                dir1 = normalize(dir1);
                dir2 = normalize(dir2);

                dir = normalize(dir1 + dir2);

                w = dot(dir1, dir);

                #ifdef DISABLE_CORNER_BROKEN  
                    w = 1.0 / max(w, cornerThreshold);
                #else
                    float flagT = step(w, cornerThreshold);
                    w = 1.0 / mix(w, 1.0, flagT);
                    dir = mix(dir, mix(dir2, dir1, flagY), flagT);
                #endif
            }

            // perpendicular to dir
            vec2 offset = vec2(dir.y, -dir.x);

            // undo aspect ratio adjustment
            offset.x /= aspect;

            // sign flip
            offset *= float(sign(position.x));

            // adjust for lineWidth
            offset *= lineWidth * w;
            
            // adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
            offset /= resolution.y;
            
            // select end
            vec4 clip = clipCurr;

            // back to clip space
            offset *= clip.w;

            clip.xy += offset;

            gl_Position = clip;

            #ifdef USE_FOG
                vDepth = -curr.z;
            #endif
            
            #ifdef USE_LOGDEPTHBUF
                #ifdef USE_LOGDEPTHBUF_EXT
                    vFragDepth = 1.0 + gl_Position.w - logDepthCameraNear;
                    // vIsPerspective = float( isPerspectiveMatrix( u_Projection ) );
                    vIsPerspective = isPerspectiveMatrix( u_Projection ) ? 1.0 : 0.0;
                #else
                    if ( isPerspectiveMatrix( u_Projection ) ) {
                        gl_Position.z = log2( max( EPSILON, gl_Position.w - logDepthCameraNear + 1.0 ) ) * logDepthBufFC - 1.0;
                        gl_Position.z *= gl_Position.w;
                    }
                #endif
            #endif

            #ifdef FLAT_W
                if (gl_Position.w > -1.0) {
                    gl_Position.xyz /= gl_Position.w;
                    gl_Position.w = 1.0;
                }
            #endif

            // uv
            // TODO trim uv
            vec2 tUv = vec2(0.0, 0.0);
            #ifdef SIMPLE_UV
                tUv = a_Uv;
            #else
                #ifdef SCREEN_UV
                    tUv = a_Uv;
                #else
                    tUv.x = a_Uv.x;
                    tUv.y = mix(instancePrevDist, instanceNextDist, flagY);
                #endif
            #endif

            #ifdef SWAP_UV
                tUv = tUv.yx;
            #endif

            #ifdef USE_DIFFUSE_MAP
                v_Uv = (uvTransform * vec3(tUv, 1.)).xy;
            #endif
            #ifdef USE_ALPHA_MAP
                vAlphaMapUV = (alphaMapUVTransform * vec3(tUv, 1.)).xy;
            #endif
        }
    `,
	fragmentShader: `
        #include <common_frag>

        #ifdef USE_DIFFUSE_MAP
            varying vec2 v_Uv;
            uniform sampler2D diffuseMap;
        #endif
        #include <alphamap_pars_frag>

        #ifdef USE_FOG
            varying float vDepth;
        #endif

        #include <fog_pars_frag>
        #include <logdepthbuf_pars_frag>

        #ifdef LINE_BREAK
            varying float vDiscard;
        #endif

        void main() {
            #ifdef LINE_BREAK
                if (vDiscard > 0.5) {
                    discard;
                }
            #endif
        
            vec4 outColor = vec4(u_Color, u_Opacity);

            #ifdef USE_DIFFUSE_MAP
                outColor *= texture2D(diffuseMap, v_Uv);
            #endif
        
            #ifdef USE_ALPHA_MAP
                outColor.a *= texture2D(alphaMap, vAlphaMapUV).g;
            #endif
        
            gl_FragColor = outColor;
        
            #ifdef USE_FOG
                float depth = vDepth;
                #ifdef USE_EXP2_FOG
                    float fogFactor = whiteCompliment( exp2( - u_FogDensity * u_FogDensity * depth * depth * LOG2 ) );
                #else
                    float fogFactor = smoothstep( u_FogNear, u_FogFar, depth );
                #endif
                gl_FragColor.rgb = mix( gl_FragColor.rgb, u_FogColor, fogFactor );
            #endif
            #include <logdepthbuf_frag>
        }
    `
};

export class InstancedLineMaterial extends ShaderMaterial {

	constructor() {
		super(instancedLineShader);
	}

}