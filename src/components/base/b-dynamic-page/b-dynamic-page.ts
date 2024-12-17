/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-dynamic-page/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import addEmitter from 'core/cache/decorators/helpers/add-emitter';
import { Cache, RestrictedCache, AbstractCache } from 'core/cache';

import SyncPromise from 'core/promise/sync';
import type { EventEmitterLike } from 'core/async';

import Block, { element } from 'components/friends/block';
import AsyncRender, { iterate } from 'components/friends/async-render';

import iBlock from 'components/super/i-block/i-block';

import iDynamicPage, {

	component,

	prop,
	system,
	computed,
	watch,

	UnsafeGetter,
	ComponentStatus,
	InitLoadOptions

} from 'components/super/i-dynamic-page/i-dynamic-page';

import type {

	PageGetter,

	Include,
	Exclude,

	iDynamicPageEl,
	KeepAliveStrategy,
	UnsafeBDynamicPage

} from 'components/base/b-dynamic-page/interface';

import { restorePageElementsScroll, saveScrollIntoAttribute } from 'components/base/b-dynamic-page/helpers';

//#if runtime has dummyComponents
import('components/base/b-dynamic-page/test/b-scroll-element-dummy');
//#endif

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-dynamic-page/interface';

Block.addToPrototype({element});
AsyncRender.addToPrototype({iterate});

const $$ = symbolGenerator();

@component({inheritMods: false})
export default class bDynamicPage extends iDynamicPage {
	/**
	 * The initial name of the page to load
	 */
	@prop({type: String, required: false})
	readonly pageProp?: string;

	/**
	 * The name of the active page to load
	 * {@link bDynamicPage.pageProp}
	 */
	@system<bDynamicPage>((o) => o.sync.link((val) => {
		if (val != null) {
			return val;
		}

		const pageInfo = o.pageGetter(o.route, Object.cast(o));

		if (Object.isString(pageInfo)) {
			return pageInfo;
		}

		return pageInfo?.[0];
	}))

	page?: string;

	/**
	 * The active page unique key.
	 * It is used to determine whether to reuse the current page component
	 * or create a new one when switching between routes with the same page component.
	 */
	@system()
	pageKey?: CanUndef<string>;

	/**
	 * A function that takes a route object and returns the name of the page component to be loaded.
	 * Additionally, this function can return a tuple consisting of the component name and a unique key
	 * for the given route.
	 * The key will be used to determine whether to reuse the current page component
	 * or create a new one when switching between routes that use the same page component.
	 */
	@prop({
		type: Function,
		default: (route: bDynamicPage['route']) => route != null ? (route.meta.component ?? route.name) : undefined
	})

	readonly pageGetter!: PageGetter;

	/**
	 * If set to true, the previous pages will be cached under their own names,
	 * allowing them to be restored when revisited.
	 * This optimization helps improve page switching but may increase memory usage.
	 *
	 * Please note that when a page is switched, it will be deactivated through the `deactivate` function.
	 * Similarly, when the page is restored, it will be activated using the `activate` function.
	 */
	@prop(Boolean)
	readonly keepAlive: boolean = false;

	/**
	 * The maximum number of pages that can be stored in the global cache of `keepAlive`
	 */
	@prop(Number)
	readonly keepAliveSize: number = 10;

	/**
	 * A dictionary of `keepAlive` caches, where the keys represent cache groups (with the default being `global`)
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
	 * A predicate to determine which pages should be included in `keepAlive` caching.
	 * If not specified, all loaded pages will be cached.
	 *
	 * The predicate can be defined in three ways:
	 * 1. As a component name or a list of component names.
	 * 2. As a regular expression.
	 * 3. As a function that takes a component name and returns one of the following:
	 *    - `true` (to include the page in caching).
	 *    - `false` (to exclude the page from caching).
	 *    - A string key to be used for caching instead of the component name.
	 *    - A special object with information about the caching strategy being used.
	 */
	@prop({
		type: [String, Array, RegExp, Function],
		required: false
	})

	readonly include?: Include;

