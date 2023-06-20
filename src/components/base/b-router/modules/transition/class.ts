/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as router from 'core/router';
import type { Router } from 'core/router/interface';

import { fillRouteParams } from 'components/base/b-router/modules/normalizers';
import type bRouter from 'components/base/b-router/b-router';

import ScrollControl from 'components/base/b-router/modules/transition/scroll-control';
import type { TransitionContext } from 'components/base/b-router/modules/transition/interface';

export default class Transition {
	/**
	 * Instance of the `bRouter` component
	 */
	readonly component: bRouter;

	/**
	 * Engine's current route
	 */
	readonly currentEngineRoute: Router['route'];

	/**
	 * The route name or URL or `null`, if the route is equal to the previous
	 */
	protected ref: TransitionContext['ref'];

	/**
	 * The transition method
	 */
	protected method: TransitionContext['method'];

	/**
	 * Normalized transition options
	 */
	protected opts: Exclude<TransitionContext['opts'], undefined>;

	/**
	 * Scroll control
	 */
	protected scroll: ScrollControl;

	/**
	 * New route info store
	 */
	private newRouteInfoStore: CanUndef<router.RouteAPI>;

	/**
	 * Flag which determines if new route info was initialized
	 */
	private newRouteInfoInitialized: boolean = false;

	/**
	 * @param component - instance of the `bRouter` component
	 * @param ctx - transition context
	 */
	constructor(component: bRouter, {ref, method, opts}: TransitionContext) {
		this.component = component;
		this.currentEngineRoute = this.engine.route;

		// Transition context
		this.ref = ref;
		this.method = method;
		this.opts = router.getBlankRouteFrom(router.normalizeTransitionOpts(opts));

		// Additional API
		this.scroll = new ScrollControl(this);
	}

	/**
	 * Returns the engine of the `bRouter` component
	 */
	get engine(): Router {
		return this.component.unsafe.engine;
	}

	/**
	 * Returns information about the route we are transitioning to
	 */
	get newRouteInfo(): CanUndef<router.RouteAPI> {
		if (!this.newRouteInfoInitialized) {
			throw new Error('New router info is not initialized');
		}

		return this.newRouteInfoStore;
	}

	/**
	 * Returns the transition ref
	 */
	getRef(): TransitionContext['ref'] {
		return this.ref;
	}

	/**
	 * Returns the transition method
	 */
	getMethod(): TransitionContext['method'] {
		return this.method;
	}

	/**
	 * Returns the current engine route URL or its name
	 */
	getEngineRoute(): CanUndef<string> {
		const {currentEngineRoute} = this;

		if (!currentEngineRoute) {
			return undefined;
		}

		return currentEngineRoute.url ?? router.getRouteName(currentEngineRoute);
	}

	/**
	 * Performs a transition to the specified route, emits transition events
	 * and restores user's scroll position if needed.
	 *
	 * @emits `beforeChange(route: Nullable<string>, params:` [[TransitionOptions]]`, method:` [[TransitionMethod]]`)`
	 *
	 * @emits `change(route:` [[Route]]`)`
	 * @emits `hardChange(route:` [[Route]]`)`
	 * @emits `softChange(route:` [[Route]]`)`
	 *
	 * @emits `transition(route:` [[Route]]`, type:` [[TransitionType]]`)`
	 * @emits `$root.transition(route:` [[Route]]`, type:` [[TransitionType]]`)`
	 */
	async execute(): Promise<CanUndef<router.Route>> {
		const
			{component} = this,
			{engine} = component.unsafe;

		component.emit('beforeChange', this.ref, this.opts, this.method);

		this.initNewRouteInfo();

		this.scroll.createSnapshot();

		await this.scroll.updateCurrentRouteScroll();

		// We didn't find any route matching the given ref
		if (this.newRouteInfo == null) {
			// The transition was user-generated, then we need to save the scroll
			if (this.method !== 'event' && this.ref != null) {
				await engine[this.method](this.ref, this.scroll.getSnapshot());
			}

			return;
		}

		this.fillNewRouteInfo();

		// We have two variants of transitions:
		// "soft" - only query parameters or meta changed between routes
		// "hard" - the first and second routes do not match in name

		// Query and route meta-parameter mutations should not cause components to re-render,
		// so we put it in a prototype object with `Object.create`

		const {newRouteInfo} = this;

		const nonWatchRouteValues = {
			url: newRouteInfo.resolvePath(newRouteInfo.params),
			query: newRouteInfo.query,
			meta: newRouteInfo.meta
		};

		const newRoute: router.RouteAPI = Object.assign(
			Object.create(nonWatchRouteValues),
			Object.reject(router.convertRouteToPlainObject(newRouteInfo), Object.keys(nonWatchRouteValues))
		);

		const result = await this.performTransition(newRoute, nonWatchRouteValues);

		if (result == null) {
			return;
		}

		this.scroll.restore(result.hardChange);

		return newRoute;
	}

