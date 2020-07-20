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

	// b-button
	'--name b-button --suit demo'
];
