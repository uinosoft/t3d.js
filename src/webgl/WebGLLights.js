import { PropertyMap } from '../render/PropertyMap.js';
import { WebGLClusteredLighting } from './WebGLClusteredLighting.js';

class WebGLLights extends PropertyMap {

	constructor(prefix, capabilities, textures) {
		super(prefix);

		const that = this;

		function onLightingGroupDispose(event) {
			const lightingGroup = event.target;
			const lightingProperties = that.get(lightingGroup);

			lightingGroup.removeEventListener('dispose', onLightingGroupDispose);

			if (lightingProperties.clustered) {
				lightingProperties.clustered.dispose();
			}

			that.delete(lightingGroup);
		}

		this._onLightingGroupDispose = onLightingGroupDispose;

		this._capabilities = capabilities;
		this._textures = textures;
	}

	setLightingGroup(lightingGroup, passInfo, options, cameraData) {
		const lightingProperties = this.get(lightingGroup);

		// Skip early if this lighting group has been set in this pass.
		if (lightingProperties.pass === passInfo.count) {
			return lightingProperties;
		}
		lightingProperties.pass = passInfo.count;

		if (lightingProperties.state === undefined) {
			lightingGroup.addEventListener('dispose', this._onLightingGroupDispose);
			lightingProperties.state = new LightingState();
			lightingProperties.uploadVersion = 0;
		}

		// Skip early if this lighting group is empty
		if (lightingGroup.totalNum === 0) {
			return lightingProperties;
		}

		const clusteredOptions = options.clustered;
		const clusteredEnabled = clusteredOptions.enabled;

		let clusteredLightsChanged = false;

		if (lightingProperties.lightingVersion !== lightingGroup.version || lightingProperties.clusteredEnabled !== clusteredEnabled) {
			lightingProperties.state.update(lightingGroup, clusteredEnabled);
			lightingProperties.uploadVersion++;

			const hasClusteredLights = lightingProperties.state._factor[10] > 0;

			lightingProperties.lightingVersion = lightingGroup.version;
			lightingProperties.clusteredEnabled = clusteredEnabled;
			lightingProperties.hasClusteredLights = hasClusteredLights;

			clusteredLightsChanged = hasClusteredLights;

			// prepare clustered lighting

			if (hasClusteredLights && !lightingProperties.clustered) {
				lightingProperties.clustered = new WebGLClusteredLighting(clusteredOptions);
				lightingProperties.clusteredOptionVersion = clusteredOptions.version;
			} else if (!clusteredEnabled && lightingProperties.clustered) {
				lightingProperties.clustered.dispose();
				delete lightingProperties.clustered;
			}
		}

		if (lightingProperties.hasClusteredLights) {
			if (lightingProperties.clusteredOptionVersion !== clusteredOptions.version) {
				lightingProperties.clustered.setOptions(clusteredOptions);
				lightingProperties.clusteredOptionVersion = clusteredOptions.version;

				clusteredLightsChanged = true;
			}

			let cameraChanged = false;

			if (lightingProperties.cameraId !== cameraData.id || lightingProperties.cameraVersion !== cameraData.version) {
				lightingProperties.cameraId = cameraData.id;
				lightingProperties.cameraVersion = cameraData.version;

				cameraChanged = true;
			}

			if (clusteredLightsChanged || cameraChanged) {
				lightingProperties.clustered.update(lightingGroup, cameraData, clusteredLightsChanged);
			}
		}

		return lightingProperties;
	}

