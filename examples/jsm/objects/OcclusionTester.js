import { Mesh, Query, QUERY_TYPE } from 't3d';

class OcclusionTester extends Mesh {

	constructor(geometry, material) {
		super(geometry, material);

		// Set renderLayer to 1 by default.
		// This can be changed by user
		// to make sure the occlusion tester is rendered after other objects.
		this.renderLayer = 1;

		this.queryType = QUERY_TYPE.ANY_SAMPLES_PASSED_CONSERVATIVE;

		this.onOcclusionChange = null;

		this.$query = new Query();
		this.$inProgress = false;
		this.$occluded = false;
	}

	get occluded() {
		return this.$occluded;
	}

	update(renderer) {
		if (!this.$inProgress) {
			return;
		}

		if (!renderer.isQueryResultAvailable(this.$query)) {
			return;
		}

		this.$inProgress = false;

		const occluded = !renderer.getQueryResult(this.$query);

		if (this.$occluded !== occluded) {
			this.$occluded = occluded;
			this.onOcclusionChange && this.onOcclusionChange(occluded);
		}
	}

	dispose() {
		this.$query.dispose();
		this.$occluded = false;
		this.$inProgress = false;
	}

}

function OcclusionIfRender(renderable) {
	return !renderable.object.$inProgress;
}

function OcclusionBeforeRender(renderable) {
	const tester = renderable.object;
	this.beginQuery(tester.$query, tester.queryType);
}

function OcclusionAfterRender(renderable) {
	const tester = renderable.object;
	this.endQuery(tester.$query);
	tester.$inProgress = true;
}

export {
	OcclusionTester,
	OcclusionIfRender,
	OcclusionBeforeRender,
	OcclusionAfterRender
};