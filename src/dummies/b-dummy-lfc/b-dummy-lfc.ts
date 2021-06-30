/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-async-render/README.md]]
 * @packageDocumentation
 */

import iData, { component, hook } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyLfc extends iData {
	@hook('beforeDataCreate')
	beforeDataCreate(): void {
		(<Promise<any>>this.lfc.execCbAtTheRightTime(() => {
			this.tmp.beforeDataCreate1 = this.hook;
			return this.hook;

		})).then((res) => {
			this.tmp.beforeDataCreate2 = res;
		});
	}
}
