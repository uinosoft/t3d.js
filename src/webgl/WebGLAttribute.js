class WebGLAttribute {

	constructor(gl, program, attributeData) {
		this.gl = gl;

		this.name = attributeData.name;

		this.type = attributeData.type;

		this.size = attributeData.size;

		this.location = gl.getAttribLocation(program, this.name);

		this.count = getAttributeCount(gl, this.type);

		this.format = getAttributeFormat(gl, this.type);

		this.locationSize = 1;
		if (this.type === gl.FLOAT_MAT2) this.locationSize = 2;
		if (this.type === gl.FLOAT_MAT3) this.locationSize = 3;
		if (this.type === gl.FLOAT_MAT4) this.locationSize = 4;
	}

}

function getAttributeCount(gl, type) {
	switch (type) {
		case gl.FLOAT:
		case gl.INT:
		case gl.UNSIGNED_INT:
			return 1;
		case gl.FLOAT_VEC2:
		case gl.INT_VEC2:
			return 2;
		case gl.FLOAT_VEC3:
		case gl.INT_VEC3:
			return 3;
		case gl.FLOAT_VEC4:
		case gl.INT_VEC4:
			return 4;
		case gl.FLOAT_MAT2:
			return 4;
		case gl.FLOAT_MAT3:
			return 9;
		case gl.FLOAT_MAT4:
			return 16;
		default:
			return 0;
	}
}

function getAttributeFormat(gl, type) {
	switch (type) {
		case gl.FLOAT:
		case gl.FLOAT_VEC2:
		case gl.FLOAT_VEC3:
		case gl.FLOAT_VEC4:
		case gl.FLOAT_MAT2:
		case gl.FLOAT_MAT3:
		case gl.FLOAT_MAT4:
			return gl.FLOAT;
		case gl.INT:
		case gl.INT_VEC2:
		case gl.INT_VEC3:
		case gl.INT_VEC4:
			return gl.INT;
		case gl.UNSIGNED_INT:
			return gl.UNSIGNED_INT;
		default:
			return gl.FLOAT;
	}
}

export { WebGLAttribute };