	/**
	 * A predicate to exclude certain pages from `keepAlive` caching can be defined in three ways:
	 * 1. As a component name or a list of component names.
	 * 2. As a regular expression.
	 * 3. As a function that takes a component name and returns `true` to exclude the page from caching,
	 *    or `false` to include the page in caching.
	 */
	@prop({
		type: [String, Array, RegExp, Function],
		required: false
	})

	readonly exclude?: Exclude;

	/**
	 * A link to an event emitter to listen for page switch events
	 */
	@prop({type: Object, required: false})
	readonly emitter?: EventEmitterLike;

	/**
	 * The page switching event name
	 */
	@prop({type: String, required: false})
	readonly event?: string = 'setRoute';

	/**
	 * A link to the loaded page component
	 */
	@computed({cache: false, dependencies: ['page']})
	get component(): CanPromise<iDynamicPage> {
		const
			that = this,
			componentRef = this.$refs.component;

		if (componentRef != null && (!Object.isArray(componentRef) || componentRef.length > 0)) {
			return getComponent();
		}

		return this.waitRef('component').then(getComponent);

		function getComponent() {
			const
				componentRef = that.$refs.component!;

			if (Object.isArray(componentRef)) {
				return componentRef[0];
			}

			return componentRef;
		}
	}

	override get unsafe(): UnsafeGetter<UnsafeBDynamicPage<this>> {
		return Object.cast(this);
	}

	protected override readonly componentStatusStore: ComponentStatus = 'ready';

	/** @inheritDoc */
	declare protected readonly $refs: iDynamicPage['$refs'] & {
		component?: iDynamicPage[];
	};

	/**
	 * True if the current page is taken from the cache
	 */
	@system()
	protected pageTakenFromCache: boolean = false;

	/**
	 * Handler: the page has been changed
	 */
	@system()
	protected onPageChange?: Function;

	/**
	 * The page rendering counter.
	 * Updated every time the component template is updated.
	 */
	@system()
	protected renderCounter: number = 0;

	/**
	 * Registered groups of asynchronous render tasks
	 */
	@system()
	protected renderGroups: Set<string> = new Set();

	/**
	 * The name of the current rendering group
	 */
	protected get currentRenderGroup(): string {
		return `pageRendering-${this.renderCounter}`;
	}

	/**
	 * The render loop iterator for `asyncRender`
	 */
	protected get renderIterator(): CanPromise<number> {
		if (SSR) {
			return 1;
		}

		if (HYDRATION) {
			return 99999;
		}

		return SyncPromise.resolve(Infinity);
	}

	/**
	 * True if the current page is successfully hydrated
	 */
	protected get hydrated(): boolean {
		return HYDRATION && $$.hydrated in this;
	}

	/**
	 * Sets the page hydration status
	 * @param complete
	 */
	protected set hydrated(complete: boolean) {
		if (HYDRATION) {
			this[$$.hydrated] = complete;
		}
	}

	override initLoad(): Promise<void> {
		if (SSR && this.page == null && this.event != null) {
			this.syncEmitterWatcher();
			this.$initializer = this.async.promisifyOnce(this.emitter ?? this.r, this.event);
		}

		return Promise.resolve();
	}

	/**
	 * Reloads the loaded page component
	 * @param [params]
	 */
	override async reload(params?: InitLoadOptions): Promise<void> {
		const component = await this.component;
		return component.reload(params);
	}

	/**
	 * Returns a dictionary of props for the page being created.
	 * The component interprets most of its input props as parameters for the page being created.
	 */
	protected getPageProps(): Dictionary {
		const
			props = {'@hook:destroyed': this.createPageDestructor()},
			passedProps = this.getPassedProps?.();

		if (passedProps != null) {
			const rejectedProps = {
				is: true,
				dispatching: true,
				componentIdProp: true,
				getRoot: true,
				getParent: true,
				getPassedProps: true
			};

			Object.entries(passedProps).forEach(([propName, prop]) => {
				if (rejectedProps.hasOwnProperty(propName) || this.meta.props.hasOwnProperty(propName)) {
					return;
				}

				if (propName.startsWith('on')) {
					propName = `@${propName[2].toLowerCase()}${propName.slice(3)}`;
				}

				props[propName] = prop;
			});
		}

		return props;
	}

