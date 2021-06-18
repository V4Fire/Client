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

				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				],

				'mods.someMod': 'bar',
				setMod: ['anotherMod', 'bla']
			}
		},

		{
			query: {value: 1},
			response: '0'
		}
	]
};
