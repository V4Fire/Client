/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This package provides a router engine that stores its state entirely in memory
 * @packageDescription
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import {

	getRoute,

	Route,
	Router,

	RouteAPI,
	TransitionParams,
	HistoryClearFilter

} from 'core/router';

import type bRouter from 'components/base/b-router/b-router';

let
	historyLog: Route[] = [],
	historyLogPointer: CanUndef<number> = undefined;

/**
 * Returns the complete history log
 */
export function getHistory(): Route[] {
	return historyLog;
}

/**
 * Returns the position of the current history entry, or `undefined` if the history is empty
 */
export function getCurrentHistoryEntryPointer(): CanUndef<number> {
	return historyLogPointer;
}

/**
 * Creates an in-memory engine for the `bRouter` component
 * @param routerCtx
 */
export default function createRouter(routerCtx: bRouter): Router {
	const emitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false
	});

	return Object.mixin<Router>({withDescriptors: 'onlyAccessors'}, Object.create(emitter), {
		get route(): CanUndef<Route> {
			if (historyLogPointer !== undefined) {
				return historyLog[historyLogPointer];
			}

			return undefined;
		},

		get history(): Route[] {
			if (historyLogPointer === undefined) {
				return [];
			}

			return historyLog.slice(0, historyLogPointer + 1);
		},

		id(page: string): string {
			return page;
		},

		push(route: string, params?: TransitionParams): Promise<void> {
			let
				newRoute = getRoute(route, routerCtx.routes, {defaultRoute: routerCtx.defaultRoute});

			if (newRoute == null) {
				return Promise.reject();
			}

			newRoute = Object.mixin(true, {}, newRoute, params);

			if (historyLogPointer === undefined) {
				historyLog = [newRoute];
				historyLogPointer = 0;

			} else if (historyLogPointer === historyLog.length - 1) {
				historyLog.push(newRoute);
				historyLogPointer++;

			} else {
				historyLog = historyLog.slice(0, historyLogPointer + 1);
				historyLog.push(newRoute);
				historyLogPointer++;
			}

			return loadDeps(newRoute);
		},

		replace(route: string, params?: TransitionParams): Promise<void> {
			let
				newRoute = getRoute(route, routerCtx.routes, {defaultRoute: routerCtx.defaultRoute});

			if (newRoute == null) {
				return Promise.reject();
			}

			newRoute = Object.mixin(true, {}, newRoute, params);

			if (historyLogPointer === undefined) {
				historyLog = [newRoute];
				historyLogPointer = 0;

			} else {
				historyLog[historyLogPointer] = newRoute;
			}

			return loadDeps(newRoute);
		},

		go,

		forward(): void {
			return go(1);
		},

		back(): void {
			return go(-1);
		},

		clear(filterFn?: HistoryClearFilter): Promise<void> {
			return clear(filterFn);
		},

		clearTmp(): Promise<void> {
			return clear(filter);

			function filter(route: Route) {
				return Object.isTruly(route.params.tmp) || Object.isTruly(route.query.tmp) || Object.isTruly(route.meta.tmp);
			}
		}
	});

	function clear(filterFn?: HistoryClearFilter): Promise<void> {
		if (filterFn == null) {
			historyLog = [];
			historyLogPointer = undefined;

		} else {
			const
				filter = (log: Route[]): Route[] => log.filter((item) => !Object.isTruly(filterFn(item)));

			if (historyLogPointer == null) {
				historyLog = filter(historyLog);

			} else {
				const
					backHistoryLog = filter(historyLog.slice(0, historyLogPointer + 1)),
					forwardHistoryLog = filter(historyLog.slice(historyLogPointer + 1));

				historyLogPointer = backHistoryLog.length === 0 ? undefined : backHistoryLog.length - 1;
				historyLog = backHistoryLog.concat(forwardHistoryLog);
			}
		}

		if (historyLogPointer == null) {
			routerCtx.field.set('routeStore', undefined);
			routerCtx.r.route = undefined;
		}

		return Promise.resolve();
	}

	function go(delta: number): void {
		const
			newHistoryLogPointer = (historyLogPointer ?? -1) + delta;

		if (newHistoryLogPointer < -1 || newHistoryLogPointer > historyLog.length - 1) {
			return;
		}

		historyLogPointer = newHistoryLogPointer === -1 ? undefined : newHistoryLogPointer;

		if (historyLogPointer !== undefined) {
			const
				route = historyLog[historyLogPointer];

			routerCtx.emitTransition(route.name, route, 'event').catch(stderr);

		} else {
			routerCtx.field.set('routeStore', undefined);
			routerCtx.r.route = undefined;
		}
	}

	/**
	 * Loads dependencies of a given route
	 * @param route
	 */
	function loadDeps(route: RouteAPI): Promise<void> {
		const
			// eslint-disable-next-line @v4fire/unbound-method
			{load} = route.meta;

		if (load == null) {
			return Promise.resolve();
		}

		return Promise.resolve(load(routerCtx)).then(() => undefined).catch(stderr);
	}
}
