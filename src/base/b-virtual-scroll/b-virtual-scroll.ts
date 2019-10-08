import Range from 'core/range';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender, { RenderItem } from 'base/b-virtual-scroll/modules/scroll-render';

import iData, { RequestParams, component, prop, field, wait, system, hook } from 'super/i-data/i-data';

export type OptionProps = ((el: unknown, i: number) => Dictionary) | Dictionary;
export type OptionsIterator<T = bVirtualScroll> = (options: unknown[], ctx: T) => unknown[];

export type RequestQuery<T extends unknown = unknown> = (params: LoadMoreParams<T>) => Dictionary;
export type ShouldRequestMore<T extends unknown = unknown> = (params: LoadMoreParams<T>) => boolean;

export interface LoadMoreParams<T extends unknown = unknown> {
	currentSlice: RenderItem<T>[];
	currentPage: number;
	nextPage: number;
	itemsToRichBottom: number;
	currentRange: Range<number>;
	items: RenderItem<T>[];
	lastLoaded: Array<T>;
}

export const scrollAxis = {
	x: true,
	y: true
};

export type ScrollAxis = keyof typeof scrollAxis;

export * from 'super/i-block/i-block';

@component()
export default class bVirtualScroll extends iData<unknown[]> {
	/**
	 * Initial component options
	 */
	@prop(Array)
	readonly optionsProp?: unknown[] = [];

	/**
	 * Component options
	 */
	@system()
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
	@prop([Object, Function])
	readonly optionProps: OptionProps = {};

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
	readonly cacheSize: number = 200;

	/**
	 * Count of tombstone elements
	 */
	@prop(Number)
	readonly tombstoneSize: number = 10;

	/**
	 * If true, created nodes will be cached
	 */
	@prop(Boolean)
	readonly cacheNode: boolean = true;

	/**
	 * Use waterflow render mode
	 */
	@prop(Boolean)
	readonly waterflow: boolean = false;

	/**
	 * Scroll direction
	 */
	@prop({type: String, validator: (v) => scrollAxis.hasOwnProperty(v)})
	readonly scrollDirection: ScrollAxis = 'y';

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

	/** @override */
	@field((o: bVirtualScroll) => ({get: o.requestQuery ? o.requestQuery({
		currentPage: 0,
		currentRange: new Range(0, 0),
		items: [],
		nextPage: 1,
		lastLoaded: [],
		currentSlice: [],
		itemsToRichBottom: 0
	}) : {}}))

	protected readonly requestParams!: RequestParams;

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
		list: HTMLElement;
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
	 * Function which should return true if there is no need to request more data
	 */
	@prop({type: Function})
	readonly shouldRequestMore: ShouldRequestMore = (v) => v.itemsToRichBottom <= 10;

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

	/**
	 * Initializes content renderer
	 */
	@hook('mounted')
	@wait('ready')
	protected initRender(): CanPromise<void> {
		this.componentRender = new ComponentRender(this);
		this.scrollRender = new ScrollRender(this);
	}

	/** @override */
	protected initRemoteData(): CanUndef<unknown[]> {
		this.options = this.optionsProp || [];

		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
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
	protected async requestRemoteData(params: LoadMoreParams): Promise<CanUndef<unknown[]>> {
		const
			shouldRequest = Object.isFunction(this.shouldRequestMore) && this.shouldRequestMore(params);

		if (!shouldRequest) {
			return;
		}

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
			converted = this.convertDataToDB(data);

		if (!Object.isArray(converted) || !converted.length) {
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
	 * Handler: element click
	 *
	 * @param el
	 * @param i
	 *
	 * @emits elClick(el: unknown, i: number)
	 */
	protected onElClick(el: unknown, i: number): void {
		this.emit('elClick', el, i);
	}
}

function isNatural(v: number): boolean {
	return v.isNatural();
}
