/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import {

	RemoteData,
	RecycleFn,
	OptionProps,
	RequestQuery,
	RequestCheckFn,
	RequestMoreParams,
	Axis

} from 'base/b-virtual-scroll/modules/interface';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender, { getRequestParams } from 'base/b-virtual-scroll/modules/scroll-render';

import iData, { InitLoadParams, RequestParams, ModsDecl, field, component, prop, system, hook, wait } from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export const axis = {
	x: true,
	y: true
};

export * from 'super/i-block/i-block';

@component()
export default class bVirtualScroll extends iData<RemoteData> {
	/**
	 * Option component
	 */
	@prop({type: String})
	readonly option!: string;

	/**
	 * Initial component options
	 */
	@prop(Array)
	readonly optionsProp?: unknown[] = [];

	/**
	 * Component options
	 */
	@field((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: [String, Function]})
	readonly optionKey!: (el: unknown, i: number) => string | number;

	/**
	 * Option component props
	 */
	@prop({type: Function, required: false})
	readonly optionProps?: OptionProps;

	/**
	 * Height of option
	 */
	@prop({type: Number, required: false})
	readonly optionHeight?: number;

	/**
	 * Amount of columns
	 */
	@prop({type: Number, validator: isNatural})
	readonly columns: number = 1;

	/**
	 * Amount of nodes at the current time
	 */
	@prop({type: Number, validator: isNatural})
	readonly realElementsSize: number = 20;

	/**
	 * Amount of nodes at the current time that are drawn in the opposite direction from the scroll
	 */
	@prop({type: Number, validator: isNatural})
	readonly oppositeElementsSize: number = 10;

	/**
	 * The number of components that could be cached
	 */
	@prop({type: Number, validator: isNatural})
	readonly cacheSize: number = 400;

	/**
	 * The number of items that will be removed from the cache when it is full
	 */
	@prop({type: Number, validator: isNatural})
	readonly dropCacheSize: number = 50;

	/**
	 * The number of elements from the current range that cannot be removed from the cache
	 */
	@prop({type: Number, validator: isNatural})
	readonly dropCacheSafeZone: number = 10;

	/**
	 * Number of tombstones
	 */
	@prop(Number)
	readonly tombstoneSize: number = 10;

	/**
	 * The number of pixels of additional length to allow scrolling to
	 */
	@prop(Number)
	readonly scrollRunnerMin: number = 0;

	/**
	 * Scroll axis
	 */
	@prop({type: String, validator: (v: string) => axis.hasOwnProperty(v)})
	readonly axis: Axis = 'y';

	/**
	 * If true, then created nodes will be cached
	 */
	@prop(Boolean)
	readonly cacheNode: boolean = true;

	/**
	 * If true, then the height of the container will be updated for every change in range
	 */
	@prop(Boolean)
	readonly containerSize: boolean = true;

	/**
	 * If true, then created nodes will be reused
	 *   *) Works only with recycleFn defined
	 */
	@prop(Boolean)
	readonly recycle: boolean = false;

	/**
	 * Function that returns a scroll root
	 */
	@prop({type: Function, required: false})
	readonly scrollingElement?: Function;

	/**
	 * Function that returns request parameters
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQuery;

	/**
	 * Create component function
	 */
	@prop({type: Function, required: false})
	readonly recycleFn?: RecycleFn;

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
			get: this.requestQuery ? this.requestQuery(getRequestParams()) : {}
		};
	}

	/** @override */
	protected set requestParams(v: RequestParams) {
		return;
	}

	/**
	 * Scroll render module
	 */
	@system((o: bVirtualScroll) => new ScrollRender(o))
	protected scrollRender!: ScrollRender;

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
	protected get scrollRoot(): HTMLElement {
		if (this.scrollingElement) {
			return this.scrollingElement();
		}

		return this.axis === 'y' ?
			document.documentElement || document.scrollingElement || document.body :
			<HTMLElement>this.$el;
	}

	/**
	 * Link to scroll event emitter
	 */
	protected get scrollEmitter(): Document | HTMLElement {
		return this.axis === 'y' ? document : this.scrollRoot;
	}

	/**
	 * If, when calling a function, it returns true, then the component will be able to request additional data
	 */
	@prop(Function)
	readonly shouldRequest: RequestCheckFn = (v) => v.itemsToRichBottom <= 10 && !v.isLastEmpty;

	/**
	 * If, when calling a function, it returns true, then the component will stop request data
	 */
	@prop(Function)
	readonly isRequestsDone: RequestCheckFn = (v) => !v.isLastEmpty;

	/** @override */
	async reload(params?: InitLoadParams): Promise<void> {
		const
			load = super.reload(params),
			reInit = this.componentRender.reInit().then(() => this.scrollRender.reset());

		return Promise.all([load, reInit]).then(() => this.scrollRender.initRender());
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
		}

		return this.options;
	}

	/**
	 * Requests an additional data
	 * @param params
	 */
	protected loadEntities(params: RequestMoreParams): Promise<CanUndef<RemoteData>> {
		const query = {
			...this.request,
			...Object.isFunction(this.requestQuery) && this.requestQuery(params) || {}
		};

		return this.get(query)
			.then((data) => {
				if (!data) {
					return;
				}

				const
					converted = this.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!this.field.get('data.length', converted)) {
					return;
				}

				this.options = this.options.concat(converted);
				return converted;
			})

			.catch((err) => (stderr(err), undefined));
	}

	/**
	 * Generates or returns an option key for v-for
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
		return Object.isFunction(this.optionKey) ?
			this.optionKey(el, i) :
			this.optionKey;
	}
}

function isNatural(v: number): boolean {
	return v.isNatural();
}
