
export class KHR_gaussian_splatting_compression_spz {

	static getGeometry(bufferView, spzLoader) {
		return new Promise(async function(resolve, reject) {
			try {
				const bufferViewTypedArray = new Uint8Array(bufferView);
				const gcloud = await spzLoader(bufferViewTypedArray, {
					unpackOptions: { coordinateSystem: 'UNSPECIFIED' }
				});
				const splatBuffer = KHR_gaussian_splatting_compression_spz.convertInternalDataToSplat(gcloud.numPoints, gcloud.positions, gcloud.rotations, gcloud.scales, gcloud.alphas, gcloud.colors);
				splatBuffer._isSplatBuffer = true;
				resolve(splatBuffer);
			} catch (error) {
				reject(new Error('Failed to load SPZ: ' + error.message));
			}
		});
	}
	static convertInternalDataToSplat(vertexCount, positions, rotations, scales, alphas, colors) {
		const rgbaColors = new Uint8Array(vertexCount * 4);
		for (let i = 0; i < vertexCount; i++) {
			rgbaColors[i * 4 + 0] = colors[i * 3 + 0] * 255;
			rgbaColors[i * 4 + 1] = colors[i * 3 + 1] * 255;
			rgbaColors[i * 4 + 2] = colors[i * 3 + 2] * 255;
			rgbaColors[i * 4 + 3] = alphas[i] * 255;
		}

		return {
			vertexCount,
			positions,
			rotations,
			scales,
			colors: rgbaColors
		};
	}
}