/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

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
	ModsDecl

} from 'super/i-data/i-data';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { isNatural, getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

import {

	OptionProps,
	OptionKey,
	Axis,
	ScrollRenderStatus,
	RequestFn,
	RemoteData,
	RequestQuery,
	ReInitParams

} from 'base/b-virtual-scroll/modules/interface';

export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export const axis = Object.createDict({
	x: true,
	y: true
});

@component()
export default class bVirtualScroll extends iData<RemoteData> {
	/** @override */
	readonly checkDBEquality: CheckDBEquality = false;

	/**
	 * Option component
	 */
	@prop({type: String, watch: 'syncPropsWatcher'})
	readonly option!: string;

	/**
	 * Initial component options
	 */
	@prop({type: Array, watch: 'syncPropsWatcher'})
	readonly optionsProp?: unknown[] = [];

	/**
	 * Component options
	 */
	@field((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option component props
	 */
	@prop({type: Function, watch: 'syncPropsWatcher', default: () => ({})})
	readonly optionProps!: OptionProps;

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: Function, watch: 'syncPropsWatcher'})
	readonly optionKey!: OptionKey;

	/**
	 * Number of columns
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: isNatural})
	readonly columns: number = 1;

	/**
	 * Number of components that could be cached
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of items that will be removed from the cache when it is full
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: isNatural})
	readonly dropCacheSize: number = 50;

	/**
	 * Number of elements from the same range that cannot be removed from the cache
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: isNatural})
	readonly dropCacheSafeZone: number = 10;

	/**
	 * Number of nodes at the same time
	 */
	@prop({type: Number,  watch: 'syncPropsWatcher', validator: isNatural})
	readonly realElementsCount: number = 20;

	/**
	 * Number of nodes at the same time that are drawn in the opposite direction from the scroll
	 */
	@prop({type: Number, watch: 'syncPropsWatcher', validator: isNatural})
	readonly oppositeElementsCount: number = 10;

	/**
	 * Number of tombstones
	 */
	@prop({type: Number, watch: 'syncPropsWatcher'})
	readonly tombstoneCount: number = 10;

	/**
	 * Number of additional pixels length for allow scrolling
	 */
	@prop({type: Number, watch: 'syncPropsWatcher'})
	readonly scrollRunnerOffset: number = 0;

	/**
	 * Scroll axis
	 */
	@prop({type: String, watch: 'syncPropsWatcher', validator: (v: string) => axis[v]})
	readonly axis: Axis = 'y';

	/**
	 * If true, then created nodes will be cached
	 */
	@prop({type: Boolean, watch: 'syncPropsWatcher'})
	readonly cacheNode: boolean = true;

	/**
	 * If true, then the container height will be updated for every change in the range
	 */
	@prop({type: Boolean, watch: 'syncPropsWatcher'})
	readonly containerSize: boolean = true;

	/**
	 * Function that returns the scroll root
	 */
	@prop({type: Function, watch: 'syncPropsWatcher', required: false})
	readonly scrollingElement?: Function;

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
				...this.requestQuery?.(getRequestParams()),
				...this.request
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
		tombstone: HTMLElement;
		scrollRunner: HTMLElement;
	};

	/**
	 * Link to the scroll root
	 */
	@p({cache: false})
	protected get scrollRoot(): HTMLElement {
		if (this.scrollingElement) {
			return this.scrollingElement();
		}

		if (this.axis === 'x') {
			return <HTMLElement>this.$el;
		}

		return document.documentElement.scrollTop ?
			document.documentElement :
			document.body;
	}

	/**
	 * Link to the scroll event emitter
	 */
	protected get scrollEmitter(): Document | HTMLElement {
		if (this.scrollingElement) {
			return this.scrollingElement();
		}

		return this.axis === 'y' ? document : this.scrollRoot;
	}

	/** @override */
	initLoad(data?: unknown, params: InitLoadParams = {}): CanPromise<void> {
		if (!this.lfc.isBeforeCreate()) {
			this.reInit({hard: true}).catch(stderr);
		}

		const
			res = super.initLoad(data, {...params, silent: false});

		if (Object.isPromise(res)) {
			res.then(this.initRemoteData);

		} else {
			this.initRemoteData();
		}
	}

	/**
	 * Reloads the last request
	 */
	reloadLast(): void {
		return this.scrollRequest.reloadLast();
	}

	/**
	 * Re-initializes component
	 *
	 * @param [waitReady] - if false, the component will be initialized immediately
	 * @param [force] - if true, all tombstones will be redraw
	 */
	async reInit({waitReady = true, hard = false}: ReInitParams = {}): Promise<void> {
		await this.componentRender.reInit();
		await this.scrollRender.reInit(hard);

		if (waitReady) {
			await this.waitStatus('ready', {
				label: $$.initScrollRender,
				group: 'scroll-render'
			});
		}

		await this.scrollRender.init();
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('containerSize', 'containerSize', String);
		this.sync.mod('axis', 'axis', String);
	}

	/** @override */
	protected syncRequestParamsWatcher(): Promise<void> {
		return new Promise((res) => {
			const fn = this.lazy.createLazyFn(() => {
				this.reload()
					.then(res)
					.catch(stderr);

			}, {label: $$.lazySyncRequest});

			fn();
		});
	}

	/**
	 * @override
	 * @emits empty()
	 */
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
			this.emit('empty');
		}

		return this.options;
	}

	/**
	 * Returns an option key
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return Object.isFunction(this.optionKey) ?
			this.optionKey(el, i) :
			this.optionKey;
	}

	/**
	 * Synchronization for the component props
	 */
	@wait('ready', {defer: true, label: $$.syncPropsWatcher})
	protected async syncPropsWatcher(): Promise<void> {
		const
			{scrollRender: {status}} = this;

		if (status !== ScrollRenderStatus.render) {
			return;
		}

		return this.reInit();
	}

	/**
	 * Handler: container or window was resized
	 */
	protected onResize(): void {
		this.async.setTimeout(() => {
			// @ts-ignore (access)
			this.scrollRender.onResize();

		}, 100, {label: $$.onResize});
	}

	/**
	 * Handler: element enters/leaves viewport
	 */
	protected onIntersectChange(): void {
		this.scrollRender.updateOffset();
	}
}
