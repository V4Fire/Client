/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, system, RequestError } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

@component()
export default class bRemoteProvider<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly remoteProvider: boolean = true;

	/** @override */
	readonly needReInit: boolean = true;

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

	/** @override */
	protected onRequestError<T>(err: Error | RequestError, retry: () => Promise<T | undefined>): void {
		const
			l = this.$listeners;

		if (!l.error && !l['on-error']) {
			return super.onRequestError(err, retry);
		}

		this.emit('error', err, retry);
	}

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
			f = this.field;

		let
			needUpdate = !f,
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

		if (needUpdate) {
			p.execCbAtTheRightTime(() => {
				action && action();
				this.emit('change', value);

			}, {
				label: $$.syncDBWatcher
			});
		}
	}

	/**
	 * @override
	 * @emits addData(data: any)
	 */
	protected onAddData(data: any): void {
		const
			l = this.$listeners;

		if (!l['add-data'] && !l['on-add-data']) {
			return super.onAddData(data);
		}

		this.emit('addData', data);
	}

	/**
	 * @override
	 * @emits updData(data: any)
	 */
	protected onUpdData(data: any): void {
		const
			l = this.$listeners;

		if (!l['upd-data'] && !l['on-upd-data']) {
			return super.onUpdData(data);
		}

		this.emit('updData', data);
	}

	/**
	 * @override
	 * @emits delData(data: any)
	 */
	protected onDelData(data: any): void {
		const
			l = this.$listeners;

		if (!l['del-data'] && !l['on-del-data']) {
			return super.onDelData(data);
		}

		this.emit('delData', data);
	}
}
