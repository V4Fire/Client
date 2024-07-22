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

@component({functional: {}})
export default class bComponentDirectivesAttrsDummy extends iBlock {
	@system()
	counter: number = 0;

	protected onClick(): void {
		this.emit('delete');
	}
}
