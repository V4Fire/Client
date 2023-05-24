/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, field, hook, watch, WatchHandlerParams } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

@component({
	functional: true
})

export default class bCoreComponentDecoratorsDummy extends iData {
	/**
	 * Watched field
	 */
	@field()
	i: number = 0;

	/**
	 * Watched field
	 */
	@field({
		after: 'i',
		init: (o, data) => <number>data.i + 1
	})

	j!: number;

	/**
	 * This method will be called on the `created` hook
	 */
	@hook('created')
	initValues(): void {
		this.tmp.changes = [];
		this.i = 2 + this.j;
	}

	/**
	 * This method will be called on the `created` hook and only after `initValues` is called
	 */
	@hook({created: {after: 'initValues'}})
	calcValues(): void {
		this.i *= 2;
	}

	/**
	 * This method will be called on the `created` hook and only after `initValues` and `calcValues` are called
	 */
	@hook({created: {after: ['initValues', 'calcValues']}})
	calcValues2(): void {
		this.i++;
	}

	/**
	 * This method will be called every time the `i` field changes.
	 * Only the last change in the tick will be registered.
	 *
	 * @param value
	 * @param oldValue
	 * @param i
	 */
	@watch('i')
	onIChange(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	/**
	 * This method will be called every time the `i` field changes.
	 * During the call, all arguments will be `undefined` because provideArgs is set to `false`.
	 * Only the last change in the tick will be registered.
	 *
	 * @param value
	 * @param oldValue
	 * @param i
	 */
	@watch({path: 'i', provideArgs: false})
	onIChangeWithoutArgs(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	/**
	 * This method will be called every time the `i` field changes.
	 * During the call, `value` will be equal to `'boom!'` and other arguments will be `undefined`.
	 * Only the last change in the tick will be registered.
	 *
	 * @param value
	 * @param oldValue
	 * @param i
	 */
	@watch({
		path: 'i',
		wrapper: (o, fn) => () => fn('boom!')
	})

	onIChangeWithWrapper(value: unknown, oldValue: unknown, i?: WatchHandlerParams): void {
		(<any[]>this.tmp.changes).push([value, oldValue, i?.path]);
	}

	/**
	 * This method will be called every time the `i` or the `j` fields change.
	 * All changes during the tick will be registered.
	 */
	@watch([{path: 'i', flush: 'sync', immediate: true}, {path: 'j', flush: 'sync', immediate: true}])
	@hook(['created', 'mounted'])

	onImmediate(): void {
		if (this.tmp.immediateChanges == null) {
			this.tmp.immediateChanges = [];
		}

		(<any[]>this.tmp.immediateChanges).push([this.hook, this.i, this.j]);
	}
}
