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
	.dependencies('b-button', 'b-checkbox', 'b-hidden-input')
	.libs('components/directives/icon');
