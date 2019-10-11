/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';
import symbolGenerator from 'core/symbol';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender, { RenderItem, getRequestParams } from 'base/b-virtual-scroll/modules/scroll-render';

import iData, { RequestParams, ModsDecl, component, prop, wait, system, hook } from 'super/i-data/i-data';

export type OptionProps = ((el: unknown, i: number) => Dictionary);
export type OptionsIterator<T = bVirtualScroll> = (options: unknown[], ctx: T) => unknown[];

export type RequestQuery<T extends unknown = unknown> = (params: RequestMoreParams<T>) => Dictionary;
export type RequestCheckFn<T extends unknown = unknown> = (params: RequestMoreParams<T>) => boolean;

export interface RequestMoreParams<T extends unknown = unknown> {
	currentSlice: RenderItem<T>[];
	currentPage: number;
	currentRange: Range<number>;

	nextPage: number;
	itemsToRichBottom: number;
	items: RenderItem<T>[];

	isLastEmpty: boolean;
	lastLoaded: Array<T>;
}

export interface RemoteData {
	data: unknown[];
	total?: number;
}

export const
	$$ = symbolGenerator();

export * from 'super/i-block/i-block';

@component()
export default class bVirtualScroll extends iData<RemoteData> {
	/**
	 * Initial component options
	 */
	@prop(Array)
	readonly optionsProp?: unknown[] = [];

	/**
	 * Component options
	 */
	@system((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: [String, Function]})
	readonly optionKey!: string | ((el: unknown, i: number) => string);

	/**
	 * Option component
	 */
	@prop({type: String})
	readonly option!: string;

	/**
	 * Option component props
	 */
	@prop({type: Function, required: false})
	readonly optionProps?: OptionProps;

	/**
	 * Height of option component
	 */
	@prop({type: Number, required: false})
	readonly optionHeight?: number;

	/**
	 * Number of columns
	 */
	@prop({type: Number, validator: isNatural})
	readonly columns: number = 1;

	/**
	 * Number of real DOM elements
	 */
	@prop({type: Number, validator: isNatural})
	readonly realElementsSize: number = 20;

	/**
	 * Number of elements should be rendered in opposite side direction
	 */
	@prop({type: Number, validator: isNatural})
	readonly oppositeElementsSize: number = 10;

	/**
	 * Number of cached VNodes
	 */
	@prop({type: Number, validator: isNatural})
	readonly cacheSize: number = 400;

	/**
	 * Number of components will be destroyed on cache drop
	 */
	@prop({type: Number, validator: isNatural})
	readonly dropCacheSize: number = 50;

	/**
	 * ...
	 */
	@prop({type: Number, validator: isNatural})
	readonly dropCacheSafeZone: number = 10;

	/**
	 * Count of tombstone elements
	 */
	@prop(Number)
	readonly tombstoneSize: number = 10;

	/**
	 * Count of tombstones for first render
	 */
	@prop(Number)
	readonly firstRenderTombstoneCount: number = 10;

	/**
	 * The number of pixels of additional length to allow scrolling to
	 */
	@prop(Number)
	readonly scrollRunnerMin: number = 0;

	/**
	 * If true, created nodes will be cached
	 */
	@prop(Boolean)
	readonly cacheNode: boolean = true;

	/**
	 * If true, user will be able to scroll until content end
	 */
	@prop(Boolean)
	readonly drawMaxBased: boolean = false;

	/**
	 * If true, heights will be recalculates on every draw
	 * NOTICE: May slowdown your app performance
	 */
	@prop(Boolean)
	readonly recalculateHeights: boolean = false;

	/**
	 * If true, will update container height on every range update
	 */
	@prop(Boolean)
	readonly containerSize: boolean = true;

	/**
	 * If true, will bind click event to element
	 */
	@prop(Boolean)
	readonly bindClickEvent: boolean = true;

	/**
	 * Function which returns a scroll root
	 */
	@prop({type: Function, required: false})
	readonly scrollingElement?: Function;

