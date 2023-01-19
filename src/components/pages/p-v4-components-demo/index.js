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
		'b-window',

		'b-form',
		'b-button',
		'b-checkbox',
		'b-hidden-input',
		'b-input',
		'b-textarea'
	)

	.libs(
		'components/directives/image',
		'components/directives/icon'
	);
