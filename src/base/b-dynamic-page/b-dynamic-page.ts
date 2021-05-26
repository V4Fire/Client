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
	KeepAliveStrategy,
	iDynamicPageEl,
	UnsafeBDynamicPage

} from 'base/b-dynamic-page/interface';

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
				currentPage = this.page,
				currentRoute = this.route;

			this.watch('page', {immediate: true, label: $$.keepAliveFilter}, (newPage) => {
				if (currentPage === newPage) {
					return;
				}

				const
					componentRef = this.$refs.component;

				const
					currentComponentEl = this.block?.element<iDynamicPageEl>('component'),
					currentComponent = currentComponentEl?.component?.unsafe;

				if (currentComponentEl != null && currentComponent != null) {
					const
						currentPageStrategy = this.getKeepAliveStrategy(currentPage, currentRoute);

					if (currentPageStrategy.add(currentComponentEl) === currentComponentEl) {
						currentComponent.deactivate();

					} else {
						currentComponent.$destroy();
					}

					currentComponentEl.remove();
				}

				if (Object.isArray(componentRef)) {
					componentRef.pop();
				}

				const
					newPageStrategy = this.getKeepAliveStrategy(newPage),
					componentFromCache = newPageStrategy.get();

				if (componentFromCache != null) {
					if (Object.isArray(componentRef)) {
						const
							c = componentFromCache.component;

						if (c != null) {
							this.$el?.append(componentFromCache);

							c.activate();
							componentRef.push(c);

						} else {
							newPageStrategy.remove();
						}
					}
				}

				r(true);
			});
		});
	}

	/**
	 * Returns a `keepAlive` cache strategy for the specified page
	 *
	 * @param page
	 * @param [route] - link to an application route object
	 */
	protected getKeepAliveStrategy(page: CanUndef<string>, route: this['route'] = this.route): KeepAliveStrategy {
		const loopbackStrategy = {
			has: () => false,
			get: () => undefined,
			add: (page) => page,
			remove: () => undefined
		};

		if (page == null) {
			return loopbackStrategy;
		}

		const
			{exclude, include} = this;

		if (exclude != null) {
			if (Object.isFunction(exclude)) {
				if (Object.isTruly(exclude(page, route))) {
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
			has: () => globalCache.has(cacheKey),
			get: () => globalCache.get(cacheKey),
			add: (page) => globalCache.set(cacheKey, page),
			remove: () => globalCache.remove(cacheKey)
		};

		if (include != null) {
			if (Object.isFunction(include)) {
				const
					res = include(page, route);

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
		addEmitter(cache).subscribe('remove', cache, ({result}) => {
			result?.component?.unsafe.$destroy();
		});

		addEmitter(cache).subscribe('clear', cache, ({result}) => {
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
