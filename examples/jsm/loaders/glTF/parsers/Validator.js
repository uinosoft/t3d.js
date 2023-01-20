export class Validator {

	static parse(context) {
		const {
			gltf: {
				asset: { version }
			}
		} = context;

		const gltfVersion = Number(version);
		if (!(gltfVersion >= 2 && gltfVersion < 3)) {
			throw "Only support gltf 2.x.";
		}
	}

}