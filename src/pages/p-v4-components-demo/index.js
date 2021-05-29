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
		'b-dummy',

		'b-v4-component-demo',
		'p-v4-dynamic-page-1',
		'p-v4-dynamic-page-2',
		'p-v4-dynamic-page-3',

		'b-router',
		'b-dynamic-page',

		'b-tree',
		'b-list',

		'b-checkbox',
		'b-button',

		'b-input-hidden',
		'b-form',

		'b-sidebar',
		'b-dummy',
		'b-dummy-text',
		'b-slider',

		components
	);
