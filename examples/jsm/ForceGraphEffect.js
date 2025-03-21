import {
	BLEND_TYPE,
	BLEND_FACTOR,
	BLEND_EQUATION,
	ShaderPostPass,
	RenderTarget2D,
	Texture2D,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	PIXEL_FORMAT
} from 't3d';
import { CopyShader } from './shaders/CopyShader.js';

export default class ForceGraphEffect {

	constructor(forceGraphData) {
		this.positions = forceGraphData.nodes;
		this._nodesWidth = this._indexTextureSize(forceGraphData.nodes.length);
		this._edgesWidth = this._indexTextureSize(forceGraphData.links.length);
		this._nodesAndEdges = this._getNodesAndEdgesArray(forceGraphData);

		this.dtPositionTexture = this.createTexture(this._nodesWidth, this._nodesWidth);
		this._fillPositionTexture(this.dtPositionTexture, this._nodesAndEdges);
		this.dtEdgeIndicesTexture = this.createTexture(this._nodesWidth, this._nodesWidth);
		this._fillEdgeIndicesTexture(this.dtEdgeIndicesTexture, this._nodesAndEdges);
		this.dtEdgeDataTexture = this.createTexture(this._edgesWidth, this._edgesWidth);
		this._fillEdgeDataTexture(this.dtEdgeDataTexture, this._nodesAndEdges);

		this._vectotTarget = new RenderTarget2D(this._nodesWidth, this._nodesWidth);
		this._vectotTarget.texture.generateMipmaps = false;
		this._vectotTarget.texture.type = PIXEL_TYPE.FLOAT;
		this._vectotTarget.texture.format = PIXEL_FORMAT.RGBA;
		this._vectotTarget.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._vectotTarget.texture.magFilter = TEXTURE_FILTER.NEAREST;

		this._vectotTarget2 = new RenderTarget2D(this._nodesWidth, this._nodesWidth);
		this._vectotTarget2.texture.generateMipmaps = false;
		this._vectotTarget2.texture.type = PIXEL_TYPE.FLOAT;
		this._vectotTarget2.texture.format = PIXEL_FORMAT.RGBA;
		this._vectotTarget2.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._vectotTarget2.texture.magFilter = TEXTURE_FILTER.NEAREST;

		this._positionTarget = new RenderTarget2D(this._nodesWidth, this._nodesWidth);
		this._positionTarget.texture.generateMipmaps = false;
		this._positionTarget.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._positionTarget.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this._positionTarget.texture.type = PIXEL_TYPE.FLOAT;
		this._positionTarget.texture.format = PIXEL_FORMAT.RGBA;


		this._forceCalculationPass = new ShaderPostPass(forceCalculationShader);
		this._forceCalculationPass.material.defines['NODESWIDTH'] = this._nodesWidth.toFixed(2);
		this._forceCalculationPass.material.defines['EDGESWIDTH'] = this._edgesWidth.toFixed(2);
		this._pointTransformationPass = new ShaderPostPass(pointTransformationShader);
		this._pointTransformationPass.material.defines['NODESWIDTH'] = this._nodesWidth.toFixed(2);
		this._pointTransformationPass.material.transparent = true;
		this._pointTransformationPass.material.blending = BLEND_TYPE.CUSTOM;
		this._pointTransformationPass.material.blendEquationAlpha = BLEND_EQUATION.MIN;
		this._pointTransformationPass.material.blendEquation = BLEND_EQUATION.ADD;
		this._pointTransformationPass.material.blendSrc = BLEND_FACTOR.ONE;
		this._pointTransformationPass.material.blendDst = BLEND_FACTOR.ONE;
		this._copyPass = new ShaderPostPass(CopyShader);

		this._temperature = forceGraphData.nodes.length / 0.01;
		this._nodesCount = forceGraphData.nodes.length;
		this.fristRender = true;
		this.frustumCulled = false;
		this.i = 0;
	}

	update(renderer, deltaTime) {
		if (this._temperature > 0.001) {
			this._delta += deltaTime;
			this._delta = this._delta / 3;
			if (this._delta > 1) this._delta = 1;

			if (this.fristRender) {
				this.fristRender = false;
				this._copyPass.uniforms.tDiffuse = this.dtPositionTexture;
				renderer.setRenderTarget(this._positionTarget);
				renderer.clear(true, true, true);
				this._copyPass.render(renderer);
			}

			this._forceCalculationPass.uniforms.positions = this._positionTarget.texture;
			this._forceCalculationPass.uniforms.edgeIndices = this.dtEdgeIndicesTexture;
			this._forceCalculationPass.uniforms.edgeData = this.dtEdgeDataTexture;
			this._temperature *= 0.99;
			this._forceCalculationPass.uniforms.temperature = this._temperature;
			this._forceCalculationPass.uniforms.posNum = this._nodesCount;
			renderer.setRenderTarget(this.i % 2 === 0 ? this._vectotTarget2 : this._vectotTarget);
			renderer.clear(true, true, true);

			this._forceCalculationPass.uniforms.velocities = this.i % 2 === 0 ? this._vectotTarget.texture : this._vectotTarget2.texture;

			this._forceCalculationPass.render(renderer);
			this._pointTransformationPass.uniforms.velocities = this.i % 2 === 0 ? this._vectotTarget2.texture : this._vectotTarget.texture;
			renderer.setRenderTarget(this._positionTarget);
			this._pointTransformationPass.render(renderer);
			this.i++;
		}
	}

