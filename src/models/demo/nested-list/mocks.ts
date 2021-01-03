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
				{id: 'foo'},

				{
					id: 'bar',
					children: [
						{id: 'foo_one'},
						{id: 'foo_two'},

						{
							id: 'foo_three',
							children: [{id: 'foo_three_one'}, {id: 'foo_three_two'}, {id: 'foo_three_three'}]
						},

						{id: 'foo_four'},
						{id: 'foo_five'},
						{id: 'foo_six'}
					]
				}
			]
		}
	]
};
