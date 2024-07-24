/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */
import iBlock, { component, system } from 'components/super/i-block/i-block';

export * from 'components/super/i-block/i-block';

@component({
	functional: {
		functional: true
	}
})

export default class bComponentRenderFlagsDummy extends iBlock {
	@system()
	clickCount: number = 0;

	onClick(): void {
		this.clickCount++;
	}
}
