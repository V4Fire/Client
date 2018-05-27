/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Then from 'core/then';
import symbolGenerator from 'core/symbol';
import iData, { component, prop, system, watch } from 'super/i-data/i-data';
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
		this.dbStore = value;
		this.initRemoteData();
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
	@watch('db')
	protected syncDBWatcher(value: T | undefined): void {
		const
			p = this.$parent;

		if (!p) {
			return;
		}

		const handler = () => {
			const
				f = this.field;

			if (f) {
				const
					c = p.getField(f);

				if (Object.isFunction(c)) {
					c.call(p, value);

				} else {
					p.setField(f, value);
				}
			}

			this.emit('change', value);
		};

		const res = p.waitStatus('beforeReady', handler, {
			label: $$.syncDBWatcher
		});

		if (Then.isThenable(res)) {
			res.catch(stderr);
		}
	}
}
