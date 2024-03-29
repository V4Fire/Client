/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-virtual-scroll/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/pagination';
//#endif

import symbolGenerator from 'core/symbol';
import { deprecate } from 'core/functools';

import iItems, { IterationKey } from 'traits/i-items/i-items';

import iData, {

	component,
	computed,
	prop,
	system,
	field,
	watch,
	wait,
	hook,
	p,

	RequestParams,
	RequestError,

	InitLoadOptions,
	RetryRequestFn,
	CheckDBEquality,

	UnsafeGetter

} from 'super/i-data/i-data';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';
import ChunkRequest, { $$ as $$ChunkRequest } from 'base/b-virtual-scroll/modules/chunk-request';

import { getRequestParams, isAsyncReplaceError } from 'base/b-virtual-scroll/modules/helpers';

import type {

	GetData,
	RemoteData,

	RequestFn,
	RequestQueryFn,

	LocalState,
	LoadStrategy,

	DataState,
	MergeDataStateParams,

	UnsafeBVirtualScroll

} from 'base/b-virtual-scroll/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-virtual-scroll/modules/helpers';
export * from 'base/b-virtual-scroll/interface';

export { RequestFn, RemoteData, RequestQueryFn, GetData };

export const
	$$ = symbolGenerator();

@component()
export default class bVirtualScroll extends iData implements iItems {
	/** @see [[iItems.Item]] */
	readonly Item!: object;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	override readonly DB!: RemoteData;

	override readonly checkDBEquality: CheckDBEquality = false;

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly optionsProp?: this['Items'] = [];

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	options!: this['Items'];

	/** @see [[LoadStrategy]] */
	@prop({type: String, watch: 'syncPropsWatcher'})
	readonly loadStrategy: LoadStrategy = 'scroll';

	/**
	 * @deprecated
	 * @see [[iItems.item]]
	 */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['item'];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/**
	 * @deprecated
	 * @see [[iItems.itemKey]]
	 */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['itemKey'];

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/**
	 * @deprecated
	 * @see [[iItems.itemProps]]
	 */
	@prop({type: Function})
	readonly optionProps!: iItems['itemProps'];

	/** @see [[iItems.itemProps]] */
	@prop({type: [Function, Object], default: () => ({})})
	readonly itemProps!: iItems['itemProps'];

	/**
	 * The maximum number of elements to cache
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, watch: 'syncPropsWatcher', validator: Number.isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of elements till the page bottom that should initialize a new render iteration
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNatural})
	readonly renderGap: number = 10;

	/**
	 * Number of elements per one render chunk
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNatural})
	readonly chunkSize: number = 10;

	/**
	 * Number of tombstones to render
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, required: false, validator: Number.isNatural})
	readonly tombstonesSize?: number;

	/**
	 * If true, then elements are dropped from a DOM tree after scrolling.
	 * This method is recommended to use if you need to display a huge number of elements and prevent an OOM error.
	 */
	@prop(Boolean)
	readonly clearNodes: boolean = false;

	/**
	 * If true, then created nodes are cached
	 */
	@prop({type: Boolean, watch: 'syncPropsWatcher'})
	readonly cacheNodes: boolean = true;

	/**
	 * Function that returns parameters to make a request
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQueryFn;

	@prop({type: [Object, Array], required: false})
	override readonly request?: RequestParams;

	/**
	 * Function to request a new data chunk to render
	 */
	@prop({type: Function, default: (ctx, query) => ctx.get(query), required: false})
	readonly getData!: GetData;

	/**
	 * When this function returns true the component will be able to request additional data
	 */
	@prop({type: Function, default: (v: DataState) => v.itemsTillBottom <= 10 && !v.isLastEmpty})
	readonly shouldMakeRequest!: RequestFn;

	/**
	 * When this function returns true the component will stop to request new data
	 */
	@prop({type: Function, default: (v) => v.isLastEmpty})
	readonly shouldStopRequest!: RequestFn;

	/** @see [[iItems.items]] */
	@computed({dependencies: ['itemsStore', 'options']})
	get items(): this['Items'] {
		const
			items = Object.size(this.options) > 0 ? this.options : this.itemsStore;

		if (Object.size(this.options) > 0) {
			deprecate({
				name: 'options',
				type: 'property',
				renamedTo: 'items'
			});
		}

		return items ?? [];
	}