	getPointsTexture() {
		return this._positionTarget.texture;
	}
	_indexTextureSize(num) {
		let power = 1;
		while (power * power < num) {
			power *= 2;
		}
		return power / 2 > 1 ? power : 2;
	}

	_getNodesAndEdgesArray(data) {
		const nodes = data.nodes;
		const links = data.links;
		links.forEach(link => {
			let a, b;
			nodes.forEach(cur => {
				if (cur.id === link.source) {
					a = cur;
				} else if (cur.id === link.target) {
					b = cur;
				}
			});
			!a.neighbors && (a.neighbors = []);
			!b.neighbors && (b.neighbors = []);
			a.neighbors.push(b);
			b.neighbors.push(a);

			!a.links && (a.links = []);
			!b.links && (b.links = []);
			a.links.push(link);
			b.links.push(link);
		});

		const result = [];
		nodes.forEach(cur => {
			const edges = [];
			cur.neighbors.forEach(edge => {
				edges.push(edge.id);
			});
			result.push(edges);
		});

		return result;
	}

	createTexture(width, height) {
		const data = new Float32Array(width * height * 4);
		const image = {
			data: data,
			width,
			height
		};
		const result = new Texture2D();
		result.image = image;
		result.type = PIXEL_TYPE.FLOAT;
		result.format = PIXEL_FORMAT.RGBA;
		result.minFilter = TEXTURE_FILTER.NEAREST;
		result.magFilter = TEXTURE_FILTER.NEAREST;
		result.generateMipmaps = false;
		result.flipY = false;
		result.version++;
		return result;
	}

	_fillPositionTexture(texture, nodesAndEdges) {
		const theArray = texture.image.data;

		for (let k = 0, kl = theArray.length; k < kl; k += 4) {
			if (k < nodesAndEdges.length * 4) {
				const x = Math.random() * 1000 - 500;
				const y = Math.random() * 1000 - 500;
				const z = Math.random() * 1000 - 500;

				theArray[k + 0] = x;
				theArray[k + 1] = y;
				theArray[k + 2] = z;
				theArray[k + 3] = 1;
			} else {
				theArray[k + 0] = -1;
				theArray[k + 1] = -1;
				theArray[k + 2] = -1;
				theArray[k + 3] = -1;
			}
		}
	}

	_fillEdgeIndicesTexture(texture, nodesAndEdges) {
		const theArray = texture.image.data;
		let currentPixel = 0;
		let currentCoord = 0;

		for (let i = 0; i < nodesAndEdges.length; i++) {
			const startPixel = currentPixel;
			const startCoord = currentCoord;
			for (let j = 0; j < nodesAndEdges[i].length; j++) {
				currentCoord++;
				if (currentCoord === 4) {
					currentPixel++;
					currentCoord = 0;
				}
			}
			theArray[i * 4] = startPixel;
			theArray[i * 4 + 1] = startCoord;
			theArray[i * 4 + 2] = currentPixel;
			theArray[i * 4 + 3] = currentCoord;
		}

		for (let i = nodesAndEdges.length * 4; i < theArray.length; i++) {
			theArray[i] = -1;
		}
	}

	_fillEdgeDataTexture(texture, nodesAndEdges) {
		const theArray = texture.image.data;
		let currentIndex = 0;

		for (let i = 0; i < nodesAndEdges.length; i++) {
			for (let j = 0; j < nodesAndEdges[i].length; j++) {
				theArray[currentIndex] = nodesAndEdges[i][j];
				currentIndex++;
			}
		}

		for (let i = currentIndex; i < theArray.length; i++) {
			theArray[i] = -1;
		}
	}


}


