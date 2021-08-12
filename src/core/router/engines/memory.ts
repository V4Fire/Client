import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import logger from 'core/log';
import { deprecate } from 'core/functools/deprecation';
import {

	Route,
	Router,
	TransitionParams,
	HistoryClearFilter,
	getRoute

} from 'core/router';

import type bRouter from 'base/b-router/b-router';

const
	log = logger.namespace('inMemoryRouter');

export let
	history: Route[] = [];

/**
 * Возвращает драйвер для in-memory роутера
 * @param ctx
 */
export default function createRouter(ctx: bRouter): Router {
	const
		emitter = new EventEmitter({maxListeners: 1e3, newListener: false});

	function clear(filterFn?: HistoryClearFilter): Promise<void> {
		return new Promise((resolve) => {
			history = filterFn != null ? history.filter((item) => !Object.isTruly(filterFn(item))) : [];

			if (history.length === 0) {
				ctx.field.set('routeStore', undefined);
				ctx.r.route = undefined;
			}

			resolve();
		});
	}

	return Object.mixin<Router>({withAccessors: true}, Object.create(emitter), <Router>{
		get route(): CanUndef<Route> {
			if (history.length > 0) {
				return history[history.length - 1];
			}

			return undefined;
		},

		get page(): CanUndef<Route> {
			deprecate({name: 'page', type: 'accessor', renamedTo: 'route'});
			return this.route;
		},

		get history(): Route[] {
			return history.slice();
		},

		id(page: string): string {
			return page;
		},

		push(route: string, params?: TransitionParams): Promise<void> {
			const
				newRoute = getRoute(route, ctx.routes);

			if (newRoute == null) {
				return Promise.reject();
			}

			Object.mixin(true, newRoute, params);

			history.push(newRoute);
			return Promise.resolve();
		},

		replace(route: string, params?: TransitionParams): Promise<void> {
			const
				newRoute = getRoute(route, ctx.routes);

			if (newRoute == null) {
				return Promise.reject();
			}

			Object.mixin(true, newRoute, params);

			if (history.length === 0) {
				history.push(newRoute);

			} else {
				history[history.length - 1] = newRoute;
			}

			return Promise.resolve();
		},

		go(pos: number): void {
			const
				index = history.length < pos ? 0 : history.length - pos;

			history.splice(index);
		},

		forward(): void {
			// TODO:
			log.warn('forward', 'Router forward is not implemented');
			return undefined;
		},

		back(): void {
			if (history.length === 1) {
				return;
			}

			history.pop();

			const
				route = history[history.length - 1];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (route != null) {
				ctx.emitTransition(route.name, route, 'event').catch(stderr);
			}
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
