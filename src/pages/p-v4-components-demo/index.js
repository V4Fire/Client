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
		'b-virtual-scroll',
		'b-tree',
		'b-checkbox',
		'b-button',
		'b-router',
		'b-list',
		'b-sidebar',
		'b-slider',
		components
	);
