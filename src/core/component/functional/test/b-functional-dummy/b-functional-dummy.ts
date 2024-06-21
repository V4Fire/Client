/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, field, system } from 'components/dummies/b-dummy/b-dummy';
import type bFunctionalButtonDummy from 'core/component/functional/test/b-functional-button-dummy/b-functional-button-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bFunctionalDummy extends bDummy {
	@field()
	clickCount: number = 0;

	@system()
	clickCountStore: number = 0;

	protected override $refs!: bDummy['$refs'] & {
		button: bFunctionalButtonDummy;
	};

	updateClickCount(): void {
		this.clickCount = this.clickCountStore;
	}

	onClick(): void {
		this.clickCountStore += 1;
	}
}
