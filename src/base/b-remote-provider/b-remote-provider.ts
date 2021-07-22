/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-remote-provider/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/list';
//#endif

import symbolGenerator from 'core/symbol';
import iData, { component, prop, RequestError, RetryRequestFn } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

@component()
export default class bRemoteProvider extends iData {
	/** @override */
	readonly remoteProvider: boolean = true;

	/** @override */
	readonly reloadOnActivation: boolean = true;

	/**
	 * Field to set to the component parent
	 */
	@prop({type: String, required: false})
	readonly fieldProp?: string;

	/**
	 * Link to component content nodes
	 */
	get content(): CanPromise<Element[]> {
		return this.waitStatus('loading', () => Array.from(this.$el!.children));
	}

	/** @override */
	set db(value: CanUndef<this['DB']>) {
		super['dbSetter'](value);
		this.syncDBWatcher(value);
	}

	/**
	 * @override
	 * @emits `error(err:Error |` [[RequestError]]`, retry:` [[RetryRequestFn]]`)`
	 */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		const
			l = this.$listeners;

		if (!l.error && !l['on-error']) {
			super.onRequestError(err, retry);
		}

		this.emitError('error', err, retry);
	}

	/**
	 * Synchronization for the `db` field
	 *
	 * @param [value]
	 * @emits `change(db: CanUndef<T>)`
	 */
	protected syncDBWatcher(value: CanUndef<this['DB']>): void {
		const
			parent = this.$parent;

		if (!parent) {
			return;
		}

		const
			fieldToUpdate = this.fieldProp;

		let
			needUpdate = fieldToUpdate == null,
			action;

		if (fieldToUpdate != null) {
			const
				field = parent.field.get(fieldToUpdate);

			if (Object.isFunction(field)) {
				action = () => field.call(parent, value);
				needUpdate = true;

			} else if (!Object.fastCompare(value, field)) {
				action = () => parent.field.set(fieldToUpdate, value);
				needUpdate = true;
			}
		}

		if (needUpdate) {
			void parent.lfc.execCbAtTheRightTime(this.async.proxy(() => {
				if (Object.isFunction(action)) {
					action();
				}

				this.emit('change', value);

			}, {
				label: $$.syncDBWatcher
			}));
		}
	}

	/**
	 * @override
	 * @emits `addData(data: unknown)`
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
	 * @emits `updData(data: unknown)`
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
	 * @emits `delData(data: unknown)`
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
