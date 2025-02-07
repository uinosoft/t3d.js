import { Mesh, Geometry, ShaderMaterial, Attribute, Buffer, Sphere, Vector3 } from 't3d';

// Default values
const DEFAULT_CONFIG = {
	bladeSegments: 4.0,		// grass segments
	bladeWidth: 0.15,		// grass width
	bladeHeightMin: 2.25,	// grass height min
	bladeHeightMax: 4.5,	// grass height max
	numBlades: 85000.0,		// seed number
	patchRadius: 150.0, 	// build radius
	transitionLow: 0.108,	// start growing grass （percent of height）
	transitionHigh: 0.25,	// fully grown
	transitionUpper: 0.883,	// stop growing
	transitionNoise: 0.5	// transition noise
};

export class Grass extends Mesh {

	constructor(config = {}) {
		const buildConfig = { ...DEFAULT_CONFIG, ...config };

		const geometry = new GrassGeometry(buildConfig);
		const material = new ShaderMaterial(createGrassShader(buildConfig));

		super(geometry, material);
	}

}

class GrassGeometry extends Geometry {

	constructor(config) {
		super();

		this.bladeSegments = config.bladeSegments;
		this.bladeVerts = (this.bladeSegments + 1) * 2;
		this.bladeIndices = this.bladeSegments * 12;
		this.bladeWidth = config.bladeWidth;
		this.bladeHeightMin = config.bladeHeightMin;
		this.bladeHeightMax = config.bladeHeightMax;
		this.numBlades = config.numBlades;
		this.patchRadius = config.patchRadius;

		this.vindexArray = this._getVIndex();
		this.offsetArray = this._getOffsetVertices();
		this.shapeArray = this._getShapeVertices(this.offsetArray);
		this.indicesArray = this._getIndices();

		this.addAttribute('vindex', new Attribute(new Buffer(this.vindexArray, 1)));

		const offsetAttribute = new Attribute(new Buffer(this.offsetArray, 4));
		offsetAttribute.divisor = 1;
		this.addAttribute('offset', offsetAttribute);

		const shapeAttribute = new Attribute(new Buffer(this.shapeArray, 4));
		shapeAttribute.divisor = 1;
		this.addAttribute('shape', shapeAttribute);

		this.setIndex(new Attribute(new Buffer(this.indicesArray, 1)));

		// because there is no position attribute, we need to calculate our own bounding sphere
		this.boundingSphere = new Sphere(
			new Vector3(0, 0, 0),
			Math.sqrt(this.patchRadius * this.patchRadius * 2.0) * 10000.0
		);

		this.instanceCount = this.numBlades;
	}

	_getIndices() {
		const indicesArray = new Uint16Array(this.bladeIndices);

		let startOffset = 0;
		let endOffset = this.bladeVerts;
		let i = 0;

		for (let seg = 0; seg < this.bladeSegments; ++seg) {
			indicesArray[i++] = startOffset + 0;
			indicesArray[i++] = startOffset + 1;
			indicesArray[i++] = startOffset + 2;
			indicesArray[i++] = startOffset + 2;
			indicesArray[i++] = startOffset + 1;
			indicesArray[i++] = startOffset + 3;
			startOffset += 2;
		}
		// blade back side
		for (let seg = 0; seg < this.bladeSegments; ++seg) {
			indicesArray[i++] = endOffset + 2;
			indicesArray[i++] = endOffset + 1;
			indicesArray[i++] = endOffset + 0;
			indicesArray[i++] = endOffset + 3;
			indicesArray[i++] = endOffset + 1;
			indicesArray[i++] = endOffset + 2;
			endOffset += 2;
		}

		return indicesArray;
	}

	_getVIndex() {
		const vIndexArray = new Float32Array(this.bladeVerts * 2 * 1);

		for (let i = 0; i < vIndexArray.length; ++i) {
			vIndexArray[i] = i;
		}

		return vIndexArray;
	}

	_getOffsetVertices() {
		const verticesArray = new Float32Array(4 * this.numBlades);

		for (let i = 0; i < this.numBlades; ++i) {
			verticesArray[i * 4 + 0] = nrand() * this.patchRadius; // x
			verticesArray[i * 4 + 1] = 0.0; // y
			verticesArray[i * 4 + 2] = nrand() * this.patchRadius; // z
			verticesArray[i * 4 + 3] = Math.PI * 2.0 * Math.random(); // rot
		}

		return verticesArray;
	}

