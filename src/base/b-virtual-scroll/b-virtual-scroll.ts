/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if demo
import 'models/demo/pagination';
//#endif

import symbolGenerator from 'core/symbol';

import iItems from 'traits/i-items/i-items';

import iData, {

	component,
	prop,
	field,
	system,
	wait,
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
	RequestQueryFn,
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
	@prop({type: Number, watch: 'syncPropsWatcher', validator: Number.isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of elements till the page bottom that should initialize a new render iteration
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly renderGap: number = 10;

	/**
	 * Number of elements per one render chunk
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly chunkSize: number = 10;

	/**
	 * Number of tombstones to render
	 */
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
	@prop({type: Function, default: (v) => v.itemsTillBottom <= 10 && !v.isLastEmpty})
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
	 * @emits localEvent:localState.loading()
	 * @emits localEvent:localState.ready()
	 * @emits localEvent:localState.error()
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
				...this.requestQuery?.(getRequestParams())?.get,
				...(<Dictionary<Dictionary>>this.request)?.get
			}
		};
	}

	/** @override */
	protected set requestParams(value: RequestParams) {
		return;
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
	};

	/** @override */
	initLoad(data?: unknown, params: InitLoadOptions = {}): CanPromise<void> {
		if (!this.lfc.isBeforeCreate()) {
			this.reInit().catch(stderr);
		}

		return super.initLoad(data, params);
	}

	/**
	 * Reloads the last request (if there is no `db` or `options` the method calls reload)
	 */
	reloadLast(): void {
		if (!this.db || !this.options.length) {
			this.reload().catch(stderr);

		} else {
			this.chunkRequest.reloadLast();
		}
	}

	/**
	 * Re-initializes component
	 */
	async reInit(): Promise<void> {
		this.componentRender.reInit();
		this.chunkRequest.reset();
		this.chunkRender.reInit();
	}

	/** @override  */
	protected initRemoteData(): void {
		if (!this.db) {
			return;
		}

		this.localState = 'init';

		const
			val = this.convertDBToComponent<RemoteData>(this.db);

		if (this.field.get('data.length', val)) {
			const
				params = getRequestParams(undefined, undefined, {lastLoadedData: val.data});

			this.chunkRequest.shouldStopRequest(params);
			this.options = val.data;
			this.total = Object.isNumber(val.total) ? val.total : undefined;

		} else {
			const
				params = getRequestParams(undefined, undefined, {isLastEmpty: true});

			this.chunkRequest.shouldStopRequest(params);
			this.options = [];
		}

		this.chunkRequest.init().catch(stderr);
	}

	/** @see [[iItems.getItemKey]] */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Synchronization for the component props
	 */
	@wait('ready', {defer: true, label: $$.syncPropsWatcher})
	protected async syncPropsWatcher(): Promise<void> {
		return this.reInit();
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
