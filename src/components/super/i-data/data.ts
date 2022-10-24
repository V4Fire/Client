/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { component, field, watch } from 'components/super/i-block/i-block';

import iDataCommon from 'components/super/i-data/common';

export const
	$$ = symbolGenerator();

@component({functional: null})
export default abstract class iDataData extends iDataCommon {
	/**
	 * Type: raw provider data
	 */
	readonly DB!: object;

	/**
	 * Initial component data.
	 * When a component takes data from own data provider it stores the value within this property.
	 */
	get db(): CanUndef<this['DB']> {
		return this.field.get('dbStore');
	}

	/**
	 * Sets new component data
	 *
	 * @emits `dbCanChange(value: CanUndef<this['DB']>)`
	 * @emits `dbChange(value: CanUndef<this['DB']>)`
	 */
	set db(value: CanUndef<this['DB']>) {
		this.emit('dbCanChange', value);

		if (value === this.db) {
			return;
		}

		const
			{async: $a} = this;

		$a.terminateWorker({
			label: $$.db
		});

		this.field.set('dbStore', value);

		if (this.initRemoteData() !== undefined) {
			this.watch('dbStore', this.initRemoteData.bind(this), {
				deep: true,
				label: $$.db
			});
		}

		this.emit('dbChange', value);
	}

	/**
	 * Component data store
	 * @see [[iData.db]]
	 */
	@field()
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Converts raw provider data to the component `db` format and returns it
	 * @param data
	 */
	protected convertDataToDB<O>(data: unknown): O;
	protected convertDataToDB(data: unknown): this['DB'];
	protected convertDataToDB<O>(data: unknown): O | this['DB'] {
		let
			val = data;

		if (this.dbConverter != null) {
			const
				converters = Array.concat([], this.dbConverter);

			if (converters.length > 0) {
				val = Object.isArray(val) || Object.isDictionary(val) ? val.valueOf() : val;

				converters.forEach((converter) => {
					val = converter.call(this, val, this);
				});
			}
		}

		const
			{db, checkDBEquality} = this;

		const canKeepOldData = Object.isFunction(checkDBEquality) ?
			Object.isTruly(checkDBEquality.call(this, val, db)) :
			checkDBEquality && Object.fastCompare(val, db);

		if (canKeepOldData) {
			return <O | this['DB']>db;
		}

		return <O | this['DB']>val;
	}

	/**
	 * Converts data from `db` to the component field format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O = unknown>(data: unknown): O | this['DB'] {
		let
			val = data;

		if (this.componentConverter) {
			const
				converters = Array.concat([], this.componentConverter);

			if (converters.length > 0) {
				val = Object.isArray(val) || Object.isDictionary(val) ? val.valueOf() : val;

				converters.forEach((converter) => {
					val = converter.call(this, val, this);
				});
			}
		}

		return <O | this['DB']>val;
	}

	/**
	 * Initializes component data from the data provider.
	 * This method is used to map `db` to component properties.
	 * If the method is used, it must return some value that not equals to undefined.
	 */
	@watch('componentConverter')
	protected initRemoteData(): CanUndef<unknown> {
		return undefined;
	}
}
