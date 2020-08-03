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
	'--name b-router',

	// b-virtual-scroll
	'--name b-virtual-scroll --suit slots/empty --runner slots/empty',
	'--name b-virtual-scroll --suit render --runner render/render',
	'--name b-virtual-scroll --suit render --runner events/data-change',
	'--name b-virtual-scroll --suit render --runner events/chunk-loaded',
	'--name b-virtual-scroll --suit render --runner events/chunk-loading',
	'--name b-virtual-scroll --suit render --runner events/db-change',
	'--name b-virtual-scroll --suit render --runner functional/state',

	// b-button
	'--name b-button --suit demo',

	// in-view
	'--name b-dummy --test-entry core/component/directives/in-view/test'
];
