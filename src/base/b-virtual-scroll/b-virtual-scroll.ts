/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iItems from 'traits/i-items/i-items';

import iData, {

	component,
	prop,
	field,
	system,
	wait,
	p,

	CheckDBEquality,
	InitLoadParams,
	RequestParams,
	RequestError,
	RetryRequestFn

} from 'super/i-data/i-data';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';
import { RequestFn, RemoteData, RequestQueryFn, GetData, Unsafe } from 'base/b-virtual-scroll/modules/interface';

export { RequestFn, RemoteData, RequestQueryFn, GetData };
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

@component()
export default class bVirtualScroll extends iData implements iItems {
	/** @override */
	readonly DB!: RemoteData;

	/** @override */
	readonly checkDBEquality: CheckDBEquality = false;

	/** @see [[iItems.prototype.itemsProp]] */
	@prop(Array)
	readonly optionsProp?: iItems['optionsProp'] = [];

	/** @see [[iItems.prototype.items]] */
	@field((o) => o.sync.link())
	options!: unknown[];

	/** @see [[iItems.prototype.item]] */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['option'];

	/** @see [[iItems.prototype.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['optionKey'];

	/** @see [[iItems.prototype.itemProps]] */
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
	 * If true, then elements is dropped from a DOM tree after scrolling:
	 * this method is recommended to use if you need to display a huge number of elements and prevent an OOM error
	 */
	@prop(Boolean)
	readonly clearNodes: boolean = false;

	/**
	 * If true then created nodes will be cached
	 */
	@prop({type: Boolean, watch: 'syncPropsWatcher'})
	readonly cacheNodes: boolean = true;

	/**
	 * Function that returns request parameters
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQueryFn;

	/** @override */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Requests remote data chunk to render
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

	/** @override */
	get unsafe(): Unsafe & this {
		return <any>this;
	}

	/** @override */
	@p({cache: false})
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
	@system((o: bVirtualScroll) => new ScrollRender(o))
	protected scrollRender!: ScrollRender;

	/**
	 * API for scroll data requests
	 */
	@system((o: bVirtualScroll) => new ScrollRequest(o))
	protected scrollRequest!: ScrollRequest;

	/**
	 * API for dynamic component rendering
	 */
	@system((o: bVirtualScroll) => new ComponentRender(o))
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
	initLoad(data?: unknown, params: InitLoadParams = {}): CanPromise<void> {
		if (!this.lfc.isBeforeCreate()) {
			this.reInit().catch(stderr);
		}

		return super.initLoad(data, params);
	}

	/**
	 * Reloads the last request (if there is no `db` or `options` `bVirtualScroll.prototype.reload` will be called)
	 */
	reloadLast(): void {
		if (!this.db || !this.options.length) {
			this.reload();

		} else {
			this.scrollRequest.reloadLast();
		}
	}

	/**
	 * Re-initializes component
	 */
	async reInit(): Promise<void> {
		this.componentRender.reInit();
		this.scrollRender.reInit();
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<RemoteData>(this.db);

		if (this.field.get('data.length', val)) {
			this.scrollRequest.shouldStopRequest(getRequestParams(undefined, undefined, {lastLoadedData: val.data}));
			this.options = <unknown[]>val.data;
			this.total = Object.isNumber(val.total) ? val.total : undefined;

		} else {
			this.scrollRequest.shouldStopRequest(getRequestParams(undefined, undefined, {isLastEmpty: true}));
			this.options = [];
		}

		this.localEvent.emit('localReady');
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

		this.localEvent.emit('localReady');
		this.scrollRender.setRefVisibility('retry', true);
	}
}
