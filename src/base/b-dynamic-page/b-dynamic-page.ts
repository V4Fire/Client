/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-dynamic-page/README.md]]
 * @packageDocumentation
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
	UnsafeBDynamicPage,

	PageInfo

} from 'base/b-dynamic-page/interface';

import { restorePageElementsScroll, saveScrollIntoAttribute } from 'base/b-dynamic-page/helpers';

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
	@prop({forceDefault: true})
	override readonly selfDispatching: boolean = true;

	/**
	 * Initial component name to load and its key
	 */
	@prop({type: Array, required: false})
	readonly pageProp?: PageInfo;

	/**
	 * Active component name to load and its key
	 * @see [[bDynamicPage.pageProp]]
	 */
	@system((o) => o.sync.link())
	page?: PageInfo;

	/**
	 * If true, when switching from one page to another, the old page is stored within a cache by its name.
	 * When occur switching back to this page, it will be restored.
	 * It helps to optimize switching between pages but grows memory using.
	 *
	 * Notice, when a page is switching, it will be deactivated by invoking `deactivate`.
	 * When the page is restoring, it will be activated by invoking `activate`.
	 */
	@prop(Boolean)
	readonly keepAlive: boolean = false;

	/**
	 * The maximum number of pages within the global `keepAlive` cache
	 */
	@prop(Number)
	readonly keepAliveSize: number = 10;

	/**
	 * A dictionary of `keepAlive` caches.
	 * The keys represent cache groups (by default uses `global`).
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
	 * 3. a function that takes a component name and returns `true` (include), `false` (does not include),
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
	 * or a function that takes a component name and returns `true` (exclude) or `false` (does not exclude).
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
	 * Function to extract a component name and its key to load from the caught event object
	 */
	@prop({
		type: [Function, Array],
		default: (e) => e != null ? [(e.meta.component ?? e.name)] : [undefined],
		forceDefault: true
	})

	readonly eventConverter!: CanArray<Function>;

	/**
	 * Link to the loaded page component
	 */
	@computed({cache: false, dependencies: ['page']})
	get component(): CanPromise<iDynamicPage> {
		const
			c = this.$refs.component;

		const getComponent = () => {
			const
				c = this.$refs.component!;

			if (Object.isArray(c)) {
				return c[0];
			}

			return c;
		};

		return c != null && (!Object.isArray(c) || c.length > 0) ?
			getComponent() :
			this.waitRef('component').then(getComponent);
	}

	override get unsafe(): UnsafeGetter<UnsafeBDynamicPage<this>> {
		return Object.cast(this);
	}

	protected override readonly componentStatusStore: ComponentStatus = 'ready';

	protected override readonly $refs!: {
		component?: iDynamicPage[];
	};

	/**
	 * True if the current page is taken from a cache
	 */
	@system()
	protected pageTakenFromCache: boolean = false;

	/**
	 * Handler: page has been changed
	 */
	@system()
	protected onPageChange?: Function;

	/**
	 * Iterator of the rendering loop (it uses with `asyncRender`)
	 */
	protected get renderIterator(): CanPromise<number> {
		return SyncPromise.resolve(Infinity);
	}

	override initLoad(): Promise<void> {
		return Promise.resolve();
	}

	/**
	 * Reloads the loaded page component
	 */
	override async reload(params?: InitLoadOptions): Promise<void> {
		const component = await this.component;
		return component.reload(params);
	}

	/**
	 * Filter of the rendering loop (it uses with `asyncRender`)
	 */
	protected renderFilter(): CanPromise<boolean> {
		if (this.lfc.isBeforeCreate()) {
			return true;
		}

		const
			{unsafe, route, r} = this;

		return new SyncPromise((r) => {
			this.onPageChange = onPageChange(r, this.route);
		});

		function onPageChange(
			resolve: Function,
			currentRoute: typeof route
		): AnyFunction {
			return (newPageInfo: CanUndef<[string, string?]>, currentPageInfo: CanUndef<[string, string?]>) => {
				if (newPageInfo?.[0] === currentPageInfo?.[0] && newPageInfo?.[1] === currentPageInfo?.[1]) {
					return;
				}

				unsafe.pageTakenFromCache = false;

				const componentRef = unsafe.$refs.component;
				componentRef?.pop();

				const
					currentPageEl = unsafe.block?.element<iDynamicPageEl>('component'),
					currentPageComponent = currentPageEl?.component?.unsafe;

				if (currentPageEl != null) {
					r.emit('beforeSwitchPage', {saveScroll: saveScrollIntoAttribute});

					if (currentPageComponent != null) {
						const
							currentPageStrategy = unsafe.getKeepAliveStrategy(currentPageInfo?.[0], currentRoute);

						if (currentPageStrategy.isLoopback) {
							currentPageComponent.$destroy();

						} else {
							currentPageStrategy.add(currentPageEl);
							currentPageComponent.deactivate();
						}
					}

					currentPageEl.remove();
				}

				const
					newPageStrategy = unsafe.getKeepAliveStrategy(newPageInfo?.[0]),
					pageElFromCache = newPageStrategy.get();

				if (pageElFromCache == null) {
					const handler = () => {
						if (!newPageStrategy.isLoopback) {
							return SyncPromise.resolve(unsafe.component).then((c) => c.activate(true));
						}
					};

					unsafe.localEmitter.once('asyncRenderChunkComplete', handler, {
						label: $$.renderFilter
					});

				} else {
					const
						pageComponentFromCache = pageElFromCache.component;

					if (pageComponentFromCache != null) {
						pageComponentFromCache.activate();

						unsafe.async.requestAnimationFrame(() => {
							restorePageElementsScroll(pageElFromCache);
						}, {label: $$.restorePageElementsScroll});

						unsafe.$el?.append(pageElFromCache);
						pageComponentFromCache.emit('mounted', pageElFromCache);

						componentRef?.push(pageComponentFromCache);
						unsafe.pageTakenFromCache = true;

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

	protected override initBaseAPI(): void {
		super.initBaseAPI();
		this.addClearListenersToCache = this.instance.addClearListenersToCache.bind(this);
	}

	/**
	 * Wraps the specified cache object and returns a wrapper.
	 * The method adds listeners to destroy unused pages from the cache.
	 *
	 * @param cache
	 */
	protected addClearListenersToCache<T extends AbstractCache<iDynamicPageEl>>(cache: T): T {
		const
			wrappedCache = addEmitter<AbstractCache<iDynamicPageEl>>(cache);

		let
			instanceCache: WeakMap<iDynamicPageEl, number> = new WeakMap();

		wrappedCache.subscribe('set', cache, changeCountInMap(0, 1));
		wrappedCache.subscribe('remove', cache, changeCountInMap(1, -1));

		wrappedCache.subscribe('remove', cache, ({result}) => {
			if (result == null || (instanceCache.get(result) ?? 0) > 0) {
				return;
			}

			result.component?.unsafe.$destroy();
		});

		wrappedCache.subscribe('clear', cache, ({result}) => {
			result.forEach((el) => el.component?.unsafe.$destroy());
			instanceCache = new WeakMap();
		});

		return cache;

		function changeCountInMap(def: number, delta: number): AnyFunction {
			return ({result}: {result: CanUndef<iDynamicPageEl>}) => {
				if (result == null) {
					return;
				}

				const count = instanceCache.get(result) ?? def;
				instanceCache.set(result, count + delta);
			};
		}
	}

	/**
	 * Synchronization for the `emitter` prop
	 */
	@watch('emitter')
	@watch({path: 'event', immediate: true})
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
					newPageInfo = e;

				if (Object.isTruly(this.eventConverter)) {
					newPageInfo = Array.concat([], this.eventConverter)
						.reduce((res, fn) => fn.call(this, res, this.page), newPageInfo);
				}

				const [newPageComponent, newPageKey = newPageComponent] = newPageInfo;

				if (newPageInfo == null || Object.isString(newPageInfo) || newPageKey !== this.page?.[1]) {
					this.page = newPageInfo;
				}

			}, group);
		}
	}

	/**
	 * Synchronization for the `page` field
	 */
	@watch({path: 'page', immediate: true})
	protected syncPageWatcher(newPageInfo: CanUndef<PageInfo>, oldPageInfo: CanUndef<PageInfo>): void {
		if (this.onPageChange == null) {
			const
				label = {label: $$.syncPageWatcher};

			this.watch('onPageChange', {...label, immediate: true}, () => {
				if (this.onPageChange == null) {
					return;
				}

				this.onPageChange(newPageInfo, oldPageInfo);
				this.async.terminateWorker(label);
			});

		} else {
			this.onPageChange(newPageInfo, oldPageInfo);
		}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('hidden', 'page', (v) => !Object.isTruly(v));
	}
}
