/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, watch } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

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
	 * Synchronization for the db field
	 *
	 * @param [value]
	 * @emits change(db: T)
	 */
	@watch('db')
	protected syncDBWatcher(value: T): void {
		if (this.field && this.$parent) {
			this.$parent.setField(this.field, value);
		}

		this.emit('change', value);
	}
}