	/**
	 * Function which should return a request queries
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQuery;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		containerHeight: [
			['true'],
			'false'
		]
	};

	/** @override */
	protected get requestParams(): RequestParams {
		return {
			get: this.requestQuery ? this.requestQuery(getRequestParams()) : {}
		};
	}

	/** @override */
	protected set requestParams(v: RequestParams) {
		return;
	}

	/**
	 * Component render module
	 */
	@system()
	protected componentRender!: ComponentRender;

	/**
	 * Scroll module
	 */
	@system()
	protected scrollRender!: ScrollRender;

	/** @override */
	protected $refs!: {
		container: HTMLElement;
		tombstone: HTMLElement;
		scrollRunner: HTMLElement;
	};

	/**
	 * Link to scroll root
	 */
	protected get scrollRoot(): HTMLElement {
		if (this.scrollingElement) {
			return this.scrollingElement();
		}

		return document.documentElement || document.scrollingElement || document.body;
	}

	/**
	 * If function returns true, will be loaded more data
	 */
	@prop({type: Function})
	readonly shouldRequest: RequestCheckFn = (v) => v.itemsToRichBottom <= 10 && !v.isLastEmpty;

	/**
	 * If function returns true, will be loaded more data
	 */
	@prop({type: Function})
	readonly isRequestsDone: RequestCheckFn = (v) => !v.isLastEmpty;

	/**
	 * Scrolls to specified element
	 * @param index
	 */
	@wait('ready')
	async scrollToEl(index: number): Promise<void> {
		return;
	}

	/**
	 * Scrolls to specified position
	 * @param value
	 */
	@wait('ready')
	async scrollTo(value: number): Promise<void> {
		return;
	}

	/** @override */
	reload(): Promise<void> {
		return super.reload()
			.then(() => this.componentRender.reInit())
			.then(() => this.scrollRender.reInit())
			.then(() => this.scrollRender.initDraw());
		// const
		// 	load = super.reload(),
		// 	reInit = this.componentRender.reInit().then(() => this.scrollRender.reInit());

		// return Promise.all([load, reInit]).then(() => this.scrollRender.initDraw());
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('containerSize', 'containerSize', String);
	}

	/**
	 * Initializes content renderer
	 */
	@hook('mounted')
	protected initRender(): CanPromise<void> {
		this.componentRender = new ComponentRender(this);
		this.scrollRender = new ScrollRender(this);

		return this.waitStatus('ready', this.scrollRender.initDraw.bind(this.scrollRender), {label: $$.initDraw});
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown[]> {
		this.options = this.optionsProp || [];

		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<RemoteData>(this.db);

		if (this.field.get('data.length', val)) {
			return this.options = val.data;
		}

		return this.options;
	}

	/**
	 * Requests an additional data
	 *
	 * @param params
	 *
	 * @emits startLoad(query: Dictionary, params: LoadMoreParams)
	 * @emits responseEmpty() - no response or empty array as response
	 * @emits loaded(data: unknown[], query: Dictionary, params: LoadMoreParams)
	 */
	protected async requestRemoteData(params: RequestMoreParams): Promise<CanUndef<RemoteData>> {
		const query = {
			...this.request,
			...Object.isFunction(this.requestQuery) && this.requestQuery(params) || {}
		};

		const
			args = [query, params];

		this.emit('startLoad', ...args);

		const
			data = await this.get(query).catch(stderr);

		if (!data) {
			this.emit('responseEmpty');
			return;
		}

		const
			converted = this.convertDataToDB<CanUndef<RemoteData>>(data);

		if (!this.field.get('data.length', converted)) {
			this.emit('responseEmpty');
			return;
		}

		this.options = this.options.concat(converted);
		this.emit('loaded', data, ...args);
		return converted;
	}

	/**
	 * Generates or returns an option key for v-for
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionKey(el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(this.optionKey) ?
			this.optionKey(el, i) :
			this.optionKey;
	}

	/**
	 * Handler: component destroy
	 */
	@hook('beforeDestroy')
	protected onDestroy(): void {
		this.componentRender.destroy();
	}
}

function isNatural(v: number): boolean {
	return v.isNatural();
}
