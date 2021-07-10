/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	components = (require('config').build.components ?? []).map(({name}) => name);

package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-v4-component-demo',
		'p-v4-dynamic-page-1',
		'p-v4-dynamic-page-2',
		'p-v4-dynamic-page-3',

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
		'b-window',

		'b-sidebar',
		'b-slider',
		'b-bottom-slide',

		'b-icon',
		'b-image',

		'b-dummy',
		'b-dummy-text',
		'b-dummy-async-render',
		'b-dummy-control-list',

		components
	);
