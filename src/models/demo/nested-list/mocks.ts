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
			response: [
				{id: 'bar'},

				{
					id: 'foo',
					children: [
						{id: 'foo_1'},
						{id: 'foo_2'},

						{
							id: 'foo_3',
							children: [{id: 'foo_3_1'}]
						},

						{id: 'foo_4'},
						{id: 'foo_5'},
						{id: 'foo_6'}
					]
				}
			]
		}
	]
};
