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
				{id: 'foo_0_0'},
				{
					id: 'foo_0_1',
					children: [
						{id: 'foo_1_0'},
						{id: 'foo_1_1'},

						{
							id: 'foo_1_2',
							children: [{id: 'foo_2_0'}]
						},

						{id: 'foo_1_3'},
						{id: 'foo_1_4'},
						{id: 'foo_1_5'}
					]
				},
				{id: 'foo_0_2'},
				{id: 'foo_0_3'},
				{id: 'foo_0_4'},
				{id: 'foo_0_5'},
				{id: 'foo_0_6'}
			]
		}
	]
};
