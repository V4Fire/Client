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

@component({
	functional: {
		functional: true
	}
})

export default class bFunctionalDummy extends bDummy {
	@field()
	counter: number = 0;

	@system()
	counterStore: number = 0;

	protected override $refs!: bDummy['$refs'] & {
		button?: bFunctionalButtonDummy;
	};

	syncStoreWithState(): void {
		this.counter = this.counterStore;
	}

	onClick(): void {
		this.counterStore += 1;
	}
}
