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
				{value: 'foo_0_0'},
				{
					value: 'foo_0_1',
					children: [
						{value: 'foo_1_0'},
						{value: 'foo_1_1'},

						{
							value: 'foo_1_2',
							children: [{value: 'foo_2_0'}]
						},

						{value: 'foo_1_3'},
						{value: 'foo_1_4'},
						{value: 'foo_1_5'}
					]
				},
				{value: 'foo_0_2'},
				{value: 'foo_0_3'},
				{value: 'foo_0_4'},
				{value: 'foo_0_5'},
				{value: 'foo_0_6'}
			]
		}
	]
};