	/**
	 * Performs the transition and emits required events
	 *
	 * @param newRoute
	 * @param nonWatchRouteValues
	 */
	protected async performTransition(
		newRoute: router.RouteAPI,
		nonWatchRouteValues: Pick<router.Route, 'url' | 'query' | 'meta'>
	): Promise<CanUndef<{hardChange:boolean}>> {
		let hardChange = false;

		const
			{component, engine, opts, newRouteInfo} = this,
			{r} = component.unsafe,
			currentRoute = component.field.get<router.Route>('routeStore');

		const emitTransition = (onlyOwnTransition?: boolean) => {
			const type = hardChange ? 'hard' : 'soft';

			if (onlyOwnTransition) {
				component.emit('transition', newRoute, type);

			} else {
				component.emit('change', newRoute);
				component.emit('transition', newRoute, type);
				r.emit('transition', newRoute, type);
			}
		};

		// Checking that the new route is really needed, i.e. not equal to the previous one
		let newRouteIsReallyNeeded = !Object.fastCompare(
			router.getComparableRouteParams(currentRoute),
			router.getComparableRouteParams(newRoute)
		);

		// Main route params didn't change, but there is a metaobject, which could have changed
		if (!newRouteIsReallyNeeded && currentRoute != null && opts.meta != null) {
			newRouteIsReallyNeeded = !Object.fastCompare(
				Object.select(currentRoute.meta, opts.meta),
				opts.meta
			);
		}

		// The transition is necessary, but now we need to understand whether we should emit a "soft" or "hard" transition
		if (newRouteIsReallyNeeded) {
			component.field.set('routeStore', newRoute);

			const
				plainInfo = router.convertRouteToPlainObject(newRouteInfo);

			const canRouteTransformToReplace =
				currentRoute &&
				this.method !== 'replace' &&
				Object.fastCompare(router.convertRouteToPlainObject(currentRoute), plainInfo);

			if (canRouteTransformToReplace) {
				this.method = 'replace';
			}

			// If the engine being used does not support the requested transition method, we must use `replace`
			if (!Object.isFunction(engine[this.method])) {
				this.method = 'replace';
			}

			// This transition is marked as "external", i.e. refers to another site
			if (newRouteInfo!.meta.external) {
				const {url} = newRoute;
				location.href = url != null && url !== '' ? url : '/';
				return;
			}

			await engine[this.method](newRoute.url, plainInfo).then(() => {
				const isSoftTransition = Boolean(r.route && Object.fastCompare(
					router.convertRouteToPlainObjectWithoutProto(currentRoute),
					router.convertRouteToPlainObjectWithoutProto(newRoute)
				));

				// Only the properties from the prototype have been changed in this transition,
				// so it can be done as a soft transition, i.e. without forcing re-rendering of components.
				if (isSoftTransition) {
					component.emit('softChange', newRoute);

					// We get a prototype by using the `__proto__` property,
					// because `Object.getPrototypeOf` returns a non-watchable object.

					const
						proto = r.route?.__proto__;

					if (Object.isDictionary(proto)) {
						Object.keys(nonWatchRouteValues).forEach((key) => {
							proto[key] = nonWatchRouteValues[key];
						});
					}

				} else {
					hardChange = true;
					component.emit('hardChange', newRoute);
					r.route = newRoute;
				}

				emitTransition();
			});

		// This route is similar to the previous one, and we don't actually make the transition,
		// but for the `push` request, we still need to fire the "fake" transition event
		} else if (this.method === 'push') {
			emitTransition();

		// In this case, we don't do transition, but we still need to fire a special event because some methods,
		// such as `back' or `forward', may be waiting for it
		} else {
			emitTransition(true);
		}

		return {hardChange};
	}

	/**
	 * Initializes information about the route we are transitioning to
	 * @throws an exception if the info already initialized
	 */
	protected initNewRouteInfo(): void {
		if (this.newRouteInfoInitialized) {
			throw new Error('New route info is already initialized');
		}

		this.newRouteInfoInitialized = true;

		// Get information about the specified route
		if (this.ref != null) {
			this.newRouteInfoStore = this.component.getRoute(this.engine.id(this.ref));

		// In this case, we don't have a ref specified,
		// so we're trying to get the information from the current route
		// and use it as a blueprint to the new one
		} else if (this.currentEngineRoute) {
			this.ref = this.getEngineRoute()!;

			const route = this.component.getRoute(this.ref);

			if (route) {
				this.newRouteInfoStore = Object.mixin(true, route, router.purifyRoute(this.currentEngineRoute));
			}
		}
	}

	/**
	 * Fills the new route info with additional options
	 */
	protected fillNewRouteInfo(): void {
		const currentRoute = this.component.field.get<router.Route>('routeStore');

		const deepMixin = (...args) => Object.mixin(
			{
				deep: true,
				skipUndefs: false,
				extendFilter: (el) => !Object.isArray(el)
			},
			...args
		);

		// Set the name for the new route info if none is specified
		if ((<router.PurifiedRoute<router.RouteAPI>>this.newRouteInfo).name == null) {
			const name = router.getRouteName(this.currentEngineRoute);

			if (name != null) {
				this.newRouteInfo!.name = name;
			}
		}

		// If the new route has the same name as the current one,
		// we need to mix the new state with the current one
		if (router.getRouteName(currentRoute) === this.newRouteInfo!.name) {
			deepMixin(this.newRouteInfo, router.getBlankRouteFrom(currentRoute), this.opts);

		} else {
			deepMixin(this.newRouteInfo, this.opts);
		}

		// If the route supports padding from the root object or query parameters
		fillRouteParams(this.newRouteInfo!, this.component);
	}
}
