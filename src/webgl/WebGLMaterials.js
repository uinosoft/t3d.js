import { PropertyMap } from '../render/PropertyMap.js';

class WebGLMaterials extends PropertyMap {

	constructor(prefix, programs, vertexArrayBindings) {
		super(prefix);

		const that = this;

		function onMaterialDispose(event) {
			const material = event.target;
			const materialProperties = that.get(material);

			material.removeEventListener('dispose', onMaterialDispose);

			const program = materialProperties.program;

			if (program !== undefined) {
				vertexArrayBindings.releaseByProgram(program);
				programs.releaseProgram(program);
			}

			that.delete(material);
		}

		this._onMaterialDispose = onMaterialDispose;
	}

	setMaterial(material) {
		const materialProperties = this.get(material);

		if (materialProperties.program === undefined) {
			material.addEventListener('dispose', this._onMaterialDispose);
		}

		// Set program in renderer

		return materialProperties;
	}

}

export { WebGLMaterials };