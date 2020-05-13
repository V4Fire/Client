/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	s = JSON.stringify;

module.exports = [
	{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':options': s(Array.from(Array(100), (v, i) => i))
		},

		content: {}
	}
];
