/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import addEmitter from 'core/cache/decorators/helpers/add-emitter';
import { Cache, RestrictedCache, AbstractCache } from 'core/cache';

import SyncPromise from 'core/promise/sync';
import type { EventEmitterLike } from 'core/async';

import iBlock from 'super/i-block/i-block';

import iDynamicPage, {

	component,

	prop,
	system,
	computed,
	watch,

	UnsafeGetter,
	ComponentStatus,
	InitLoadOptions

} from 'super/i-dynamic-page/i-dynamic-page';

import type {

	Include,
	Exclude,

	iDynamicPageEl,
	KeepAliveStrategy,
	UnsafeBDynamicPage

} from 'base/b-dynamic-page/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-dynamic-page/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to dynamically load page components.
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
	 * Notice, when a page is switching, it will be deactivated by invoking `deactivate`.
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
		global: o.addClearListenersToCache(
			size > 0 ?
				new RestrictedCache<iDynamicPageEl>(size) :
				new Cache<iDynamicPageEl>()
		)
	})))

	keepAliveCache!: Dictionary<AbstractCache<iDynamicPageEl>>;

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
		default: (e) => e != null ? (e.meta.component ?? e.name) : undefined,
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
	get unsafe(): UnsafeGetter<UnsafeBDynamicPage<this>> {
		return <any>this;
	}

	/** @override */
	protected readonly componentStatusStore: ComponentStatus = 'ready';

	/** @override */
	protected readonly $refs!: {
		component?: iDynamicPage[];
	};

	/**
	 * Iterator of the rendering loop (it uses with `asyncRender`)
	 */
	protected get renderIterator(): CanPromise<number> {
		return SyncPromise.resolve(Infinity);
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
	 * Filter of the rendering loop (it uses with `asyncRender`)
	 */
	protected renderFilter(): CanPromise<boolean> {
		if (this.lfc.isBeforeCreate()) {
			return true;
		}

		const
			{unsafe, page, route} = this;

		return new SyncPromise((r) => {
			const opts = {immediate: true, label: $$.keepAliveFilter};
			this.watch('page', opts, onPageChange(r, this.page, this.route));
		});

		function onPageChange(
			resolve: Function,
			currentPage: typeof page,
			currentRoute: typeof route
		): AnyFunction {
			return (newPage: typeof page) => {
				if (currentPage === newPage) {
					return;
				}

				const componentRef = unsafe.$refs.component;
				componentRef?.pop();

				const
					currentComponentEl = unsafe.block?.element<iDynamicPageEl>('component'),
					currentComponent = currentComponentEl?.component?.unsafe;

				if (currentComponentEl != null && currentComponent != null) {
					const
						currentPageStrategy = unsafe.getKeepAliveStrategy(currentPage, currentRoute);

					if (currentPageStrategy.isLoopback) {
						currentComponent.$destroy();

					} else {
						currentPageStrategy.add(currentComponentEl);
						currentComponent.deactivate();
					}

					currentComponentEl.remove();
				}

				const
					newPageStrategy = unsafe.getKeepAliveStrategy(newPage),
					componentFromCache = newPageStrategy.get();

				if (componentFromCache == null) {
					const handler = () => {
						if (!newPageStrategy.isLoopback) {
							unsafe.component?.activate(true);
						}
					};

					unsafe.localEmitter.once('asyncRenderChunkComplete', handler, {
						label: $$.renderFilter
					});

				} else {
					const
						c = componentFromCache.component;

					if (c != null) {
						unsafe.$el?.append(componentFromCache);

						c.activate();
						componentRef?.push(c);

					} else {
						newPageStrategy.remove();
					}
				}

				resolve(true);
			};
		}
	}

	/**
	 * Returns a `keepAlive` cache strategy for the specified page
	 *
	 * @param page
	 * @param [route] - link to an application route object
	 */
	protected getKeepAliveStrategy(page: CanUndef<string>, route: this['route'] = this.route): KeepAliveStrategy {
		const loopbackStrategy = {
			isLoopback: true,
			has: () => false,
			get: () => undefined,
			add: (page) => page,
			remove: () => undefined
		};

		if (!this.keepAlive || page == null) {
			return loopbackStrategy;
		}

		const
			{exclude, include} = this;

		if (exclude != null) {
			if (Object.isFunction(exclude)) {
				if (Object.isTruly(exclude(page, route, this))) {
					return loopbackStrategy;
				}

			} else if (Object.isRegExp(exclude) ? exclude.test(page) : Array.concat([], exclude).includes(page)) {
				return loopbackStrategy;
			}
		}

		let
			cacheKey = page;

		const
			globalCache = this.keepAliveCache.global!;

		const globalStrategy = {
			isLoopback: false,
			has: () => globalCache.has(cacheKey),
			get: () => globalCache.get(cacheKey),
			add: (page) => globalCache.set(cacheKey, page),
			remove: () => globalCache.remove(cacheKey)
		};

		if (include != null) {
			if (Object.isFunction(include)) {
				const
					res = include(page, route, this);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (res == null || res === false) {
					return loopbackStrategy;
				}

				if (Object.isString(res) || res === true) {
					cacheKey = res === true ? page : res;
					return globalStrategy;
				}

				const cache = this.keepAliveCache[res.cacheGroup] ?? this.addClearListenersToCache(res.createCache());
				this.keepAliveCache[res.cacheGroup] = cache;

				return {
					isLoopback: false,
					has: () => cache.has(res.cacheKey),
					get: () => cache.get(res.cacheKey),
					add: (page) => cache.set(res.cacheKey, page),
					remove: () => cache.remove(res.cacheKey)
				};
			}

			if (Object.isRegExp(include) ? !include.test(page) : !Array.concat([], include).includes(page)) {
				return loopbackStrategy;
			}
		}

		return globalStrategy;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const i = this.instance;
		this.addClearListenersToCache = i.addClearListenersToCache.bind(this);
	}

	/**
	 * Wraps the specified cache object and returns a new.
	 * The method adds listeners to destroy unused pages from the cache.
	 *
	 * @param cache
	 */
	protected addClearListenersToCache<T extends AbstractCache<iDynamicPageEl>>(cache: T): T {
		const
			wrappedCache = addEmitter(cache);

		wrappedCache.subscribe('remove', cache, ({result}) => {
			result?.component?.unsafe.$destroy();
		});

		wrappedCache.subscribe('clear', cache, ({result}) => {
			result.forEach((el) => el.component?.unsafe.$destroy());
		});

		return cache;
	}

	/**
	 * Synchronization for the emitter prop
	 */
	@watch('emitter')
	@watch({field: 'event', immediate: true})
	protected syncEmitterWatcher(): void {
		const
			{async: $a} = this;

		const
			group = {group: 'emitter'};

		$a
			.clearAll(group);

		if (this.event != null) {
			$a.on(this.emitter ?? this.$root, this.event, (component, e) => {
				if (component != null && !((<Dictionary>component).instance instanceof iBlock)) {
					e = component;
				}

				let
					newPage = e;

				if (Object.isTruly(this.eventConverter)) {
					newPage = Array.concat([], this.eventConverter).reduce((res, fn) => fn.call(this, res, this.page), newPage);
				}

				if (newPage == null || Object.isString(newPage)) {
					this.page = <string>newPage;
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
