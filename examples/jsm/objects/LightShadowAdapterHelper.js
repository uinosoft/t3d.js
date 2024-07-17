import { BasicMaterial, Matrix4, Mesh, Object3D, SphereGeometry } from 't3d';
import { Box3Helper } from './Box3Helper.js';

export class LightShadowAdapterHelper extends Object3D {

	constructor(adapter) {
		super();

		this.adapter = adapter;

		this.box3HelperContainer = new Object3D();
		this.add(this.box3HelperContainer);

		this.thinBoxHelper = new Box3Helper(adapter.stats.thinShadowBox, 0x00ffff);
		this.box3HelperContainer.add(this.thinBoxHelper);

		this.shadowBoxHelper = new Box3Helper(adapter.stats.shadowBox);
		this.box3HelperContainer.add(this.shadowBoxHelper);

		this.pointsHelper = new Object3D();
		this.add(this.pointsHelper);

		this.pointGeometry = new SphereGeometry(1, 8, 6);
		this.pointMaterial = new BasicMaterial();
		this.pointMaterial.diffuse.setHex(0xff0000);
	}

	updateMatrix(force) {
		const { adapter, pointsHelper, pointGeometry, pointMaterial } = this;
		const { type, shadowBox, shadowBoxRotation, boundaryPoints, polygons } = adapter.stats;

		// shadow box helper

		this.box3HelperContainer.quaternion.setFromRotationMatrix(_mat4_1.setFromMatrix3(shadowBoxRotation));

		// points helper

		const sizeScalar = shadowBox.max.distanceTo(shadowBox.min) / 500;

		pointsHelper.children.forEach(point => point.visible = false);

		if (type === 1) {
			let pointIndex = 0;
			polygons.polygons.forEach(polygon => {
				for (let i = 0; i < polygon.verticesIndex; i++) {
					let point = pointsHelper.children[pointIndex];
					if (!point) {
						point = new Mesh(pointGeometry, pointMaterial);
						pointsHelper.add(point);
					}
					point.position.copy(polygon.vertices[i]);
					point.scale.setScalar(sizeScalar);
					point.visible = true;
					pointIndex++;
				}
			});
		} else if (type === 2 || type === 3) {
			let pointIndex = 0;
			for (let i = 0; i < boundaryPoints.length; i++) {
				let point = pointsHelper.children[pointIndex];
				if (!point) {
					point = new Mesh(pointGeometry, pointMaterial);
					pointsHelper.add(point);
				}
				point.position.copy(boundaryPoints[i]);
				point.scale.setScalar(sizeScalar);
				point.visible = true;
				pointIndex++;
			}
		}

		super.updateMatrix(force);
	}

}

const _mat4_1 = new Matrix4();