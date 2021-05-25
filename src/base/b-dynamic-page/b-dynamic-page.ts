/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { Cache, RestrictedCache, AbstractCache } from 'core/cache';

import SyncPromise from 'core/promise/sync';

import iBlock from 'super/i-block/i-block';
import type { EventEmitterLike } from 'core/async';

import iDynamicPage, {

	component,
	prop,
	system,
	computed,
	watch,

	ComponentStatus,
	InitLoadOptions,
	ComponentElement

} from 'super/i-dynamic-page/i-dynamic-page';

import type { Include, Exclude, KeepAliveStrategy } from 'base/b-dynamic-page/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-dynamic-page/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to dynamically load of pages.
 * Basically, it uses with a router.
 */
@component({
	inheritMods: false,
	defaultProps: false
})

export default class bDynamicPage extends iDynamicPage {
	/** @override */
	@prop({forceDefault: true})
	readonly selfDispatching: boolean = true;

	/**
	 * Initial component name to load
	 */
	@prop({type: String, required: false})
	readonly pageProp?: string;

	/**
	 * Active component name to load
	 * @see [[bDynamicPage.pageProp]]
	 */
	@system((o) => o.sync.link())
	page?: string;

	/**
	 * If true, when switching from one page to another, the old page is stored within a cache by its name.
	 * When occur switching back to this page, it will be restored.
	 * It helps to optimize switching between pages but grows memory using.
	 *
	 * Notice, when a page is switching, it will be deactivated by invoking `deactive`.
	 * When the page is restoring, it will be activated by invoking `activate`.
	 */
	readonly keepAlive: boolean = false;

	/**
	 * The maximum number of pages within the global `keepAlive` cache
	 */
	@prop(Number)
	readonly keepAliveSize: number = 10;

	/**
	 * Dictionary of `keepAlive` caches
	 */
	@system<bDynamicPage>((o) => o.sync.link('keepAliveSize', (size: number) => ({
		...o.keepAliveCache,
		global: size > 0 ? new RestrictedCache(size) : new Cache()
	})))

	keepAliveCache!: Dictionary<AbstractCache<ComponentElement<iDynamicPage>>>;

	/**
	 * A predicate to include pages to the `keepAlive` caching: if not specified, will be cached all loaded pages.
	 * It can be defined as:
	 *
	 * 1. a component name (or a list of names);
	 * 2. a regular expression;
	 * 3. a function that takes a component name and returns `true` (include), `false` (doesn't include),
	 *    a string key to cache (it uses instead of a component name),
	 *    or a special object with information of the used cache strategy.
	 */
	@prop({
		type: [String, Array, RegExp, Function],
		required: false
	})

	readonly include?: Include;

	/**
	 * A predicate to exclude some pages from the `keepAlive` caching.
	 * It can be defined as a component name (or a list of names), regular expression,
	 * or a function that takes a component name and returns `true` (exclude) or `false` (doesn't exclude).
	 */
	@prop({
		type: [String, Array, RegExp, Function],
		required: false
	})

	readonly exclude?: Exclude;

	/**
	 * Link to an event emitter to listen to events of the page switching
	 */
	@prop({type: Object, required: false})
	readonly emitter?: EventEmitterLike;

	/**
	 * Event name of the page switching
	 */
	@prop({
		type: String,
		required: false,
		forceDefault: true
	})

	readonly event?: string = 'setRoute';

	/**
	 * Function to extract a component name to load from the caught event object
	 */
	@prop({
		type: [Function, Array],
		default: (e) => e != null ? (e.component ?? e.name) : undefined,
		forceDefault: true
	})

	readonly eventConverter!: CanArray<Function>;

	/**
	 * Link to the loaded page component
	 */
	@computed({cache: false, dependencies: ['page']})
	get component(): CanUndef<iDynamicPage> {
		const
			c = this.$refs.component;

		if (Object.isArray(c)) {
			return c[0];
		}

		return c;
	}

	/** @override */
	protected readonly componentStatusStore: ComponentStatus = 'ready';

	/** @override */
	protected readonly $refs!: {
		component?: CanArray<iDynamicPage>;
	};

	/**
	 * Iterator of the rendering loop
	 */
	protected get renderIterator(): CanPromise<number> {
		if (this.keepAlive) {
			return SyncPromise.resolve(Infinity);
		}

		return 1;
	}

