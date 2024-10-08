/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-dummy',

		'b-router',
		'b-dynamic-page',
		'b-remote-provider',

		'b-cache-ssr',
		'b-prevent-ssr',

		'b-list',
		'b-tree',
		'b-window',
		'b-virtual-scroll',
		'b-virtual-scroll-new',
		'b-bottom-slide',
		'b-slider',
		'b-sidebar',

		'b-form',
		'b-button',
		'b-icon-button',
		'b-checkbox',
		'b-radio-button',
		'b-input',
		'b-hidden-input',
		'b-textarea',
		'b-select',
		'b-select-date'
	)

	.libs(
		'components/directives/bind-with',
		'components/directives/image',
		'components/directives/icon',
		'components/directives/in-view',
		'components/directives/safe-html',

		'core/router/engines/browser-history',
		'core/router/engines/in-memory',

		'components/traits/i-control-list/i-control-list',

		'core/browser',
		'core/cookies',
		'core/html',
		'core/html/xss',
		'core/page-meta-data',

		'models/modules/session'
	);
