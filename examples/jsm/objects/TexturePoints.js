import { Geometry, Mesh, ShaderMaterial, Attribute, Buffer, DRAW_MODE } from 't3d';

class TexturePoints extends Mesh {

	constructor(options = {}) {
		const geometry = new Geometry();
		super(geometry, new ShaderMaterial(PointTextureShader));
		this.material.uniforms.positions = options.texture;
		this.material.drawMode = DRAW_MODE.POINTS;
		this.material.size = 10;
		this._initGeometry(options);
	}
	_initGeometry(param) {
		this._nodesCount = param['nodesCount'];
		this._nodesWidth = param['nodesWidth'];
		const vertices = [];
		for (let i = 0; i < this._nodesCount; i++) {
			vertices.push(0, 0, 0);
		}
		const references = [];
		for (let i = 0; i < this._nodesCount; i++) {
			const x = (i % this._nodesWidth) / this._nodesWidth;
			const y = ~~(i / this._nodesWidth) / this._nodesWidth;

			references.push(x, y);
		}

		this.geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));

		this.geometry.addAttribute('a_Reference', new Attribute(new Buffer(new Float32Array(references), 2)));
		this.geometry.version++;
	}

}

const PointTextureShader = {
	name: 'point_texture',
	uniforms: {
		positions: null,
		size: 5,
		keepSize: false,
		dragPos: [0, 0, 0],
		isDrag: false,
		dragReference: [-1, -1],
		color: [1, 0, 0]
	},
	vertexShader: `
        attribute vec3 a_Position;
        attribute vec2 a_Uv;
        attribute vec2 a_Reference;

        uniform mat4 u_ProjectionView;
        uniform mat4 u_Model;
        uniform float size;
        uniform sampler2D positions;
        uniform bool isDrag;
        uniform vec2 dragReference;

       varying vec2 v_Uv;

       void main() {
            gl_PointSize = size;
            vec4 mvPosition;
            vec4 tmpPos = texture2D( positions, a_Reference );
            gl_Position = u_ProjectionView * u_Model * vec4( tmpPos.xyz, 1.0 );
       }
   `,
	fragmentShader: `
        uniform vec3 color;
        

        void main() {

            gl_FragColor = vec4( color.rgb, 1.0 );
        }

   `

};
export { TexturePoints };