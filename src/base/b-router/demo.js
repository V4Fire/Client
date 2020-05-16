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
				},

				secondAlias: {
					path: '/second/alias',
					alias: 'second'
				},

				aliasToAlias: {
					path: '/alias-to-alias',
					alias: 'secondAlias'
				},

				aliasToRedirect: {
					path: '/second/alias-redirect',
					alias: 'indexRedirect'
				},

				indexRedirect: {
					path: '/redirect',
					redirect: 'index'
				},

				secondRedirect: {
					path: '/second/redirect',
					redirect: 'second'
				},

				redirectToAlias: {
					path: '/redirect-alias',
					redirect: 'secondAlias'
				},

				redirectToRedirect: {
					path: '/redirect-redirect',
					redirect: 'secondRedirect'
				}
			})
		},

		content: "{{ field.get('route.meta.content') }}"
	}
];
