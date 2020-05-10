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
			':pages': JSON.stringify({
				index: {
					path: '/',
					remote: false,
					content: 'Index page'
				},

				second: {
					path: '/second',
					remote: false,
					content: 'Second page'
				}
			})
		},

		content: "{{ field.get('route.meta.content') }}"
	}
];
