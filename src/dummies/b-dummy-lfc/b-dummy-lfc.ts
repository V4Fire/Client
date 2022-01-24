/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-lfc/README.md]]
 * @packageDocumentation
 */

import iData, { component, hook, field } from '@src/super/i-data/i-data';

export * from '@src/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyLfc extends iData {
	@field()
	foo: number = 1;

	@field()
	bar: number = 2;

	beforeCreate(): void {
		this.tmp.beforeCreateHook = this.hook;
		this.tmp.beforeCreateIsBefore = this.lfc.isBeforeCreate();

		void (<Promise<unknown>>this.lfc.execCbAtTheRightTime(() => {
			this.tmp.rightTimeHookFromBeforeCreate = this.hook;
			return this.hook;

		})).then((res) => {
			this.tmp.rightTimeHookFromBeforeCreate2 = res;
		});
	}

	@hook('beforeDataCreate')
	beforeDataCreate(): void {
		this.tmp.fooBar = this.field.get<number>('foo')! + this.field.get<number>('bar')!;
		this.tmp.beforeDataCreateHook = this.hook;
		this.tmp.beforeDataCreateIsBefore = this.lfc.isBeforeCreate();
		this.tmp.beforeDataCreateIsBeforeWithSkipping = this.lfc.isBeforeCreate('beforeDataCreate');

		this.tmp.rightTimeHook2 = this.lfc.execCbAtTheRightTime(() => {
			this.tmp.rightTimeHook = this.hook;
			this.tmp.rightTimeHookIsBefore = this.lfc.isBeforeCreate();
			return this.hook;
		});

		void this.lfc.execCbAfterBlockReady(() => {
			this.tmp.blockReady = this.block != null;
			this.tmp.blockReadyIsBefore = this.lfc.isBeforeCreate();
		});

		void (<Promise<unknown>>this.lfc.execCbAfterComponentCreated(() => {
			this.tmp.componentCreatedHook = this.hook;
			return this.hook;

		})).then((res) => {
			this.tmp.componentCreatedHook2 = res;
		});
	}
}