	/** @see [[iItems.items]] */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	override get unsafe(): UnsafeGetter<UnsafeBVirtualScroll<this>> {
		return Object.cast(this);
	}

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	protected itemsStore!: iItems['items'];

	/**
	 * Total amount of items that can be loaded
	 */
	@system()
	protected total?: number;

	/**
	 * Local component state
	 */
	@p({cache: false})
	protected get localState(): LocalState {
		return this.localStateStore;
	}

	/**
	 * @param state
	 * @emits `localEmitter:localState.loading()`
	 * @emits `localEmitter:localState.ready()`
	 * @emits `localEmitter:localState.error()`
	 */
	protected set localState(state: LocalState) {
		this.localStateStore = state;
		this.localEmitter.emit(`localState.${state}`);
	}

	/**
	 * Local component state store
	 */
	@system()
	protected localStateStore: LocalState = 'init';

	// @ts-ignore (getter instead readonly)
	protected override get requestParams(): RequestParams {
		return {
			get: {
				...this.requestQuery?.(this.getDataStateSnapshot())?.get,
				...Object.isDictionary(this.request?.get) ? this.request?.get : undefined
			}
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected override set requestParams(value: RequestParams) {
		// Loopback
	}

	/**
	 * API for scroll rendering
	 */
	@system<bVirtualScroll>((o) => new ChunkRender(o))
	protected chunkRender!: ChunkRender;

	/**
	 * API for scroll data requests
	 */
	@system<bVirtualScroll>((o) => new ChunkRequest(o))
	protected chunkRequest!: ChunkRequest;

	/**
	 * API for dynamic component rendering
	 */
	@system<bVirtualScroll>((o) => new ComponentRender(o))
	protected componentRender!: ComponentRender;

	protected override $refs!: {
		container: HTMLElement;
		loader?: HTMLElement;
		tombstones?: HTMLElement;
		empty?: HTMLElement;
		retry?: HTMLElement;
		done?: HTMLElement;
		renderNext?: HTMLElement;
	};

	/** @emits `chunkLoading(page: number)` */
	override initLoad(data?: unknown, opts?: InitLoadOptions): CanPromise<void> {
		this.async.clearAll({label: $$ChunkRequest.waitForInitCalls});

		if (!this.lfc.isBeforeCreate()) {
			this.reInit();
		}

		if (this.isActivated) {
			this.emit('chunkLoading', 0);
		}

		return super.initLoad(data, opts);
	}

	/**
	 * Re-initializes the component
	 */
	reInit(): void {
		this.componentRender.reInit();
		this.chunkRequest.reset();
		this.chunkRender.reInit();
	}

	/**
	 * Reloads the last request (if there is no `db` or `options` the method calls reload)
	 */
	reloadLast(): void {
		if (!this.db || this.chunkRequest.data.length === 0) {
			this.reload().catch(stderr);

		} else {
			this.chunkRequest.reloadLast();
		}
	}

	/**
	 * Tries to render the next data chunk.
	 * The method emits a new request for data if necessary.
	 */
	renderNext(): void {
		const
			{localState, chunkRequest, dataProvider, options} = this;

		if (localState !== 'ready' || dataProvider == null && options.length === 0) {
			return;
		}

		chunkRequest.try().catch(stderr);
	}

	/**
	 * Returns an object with the current data state of the component
	 *
	 * @typeparam ITEM - data item to render
	 * @typeparam RAW - raw provider data
	 */
	getCurrentDataState<
		ITEM extends object = object,
		RAW extends object = object
	>(): DataState<ITEM, RAW> {
		let overrideParams: MergeDataStateParams = {};

		if (this.componentStatus !== 'ready' || !Object.isTruly(this.dataProvider)) {
			overrideParams = {
				currentPage: 0,
				...overrideParams
			};
		}

		return this.getDataStateSnapshot(overrideParams, this.chunkRequest, this.chunkRender);
	}

	/**
	 * Returns additional props to pass to an item component
	 *
	 * @param el
	 * @param i
	 */
	getItemAttrs(el: this['Item'], i: number): CanUndef<Dictionary> {
		const
			{itemProps, optionProps} = this;

		let
			props = itemProps;

		if (optionProps != null) {
			deprecate({
				name: 'optionProps',
				type: 'property',
				renamedTo: 'itemProps'
			});

			props = optionProps;
		}

		return Object.isFunction(props) ?
			props(el, i, {
				key: this.getItemKey(el, i),
				ctx: this
			}) :
			props;
	}

	/**
	 * Returns a component name to render an item
	 *
	 * @param el
	 * @param i
	 */
	getItemComponentName(el: this['Item'], i: number): string {
		const
			{item, option} = this;

		if (option != null) {
			deprecate({
				name: 'option',
				type: 'property',
				renamedTo: 'item'
			});

			return Object.isFunction(option) ? option(el, i) : option;
		}

		return Object.isFunction(item) ? item(el, i) : <string>item;
	}

	/** @see [[iItems.getItemKey]] */
	getItemKey(el: this['Item'], i: number): CanUndef<IterationKey> {
		if (this.optionKey != null) {
			deprecate({
				name: 'optionKey',
				type: 'property',
				renamedTo: 'itemKey'
			});

			return Object.isFunction(this.optionKey) ? this.optionKey(el, i) : this.optionKey;
		}

		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Takes a snapshot of the current data state and returns it
	 *
	 * @param [overrideParams]
	 * @param [chunkRequest]
	 * @param [chunkRender]
	 *
	 * @typeparam ITEM - data item to render
	 * @typeparam RAW - raw provider data
	 */
	protected getDataStateSnapshot<
		ITEM extends object = object,
		RAW extends unknown = unknown
	>(
		overrideParams?: MergeDataStateParams,
		chunkRequest?: ChunkRequest,
		chunkRender?: ChunkRender
	): DataState<ITEM, RAW> {
		return getRequestParams(chunkRequest, chunkRender, overrideParams);
	}

	/** @emits `chunkLoaded(lastLoadedChunk:` [[LastLoadedChunk]]`)` */
	protected override initRemoteData(): void {
		if (!this.db) {
			return;
		}

		this.localState = 'init';

		const
			{data, total} = this.db;

		if (data && data.length > 0) {
			const lastLoadedChunk = {
				normalized: data,
				raw: this.chunkRequest.lastLoadedChunk.raw
			};

			const params = this.getDataStateSnapshot({
				data,
				total,
				lastLoadedData: data,
				lastLoadedChunk
			});

			this.chunkRequest.lastLoadedChunk = lastLoadedChunk;
			this.chunkRequest.shouldStopRequest(params);
			this.chunkRequest.data = data;
			this.total = total;

		} else {
			this.chunkRequest.isLastEmpty = true;

			const
				params = this.getDataStateSnapshot({isLastEmpty: true});

			this.chunkRequest.shouldStopRequest(params);
		}

		this.emit('chunkLoaded', this.chunkRequest.lastLoadedChunk);
		this.chunkRequest.init().catch(stderr);
	}

	protected override convertDataToDB<O>(data: object): O | this['DB'] {
		this.chunkRequest.lastLoadedChunk.raw = data;
		return super.convertDataToDB(data);
	}

	/**
	 * Initializes rendering on the items passed to the component
	 */
	@hook('mounted')
	@watch(['options', 'itemsStore'])
	@wait('ready', {defer: true, label: $$.initOptions})
	protected initItems(): CanPromise<void> {
		if (this.dataProvider !== undefined) {
			return;
		}

		if (this.localState === 'ready') {
			this.reInit();
		}

		this.chunkRequest.lastLoadedChunk.normalized = Object.isArray(this.options) ? [...this.options] : [];
		this.chunkRequest.init().catch(stderr);
	}

	/**
	 * Synchronization of the component props
	 */
	@wait('ready', {defer: true, label: $$.syncPropsWatcher})
	protected syncPropsWatcher(): CanPromise<void> {
		return this.reInit();
	}

	protected override syncDataProviderWatcher(initLoad?: boolean): void {
		const
			provider = this.dataProvider;

		if (provider === undefined) {
			this.reInit();

		} else {
			super.syncDataProviderWatcher(initLoad);
		}
	}

	protected override onRequestError(err: Error | RequestError<unknown>, retry: RetryRequestFn): void {
		super.onRequestError(err, retry);

		if (isAsyncReplaceError(err)) {
			return;
		}

		this.localState = 'error';
	}
}
