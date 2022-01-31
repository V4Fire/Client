/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-decorators/README.md]]
 * @packageDocumentation
 */

import iData, { component, field, hook, watch, p, WatchHandlerParams } from '/super/i-data/i-data';

export * from '/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyDecorators extends iData {
	@field()
	i: number = 0;

	@field({
		after: 'i',
		init: (o, data) => <number>data.i + 1
	})

	j!: number;

	@hook('created')
	initValues(): void {
		this.tmp.changes = [];
		this.i = 2 + this.j;
	}

	@hook({created: {after: 'initValues'}})
	calcValues(): void {
		this.i *= 2;
	}

	@hook({created: {after: ['initValues', 'calcValues']}})
	calcValues2(): void {
		this.i++;
	}

	@watch('i')
	onIChange(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	@watch({path: 'i', provideArgs: false})
	onIChangeWithoutArgs(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	@watch({
		path: 'i',
		wrapper: (o, fn) => () => fn('boom!')
	})

	onIChangeWithWrapper(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	@p({
		watch: ['i', 'j'],
		watchParams: {immediate: true},
		hook: ['created', 'mounted']
	})

	onSome(): void {
		const changes = <any[]>(this.tmp.someChanges ?? []);
		this.tmp.someChanges = changes;
		changes.push([this.hook, this.i, this.j]);
	}
}
