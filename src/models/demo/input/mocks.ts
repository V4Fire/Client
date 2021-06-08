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
			query: {
				value: undefined
			},

			response: {
				name: 'foo',
				value: 'bar',
				'mods.someMod': 'bar',
				setMod: ['anotherMod', 'bla']
			}
		},

		{
			query: {value: 1},
			response: 'bar2'
		}
	]
};
