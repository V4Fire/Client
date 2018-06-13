/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field, system, Request } from 'super/i-data/i-data';
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

	/**
	 * Request parameters
	 */
	@prop({type: [Object, Array], required: false})
	readonly request?: Request;

	/** @override */
	@field((o) => o.link('request', (val) => {
		if (!Object.fastCompare(this.requestParams, val)) {
			return val;
		}

		return this.requestParams;
	}))

	protected readonly requestParams!: Dictionary<Dictionary>;

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

		p.execCbAtTheRightTime(() => {
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
		}, {
			label: $$.syncDBWatcher
		});
	}
}
