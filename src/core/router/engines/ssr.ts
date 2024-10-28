/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This package provides a router engine to use with SSR
 * @packageDescription
 */

import SyncPromise from 'core/promise/sync';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { fromQueryString, toQueryString } from 'core/url';
import type { Route, Router } from 'core/router';

import type bRouter from 'components/base/b-router/b-router';

/**
 * Creates an SSR engine for `bRouter` component
 * @param routerCtx
 */
export default function createRouter(routerCtx: bRouter): Router {
	const emitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false
	});

	const
		historyLog: Route[] = new Array(1);

	return Object.mixin<Router>({withDescriptors: 'onlyAccessors'}, Object.create(emitter), {
		get route(): CanUndef<Route> {
			return historyLog[0];
		},

		get history(): Route[] {
			return historyLog.filter(Object.isTruly);
		},

		id(page: string): string {
			return page;
		},

		push: load,
		replace: load,

		go(): void {
			// Loopback
		},

		forward(): void {
			// Loopback
		},

		back(): void {
			// Loopback
		},

		clear(): Promise<void> {
			return SyncPromise.resolve();
		},

		clearTmp(): Promise<void> {
			return SyncPromise.resolve();
		}
	});

	function load(route: string, params?: Route): Promise<void> {
		if (!Object.isTruly(route)) {
			throw new ReferenceError('The page to load is not specified');
		}

		const qsRgxp = /\?.*?(?=#|$)/;
		route = route.replace(/[#?]\s*$/, '');

		return new SyncPromise((resolve, reject) => {
			if (params == null) {
				reject();
				return;
			}

			params.query = Object.assign(parseQuery(route, true), params.query);

			let
				qs = toQueryString(params.query);

			if (qs !== '') {
				qs = `?${qs}`;

				if (RegExp.test(qsRgxp, route)) {
					route = route.replace(qsRgxp, qs);

				} else {
					route += qs;
				}
			}

			const
				{load} = params.meta;

			if (load == null) {
				resolve();
				return;
			}

			historyLog[0] = params;
			SyncPromise.resolve(load(routerCtx)).then(() => resolve()).catch(stderr);

			/**
			 * Parses parameters from a query string
			 *
			 * @param qs
			 * @param test
			 */
			function parseQuery(qs: string, test?: boolean) {
				if (test && !RegExp.test(qsRgxp, qs)) {
					return {};
				}

				return fromQueryString(qs);
			}
		});
	}
}
