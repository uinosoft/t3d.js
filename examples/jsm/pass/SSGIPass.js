import {
	ShaderPostPass,

} from 't3d';
import { SSGIShader } from "../shaders/SSGIShader.js";

class SSGIPass extends ShaderPostPass {

	constructor() {
		super(SSGIShader);
	}



}


export { SSGIPass };