const pointTransformationShader = {
	name: 'point_transformation',
	uniforms: {
		velocities: null,
		delta: 0.0056
	},
	vertexShader: `
       attribute vec3 a_Position;
       attribute vec2 a_Uv;

       uniform mat4 u_ProjectionView;
       uniform mat4 u_Model;

       varying vec2 v_Uv;

       void main() {
           v_Uv = a_Uv;
           gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
       }
   `,
	fragmentShader: `
    uniform sampler2D velocities;
    uniform float delta;

    const float nodesTexWidth = NODESWIDTH;

    void main() {
        vec2 nodeRef = vec2(nodesTexWidth, nodesTexWidth);
        vec2 uv = gl_FragCoord.xy / nodeRef.xy;
        vec3 selfVelocity = texture2D( velocities, uv ).xyz;
        gl_FragColor = vec4( selfVelocity * delta * 50.0, 1.0 );
    }

   `

};
const forceCalculationShader = {
	name: 'force_calculation',
	uniforms: {
		velocities: null,
		positions: null,
		edgeIndices: null,
		edgeData: null,
		screenSize: [1024, 1024],
		posNum: 0,
		k: 100,
		distanceFactor: 0.25,
		temperature: 0
	},

	vertexShader: `
       attribute vec3 a_Position;
       attribute vec2 a_Uv;

       uniform mat4 u_ProjectionView;
       uniform mat4 u_Model;

       varying vec2 v_Uv;

       void main() {
           v_Uv = a_Uv;
           gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
       }
   `,

	fragmentShader: `
    uniform sampler2D velocities;
    uniform sampler2D positions;
    uniform float distanceFactor;
    uniform float k;
    uniform float temperature;
    uniform sampler2D edgeIndices;
    uniform sampler2D edgeData;
    uniform vec2 screenSize;
    uniform float posNum;

    const float nodesTexWidth = NODESWIDTH;
    const float edgesTexWidth = EDGESWIDTH;

    vec4 getNeighbor(float textureIndex) {
        return texture2D(positions, vec2(((mod(textureIndex, nodesTexWidth)) / nodesTexWidth), (floor(textureIndex / nodesTexWidth)) / nodesTexWidth));
    }
        
    vec3 addRepulsion(vec3 self, vec3 neighbor) {
        vec3 diff = self - neighbor;
        float x = length( diff );
        float f = ( k * k ) / x;
        return normalize(diff) * f ;
    }

    vec3 addAttraction(vec3 self, vec3 neighbor) {
        vec3 diff = self - neighbor;
        float x = length( diff );
        float f = ( x * x ) / 100.;
        if(x<0.001) {
            return vec3(0.);
        }
        else {
            return normalize(diff) * f;
        }

    }

    void main() {
        vec2 nodeRef = vec2(nodesTexWidth, nodesTexWidth);
        vec2 uv = gl_FragCoord.xy / nodeRef.xy;
        vec4 selfPosition = texture2D( positions, uv );

        vec3 selfVelocity = texture2D( velocities, uv ).xyz;
        vec3 velocity = selfVelocity;
        vec4 nodePosition;
        vec4 compareNodePosition;
        float strength;
        float speedLimit = 250.0;
        if( selfPosition.w > 0.0 ) {
            for(float y = 0.0; y < nodesTexWidth; y++) {
                for(float x = 0.0; x < nodesTexWidth; x++) {
                    vec2 ref = vec2(x + 0.5, y + 0.5 ) / nodeRef;
                    compareNodePosition = texture2D(positions, ref);
                    if (distance(compareNodePosition.xyz, selfPosition.xyz) > 0.001) {
                        if (compareNodePosition.w != -1.0) {
                            velocity += addRepulsion(selfPosition.xyz, compareNodePosition.xyz);
                        }
                    }

                }
            }
            vec4 selfEdgeIndices = texture2D( edgeIndices, uv);
            float idx = selfEdgeIndices.x;
            float idy = selfEdgeIndices.y;
            float idz = selfEdgeIndices.z;
            float idw = selfEdgeIndices.w;
            float start = idx * 4.0 + idy;
            float end = idz * 4.0 + idw;
            if(! ( idx == idz && idy == idw ) ) {
                float edgeIndex = 0.0;
                vec2 edgeRef = vec2(edgesTexWidth, edgesTexWidth);
                for(float y = 0.0; y < edgesTexWidth; y++) {
                    for(float x = 0.0; x < edgesTexWidth; x++) {
                        vec2 ref = vec2( x + 0.5, y + 0.5 ) / edgeRef;
                        vec4 pixel = texture2D(edgeData, ref);
                        if (edgeIndex >= start && edgeIndex < end) {
                            nodePosition = getNeighbor(pixel.x);
                            velocity -= addAttraction(selfPosition.xyz, nodePosition.xyz);
                        }
                        edgeIndex++;
                        if (edgeIndex >= start && edgeIndex < end) {
                            nodePosition = getNeighbor(pixel.y);
                            velocity -= addAttraction(selfPosition.xyz, nodePosition.xyz);
                        }
                        edgeIndex++;
                        if (edgeIndex >= start && edgeIndex < end) {
                            nodePosition = getNeighbor(pixel.z);
                            velocity -= addAttraction(selfPosition.xyz, nodePosition.xyz);
                        }
                        edgeIndex++;
                        if (edgeIndex >= start && edgeIndex < end) {
                            nodePosition = getNeighbor(pixel.w);
                            velocity -= addAttraction(selfPosition.xyz, nodePosition.xyz);
                        }
                        edgeIndex++;
                    }
                }

            }

        }
        if( length(velocity) < 0.001 ) {
            gl_FragColor = vec4(velocity, 1.0);
        }
        else {
            velocity = normalize(velocity) * temperature;
            if ( length( velocity ) > speedLimit ) {
                velocity = normalize( velocity ) * speedLimit;
            }
            velocity *= distanceFactor;
            gl_FragColor = vec4(velocity, 1.0);
        }

    }
   `
};

