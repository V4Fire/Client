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

		'b-list',
		'b-tree',
		'b-virtual-scroll',
		'b-window',
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
		'b-select-date',

		'p-v4-dynamic-page1',
		'p-v4-dynamic-page2',
		'p-v4-dynamic-page3'
	)

	.libs(
		'components/directives/bind-with',
		'components/directives/image',
		'components/directives/icon',
		'core/router/engines/browser-history',
		'core/router/engines/in-memory',
		'components/traits/i-control-list/i-control-list',
	);