	_getShapeVertices(offsetArray) {
		const shapeArray = new Float32Array(4 * this.numBlades);

		let noise = 0;
		for (let i = 0; i < this.numBlades; ++i) {
			noise = Math.abs(simplex(offsetArray[i * 4 + 0] * 0.03, offsetArray[i * 4 + 1] * 0.03));
			noise = noise * noise * noise;
			noise *= 5.0;
			shapeArray[i * 4 + 0] = this.bladeWidth + Math.random() * this.bladeWidth * 0.5; // width
			shapeArray[i * 4 + 1] = this.bladeHeightMin + Math.pow(Math.random(), 4.0) * (this.bladeHeightMax - this.bladeHeightMin) + noise; // height
			shapeArray[i * 4 + 2] = 0.0 + Math.random() * 0.3; // lean
			shapeArray[i * 4 + 3] = 0.05 + Math.random() * 0.3; // curve
		}

		return shapeArray;
	}

}

const grassFrag = `
	precision highp float;

	uniform sampler2D map;
	uniform sampler2D heightMap;
	uniform vec3 fogColor;
	uniform float fogNear;
	uniform float fogFar;
	uniform float grassFogFar;

	varying vec2 vSamplePos;
	varying vec4 vColor;
	varying vec2 vUv;

	void main() {

		// discard the grass outside the patch
	    if (vSamplePos.x < 0.001 || vSamplePos.x > 0.999 || vSamplePos.y < 0.001 || vSamplePos.y > 0.999) {
        	discard;
   		}

		vec4 color = vec4(vColor) * texture2D(map, vUv);
		vec4 hdata = texture2D(heightMap, vSamplePos);

		float depth = gl_FragCoord.z / gl_FragCoord.w;

		// make grass transparent as it approachs outer view distance perimeter
		color.a = 1.0 - smoothstep(grassFogFar * 0.55, grassFogFar * 0.8, depth);

		// if we have a lightMap we can use it, now we multiply by 1.3 to make it brighter
		color.rgb *= 1.3;

		float fogFactor = smoothstep(fogNear, fogFar, depth);
		color.rgb = mix(color.rgb, fogColor, fogFactor);

		gl_FragColor = color;
	}
`;

