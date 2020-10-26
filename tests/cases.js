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

	// b-list
	'--test-entry base/b-list/test --runner simple',
	'--test-entry base/b-list/test --runner links',
	'--test-entry base/b-list/test --runner slots',
	'--test-entry base/b-list/test --runner data-provider',

	// dom/image
	'--test-entry core/dom/image/test',

	// dom/in-view
	'--test-entry core/dom/in-view/test'
];
