/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	components = (require('@config/config').build.components ?? []).map(({name}) => name);

package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-v4-component-demo',
		'p-v4-dynamic-page1',
		'p-v4-dynamic-page2',
		'p-v4-dynamic-page3',

		'b-remote-provider',
		'b-router',
		'b-dynamic-page',

		'b-tree',
		'b-list',

		'b-form',
		'b-button',
		'b-checkbox',
		'b-radio-button',
		'b-input-hidden',
		'b-input',
		'b-textarea',
		'b-select',
		'b-select-date',

		'b-virtual-scroll',
		'b-virtual-scroll-new',
		'b-window',

		'b-sidebar',
		'b-slider',
		'b-bottom-slide',

		'b-icon',
		'b-image',

		'b-dummy',
		'b-dummy-text',
		'b-dummy-async-render',
		'b-dummy-module-loader',
		'b-dummy-lfc',
		'b-dummy-watch',
		'b-dummy-sync',
		'b-dummy-state',
		'b-dummy-control-list',
		'b-dummy-decorators',
		'b-scroll-element-dummy',

		components
	)
	.libs([
		'core/cookies',
		'core/kv-storage/engines/cookie',
		'models/demo/form'
	]);
