/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { isNatural, getRequestParams } from 'base/b-virtual-scroll/modules/helpers';

import {

	RemoteData,
	OptionProps,
	RequestQuery,
	RequestFn,
	ScrollRenderState,
	Axis

} from 'base/b-virtual-scroll/modules/interface';

import iData, { InitLoadParams, RequestParams, ModsDecl, field, component, prop, p, system } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export const axis = Object.createDict({
	x: true,
	y: true
});

@component()
export default class bVirtualScroll extends iData<RemoteData> {
	/**
	 * Option component
	 */
	@prop({type: String, watch: 'onUpdate'})
	readonly option!: string;

	/**
	 * Initial component options
	 */
	@prop({type: Array, watch: 'onUpdate'})
	readonly optionsProp?: unknown[] = [];

	/**
	 * Component options
	 */
	@field((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option component props
	 */
	@prop({type: Function, watch: 'onUpdate', default: () => ({})})
	readonly optionProps!: OptionProps;

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: Function, watch: 'onUpdate'})
	readonly optionKey!: (el: unknown, i: number) => string | number;

	/**
	 * Number of columns
	 */
	@prop({type: Number, watch: 'onUpdate', validator: isNatural})
	readonly columns: number = 1;

	/**
	 * Number of components that could be cached
	 */
	@prop({type: Number, watch: 'onUpdate', validator: isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of items that will be removed from the cache when it is full
	 */
	@prop({type: Number, watch: 'onUpdate', validator: isNatural})
	readonly dropCacheSize: number = 50;

	/**
	 * Number of elements from the current range that cannot be removed from the cache
	 */
	@prop({type: Number, watch: 'onUpdate', validator: isNatural})
	readonly dropCacheSafeZone: number = 10;

	/**
	 * Amount of nodes at the same time
	 */
	@prop({type: Number,  watch: 'onUpdate', validator: isNatural})
	readonly realElementsCount: number = 20;

	/**
	 * Amount of nodes at the same time that are drawn in the opposite direction from the scroll
	 */
	@prop({type: Number, watch: 'onUpdate', validator: isNatural})
	readonly oppositeElementsCount: number = 10;

	/**
	 * Number of tombstones
	 */
	@prop({type: Number, watch: 'onUpdate'})
	readonly tombstoneCount: number = 10;

	/**
	 * Number of pixels of additional length to allow scrolling to
	 */
	@prop({type: Number, watch: 'onUpdate'})
	readonly scrollRunnerOffset: number = 0;

	/**
	 * Scroll axis
	 */
	@prop({type: String, watch: 'onUpdate', validator: (v: string) => axis[v]})
	readonly axis: Axis = 'y';

	/**
	 * If true, then created nodes will be cached
	 */
	@prop({type: Boolean, watch: 'onUpdate'})
	readonly cacheNode: boolean = true;

	/**
	 * If true, then the height of the container will be updated for every change in range
	 */
	@prop({type: Boolean, watch: 'onUpdate'})
	readonly containerSize: boolean = true;

	/**
	 * Function that returns a scroll root
	 */
	@prop({type: Function, watch: 'onUpdate', required: false})
	readonly scrollingElement?: Function;

	/**
	 * Function that returns request parameters
	 */
	@prop({type: Function, watch: 'reload', required: false})
	readonly requestQuery?: RequestQuery;

	/** @override */
	@prop({type: [Object, Array], required: false})
	readonly request?: RequestParams;

	/**
	 * If, when calling a function, it returns true, then the component will be able to request additional data
	 */
	@prop({type: Function, watch: 'reload', default: (v) => v.itemsToReachBottom <= 10 && !v.isLastEmpty})
	readonly shouldMakeRequest!: RequestFn;

	/**
	 * If, when calling a function, it returns false, then the component will stop request data
	 */
	@prop({type: Function, watch: 'reload', default: (v) => !v.isLastEmpty})
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
	 * Scroll render module
	 */
	@system((o: bVirtualScroll) => new ScrollRender(o))
	protected scrollRender!: ScrollRender;

	/**
	 * Scroll request module
	 */
	@system((o: bVirtualScroll) => new ScrollRequest(o))
	protected scrollRequest!: ScrollRequest;

	/**
	 * Component render module
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
	 * Link to scroll root
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
	 * Link to scroll event emitter
	 */
	protected get scrollEmitter(): Document | HTMLElement {
		if (this.scrollingElement) {
			return this.scrollingElement();
		}

		return this.axis === 'y' ? document : this.scrollRoot;
	}

	/** @override */
	reload(params?: InitLoadParams): Promise<void> {
		this.componentStatus = 'loading';

		return this.async.promise(Promise.all([
				super.reload(params),
				this.reInit(true, true)
			]).then(() => undefined),

		{label: $$.reload, join: true});
	}

	/**
	 * Re-initializes component
	 * @param waitReady
	 */
	reInit(waitReady: boolean, hard: boolean = false): Promise<void> {
		const wrappedRender = () => {
			const asyncOpts = {label: 'initScrollRender', group: 'scroll-render'};
			return this.waitStatus('ready', () => this.scrollRender.init(), asyncOpts);
		};

		return this.componentRender.reset()
			.then(() => this.scrollRender.reset(hard))
			.then(waitReady ?
				wrappedRender :
				() => this.scrollRender.init()
			);
	}

	/**
	 * Retries the last request
	 */
	reloadLast (): void {
		return this.scrollRequest.reloadLast();
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('containerSize', 'containerSize', String);
		this.sync.mod('axis', 'axis', String);
	}

	/** @override */
	protected syncRequestParamsWatcher(): Promise<void> {
		return this.reload().catch(stderr);
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
	 * Handler: props was updated
	 */
	protected async onUpdate(): Promise<void> {
		const
			{scrollRender: {state}} = this,
			FRAME_TIME = 16;

		if (state !== ScrollRenderState.render || this.componentStatus !== 'ready') {
			return;
		}

		await this.async.sleep(FRAME_TIME, {label: $$.onUpdate, join: false}).catch(stderr);
		this.reInit(true).catch(stderr);
	}

	/**
	 * Handler: element enters/leaves viewport
	 */
	protected onIntersectChange(): void {
		this.scrollRender.updateOffset();
	}
}