	uploadUniforms(program, lightingGroup, disableShadowSampler) {
		const lightingGroupProperties = this.get(lightingGroup);

		let refresh = false;
		if (program.lightId !== lightingGroup.id || program.lightVersion !== lightingGroupProperties.uploadVersion) {
			refresh = true;
			program.lightId = lightingGroup.id;
			program.lightVersion = lightingGroupProperties.uploadVersion;
		}

		const uniforms = program.getUniforms();
		const capabilities = this._capabilities;
		const textures = this._textures;

		const lightingFactor = lightingGroupProperties.state._factor;

		if (lightingFactor[0] && refresh) {
			uniforms.set('u_AmbientLightColor', lightingGroup.ambient);
		}
		if (lightingFactor[1] && refresh) {
			uniforms.set('u_SphericalHarmonicsLightData', lightingGroup.sh);
		}
		if (lightingFactor[2] > 0 && refresh) {
			uniforms.set('u_Hemi', lightingGroup.hemisphere);
		}

		if (lightingFactor[3] > 0) {
			if (refresh) uniforms.set('u_Directional', lightingGroup.directional);

			if (lightingFactor[7] > 0) {
				if (refresh) uniforms.set('u_DirectionalShadow', lightingGroup.directionalShadow);

				if (uniforms.has('directionalShadowMap')) {
					if (capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set('directionalShadowMap', lightingGroup.directionalShadowDepthMap, textures);
					} else {
						uniforms.set('directionalShadowMap', lightingGroup.directionalShadowMap, textures);
					}
					uniforms.set('directionalShadowMatrix', lightingGroup.directionalShadowMatrix);
				}

				if (uniforms.has('directionalDepthMap')) {
					uniforms.set('directionalDepthMap', lightingGroup.directionalShadowMap, textures);
				}
			}
		}

		if (lightingFactor[4] > 0) {
			if (refresh) uniforms.set('u_Point', lightingGroup.point);

			if (lightingFactor[8] > 0) {
				if (refresh) uniforms.set('u_PointShadow', lightingGroup.pointShadow);

				if (uniforms.has('pointShadowMap')) {
					uniforms.set('pointShadowMap', lightingGroup.pointShadowMap, textures);
					uniforms.set('pointShadowMatrix', lightingGroup.pointShadowMatrix);
				}
			}
		}

		if (lightingFactor[5] > 0) {
			if (refresh) uniforms.set('u_Spot', lightingGroup.spot);

			if (lightingFactor[9] > 0) {
				if (refresh) uniforms.set('u_SpotShadow', lightingGroup.spotShadow);

				if (uniforms.has('spotShadowMap')) {
					if (capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set('spotShadowMap', lightingGroup.spotShadowDepthMap, textures);
					} else {
						uniforms.set('spotShadowMap', lightingGroup.spotShadowMap, textures);
					}
					uniforms.set('spotShadowMatrix', lightingGroup.spotShadowMatrix);
				}

				if (uniforms.has('spotDepthMap')) {
					uniforms.set('spotDepthMap', lightingGroup.spotShadowMap, textures);
				}
			}
		}

		if (lightingFactor[6] > 0) {
			if (refresh) uniforms.set('u_RectArea', lightingGroup.rectArea);

			if (lightingGroup.LTC1 && lightingGroup.LTC2) {
				uniforms.set('ltc_1', lightingGroup.LTC1, textures);
				uniforms.set('ltc_2', lightingGroup.LTC2, textures);
			} else {
				console.warn('WebGLRenderer: RectAreaLight.LTC1 and LTC2 need to be set before use.');
			}
		}

		if (lightingFactor[10] > 0) {
			const clusteredLighting = lightingGroupProperties.clustered;
			const cellsInfo = clusteredLighting.cellsTexture.cellsInfo;

			uniforms.set('maxLightsPerCell', cellsInfo.maxLightsPerCell);

			uniforms.set('cells', cellsInfo.table);
			uniforms.set('cellsDotData', cellsInfo.dotData);
			uniforms.set('cellsTextureSize', cellsInfo.textureSize);
			uniforms.set('cellsTransformFactors', clusteredLighting.cellsTransform.factors);

			uniforms.set('lightsTexture', clusteredLighting.lightsTexture, textures);
			uniforms.set('cellsTexture', clusteredLighting.cellsTexture, textures);
		}
	}

}

class LightingState {

	constructor() {
		this._factor = new Uint16Array(11);

		this._totalNum = 0;
		this._shadowsNum = 0;
	}

	update(lightingGroup, clusteredEnabled) {
		const selfFactor = this._factor;

		selfFactor[0] = lightingGroup.useAmbient ? 1 : 0;
		selfFactor[1] = lightingGroup.useSphericalHarmonics ? 1 : 0;
		selfFactor[2] = lightingGroup.hemisNum;
		selfFactor[3] = lightingGroup.directsNum;
		selfFactor[4] = lightingGroup.pointsNum;
		selfFactor[5] = lightingGroup.spotsNum;
		selfFactor[6] = lightingGroup.rectAreaNum;
		selfFactor[7] = lightingGroup.directShadowNum;
		selfFactor[8] = lightingGroup.pointShadowNum;
		selfFactor[9] = lightingGroup.spotShadowNum;
		selfFactor[10] = 0;

		this._totalNum = lightingGroup.totalNum;
		this._shadowsNum = lightingGroup.shadowsNum;

		if (clusteredEnabled) {
			const clusteredPointsNum = selfFactor[4] - selfFactor[8];
			const clusteredSpotsNum = selfFactor[5] - selfFactor[9];

			selfFactor[4] = selfFactor[8];
			selfFactor[5] = selfFactor[9];

			selfFactor[10] = (clusteredPointsNum + clusteredSpotsNum) > 0 ? 1 : 0;
		}
	}

	compare(factor) {
		if (!factor) {
			return false;
		}

		const selfFactor = this._factor;
		for (let i = 0, l = factor.length; i < l; i++) {
			if (selfFactor[i] !== factor[i]) {
				return false;
			}
		}

		return true;
	}

	copyTo(factor) {
		const selfFactor = this._factor;
		if (!factor) {
			factor = new selfFactor.constructor(this._factor.length);
		}
		factor.set(selfFactor);
		return factor;
	}

	hasLight() {
		return this._totalNum > 0;
	}

	hasShadow() {
		return this._shadowsNum > 0;
	}

	setProgramProps(props, receiveShadow) {
		const selfFactor = this._factor;

		props.useAmbientLight = selfFactor[0];
		props.useSphericalHarmonicsLight = selfFactor[1];
		props.hemisphereLightNum = selfFactor[2];
		props.directLightNum = selfFactor[3];
		props.pointLightNum = selfFactor[4];
		props.spotLightNum = selfFactor[5];
		props.rectAreaLightNum = selfFactor[6];
		props.directShadowNum = receiveShadow ? selfFactor[7] : 0;
		props.pointShadowNum = receiveShadow ? selfFactor[8] : 0;
		props.spotShadowNum = receiveShadow ? selfFactor[9] : 0;

		props.useClusteredLights = selfFactor[10];

		props.useShadow = this._shadowsNum > 0 && receiveShadow;
	}

}

export { WebGLLights };