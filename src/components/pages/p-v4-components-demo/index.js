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
		'b-dummy-user',

		'b-router',
		'b-dynamic-page',

		'b-remote-provider',
		'b-list',
		'b-tree',
		'b-window',
		'b-scrolly',

		'b-form',
		'b-button',
		'b-icon-button',
		'b-checkbox',
		'b-radio-button',
		'b-hidden-input',
		'b-input',
		'b-textarea'
	)

	.libs(
		'components/directives/image',
		'components/directives/icon'
	);
