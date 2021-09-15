/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This package provides a router engine that stores its state completely in memory
 * @packageDescription
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { deprecate } from 'core/functools/deprecation';
import {

	Route,
	Router,
	TransitionParams,
	HistoryClearFilter,
	getRoute

} from 'core/router';

import type bRouter from 'base/b-router/b-router';

export let
	historyLog: Route[] = [],
	historyLogPointer: CanUndef<number> = undefined;

/**
 * Creates an in-memory engine for `bRouter` component
 * @param ctx
 */
export default function createRouter(ctx: bRouter): Router {
	const
		emitter = new EventEmitter({maxListeners: 1e3, newListener: false});

	const clear = (filterFn?: HistoryClearFilter): Promise<void> => new Promise((resolve) => {
		if (filterFn == null) {
			historyLog = [];
			historyLogPointer = undefined;

		} else {
			const
				filter = (log: Route[]): Route[] => log.filter((item) => !Object.isTruly(filterFn(item)));

			if (historyLogPointer === undefined) {
				historyLog = filter(historyLog);

			} else {
				const
					backHistoryLog = filter(historyLog.slice(0, historyLogPointer + 1)),
					forwardHistoryLog = filter(historyLog.slice(historyLogPointer + 1));

				historyLogPointer = backHistoryLog.length === 0 ? undefined : backHistoryLog.length - 1;
				historyLog = backHistoryLog.concat(forwardHistoryLog);
			}
		}

		if (historyLogPointer === undefined) {
			ctx.field.set('routeStore', undefined);
			ctx.r.route = undefined;
		}

		resolve();
	});

	const go = (delta: number) => {
		const
			newHistoryLogPointer = (historyLogPointer ?? -1) + delta;

		if (newHistoryLogPointer < -1 || newHistoryLogPointer > historyLog.length - 1) {
			return;
		}

		historyLogPointer = newHistoryLogPointer === -1 ? undefined : newHistoryLogPointer;

		if (historyLogPointer !== undefined) {
			const
				route = historyLog[historyLogPointer];

			ctx.emitTransition(route.name, route, 'event').catch(stderr);

		} else {
			ctx.field.set('routeStore', undefined);
			ctx.r.route = undefined;
		}
	};

	return Object.mixin<Router>({withAccessors: true}, Object.create(emitter), <Router>{
		get route(): CanUndef<Route> {
			if (historyLogPointer !== undefined) {
				return historyLog[historyLogPointer];
			}

			return undefined;
		},

		get page(): CanUndef<Route> {
			deprecate({name: 'page', type: 'accessor', renamedTo: 'route'});
			return this.route;
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
				newRoute = getRoute(route, ctx.routes, {defaultRoute: ctx.defaultRoute});

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

			return Promise.resolve();
		},

		replace(route: string, params?: TransitionParams): Promise<void> {
			let
				newRoute = getRoute(route, ctx.routes, {defaultRoute: ctx.defaultRoute});

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

			return Promise.resolve();
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
			return clear(
				(route) => Object.isTruly(route.params.tmp) || Object.isTruly(route.query.tmp) || Object.isTruly(route.meta.tmp)
			);
		}
	});
}