const grassVert = `
    const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 0.99);
    const vec3 SPECULAR_COLOR = vec3(1.0, 1.0, 0.0);

    #include <common_vert>

    #include <modelPos_pars_vert>

    uniform vec2 drawPos; // centre of where we want to draw
    uniform float time;  // used to animate blades
    uniform sampler2D heightMap;
    uniform vec3 heightMapScale;
    uniform vec3 grassColor;
	uniform vec3 lightDir;

	uniform vec3 camDir; // direction cam is looking at
    uniform float windIntensity;

    attribute float vindex; // Which vertex are we drawing - the main thing we need to know
    attribute vec4 offset; // {x:x, y:y, z:z, w:rot} (blade's position & rotation)
    attribute vec4 shape; // {x:width, y:height, z:lean, w:curve} (blade's shape properties)

    varying vec2 vSamplePos;
    varying vec4 vColor;
    varying vec2 vUv;

    // Rotate by an angle
    vec2 rotate (float x, float y, float r) {
        float c = cos(r);
        float s = sin(r);
        return vec2(x * c - y * s, x * s + y * c);
    }

    // Rotate by a vector
    vec2 rotate (float x, float y, vec2 r) {
        return vec2(x * r.x - y * r.y, x * r.y + y * r.x);
    }

    void main() {
		vec3 cameraDir = normalize(camDir);

        mat4 modelViewMatrix = u_View * u_Model;
        mat4 projectionMatrix = u_Projection;

        float vi = mod(vindex, BLADE_VERTS); // vertex index for this side of the blade
        float di = floor(vi / 2.0);  // div index (0 .. BLADE_DIVS)
        float hpct = di / BLADE_SEGS;  // percent of height of blade this vertex is at
        float bside = floor(vindex / BLADE_VERTS);  // front/back side of blade
        float bedge = mod(vi, 2.0);  // left/right edge (x=0 or x=1)
        // Vertex position - start with 2D shape, no bend applied
        vec3 vpos = vec3(
            shape.x * (bedge - 0.5) * (1.0 - pow(hpct, 3.0)), // taper blade edges as approach tip
            shape.y * di / BLADE_SEGS, // height of vtx, unbent
            0.0 // flat y, unbent
        );

        // Start computing a normal for this vertex
        vec3 normal = vec3(rotate(0.0, bside * 2.0 - 1.0, offset.w), 0.0);
    
        // Apply blade's natural curve amount
        float curve = shape.w;

        // Then add animated curve amount by time using this blade's
        // unique properties to randomize its oscillation
        curve += shape.w + 0.125 * (sin(time * 4.0 + offset.w * 0.2 * shape.y + offset.x + offset.z));

        // put lean and curve together
        float rot = shape.z + curve * hpct;
        vec2 rotv = vec2(cos(rot), sin(rot));
        vpos.yz = rotate(vpos.y, vpos.z, rotv);
        normal.yz = rotate(normal.y, normal.z, rotv);
    
        // rotation of this blade as a vector
        rotv = vec2(cos(offset.w), sin(offset.w));
        vpos.xz = rotate(vpos.x, vpos.z, rotv);
    
        // Based on centre of view cone position, what grid tile should
        // this piece of grass be drawn at?
        vec2 gridOffset = vec2(
            floor((drawPos.x - offset.x) / PATCH_SIZE) * PATCH_SIZE + PATCH_SIZE / 2.0,
            floor((drawPos.y - offset.z) / PATCH_SIZE) * PATCH_SIZE + PATCH_SIZE / 2.0
        );
    
        // Find the blade mesh world x,y position
        vec2 bladePos = vec2(offset.xz + gridOffset);
    
        // height/light map sample position
		float scale = 1.0 / heightMapScale.x;
		vSamplePos = (bladePos + vec2(scale/2.0)) / scale;

		// Compute wind effect
		float wind = texture2D(heightMap, vec2(vSamplePos.x - time / 2500.0, vSamplePos.y - time / 200.0) * 6.0).r;
		
		// Apply some exaggeration to wind
		wind = (clamp(wind, 0.25, 1.0) - 0.25) * (1.0 / 0.75);
		wind = wind * wind * windIntensity;
		wind *= hpct; // scale wind by height of blade
		wind = -wind;
		rotv = vec2(cos(wind), sin(wind));

		// Wind blows in axis-aligned direction to make things simpler
		vpos.yz = rotate(vpos.y, vpos.z, rotv);
		normal.yz = rotate(normal.y, normal.z, rotv);

		// Sample the heightfield data texture to get altitude for this blade position
		vec4 hdata = texture2D(heightMap, vSamplePos);
		float altitude = hdata.r;

		// Determine if we want the grass to appear or not
		// Use the noise channel to perturb the altitude grass starts growing at.
		float noisyAltitude = altitude + hdata.r * TRANSITION_NOISE - (TRANSITION_NOISE / 2.0);
		
		// Calculate lower transition boundary
		float lowerTransition = (clamp(noisyAltitude, TRANSITION_LOW, TRANSITION_HIGH) - TRANSITION_LOW)
			* (1.0 / (TRANSITION_HIGH - TRANSITION_LOW));
		
		// Calculate upper transition boundary
		float upperTransition = 1.0 - (clamp(noisyAltitude, TRANSITION_HIGH, TRANSITION_UPPER) - TRANSITION_HIGH)
			* (1.0 / (TRANSITION_UPPER - TRANSITION_HIGH));

		// Combine both transitions
		// Using multiplication in the transition can cause the grass length to decrease sharply.
		// Is there a better way to handle this?
		float degenerate = lowerTransition * upperTransition;

        // Transition geometry toward degenerate as we approach beach altitude
        vpos *= degenerate;

		// Vertex color must be brighter because it is multiplied with blade texture
		vec3 color = min(vec3(grassColor.r * 1.25, grassColor.g * 1.25, grassColor.b * 0.95), 1.0);

		vec3 lightDir = normalize(lightDir);

		float diffuse = abs(dot(normal, lightDir)); // max(-dot(normal, lightDir), 0.0);
		float specMag = max(-dot(normal, lightDir), 0.0) * max(-dot(normal, camDir), 0.0);

		specMag = pow(specMag, 1.5); // * specMag * specMag;
		vec3 specular = specMag * SPECULAR_COLOR * 0.4;
		// Directional plus ambient
		float light = 0.35 * diffuse + 0.65;
		// Ambient occlusion shading - the lower vertex, the darker
		float heightLight = 1.0 - hpct;
		heightLight = heightLight * heightLight;
		light = max(light - heightLight * 0.5, 0.0);
		vColor = vec4(
			// Each blade is randomly colourized a bit by its position
			light * 0.75 + cos(offset.x * 80.0) * 0.1,
			light * 0.95 + sin(offset.y * 140.0) * 0.05,
			light * 0.95 + sin(offset.x * 99.0) * 0.05,
			1.0
		);
		vColor.rgb = vColor.rgb * LIGHT_COLOR * color;
		vColor.rgb = min(vColor.rgb + specular, 1.0);

		// grass texture coordinate for this vertex
		vUv = vec2(bedge, di * 2.0);

        // Translate to world coordinates
        vpos.x += bladePos.x;
        vpos.y += (altitude * 2.0 -1.0) * heightMapScale.z / 2.0;
        vpos.z += bladePos.y;
    
        gl_Position = projectionMatrix * modelViewMatrix * vec4(vpos, 1.0);
    }
`;

