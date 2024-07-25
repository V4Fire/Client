/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bSuperIBlockDummy extends bDummy {
	setStage(value: string): void {
		this.stage = value;
	}
}
