import { PropertyMap } from '../render/PropertyMap.js';

class WebGLMaterials extends PropertyMap {

	constructor(prefix, programs, vertexArrayBindings) {
		super(prefix);

		const that = this;

		function onMaterialDispose(event) {
			const material = event.target;
			const materialProperties = that.get(material);

			material.removeEventListener('dispose', onMaterialDispose);

			const programList = materialProperties.programList;

			if (programList !== undefined) {
				for (let i = 0, l = programList.length; i < l; i++) {
					const program = programList[i];

					vertexArrayBindings.releaseByProgram(program);
					programs.releaseProgram(program);
				}
			}

			that.delete(material);
		}

		this._onMaterialDispose = onMaterialDispose;

		this._programs = programs;
		this._vertexArrayBindings = vertexArrayBindings;
	}

	setMaterial(material) {
		const materialProperties = this.get(material);

		if (materialProperties.programList === undefined) {
			material.addEventListener('dispose', this._onMaterialDispose);

			materialProperties.programList = [];
		}

		// Set other material properties in renderer

		return materialProperties;
	}

	updateProgram(material, object, renderStates, shaderCompileOptions) {
		const programs = this._programs;
		const vertexArrayBindings = this._vertexArrayBindings;

		const materialProperties = this.get(material);

		const props = programs.generateProps(material, object, renderStates);
		const programCode = programs.generateProgramCode(props, material);

		const programList = materialProperties.programList;

		let targetProgram = findProgram(programList, programCode);

		if (targetProgram === null) {
			targetProgram = programs.getProgram(material, props, programCode, shaderCompileOptions);
			programList.unshift(targetProgram);

			if (programList.length > shaderCompileOptions.maxMaterialPrograms) {
				// release the last program
				const lastProgram = programList.pop();
				vertexArrayBindings.releaseByProgram(lastProgram);
				programs.releaseProgram(lastProgram);
			}
		}

		materialProperties.currentProgram = targetProgram;
	}

}

function findProgram(list, code) {
	let index = 0, target = null;

	for (let l = list.length; index < l; index++) {
		const program = list[index];

		if (program.code === code) {
			target = program;
			break;
		}
	}

	// move to the first
	if (target !== null && index > 0) {
		for (let i = index; i > 0; i--) {
			list[i] = list[i - 1];
		}
		list[0] = target;
	}

	return target;
}

export { WebGLMaterials };