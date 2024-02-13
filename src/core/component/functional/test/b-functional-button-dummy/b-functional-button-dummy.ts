/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, system } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component({functional: true})
export default class bFunctionalButtonDummy extends bDummy {
	@system()
	clickCount: number = 0;

	@system({unique: true})
	uniqueClickCount: number = 0;

	onClick(): void {
		this.emit('click');
		this.clickCount += 1;
		this.uniqueClickCount += 1;
	}
}
