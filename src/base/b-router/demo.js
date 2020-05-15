/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = [
	{
		attrs: {
			':routes': JSON.stringify({
				index: {
					path: '/',
					content: 'Index page'
				},

				second: {
					path: '/second',
					content: 'Second page'
				}
			})
		},

		content: "{{ field.get('route.meta.content') }}"
	}
];
