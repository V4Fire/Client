/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, system } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

@component()
export default class bRemoteProvider<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly remoteProvider: boolean = true;

	/**
	 * Field for setting to a component parent
	 */
	@prop({type: String, required: false})
	readonly field?: string;

	/** @override */
	set db(value: T | undefined) {
		// tslint:disable-next-line:no-string-literal
		super['dbSetter'](value);
		this.syncDBWatcher(value);
	}

	/** @override */
	@system()
	protected dbStore?: T | undefined;

	/**
	 * Synchronization for the db field
	 *
	 * @param [value]
	 * @emits change(db: T | undefined)
	 */
	protected syncDBWatcher(value: T | undefined): void {
		const
			p = this.$parent;

		if (!p) {
			return;
		}

		const
			e = this.$listeners,
			f = this.field;

		let
			needUpdate = false,
			action;

		if (f) {
			const
				field = p.getField(f);

			if (Object.isFunction(field)) {
				action = () => field.call(p, value);
				needUpdate = true;

			} else if (!Object.fastCompare(value, field)) {
				action = () => p.setField(f, value);
				needUpdate = true;
			}
		}

		if (needUpdate || e.change || e['on-change']) {
			p.execCbAtTheRightTime(() => {
				action && action();
				this.emit('change', value);

			}, {
				label: $$.syncDBWatcher
			});
		}
	}
}