	/** @override */
	initLoad(): Promise<void> {
		return Promise.resolve();
	}

	/** @override */
	async reload(params?: InitLoadOptions): Promise<void> {
		const {component} = this;
		return component?.reload(params);
	}

	/**
	 * Filter of the rendering loop.
	 * It uses with `asyncRender`.
	 */
	protected renderFilter(): CanPromise<boolean> {
		if (!this.keepAlive || this.lfc.isBeforeCreate()) {
			return true;
		}

		return new SyncPromise((r) => {
			const
				currentPage = this.page;

			this.watch('page', {immediate: true, label: $$.keepAliveFilter}, (newPage) => {
				if (currentPage === newPage) {
					return;
				}

				const
					componentRef = this.$refs.component;

				const
					currentPageStrategy = this.getKeepAliveStrategy(currentPage),
					currentComponent = this.block?.element<ComponentElement<iDynamicPage>>('component');

				if (currentComponent != null) {
					currentPageStrategy?.add(currentComponent);
					currentComponent.component?.deactivate();
					currentComponent.remove();
				}

				if (Object.isArray(componentRef)) {
					componentRef.pop();
				}

				const
					newPageStrategy = this.getKeepAliveStrategy(newPage),
					componentFromCache = newPageStrategy?.get();

				if (componentFromCache != null) {
					if (Object.isArray(componentRef)) {
						const
							c = componentFromCache.component;

						if (c != null) {
							this.$el?.append(componentFromCache);

							c.activate();
							componentRef.push(c);

						} else {
							newPageStrategy?.remove();
						}
					}
				}

				r(true);
			});
		});
	}

	/**
	 * Returns a `keepAlive` cache strategy for the specified page
	 * @param page
	 */
	protected getKeepAliveStrategy(page: CanUndef<string>): CanUndef<KeepAliveStrategy> {
		if (page == null) {
			return;
		}

		const
			{exclude, include} = this;

		if (exclude != null) {
			if (Object.isFunction(exclude)) {
				if (Object.isTruly(exclude(page))) {
					return;
				}

			} else if (Object.isRegExp(exclude) ? exclude.test(page) : Array.concat([], exclude).includes(page)) {
				return;
			}
		}

		let
			cacheKey = page;

		const
			globalCache = this.keepAliveCache.global!;

		const globalStrategy = {
			has: () => globalCache.has(cacheKey),
			get: () => globalCache.get(cacheKey),
			add: (page) => globalCache.set(cacheKey, page),
			remove: () => globalCache.remove(cacheKey)
		};

		if (include != null) {
			if (Object.isFunction(include)) {
				const
					res = include(page);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (res == null || res === false) {
					return;
				}

				if (Object.isString(res) || res === true) {
					cacheKey = res === true ? page : res;
					return globalStrategy;
				}

				const cache = this.keepAliveCache[res.cacheGroup] ?? res.createCache();
				this.keepAliveCache[res.cacheGroup] = cache;

				return {
					has: () => cache.has(res.cacheKey),
					get: () => cache.get(res.cacheKey),
					add: (page) => cache.set(res.cacheKey, page),
					remove: () => cache.remove(res.cacheKey)
				};
			}

			if (Object.isRegExp(include) ? !include.test(page) : !Array.concat([], include).includes(page)) {
				return;
			}
		}

		return globalStrategy;
	}

	/**
	 * Synchronization for the emitter prop
	 */
	@watch('emitter')
	@watch({field: 'event', immediate: true})
	protected syncEmitterWatcher(): void {
		const
			{async: $a} = this,
			group = {group: 'emitter'};

		$a
			.clearAll(group);

		if (this.event != null) {
			$a.on(this.emitter ?? this.$root, this.event, (component, e) => {
				if (component != null && !((<Dictionary>component).instance instanceof iBlock)) {
					e = component;
				}

				let
					v = e;

				if (Object.isTruly(this.eventConverter)) {
					v = Array.concat([], this.eventConverter).reduce((res, fn) => fn.call(this, res, this.page), v);
				}

				if (v == null || Object.isString(v)) {
					this.page = <string>v;
				}

			}, group);
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('hidden', 'page', (v) => !Object.isTruly(v));
	}
}
