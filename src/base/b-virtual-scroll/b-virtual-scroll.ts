/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iItem from 'traits/i-item/i-item';

import iData, {

	component,
	prop,
	field,
	system,
	wait,

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
import { Axis, RequestFn, RemoteData, RequestQuery, RequestEngine } from 'base/b-virtual-scroll/modules/interface';

export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export const axis = Object.createDict({
	x: true,
	y: true
});

@component()
export default class bVirtualScroll extends iData implements iItem {
	/** @override */
	readonly DB!: RemoteData;

	/** @override */
	readonly checkDBEquality: CheckDBEquality = false;

	/** @see [[iItem.itemsProp]] */
	@prop(Array)
	readonly optionsProp?: iItem['optionsProp'] = [];

	/** @see [[iItem.items]] */
	@field((o) => o.sync.link())
	options!: unknown[];

	/** @see [[iItem.item]] */
	@prop({type: String, required: false})
	readonly option?: iItem['option'];

	/** @see [[iItem.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItem['optionKey'];

	/** @see [[iItem.itemProps]] */
	@prop({type: [Object, Function]})
	readonly optionProps: iItem['optionProps'] = {};

	/**
	 * Maximum number of elements to cache
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: Number.isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of items to the end of the list to start render the next chunk
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly renderBefore: number = 10;

	/**
	 * Render elements per chunk
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly chunkSize: number = 10;

	/**
	 * Number of tombstones to render
	 */
	@prop({type: Number, required: false, validator: Number.isNatural})
	readonly tombstonesSize?: number;

	/**
	 * Scroll axis
	 */
	@prop({type: String, watch: 'syncPropsWatcher', validator: (v: string) => axis[v]})
	readonly axis: Axis = 'y';

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
	readonly requestQuery?: RequestQuery;

	/** @override */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * Engine for request remote data
	 */
	@prop({type: Function, default: (ctx, query) => ctx.get(query), required: false})
	readonly requestEngine!: RequestEngine;

	/**
	 * If, when calling a function, it returns true, then the component will be able to request additional data
	 */
	@prop({type: Function, default: (v) => v.itemsTillBottom <= 10 && !v.isLastEmpty})
	readonly shouldMakeRequest!: RequestFn;

	/**
	 * If, when calling a function, it returns true, then the component will stop request data
	 */
	@prop({type: Function, default: (v) => v.isLastEmpty})
	readonly shouldStopRequest!: RequestFn;

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
	 * Reloads the last request
	 */
	reloadLast(): void {
		this.scrollRequest.reloadLast();
	}

	/**
	 * Re-initializes component
	 * @param [waitReady] - if false, the component will be initialized immediately
	 */
	async reInit(waitReady: boolean = true): Promise<void> {
		this.componentRender.reInit();
		this.scrollRender.reInit();

		if (waitReady) {
			await this.waitStatus('ready', {
				label: $$.initScrollRender,
				group: 'scroll-render'
			});
		}

		this.scrollRender.reInit();
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('containerSize', 'containerSize', String);
		this.sync.mod('axis', 'axis', String);
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<RemoteData>(this.db);

		if (this.field.get('data.length', val)) {
			this.options = <unknown[]>val.data;
			this.scrollRequest.shouldStopRequest(getRequestParams(undefined, undefined, {lastLoadedData: val.data}));
			return this.options;

		} else {
			this.options = [];
			this.scrollRequest.shouldStopRequest(getRequestParams(undefined, undefined, {isLastEmpty: true}));
		}

		return this.options;
	}

	/** @see [[iItem.getOptionKey]] */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return iItem.getOptionKey(this, el, i);
	}

	/**
	 * Synchronization for the component props
	 */
	@wait('ready', {defer: true, label: $$.syncPropsWatcher})
	protected async syncPropsWatcher(): Promise<void> {
		return this.reInit();
	}

	/** @override */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		super.onRequestError(err, retry);
		this.scrollRender.setRefVisibility('retry', true);
	}
}
