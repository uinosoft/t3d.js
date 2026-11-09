import { Material } from '../../../../../src/resources/materials/Material.js';
import { PBRMaterial } from '../../../../../src/resources/materials/PBRMaterial.js';
import { Texture2D } from '../../../../../src/resources/textures/Texture2D.js';

QUnit.module('Material');

QUnit.test('normal map transform is independent of diffuse map transform', assert => {
	const material = new Material();

	material.diffuseMapTransform.offset.set(0.25, 0.5);
	material.diffuseMapTransform.scale.set(2, 3);
	material.diffuseMapTransform.updateMatrix();

	assert.strictEqual(material.normalMapCoord, 0, 'normal map defaults to the first UV channel');
	assert.ok(material.normalMapTransform.isIdentity(), 'normal map retains its identity transform');

	material.normalMapTransform.offset.set(0.5, 0.25);
	material.normalMapTransform.updateMatrix();

	assert.strictEqual(material.diffuseMapTransform.elements[6], 0.25, 'normal map offset does not change the diffuse map offset');
});

QUnit.test('cloned PBR material retains independent normal map settings', assert => {
	const source = new PBRMaterial();
	source.normalMap = new Texture2D();
	source.normalMapCoord = 1;
	source.normalMapTransform.offset.set(0.25, 0.5);
	source.normalMapTransform.scale.set(2, -3);
	source.normalMapTransform.rotation = 0.5;
	source.normalMapTransform.updateMatrix();
	source.normalScale.set(0.75, -0.75);

	const cloned = source.clone();

	assert.strictEqual(cloned.normalMap, source.normalMap, 'normal texture is shared');
	assert.strictEqual(cloned.normalMapCoord, 1, 'normal UV channel is retained');
	assert.deepEqual(cloned.normalMapTransform.elements, source.normalMapTransform.elements, 'normal UV matrix is retained');
	assert.deepEqual(cloned.normalMapTransform.offset, source.normalMapTransform.offset, 'normal UV offset is retained');
	assert.deepEqual(cloned.normalMapTransform.scale, source.normalMapTransform.scale, 'normal UV scale is retained');
	assert.strictEqual(cloned.normalMapTransform.rotation, source.normalMapTransform.rotation, 'normal UV rotation is retained');
	assert.deepEqual(cloned.normalScale, source.normalScale, 'normal scale is retained');

	cloned.normalMapTransform.offset.x = 1;
	cloned.normalMapTransform.updateMatrix();
	assert.strictEqual(source.normalMapTransform.offset.x, 0.25, 'editing the clone does not change the source transform');
	assert.strictEqual(source.normalMapTransform.elements[6], 0.25, 'editing the clone does not change the source matrix');
});
