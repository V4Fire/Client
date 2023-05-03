/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import * as router from 'core/router';
import type { Router } from 'core/router/interface';

import type { TransitionMethod } from 'components/base/b-router/interface';
import { fillRouteParams } from 'components/base/b-router/modules/normalizers';
import type bRouter from 'components/base/b-router/b-router';

const $$ = symbolGenerator();

interface TransitionContext {
	ref: Nullable<string>;
	opts?: router.TransitionOptions;
	method: TransitionMethod;
}

export default class Transition {
	/**
	 * Instance of the b-router component
	 */
	protected component: bRouter;

	/**
	 * The route name or URL or `null`, if the route is equal to the previous
	 */
	protected ref: TransitionContext['ref'];

	/**
	 * The transition method
	 */
	protected method: TransitionContext['method'];

	/**
	 * Additional transition options
	 */
	protected opts: TransitionContext['opts'];

	/**
	 * Store engine's current route
	 */
	protected currentEngineRoute: Router['route'];

	/**
	 * User's scroll position. It is initialized after `beforeChange` event.
	 */
	protected scroll: CanUndef<{meta: {scroll: {x:number; y:number}}}>;

	/**
	 * New route info store
	 */
	private newRouteInfoStore: CanUndef<router.RouteAPI>;

	constructor(component: bRouter, {ref, method, opts}: TransitionContext) {
		this.component = component;
		this.ref = ref;
		this.method = method;
		this.opts = opts;
		this.currentEngineRoute = this.engine.route;
	}

	/**
	 * Returns engine of the b-router component
	 */
	get engine(): Router {
		return this.component.unsafe.engine;
	}

	/**
	 * Emits a new transition to the specified route
	 *
	 * @param ref - the route name or URL or `null`, if the route is equal to the previous
	 * @param [opts] - additional transition options
	 * @param [method] - the transition method
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
	async emit(): Promise<CanUndef<router.Route>> {
		const
			opts = router.getBlankRouteFrom(router.normalizeTransitionOpts(this.opts));

		const
			{component} = this,
			{r, engine} = component.unsafe;

		component.emit('beforeChange', this.ref, opts, this.method);

		const {newRouteInfo} = this;

		this.createScrollSnapshot();

		await this.updateCurrentRouteScroll();

		// We didn't find any route matching the given ref
		if (newRouteInfo == null) {
			// The transition was user-generated, then we need to save the scroll
			if (this.method !== 'event' && this.ref != null) {
				await engine[this.method](this.ref, this.scroll);
			}

			return;
		}

		this.setNameForRouteInfo(newRouteInfo);

		const
			currentRoute = component.field.get<router.Route>('routeStore');

		const deepMixin = (...args) => Object.mixin(
			{
				deep: true,
				skipUndefs: false,
				extendFilter: (el) => !Object.isArray(el)
			},
			...args
		);

		// If the new route has the same name as the current one,
		// we need to mix the new state with the current one
		if (router.getRouteName(currentRoute) === newRouteInfo.name) {
			deepMixin(newRouteInfo, router.getBlankRouteFrom(currentRoute), opts);

		} else {
			deepMixin(newRouteInfo, opts);
		}

		const {meta} = newRouteInfo;

		// If the route supports padding from the root object or query parameters
		fillRouteParams(newRouteInfo, this.component);

		// We have two variants of transitions:
		// "soft" - only query parameters or meta changed between routes
		// "hard" - the first and second routes do not match in name

		// Query and route meta-parameter mutations should not cause components to re-render,
		// so we put it in a prototype object with `Object.create`

		const nonWatchRouteValues = {
			url: newRouteInfo.resolvePath(newRouteInfo.params),
			query: newRouteInfo.query,
			meta
		};

		const newRoute: router.RouteAPI = Object.assign(
			Object.create(nonWatchRouteValues),
			Object.reject(router.convertRouteToPlainObject(newRouteInfo), Object.keys(nonWatchRouteValues))
		);

		let
			hardChange = false;

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

		// Nothing changes between routes, but there is a certain meta object
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
			if (newRouteInfo.meta.external) {
				const u = newRoute.url;
				location.href = u !== '' ? u : '/';
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

		this.restoreScroll(hardChange);

		return newRoute;
	}

	/**
	 * Stores user's scroll position for the specific time moment
	 */
	protected createScrollSnapshot(): void {
		if (this.scroll) {
			return;
		}

		this.scroll = {
			meta: {
				scroll: {
					x: typeof scrollX === 'undefined' ? 0 : scrollX,
					y: typeof scrollY === 'undefined' ? 0 : scrollY
				}
			}
		};
	}

	/**
	 * This method updates current route's scroll position.
	 * To save the scroll position before switching to a new route,
	 * we need to emit a system "replace" transition with additional information about the scroll.
	 */
	protected async updateCurrentRouteScroll(): Promise<void> {
		if (!SSR && this.currentEngineRoute && this.method !== 'replace') {
			const currentRouteWithScroll = Object.mixin(true, undefined, this.currentEngineRoute, this.scroll);

			if (!Object.fastCompare(this.currentEngineRoute, currentRouteWithScroll)) {
				await this.engine.replace(this.getEngineRoute()!, currentRouteWithScroll);
			}
		}
	}

	/**
	 * Restores scroll position after transition is completed
	 * @param hardChange
	 */
	protected restoreScroll(hardChange: boolean): void {
		const {meta} = this.newRouteInfo ?? {};

		if (SSR || !meta || meta.autoScroll === false) {
			return;
		}

		const {component} = this;

		(async () => {
			const label = {
				label: $$.autoScroll
			};

			const setScroll = () => {
				const
					s = meta.scroll;

				if (s != null) {
					component.r.scrollTo(s.x, s.y);

				} else if (hardChange) {
					component.r.scrollTo(0, 0);
				}
			};

			await component.nextTick(label);
			setScroll();

			// Restoring the scroll for dynamic height components
			await component.async.sleep(10, label);
			setScroll();
		})().catch(stderr);
	}

	/**
	 * Returns current engine route URL or name
	 */
	protected getEngineRoute(): CanUndef<string> {
		const {currentEngineRoute} = this;
		return currentEngineRoute ?
			(currentEngineRoute.url ?? router.getRouteName(currentEngineRoute)) :
			undefined;
	}

	/**
	 * Returns information about the route we are transitioning to.
	 */
	protected get newRouteInfo(): CanUndef<router.RouteAPI> {
		if (this.newRouteInfoStore == null) {
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

		return this.newRouteInfoStore;
	}

	/**
	 * Set's the name for the route info if none is specified
	 * @param newRouteInfo
	 */
	protected setNameForRouteInfo(newRouteInfo: router.RouteAPI): void {
		if ((<router.PurifiedRoute<router.RouteAPI>>newRouteInfo).name == null) {
			const name = router.getRouteName(this.currentEngineRoute);

			if (name != null) {
				newRouteInfo.name = name;
			}
		}
	}
}
