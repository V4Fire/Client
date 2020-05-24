/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = [
	/*
		b-virtual-scroll tests
	*/
	`--name b-virtual-scroll --suit render`,
	`--name b-virtual-scroll --suit render-options`,
	`--name b-virtual-scroll --suit render-truncated --runner render-truncated`,

	'--name b-virtual-scroll --suit slot-empty --runner slot-empty',

	/*
		b-button tests
	*/
	`--name b-button --suit demo`
]
