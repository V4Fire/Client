/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { VNodeData } from 'core/component/engines';

import {

	RemoteData,
	RecycleFn,
	OptionProps,
	RequestQuery,
	RequestCheckFn,
	RequestMoreParams,
	SchemeRenderNode,
	RenderParams

} from 'base/b-virtual-scroll/modules/interface';

import ComponentRender from 'base/b-virtual-scroll/modules/component-render';
import ScrollRender, { getRequestParams } from 'base/b-virtual-scroll/modules/scroll-render';

import iBlock from 'super/i-block/i-block';
import iData, { InitLoadParams, RequestParams, ModsDecl, component, prop, system, hook } from 'super/i-data/i-data';

export const
	$$ = symbolGenerator();

export * from 'super/i-block/i-block';

@component()
export default class bVirtualScroll extends iData<RemoteData> {
	/**
	 * Renders the specified node by params
	 * @param renderObj
	 */
	static renderScheme(
		node: HTMLElement,
		renderObj: SchemeRenderNode[],
		renderParams: RenderParams<any, iBlock>
	): HTMLElement {

		const
			{optionCtx} = renderParams,
			isImage = (el): el is HTMLImageElement => el.tagName === 'IMG';

		for (let i = 0; i < renderObj.length; i++) {
			const
				obj = renderObj[i],
				{val = '', if: vIf, style} = obj;

			const el = <CanUndef<HTMLElement>>(Object.isString(obj.node) && optionCtx ?
				// @ts-ignore (access)
				node.querySelector(`.${optionCtx.block.getFullElName(obj.node)}`) :
				obj.node
			);

			if (!el) {
				continue;
			}

			if ('if' in obj && !vIf) {
				el.style.display = 'none';
				continue;

			} else {
				el.style.display = '';
			}

			if (isImage(el)) {
				el.src = '';
				el.src = val;

			} else {
				if (obj.method === 'replace' || !obj.method) {
					const
						target = el.childNodes[0];

					if (target) {
						el.replaceChild(document.createTextNode(val), target);

					} else {
						el.appendChild(document.createTextNode(val));
					}

				} else {
					el.innerHTML = val;
				}
			}

			Object.assign(el.style, style);
		}

		return node;
	}

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
	 * Option attrs
	 */
	@prop({type: Function, required: false})
	readonly optionAttrs?: (el: unknown, i: number) => VNodeData;

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: [String, Function]})
	readonly optionKey!: (el: unknown, i: number) => string | number;

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
	 * Cache size
	 */
	@prop({type: Number, validator: isNatural})
	readonly cacheSize: number = 200;

	/**
	 * The number of items to be removed from the cache
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
	 * If true, then the user will be able to scroll the content, regardless of the loading status of the previous page
	 */
	@prop(Boolean)
	readonly drawMaxBased: boolean = false;

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
	 * Scroll render module
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
	async reload(params?: InitLoadParams | undefined): Promise<void> {
		const
			load = super.reload(params),
			reInit = this.componentRender.reInit().then(() => this.scrollRender.reInit());

		return Promise.all([load, reInit]).then(() => this.scrollRender.initRendering());
	}

	/**
	 * Initializes the content renderer
	 */
	@hook('mounted')
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
	protected getOptionKey(el: unknown, i: number): CanUndef<string | number> {
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
