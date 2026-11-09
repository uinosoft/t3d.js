import { PBRMaterial, Scene, Texture2D } from 't3d';
import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';
import { MaterialParser } from '../../../../examples/jsm/loaders/glTF/parsers/MaterialParser.js';
import { KHR_texture_transform } from '../../../../examples/jsm/loaders/glTF/extensions/KHR_texture_transform.js';

QUnit.module('GLTFExporter');

function exportMaterial(material) {
	const exporter = new GLTFExporter();
	exporter.register(class {

		constructor(writer) {
			this.writer = writer;
		}

		afterParse() {
			// Isolate material metadata from browser image encoding and buffer serialization.
			this.writer.processTextureAsync = async () => 0;
			this.writer.pending.push(this.writer.processMaterialAsync(material));
		}

	});
	return exporter.parseAsync(new Scene());
}

QUnit.test('normal UV channel and transform survive material export and parsing', async assert => {
	const material = new PBRMaterial();
	material.normalMap = new Texture2D();
	material.normalMapCoord = 1;
	material.normalMapTransform.offset.set(0.25, -0.5);
	material.normalMapTransform.scale.set(2, 3);
	material.normalMapTransform.updateMatrix();
	material.normalScale.set(0.75, -0.75);

	const gltf = await exportMaterial(material);
	const normalTexture = gltf.materials[0].normalTexture;

	assert.strictEqual(normalTexture.texCoord, 1, 'normal UV channel is exported');
	assert.strictEqual(normalTexture.scale, 0.75, 'normal strength is exported separately from UV scale');
	assert.deepEqual(normalTexture.extensions.KHR_texture_transform, {
		offset: [0.25, -0.5],
		scale: [2, 3]
	}, 'normal UV offset and scale are exported');
	assert.ok(gltf.extensionsUsed.includes('KHR_texture_transform'), 'texture transform extension is declared');

	const context = { gltf, textures: [material.normalMap] };
	MaterialParser.parse(context, {
		extensions: new Map([['KHR_texture_transform', KHR_texture_transform]]),
		autoParseConfig: { materials: [] }
	});
	const parsed = context.materials[0];

	assert.strictEqual(parsed.normalMapCoord, material.normalMapCoord, 'parsed normal UV channel matches');
	assert.deepEqual(parsed.normalMapTransform.elements, material.normalMapTransform.elements, 'parsed normal UV matrix matches');
	assert.deepEqual(parsed.normalScale.toArray(), material.normalScale.toArray(), 'parsed normal strength matches');
});

QUnit.test('default normal UV settings omit the texture transform extension', async assert => {
	const material = new PBRMaterial();
	material.normalMap = new Texture2D();

	const gltf = await exportMaterial(material);
	const normalTexture = gltf.materials[0].normalTexture;

	assert.strictEqual(normalTexture.texCoord, 0, 'normal map defaults to UV channel 0');
	assert.strictEqual(normalTexture.extensions, undefined, 'identity transform does not add an extension');
	assert.strictEqual(normalTexture.scale, undefined, 'default normal strength is omitted');
	assert.strictEqual(gltf.extensionsUsed, undefined, 'unused extension is not declared');
});

QUnit.test('UV offsets are exported from the translation column for existing maps', async assert => {
	const material = new PBRMaterial();
	const texture = new Texture2D();
	for (const map of ['diffuseMap', 'emissiveMap', 'aoMap']) {
		material[map] = texture;
		material[map + 'Transform'].offset.set(-0.25, 0.5);
		material[map + 'Transform'].updateMatrix();
	}

	const gltf = await exportMaterial(material);
	const definition = gltf.materials[0];
	for (const map of [definition.pbrMetallicRoughness.baseColorTexture, definition.emissiveTexture, definition.occlusionTexture]) {
		assert.deepEqual(map.extensions.KHR_texture_transform.offset, [-0.25, 0.5], 'texture UV offset is retained');
	}
});
