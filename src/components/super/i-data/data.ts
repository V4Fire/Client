/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { derive } from 'core/functools/trait';

import type DataProvider from 'components/friends/data-provider';
import type { DataProviderProp, DataProviderOptions } from 'components/friends/data-provider';

import iDataProvider from 'components/traits/i-data-provider/i-data-provider';

import iBlock, {

	component,

	prop,
	field,
	system,
	watch,

	hydrationStore,
	ModsDecl

} from 'components/super/i-block/i-block';

import type {

	RequestParams,
	RequestFilter,

	ComponentConverter,
	CheckDBEquality

} from 'components/super/i-data/interface';

const
	$$ = symbolGenerator();

interface iDataData extends Trait<typeof iDataProvider> {}

@component({functional: null})
@derive(iDataProvider)
abstract class iDataData extends iBlock implements iDataProvider {
	/**
	 * Type: the raw provider data
	 */
	readonly DB!: object;

	/** {@link iDataProvider.dataProviderProp} */
	@prop({type: [String, Object, Function], required: false})
	readonly dataProviderProp?: DataProviderProp;

	/** {@link iDataProvider.dataProvider} */
	@system()
	dataProvider?: DataProvider;

	/** {@link iDataProvider.dataProviderOptions} */
	@prop({type: Object, required: false})
	readonly dataProviderOptions?: DataProviderOptions;

	/** {@link iDataProvider.request} */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Remote data converter(s).
	 * This function transforms the original provider data before storing it to `db`.
	 * To provide more than one function, pass an iterable of functions.
	 * Functions from the iterable are called from left to right.
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly dbConverter?: CanIter<ComponentConverter>;

	/**
	 * A list of remote data converters.
	 * These functions step by step transform the original provider data before storing it in `db`.
	 * {@link iDataProvider.dbConverter}
	 */
	@system((o) => o.sync.link('dbConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	dbConverters!: ComponentConverter[];

	/**
	 * Converter(s) from the raw `db` to the component field.
	 * To provide more than one function, pass an iterable of functions.
	 * Functions from the iterable are called from left to right.
	 */
	@prop({
		validator: (v) => v == null || Object.isFunction(v) || Object.isIterable(v),
		required: false
	})

	readonly componentConverter?: CanIter<ComponentConverter>;

	/**
	 * A list of converters from the raw `db` to the component field
	 * {@link iDataProvider.componentConverterProp}
	 */
	@system((o) => o.sync.link('componentConverter', (val) => Array.concat([], Object.isIterable(val) ? [...val] : val)))
	componentConverters!: ComponentConverter[];

	/**
	 * A function to filter all "default" requests: all requests that were created implicitly, as the initial
	 * request of a component, or requests that are initiated by changing parameters from `request` and `requestParams`.
	 * If the filter returns negative value, the tied request will be aborted. You can also set this parameter to true,
	 * and it will only pass requests with a payload.
	 */
	@prop({type: [Boolean, Function], required: false})
	readonly defaultRequestFilter?: RequestFilter;

	/** {@link iDataProvider.suspendedRequestsProp} */
	@prop(Boolean)
	readonly suspendedRequestsProp: boolean = false;

	/** {@link iDataProvider.suspendRequests} */
	@system((o) => o.sync.link())
	suspendedRequests!: boolean;

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

	/** {@link iDataProvider.requestParams} */
	@system({merge: true})
	readonly requestParams: RequestParams = {get: {}};

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

		if (SSR) {
			hydrationStore.set(this.componentId, 'dbStore', Object.cast(value));
			hydrationStore.set(this.componentId, 'initRemoteData', null);
		}

		if (this.initRemoteData() !== undefined) {
			this.watch('dbStore', this.initRemoteData.bind(this), {
				deep: true,
				label: $$.db
			});
		}

		this.emit('dbChange', value);
	}

	static override readonly mods: ModsDecl = {
		...iDataProvider.mods
	};

	/**
	 * Component data store
	 * {@link iData.db}
	 */
	@field()
	// @ts-ignore (recursive type)
	protected dbStore?: CanUndef<this['DB']>;

	/**
	 * Converts the raw provider data to the component `db` format and returns it
	 * @param data
	 */
	protected convertDataToDB<O>(data: unknown): O;
	protected convertDataToDB(data: unknown): this['DB'];
	protected convertDataToDB<O>(data: unknown): O | this['DB'] {
		const
			{dbConverters} = this;

		let
			convertedData = data;

		if (dbConverters.length > 0) {
			const rawData = Object.isArray(convertedData) || Object.isDictionary(convertedData) ?
				convertedData.valueOf() :
				convertedData;

			convertedData = dbConverters.reduce((val, converter) => converter(val, Object.cast(this)), rawData);
		}

		const
			{db, checkDBEquality} = this;

		const canKeepOldData = Object.isFunction(checkDBEquality) ?
			Object.isTruly(checkDBEquality.call(this, convertedData, db)) :
			checkDBEquality && Object.fastCompare(convertedData, db);

		if (canKeepOldData) {
			return <O | this['DB']>db;
		}

		return <O | this['DB']>convertedData;
	}

	/**
	 * Converts the data from `db` to the component field format and returns it
	 * @param data
	 */
	protected convertDBToComponent<O = unknown>(data: unknown): O | this['DB'] {
		const
			{componentConverters} = this;

		let
			convertedData = data;

		if (componentConverters.length > 0) {
			const rawData = Object.isArray(convertedData) || Object.isDictionary(convertedData) ?
				convertedData.valueOf() :
				convertedData;

			convertedData = componentConverters.reduce((val, converter) => converter(val, Object.cast(this)), rawData);
		}

		return <O | this['DB']>convertedData;
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
		iDataProvider.initModEvents(this);
	}
}

export default iDataData;
