/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-remote-provider/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, RequestError, RetryRequestFn } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

const
	$$ = symbolGenerator();

@component()
export default class bRemoteProvider extends iData {
	override readonly remoteProvider: boolean = true;

	override readonly reloadOnActivation: boolean = true;

	/**
	 * A path to the field of the parent component where you want to store the loaded data
	 */
	@prop({type: String, required: false})
	readonly fieldProp?: string;

	/**
	 * A list of the component child nodes
	 */
	get content(): CanPromise<Element[]> {
		return this.waitComponentStatus('loading', () => Array.from(this.$el!.children));
	}

	override set db(value: CanUndef<this['DB']>) {
		super['dbSetter'](value);
		this.syncDBWatcher(value);
	}

	/**
	 * @emits `error(err:Error |` [[RequestError]]`, retry:` [[RetryRequestFn]]`)`
	 */
	protected override onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		const
			a = this.$attrs;

		if (a.onError == null && a.onOnError == null) {
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
	 * @emits `addData(data: unknown)`
	 */
	protected override onAddData(data: unknown): void {
		const
			a = this.$attrs;

		if (a.onAddData == null && a.onOnAddData == null) {
			return super.onAddData(data);
		}

		this.emit('addData', data);
	}

	/**
	 * @emits `updateData(data: unknown)`
	 */
	protected override onUpdateData(data: unknown): void {
		const
			a = this.$attrs;

		if (a.onUpdateData == null && a.onOnUpdateData == null) {
			return super.onUpdateData(data);
		}

		this.emit('updateData', data);
	}

	/**
	 * @emits `deleteData(data: unknown)`
	 */
	protected override onDeleteData(data: unknown): void {
		const
			a = this.$attrs;

		if (a.onDeleteData == null && a.onOnDeleteData == null) {
			return super.onDeleteData(data);
		}

		this.emit('deleteData', data);
	}
}