	/**
	 * Registers a new group for asynchronous rendering and returns it
	 */
	protected registerRenderGroup(): string {
		this.renderCounter++;
		this.renderGroups.add(this.currentRenderGroup);
		return this.currentRenderGroup;
	}

	/**
	 * Creates a page destructor function
	 */
	protected createPageDestructor(): Function {
		const
			group = this.currentRenderGroup,
			groupRgxp = new RegExp(RegExp.escape(group));

		return () => {
			this.async.clearAll({group: groupRgxp});
			this.renderGroups.delete(group);
		};
	}

	/**
	 * The render loop filter for `asyncRender`
	 */
	protected renderFilter(): CanPromise<boolean> {
		const canPass =
			SSR ||
			HYDRATION && !this.hydrated ||
			this.lfc.isBeforeCreate();

		this.hydrated = true;

		if (canPass) {
			return true;
		}

		const that = this;

		const {route, r} = this;

		return new SyncPromise((resolve) => {
			this.onPageChange = onPageChange(resolve, this.route);
		});

		function onPageChange(
			resolve: (status: boolean) => void,
			currentRoute: typeof route
		): AnyFunction {
			return (newPage: CanUndef<string>, currentPage: CanUndef<string>) => {
				that.pageTakenFromCache = false;

				const componentRef = that.$refs[that.$resolveRef('component')];
				componentRef?.pop();

				const
					currentPageEl = that.block?.element<iDynamicPageEl>('component'),
					currentPageComponent = currentPageEl?.component?.unsafe;

				if (currentPageEl != null) {
					r.emit('beforeSwitchPage', {saveScroll: saveScrollIntoAttribute});

					if (currentPageComponent != null) {
						const currentPageStrategy = that.getKeepAliveStrategy(currentPage, currentRoute);

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
					newPageStrategy = that.getKeepAliveStrategy(newPage),
					pageElFromCache = newPageStrategy.get();

				if (pageElFromCache == null) {
					const handler = () => {
						if (!newPageStrategy.isLoopback) {
							return SyncPromise.resolve(that.component).then((c) => c.activate(true));
						}
					};

					that.localEmitter.once('asyncRenderChunkComplete', handler, {
						label: $$.renderFilter
					});

				} else {
					const pageComponentFromCache = pageElFromCache.component;

					if (pageComponentFromCache != null) {
						pageComponentFromCache.activate();

						that.async.requestAnimationFrame(() => {
							restorePageElementsScroll(pageElFromCache);
						}, {label: $$.restorePageElementsScroll});

						that.$el?.append(pageElFromCache);
						pageComponentFromCache.emit('mounted', pageElFromCache);

						componentRef?.push(pageComponentFromCache);
						that.pageTakenFromCache = true;

					} else {
						newPageStrategy.remove();
					}
				}

				// The `onPageChange` callback is created during the `renderFilter` call.
				// When this callback resolves, the asynchronous render starts rendering a new page
				// and proceeds to the next iteration by calling `renderFilter` again.
				// However, we can't guarantee that the next `renderFilter` call will occur before `syncPageWatcher`.
				// If `syncPageWatcher` is called before the next `renderFilter`, it will execute
				// the `onPageChange` callback, which is why we must clean it up here.
				that.onPageChange = undefined;

				resolve(newPage != null);
			};
		}
	}

	/**
	 * Returns the `keepAlive` caching strategy for the specified page
	 *
	 * @param page
	 * @param [route] - the application route object
	 */
	protected getKeepAliveStrategy(page: CanUndef<string>, route: this['route'] = this.route): KeepAliveStrategy {
		const loopbackStrategy: KeepAliveStrategy = {
			isLoopback: true,
			has: () => false,
			get: () => undefined,
			add: (page) => page,
			remove: () => undefined
		};

		if (!this.keepAlive || page == null) {
			return loopbackStrategy;
		}

		const {exclude, include} = this;

		if (exclude != null) {
			if (Object.isFunction(exclude)) {
				if (Object.isTruly(exclude(page, route, this))) {
					return loopbackStrategy;
				}

			} else if (Object.isRegExp(exclude) ? exclude.test(page) : Array.toArray(exclude).includes(page)) {
				return loopbackStrategy;
			}
		}

		let cacheKey = page;

		const globalCache = this.keepAliveCache.global!;

		const globalStrategy: KeepAliveStrategy = {
			isLoopback: false,
			has: () => globalCache.has(cacheKey),
			get: () => globalCache.get(cacheKey),
			add: (page) => globalCache.set(cacheKey, page),
			remove: () => globalCache.remove(cacheKey)
		};

		if (include != null) {
			if (Object.isFunction(include)) {
				const res = include(page, route, this);

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

			if (Object.isRegExp(include) ? !include.test(page) : !Array.toArray(include).includes(page)) {
				return loopbackStrategy;
			}
		}

		return globalStrategy;
	}

	/**
	 * Wraps the specified cache object and returns a wrapper.
	 * The method adds listeners to destroy unused pages from the cache.
	 *
	 * @param cache
	 */
	protected addClearListenersToCache<T extends AbstractCache<iDynamicPageEl>>(cache: T): T {
		const wrappedCache = addEmitter<AbstractCache<iDynamicPageEl>>(cache);

		let instanceCache: WeakMap<iDynamicPageEl, number> = new WeakMap();

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
		const {async: $a} = this;

		const group = {group: 'emitter'};
		$a.clearAll(group);

		if (this.event != null) {
			$a.on(this.emitter ?? this.r, this.event, (component, route) => {
				if (component != null && !((<Dictionary>component).instance instanceof iBlock)) {
					route = component;
				}

				const
					newPage = this.pageGetter(route, this),
					[newPageComponentName, newPageKey] = Object.isString(newPage) ? [newPage] : newPage ?? [];

				const
					pageChanged = newPageComponentName !== this.page,
					oldPageKey = this.pageKey;

				if (newPageComponentName == null || Object.isString(newPageComponentName)) {
					this.page = newPageComponentName;
					this.pageKey = newPageKey;

					if (!pageChanged && newPageKey !== oldPageKey) {
						this.syncPageWatcher(newPageComponentName, this.page);
					}
				}

			}, group);
		}
	}

	/**
	 * Synchronization for the `page` field
	 *
	 * @param page
	 * @param oldPage
	 */
	@watch({path: 'page', immediate: true, flush: 'sync'})
	protected syncPageWatcher(page: CanUndef<string>, oldPage: CanUndef<string>): void {
		if (HYDRATION && !this.hydrated) {
			const label = {
				label: $$.hydratePageWatcher
			};

			this.watch('onPageChange', {...label, immediate: true}, () => {
				if (this.hydrated) {
					this.onPageHydrated(page);
					this.async.terminateWorker(label);
				}
			});

			return;
		}

		if (this.onPageChange == null) {
			const label = {
				label: $$.syncPageWatcher
			};

			this.watch('onPageChange', {...label, immediate: true}, () => {
				if (this.onPageChange == null) {
					return;
				}

				this.onPageChange(page, oldPage);
				this.async.terminateWorker(label);
			});

		} else {
			this.onPageChange(page, oldPage);
		}
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();
		this.addClearListenersToCache = this.instance.addClearListenersToCache.bind(this);
	}

	protected override initModEvents(): void {
		super.initModEvents();

		if (!SSR) {
			this.async.setImmediate(() => {
				this.sync.mod('hidden', 'page', (v) => !Object.isTruly(v));
			});
		}
	}

	/**
	 * Handler: the page has been hydrated
	 * @param page
	 */
	protected onPageHydrated(page: CanUndef<string>): void {
		const
			pageEl = this.unsafe.block?.element<iDynamicPageEl>('component'),
			pageComponent = pageEl?.component?.unsafe,
			pageStrategy = this.unsafe.getKeepAliveStrategy(page, this.route);

		if (pageComponent != null && !pageStrategy.isLoopback) {
			pageComponent.activate(true);
		}
	}
}
