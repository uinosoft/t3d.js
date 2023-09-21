/**
 * Render info collector.
 * If you want to collect information about the rendering of this frame,
 * pass an instance of RenderInfo to RenderOption when calling renderRenderableList.
 * @memberof t3d
 */
class RenderInfo {

	constructor() {
		const render = {
			calls: 0,
			triangles: 0,
			lines: 0,
			points: 0
		};

		// A series of function use for collect information.
		const updateFuncs = [
			function updatePoints(instanceCount, count) {
				render.points += instanceCount * count;
			},
			function updateLines(instanceCount, count) {
				render.lines += instanceCount * (count / 2);
			},
			function updateLineLoop(instanceCount, count) {
				render.lines += instanceCount * count;
			},
			function updateLineStrip(instanceCount, count) {
				render.lines += instanceCount * (count - 1);
			},
			function updateTriangles(instanceCount, count) {
				render.triangles += instanceCount * (count / 3);
			},
			function updateTriangleStrip(instanceCount, count) {
				render.triangles += instanceCount * (count - 2);
			},
			function updateTriangleFan(instanceCount, count) {
				render.triangles += instanceCount * (count - 2);
			}
		];

		/**
		 * Method of update render info.
		 * This method will be executed after each draw.
		 * @private
		 * @param {Number} count
		 * @param {t3d.DRAW_MODE} mode
		 * @param {Number} instanceCount
		 */
		this.update = function(count, mode, instanceCount) {
			render.calls++;
			updateFuncs[mode](instanceCount, count);
		};

		/**
		 * Reset the render info.
		 * Call this method whenever you have finished to render a single frame.
		 */
		this.reset = function() {
			render.calls = 0;
			render.triangles = 0;
			render.lines = 0;
			render.points = 0;
		};

		/**
         * A series of statistical information of rendering process, include calls, triangles, lines and points.
         * @type {Object}
         */
		this.render = render;
	}

}

export { RenderInfo };