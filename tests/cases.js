/* eslint-disable capitalized-comments */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = [
	// b-router
	'--test-entry base/b-router/test',

	// b-virtual-scroll
	'--test-entry base/b-virtual-scroll/test --runner slots/empty',
	'--test-entry base/b-virtual-scroll/test --runner slots/render-next',

	'--test-entry base/b-virtual-scroll/test --runner render/render',

	'--test-entry base/b-virtual-scroll/test --runner events/data-change',
	'--test-entry base/b-virtual-scroll/test --runner events/chunk-loaded',
	'--test-entry base/b-virtual-scroll/test --runner events/chunk-loading',
	'--test-entry base/b-virtual-scroll/test --runner events/db-change',

	'--test-entry base/b-virtual-scroll/test --runner functional/state',
	'--test-entry base/b-virtual-scroll/test --runner functional/render-next',

	// b-button
	'--test-entry form/b-button/test',

	// in-view
	'--test-entry core/component/directives/in-view/test'
];
