/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
class bSuperIBlockDummy extends bDummy {
	/**
	 * Sets the stage
	 * @param value
	 */
	setStage(value: string): void {
		this.stage = value;
	}
}

export default bSuperIBlockDummy;
