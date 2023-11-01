import {
	ATTACHMENT,
	BoxGeometry,
	Loader,
	FileLoader,
	TextureCube,
	PIXEL_TYPE,
	PIXEL_FORMAT,
	RenderTargetCube,
	DRAW_SIDE,
	ShaderMaterial,
	Mesh,
	Scene
} from 't3d';

import { ReflectionProbe } from '../probes/ReflectionProbe.js';

// This loader can be used to load .env files from BabylonJS
export class EnvLoader extends Loader {

	constructor(manager) {
		super(manager);

		this._renderer = null;
		this._outputTexture = null;
	}

	setRenderer(renderer) {
		this._renderer = renderer;
		return this;
	}

	setOutputTexture(texture) {
		this._outputTexture = texture;
		return this;
	}

	load(url, onLoad, onProgress, onError) {
		const scope = this;

		const loader = new FileLoader(this.manager);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setPath(this.path);
		loader.setWithCredentials(this.withCredentials);

		loader.load(url, function(buffer) {
			if (onLoad !== undefined) {
				onLoad(scope.parse(buffer));
			}
		}, onProgress, onError);
	}

	parse(buffer) {
		const bufferArray = new Uint8Array(buffer, 0, buffer.dataLength);

		const info = this.getEnvInfo(bufferArray);
		const imageData = this.createImageDataArrayBufferViews(bufferArray, info);

		let outputTexture = this._outputTexture;
		if (!outputTexture) {
			outputTexture = new TextureCube();
		}
		outputTexture.type = PIXEL_TYPE.HALF_FLOAT;
		outputTexture.format = PIXEL_FORMAT.RGBA;
		outputTexture.generateMipmaps = false;
		outputTexture.internalFormat = PIXEL_FORMAT.RGBA16F;

		let mipmapSize = info.width;

		const target = new RenderTargetCube(mipmapSize, mipmapSize);
		target.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
		target.attach(outputTexture, ATTACHMENT.COLOR_ATTACHMENT0);

		const reflectionProbe = new ReflectionProbe(target);

		const envMap = new TextureCube();

		const dummyScene = new Scene();
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(RGBDDecodeShader);
		material.side = DRAW_SIDE.BACK;
		material.uniforms.environmentMap = envMap;
		const skyEnv = new Mesh(geometry, material);
		skyEnv.frustumCulled = false;

		dummyScene.add(skyEnv);
		dummyScene.add(reflectionProbe.camera);

		const mipmapsCount = Math.round(Log2(mipmapSize)) + 1;
		const urls = [];

		for (let i = 0; i < mipmapsCount; i++) {
			outputTexture.mipmaps[i] = [];
			for (let j = 0; j < 6; j++) {
				outputTexture.mipmaps[i].push({
					width: mipmapSize,
					height: mipmapSize,
					data: null
				});
				const blob = new Blob([imageData[i][j]], { type: DefaultEnvironmentTextureImageType });
				const url = URL.createObjectURL(blob);
				urls.push(url);
			}
			mipmapSize = mipmapSize / 2;
			// reversal up and down
			const url = urls[i * 6 + 2];
			urls[i * 6 + 2] = urls[i * 6 + 3];
			urls[i * 6 + 3] = url;
		}

		const promises = urls.map(url => {
			return new Promise(resolve => {
				const img = new Image();
				img.src = url;
				img.addEventListener('load', () => {
					resolve(img);
				});
			});
		});

		Promise.all(promises).then(images => {
			for (let i = 0; i < mipmapsCount; i++) {
				envMap.images = images.slice(i * 6, i * 6 + 6);
				envMap.version++;
				target.activeMipmapLevel = i;
				reflectionProbe.render(this._renderer, dummyScene);
				reflectionProbe.camera.rect.z = 1 / (Math.pow(2, i + 1));
				reflectionProbe.camera.rect.w = 1 / (Math.pow(2, i + 1));
			}
		});
		return outputTexture;
	}

	createImageDataArrayBufferViews(data, info) {
		info = this.normalizeEnvInfo(info);

		const specularInfo = info.specular;

		// Double checks the enclosed info
		let mipmapsCount = Log2(info.width);
		mipmapsCount = Math.round(mipmapsCount) + 1;
		if (specularInfo.mipmaps.length !== 6 * mipmapsCount) {
			throw new Error(
				`Unsupported specular mipmaps number "${specularInfo.mipmaps.length}"`
			);
		}

		const imageData = new Array(mipmapsCount);
		for (let i = 0; i < mipmapsCount; i++) {
			imageData[i] = new Array(6);
			for (let face = 0; face < 6; face++) {
				const imageInfo = specularInfo.mipmaps[i * 6 + face];
				imageData[i][face] = new Uint8Array(
					data.buffer,
					data.byteOffset +
                    specularInfo.specularDataPosition +
                    imageInfo.position,
					imageInfo.length
				);
			}
		}

		return imageData;
	}

	getEnvInfo(data) {
		const dataView = new DataView(
			data.buffer,
			data.byteOffset,
			data.byteLength
		);
		let pos = 0;

		for (let i = 0; i < MagicBytes.length; i++) {
			if (dataView.getUint8(pos++) !== MagicBytes[i]) {
				console.Error('Not a  environment map');
				return null;
			}
		}

		// Read json manifest - collect characters up to null terminator
		let manifestString = '';
		let charCode = 0x00;
		while ((charCode = dataView.getUint8(pos++))) {
			manifestString += String.fromCharCode(charCode);
		}

		let manifest = JSON.parse(manifestString);
		manifest = this.normalizeEnvInfo(manifest);
		if (manifest.specular) {
			// Extend the header with the position of the payload.
			manifest.specular.specularDataPosition = pos;
			// Fallback to 0.8 exactly if lodGenerationScale is not defined for backward compatibility.
			manifest.specular.lodGenerationScale = manifest.specular.lodGenerationScale || 0.8;
		}

		return manifest;
	}

	normalizeEnvInfo(info) {
		if (info.version > CurrentVersion) {
			throw new Error(
				`Unsupported babylon environment map version "${info.version}". Latest supported version is "${CurrentVersion}".`
			);
		}

		if (info.version === 2) {
			return info;
		}

		// Migrate a v1 info to v2
		info = {
			...info,
			version: 2,
			imageType: DefaultEnvironmentTextureImageType
		};

		return info;
	}

}

const DefaultEnvironmentTextureImageType = 'image/png';
const CurrentVersion = 2;
const MagicBytes = [0x86, 0x16, 0x87, 0x96, 0xf6, 0xd6, 0x96, 0x36];

const RGBDDecodeShader = {
	name: 'RGBDDecodePass',

	uniforms: {
		environmentMap: null
	},

	vertexShader: `
		#include <common_vert>
		varying vec3 vDir;
		void main() {
			vDir = (u_Model * vec4(a_Position, 0.0)).xyz;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w; // set z to camera.far
		}
	`,

	fragmentShader: `
		#include <common_frag>

        uniform samplerCube environmentMap;
		varying vec3 vDir;
   
        vec3 fromRGBD(vec4 rgbd) {
			return rgbd.rgb / rgbd.a;
		}

		void main() {
			#include <begin_frag>

			vec3 V = normalize(vDir);
            vec3 coordVec = vec3(V.x, -V.yz);
            outColor = vec4(fromRGBD(textureCube(environmentMap, coordVec)),1.0);

			#include <end_frag>
		}
	`
};

function Log2(value) {
	return Math.log(value) * Math.LOG2E;
}
