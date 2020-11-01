/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export default {
	GET: [
		{
			url: '/input',

			response: {
				name: 'foo',
				value: 'bar',
				'mods.someMod': 'bar',
				setMod: ['anotherMod', 'bla']
			}
		},

		{
			url: '/input-value',
			response: 'bar2'
		}
	]
};
