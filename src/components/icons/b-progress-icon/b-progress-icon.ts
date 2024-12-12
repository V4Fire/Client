/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/icons/b-progress-icon/README.md]]
 * @packageDocumentation
 */

import iBlock, { component } from 'components/super/i-block/i-block';

export * from 'components/super/i-block/i-block';

@component({functional: true})
export default class bProgressIcon extends iBlock {
	destroyed(): void {
		this.console.log(this.componentName, 'destroyed');
	}
}