function createGrassShader(config) {
	return {
		name: 'grass',
		defines: {
			'PATCH_SIZE': config.patchRadius.toFixed(1),
			'BLADE_SEGS': config.bladeSegments.toFixed(1),
			'BLADE_HEIGHT_TALL': config.bladeHeightMax.toFixed(1),
			'BLADE_DIVS': (config.bladeSegments + 1.0).toFixed(1),
			'BLADE_VERTS': ((config.bladeSegments + 1.0) * 2.0).toFixed(1),
			'TRANSITION_LOW': config.transitionLow.toFixed(1),
			'TRANSITION_HIGH': config.transitionHigh.toFixed(1),
			'TRANSITION_UPPER': config.transitionUpper.toFixed(1),
			'TRANSITION_NOISE': config.transitionNoise.toFixed(1)
		},
		uniforms: {
			time: 0.0,
			drawPos: [154.9653, 311.5642],
			windIntensity: 1.5,
			heightMapScale: [1 / 256.0, 1 / 256.0, 180.0],
			heightMap: null,
			map: null,
			grassColor: [0.45, 0.46, 0.19],
			lightDir: [0.0, 0.0, 1.0],
			camDir: [0.0, 0.0, 1.0],
			fogColor: [0.74, 0.77, 0.91],
			fogNear: 1.0,
			fogFar: config.patchRadius * 2.0,
			grassFogFar: config.patchRadius * 0.6
		},
		vertexShader: grassVert,
		fragmentShader: grassFrag // useDefault pbr color          // we should change alpha for depth
	};
}

function nrand() {
	return Math.random() * 2.0 - 1.0;
}

/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */

class Grad {

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	dot2(x, y) {
		return this.x * x + this.y * y;
	}

	dot3(x, y, z) {
		return this.x * x + this.y * y + this.z * z;
	}

}

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const perm = new Array(512);
const gradP = new Array(512);

const grad3 = [
	new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
	new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
	new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)
];

const p = [
	151, 160, 137, 91, 90, 15,
	131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
	190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
	88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
	77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
	102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
	135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
	5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
	223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
	129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
	251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
	49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
	138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];

// This isn't a very good seeding function, but it works ok. It supports 2^16
// different seed values. Write something better if you need more seeds.
function seed(seed) {
	if (seed > 0 && seed < 1) {
		// Scale the seed out
		seed *= 65536;
	}

	seed = Math.floor(seed);
	if (seed < 256) {
		seed |= seed << 8;
	}

	for (let i = 0; i < 256; i++) {
		let v;
		if (i & 1) {
			v = p[i] ^ (seed & 255);
		} else {
			v = p[i] ^ ((seed >> 8) & 255);
		}

		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12];
	}
}

seed(0);
// 2D simplex noise
function simplex(xin, yin) {
	let n0, n1, n2; // Noise contributions from the three corners
	// Skew the input space to determine which simplex cell we're in
	const s = (xin + yin) * F2; // Hairy factor for 2D
	let i = Math.floor(xin + s);
	let j = Math.floor(yin + s);
	const t = (i + j) * G2;
	const x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
	const y0 = yin - j + t;
	// For the 2D case, the simplex shape is an equilateral triangle.
	// Determine which simplex we are in.
	let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
	if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
		i1 = 1;
		j1 = 0;
	} else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
		i1 = 0;
		j1 = 1;
	}
	// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
	// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
	// c = (3-sqrt(3))/6
	const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
	const y1 = y0 - j1 + G2;
	const x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
	const y2 = y0 - 1 + 2 * G2;
	// Work out the hashed gradient indices of the three simplex corners
	i &= 255;
	j &= 255;
	const gi0 = gradP[i + perm[j]];
	const gi1 = gradP[i + i1 + perm[j + j1]];
	const gi2 = gradP[i + 1 + perm[j + 1]];
	// Calculate the contribution from the three corners
	let t0 = 0.5 - x0 * x0 - y0 * y0;
	if (t0 < 0) {
		n0 = 0;
	} else {
		t0 *= t0;
		n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
	}
	let t1 = 0.5 - x1 * x1 - y1 * y1;
	if (t1 < 0) {
		n1 = 0;
	} else {
		t1 *= t1;
		n1 = t1 * t1 * gi1.dot2(x1, y1);
	}
	let t2 = 0.5 - x2 * x2 - y2 * y2;
	if (t2 < 0) {
		n2 = 0;
	} else {
		t2 *= t2;
		n2 = t2 * t2 * gi2.dot2(x2, y2);
	}
	// Add contributions from each corner to get the final noise value.
	// The result is scaled to return values in the interval [-1,1].
	return 70 * (n0 + n1 + n2);
}
