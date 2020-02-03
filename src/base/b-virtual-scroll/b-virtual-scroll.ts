/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iOption from 'traits/i-option/i-option';

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
	RetryRequestFn,
	ModsDecl

} from 'super/i-data/i-data';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

import { Axis, RequestFn, RemoteData, RequestQuery } from 'base/b-virtual-scroll/modules/interface';

export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export const axis = Object.createDict({
	x: true,
	y: true
});

@component()
export default class bVirtualScroll extends iData implements iOption {
	/** @override */
	readonly DB!: RemoteData;

	/** @override */
	readonly checkDBEquality: CheckDBEquality = false;

	/** @see iOption.optionsProp */
	@prop(Array)
	readonly optionsProp?: iOption['optionsProp'] = [];

	/** @see iOption.options */
	@field((o) => o.sync.link())
	options!: unknown[];

	/** @see iOption.option */
	@prop({type: String, required: false})
	readonly option?: iOption['option'];

	/** @see iOption.optionKey */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iOption['optionKey'];

	/** @see iOption.optionProps */
	@prop({type: [Object, Function]})
	readonly optionProps: iOption['optionProps'] = {};

	/**
	 * Number of components that could be cached
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: Number.isNatural})
	readonly cacheSize: number = 400;

	/**
	 * ...
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly drawBefore: number = 10;

	/**
	 * Render elements per chunk
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly renderPerChunk: number = 10;

	/**
	 * Scroll axis
	 */
	@prop({type: String, watch: 'syncPropsWatcher', validator: (v: string) => axis[v]})
	readonly axis: Axis = 'y';

	/**
	 * If true then the elements will be deleted from the DOM tree when scrolling
	 *   *) recommended for use if you need to display a huge number of elements (prevents OOM)
	 */
	@prop(Boolean)
	readonly dropNodes: boolean = true;

	/**
	 * If true, then created nodes will be cached
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
	 * If, when calling a function, it returns true, then the component will be able to request additional data
	 */
	@prop({type: Function, default: (v) => v.itemsToReachBottom <= 10 && !v.isLastEmpty})
	readonly shouldMakeRequest!: RequestFn;

	/**
	 * If, when calling a function, it returns false, then the component will stop request data
	 */
	@prop({type: Function, default: (v) => !v.isLastEmpty})
	readonly shouldContinueRequest!: RequestFn;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		containerSize: [
			['true'],
			'false'
		],

		requestsDone: [
			'true',
			['false']
		],

		axis: [
			['y'],
			'x'
		]
	};

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
			return this.options = val.data;

		} else {
			this.options = [];
			this.scrollRequest.checksRequestPossibility(getRequestParams(undefined, undefined, {isLastEmpty: true}));
		}

		return this.options;
	}

	/** @see iOption.getOptionKey */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return iOption.getOptionKey(this, el, i);
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
