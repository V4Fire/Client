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

import iItems from 'traits/i-items/i-items';

import iData, {

	component,
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
import ChunkRequest from 'base/b-virtual-scroll/modules/chunk-request';

import { getRequestParams, isAsyncReplaceError } from 'base/b-virtual-scroll/modules/helpers';

import {

	GetData,
	RequestFn,
	RemoteData,
	LocalState,
	LoadStrategy,
	RequestQueryFn,
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
	/** @override */
	readonly DB!: RemoteData;

	/** @override */
	readonly checkDBEquality: CheckDBEquality = false;

	/** @see [[iItems.itemsProp]] */
	@prop(Array)
	readonly optionsProp?: iItems['optionsProp'] = [];

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	options!: unknown[];

	/** @see [[LoadStrategy]] */
	@prop({type: String, watch: 'syncPropsWatcher'})
	readonly loadStrategy: LoadStrategy = 'scroll';

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['option'];

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['optionKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, default: () => ({})})
	readonly optionProps!: iItems['optionProps'];

	/**
	 * Maximum number of elements to cache
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
	 * If true, then elements are dropped from a DOM tree after scrolling:
	 * this method is recommended to use if you need to display a huge number of elements and prevent an OOM error
	 */
	@prop(Boolean)
	readonly clearNodes: boolean = false;

	/**
	 * If true, then created nodes will be cached
	 */
	@prop({type: Boolean, watch: 'syncPropsWatcher'})
	readonly cacheNodes: boolean = true;

	/**
	 * If true, then additional data chunk will be requested automatically on user scroll
	 */
	@prop({type: Boolean})
	readonly requestOnScroll: boolean = true;

	/**
	 * Function that returns request parameters
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQueryFn;

	/** @override */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Requests a new data chunk to render
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
	 * @emits localEmitter:localState.loading()
	 * @emits localEmitter:localState.ready()
	 * @emits localEmitter:localState.error()
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

	/** @override */
	get unsafe(): UnsafeGetter<UnsafeBVirtualScroll<this>> {
		return <any>this;
	}

	/** @override */
	protected get requestParams(): RequestParams {
		return {
			get: {
				...this.requestQuery?.(this.getDataStateSnapshot())?.get,
				...Object.isDictionary(this.request?.get) ? this.request?.get : undefined
			}
		};
	}

	/** @override */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected set requestParams(value: RequestParams) {
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

	/** @override */
	protected $refs!: {
		container: HTMLElement;
		loader?: HTMLElement;
		tombstones?: HTMLElement;
		empty?: HTMLElement;
		retry?: HTMLElement;
		done?: HTMLElement;
		renderNext?: HTMLElement;
	};

	/**
	 * @override
	 * @emits chunkLoading(page: number)
	 */
	initLoad(data?: unknown, opts?: InitLoadOptions): CanPromise<void> {
		if (!this.lfc.isBeforeCreate()) {
			this.reInit();
		}

		if (this.isActivated) {
			this.emit('chunkLoading', 0);
		}

		return super.initLoad(data, opts);
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
	 * Re-initializes component
	 */
	reInit(): void {
		this.componentRender.reInit();
		this.chunkRequest.reset();
		this.chunkRender.reInit();
	}

	/**
	 * Returns an object with the current data state of the component
	 *
	 * @typeParam ITEM - data item to render
	 * @typeParam RAW - raw provider data
	 */
	getCurrentDataState<
		ITEM extends unknown = unknown,
		RAW extends unknown = unknown
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
	 * Takes a snapshot of the current data state and returns it
	 *
	 * @param [overrideParams]
	 * @param [chunkRequest]
	 * @param [chunkRender]
	 *
	 * @typeParam ITEM - data item to render
	 * @typeParam RAW - raw provider data
	 */
	protected getDataStateSnapshot<
		ITEM extends unknown = unknown,
		RAW extends unknown = unknown
	>(
		overrideParams?: MergeDataStateParams,
		chunkRequest?: ChunkRequest,
		chunkRender?: ChunkRender
	): DataState<ITEM, RAW> {
		return getRequestParams(chunkRequest, chunkRender, overrideParams);
	}

	/**
	 * @override
	 * @emits chunkLoaded(lastLoadedChunk: LastLoadedChunk)
	 */
	protected initRemoteData(): void {
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

	/** @override */
	protected convertDataToDB<O>(data: unknown): O | this['DB'] {
		this.chunkRequest.lastLoadedChunk.raw = data;
		return super.convertDataToDB(data);
	}

	/**
	 * Initializes rendering on the items passed to the component
	 */
	@hook('mounted')
	@watch('options')
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

	/** @see [[iItems.getItemKey]] */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Synchronization of the component props
	 */
	@wait('ready', {defer: true, label: $$.syncPropsWatcher})
	protected syncPropsWatcher(): CanPromise<void> {
		return this.reInit();
	}

	/** @override */
	protected syncDataProviderWatcher(initLoad?: boolean): void {
		const
			provider = this.dataProvider;

		if (provider === undefined) {
			this.reInit();

		} else {
			super.syncDataProviderWatcher(initLoad);
		}
	}

	/** @override */
	protected onRequestError(err: Error | RequestError<unknown>, retry: RetryRequestFn): void {
		super.onRequestError(err, retry);

		if (isAsyncReplaceError(err)) {
			return;
		}

		this.localState = 'error';
	}
}
