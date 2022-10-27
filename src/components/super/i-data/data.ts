/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { derive } from 'core/functools/trait';

import type Data from 'components/friends/data';
import iProvider, { DataProvider, DataProviderOptions } from 'components/traits/i-provider/i-provider';

import iBlock, {

	component,

	prop,
	field,
	system,
	watch,

	ModsDecl

} from 'components/super/i-block/i-block';

import type {

	RequestParams,
	RequestFilter,

	ComponentConverter,
	CheckDBEquality

} from 'components/super/i-data/interface';

export const
	$$ = symbolGenerator();

interface iDataData extends Trait<typeof iProvider> {}

@component({functional: null})
@derive(iProvider)
abstract class iDataData extends iBlock {
	/**
	 * Type: the raw provider data
	 */
	readonly DB!: object;

	/** @see [[iProvider.dataProvider]] */
	@prop({type: String, required: false})
	readonly dataProvider?: DataProvider;

	/** @see [[iProvider.dataProviderOptions]] */
	@prop({type: Object, required: false})
	readonly dataProviderOptions?: DataProviderOptions;

	/** @see [[iProvider.request]] */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Remote data converter(s).
	 * This function (or a list of functions) transforms the original provider data before storing it to `db`.
	 */
	@prop({type: [Function, Array], required: false})
	readonly dbConverter?: CanArray<ComponentConverter>;

	/**
	 * Converter(s) from the raw `db` to the component fields
	 */
	@prop({type: [Function, Array], required: false})
	readonly componentConverter?: CanArray<ComponentConverter>;

	/**
	 * A function to filter all "default" requests: all requests that were created implicitly, as the initial
	 * request of a component, or requests that are initiated by changing parameters from `request` and `requestParams`.
	 * If the filter returns negative value, the tied request will be aborted. You can also set this parameter to true,
	 * and it will only pass requests with a payload.
	 */
	@prop({type: [Boolean, Function], required: false})
	readonly defaultRequestFilter?: RequestFilter;

	/** @see [[iProvider.suspendRequests]] */
	@prop(Boolean)
	readonly suspendRequestsProp: boolean = false;

	/** @see [[iData.suspendRequests]] */
	@system((o) => o.sync.link())
	suspendRequests?: boolean | Function;

	/**
	 * If true, then the component can reload data within the offline mode
	 */
	@prop(Boolean)
	readonly offlineReload: boolean = false;

	/**
	 * If true, then all new provider data will be compared with the old data before storing it to `db`.
	 * Also, the parameter can be passed as a function that returns true if the data is equal.
	 */
	@prop({type: [Boolean, Function]})
	readonly checkDBEquality: CheckDBEquality = true;

	/** @see [[iProvider.requestParams]] */
	@system({merge: true})
	readonly requestParams: RequestParams = {get: {}};

	/** @see [[iProvider.data]] */
	@system()
	data?: Data;

	/**
	 * The raw component data from the data provider
	 */
	get db(): CanUndef<this['DB']> {
		return this.field.get('dbStore');
	}

	/**
	 * Sets new component data from the data provider
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

	static override readonly mods: ModsDecl = {
		...iProvider.mods
	};

	/**
	 * Component data store
	 * @see [[iData.db]]
	 */
	@field()
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Converts the raw provider data to the component `db` format and returns it
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
	 * Converts the data from `db` to the component field format and returns it
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
	 * Initializes the component data from the data provider.
	 * This method is used to map `db` to bean properties.
	 * If the method is used, it must return some value other than undefined.
	 */
	@watch('componentConverter')
	protected initRemoteData(): CanUndef<unknown> {
		return undefined;
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iProvider.initModEvents(this);
	}
}

export default iDataData;
