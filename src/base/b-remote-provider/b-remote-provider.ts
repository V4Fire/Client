/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, p, RequestError, RetryRequestFn } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

@component()
export default class bRemoteProvider<T extends object = Dictionary> extends iData<T> {
	/** @override */
	readonly remoteProvider: boolean = true;

	/** @override */
	readonly reloadOnActivation: boolean = true;

	/**
	 * Field for setting to a component parent
	 */
	@prop({type: String, required: false})
	readonly fieldProp?: string;

	/**
	 * Link to component content nodes
	 */
	@p({cache: false})
	get content(): CanPromise<HTMLCollection> {
		return this.waitStatus('loading', () => this.$el.children);
	}

	/** @override */
	set db(value: CanUndef<T>) {
		// tslint:disable-next-line:no-string-literal
		super['dbSetter'](value);
		this.syncDBWatcher(value);
	}

	/**
	 * @override
	 * @emits error(err:Error | RequestError, retry: RetryRequestFn)
	 */
	protected onRequestError<T = unknown>(err: Error | RequestError, retry: RetryRequestFn): void {
		const
			l = this.$listeners;

		if (!l.error && !l['on-error']) {
			super.onRequestError(err, retry);
		}

		this.emitError('error', err, retry);
	}

	/**
	 * Synchronization for the db field
	 *
	 * @param [value]
	 * @emits change(db: CanUndef<T>)
	 */
	protected syncDBWatcher(value: CanUndef<T>): void {
		const
			p = this.$parent;

		if (!p) {
			return;
		}

		const
			f = this.fieldProp;

		let
			needUpdate = !f,
			action;

		if (f) {
			const
				field = p.field.get(f);

			if (Object.isFunction(field)) {
				action = () => field.call(p, value);
				needUpdate = true;

			} else if (!Object.fastCompare(value, field)) {
				action = () => p.field.set(f, value);
				needUpdate = true;
			}
		}

		if (needUpdate) {
			p.lfc.execCbAtTheRightTime(this.async.proxy(() => {
				action && action();
				this.emit('change', value);

			}, {
				label: $$.syncDBWatcher
			}));
		}
	}

	/**
	 * @override
	 * @emits addData(data: unknown)
	 */
	protected onAddData(data: unknown): void {
		const
			l = this.$listeners;

		if (!l['add-data'] && !l['on-add-data']) {
			return super.onAddData(data);
		}

		this.emit('addData', data);
	}

	/**
	 * @override
	 * @emits updData(data: unknown)
	 */
	protected onUpdData(data: unknown): void {
		const
			l = this.$listeners;

		if (!l['upd-data'] && !l['on-upd-data']) {
			return super.onUpdData(data);
		}

		this.emit('updData', data);
	}

	/**
	 * @override
	 * @emits delData(data: unknown)
	 */
	protected onDelData(data: unknown): void {
		const
			l = this.$listeners;

		if (!l['del-data'] && !l['on-del-data']) {
			return super.onDelData(data);
		}

		this.emit('delData', data);
	}
}
