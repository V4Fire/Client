/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This package provides a router based on the HTML history API with support for loading entry points dynamically
 * @packageDescription
 */

import symbolGenerator from 'core/symbol';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { session } from 'core/kv-storage';
import { fromQueryString, toQueryString } from 'core/url';

import * as browser from 'core/browser';
import type bRouter from 'components/base/b-router/b-router';

import type { Router, Route, HistoryClearFilter } from 'core/router/interface';

const
	$$ = symbolGenerator();

const isIFrame = (() => {
	try {
		return location !== parent.location;

	} catch {
		return false;
	}
})();

/**
 * This code is required to fix a bug in the History API router engine where returning to the first element in history
 * does not fire a popstate event in Safari when the script is executed within an iframe
 *
 * @see https://github.com/V4Fire/Client/issues/717
 */
if (isIFrame && (browser.is.Safari !== false || browser.is.iOS !== false)) {
	history.pushState({}, '', location.href);
}

/**
 * This flag is needed to get rid of redundant router transitions when restoring a page from BFCache in safari
 * @see https://github.com/V4Fire/Client/issues/552
 */
let isOpenedFromBFCache = false;

// The code below is a shim of native logic of the route history:
// it's used the session storage API to clone native history, and some hacks to clean up the history.
// The way to clear the history is based on the mechanics of when we return to the previous route of the route we want
// to clear and after the router emit a new transition to erase the all upcoming routes.
// After that, we need to restore some routes that were unnecessarily dropped from the history,
// so we need a history clone.

let
	historyLogPointer = 0,
	isHistoryInit = false;

type HistoryLog = Array<{
	route: string;
	params: Route;
}>;

const
	historyLog = <HistoryLog>[],
	historyStorage = session.namespace('[[BROWSER_HISTORY]]');

/**
 * Truncates the history clone log to the actual history size
 */
function truncateHistoryLog(): void {
	if (historyLog.length <= history.length) {
		return;
	}

	if (historyLogPointer >= history.length) {
		historyLogPointer = history.length - 1;
		saveHistoryPos();
	}

	historyLog.splice(history.length);
	saveHistoryLog();
}

/**
 * Saves the history log in session storage
 */
function saveHistoryLog(): void {
	try {
		historyStorage.set('log', historyLog);
	} catch {}
}

/**
 * Saves the active position of the history in the session store
 */
function saveHistoryPos(): void {
	try {
		historyStorage.set('pos', historyLogPointer);
	} catch {}
}

// Try loading the history log from session storage
try {
	historyLogPointer = historyStorage.get('pos') ?? 0;

	(<HistoryLog>historyStorage.get('log')).forEach((el) => {
		if (Object.isPlainObject(el)) {
			historyLog.push(el);
		}
	});

	truncateHistoryLog();
} catch {}

/**
 * Creates an engine (browser history api) for the `bRouter` component
 * @param routerCtx
 */
export default function createRouter(routerCtx: bRouter): Router {
	const
		{async: $a} = routerCtx;

	const
		engineGroup = {group: 'routerEngine'},
		popstateLabel = {...engineGroup, label: $$.popstate},
		pageshowLabel = {...engineGroup, label: $$.pageshow},
		modHistoryLabel = {...engineGroup, label: $$.modHistory};

	$a
		.clearAll(engineGroup);

	const emitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false
	});

	let currentLocation;
	saveLocation();

	const router = Object.mixin({withDescriptors: 'onlyAccessors'}, Object.create(emitter), {
		get route(): CanUndef<Route> {
			const
				url = this.id(location.href);

			return {
				name: url,
				query: fromQueryString(location.search),
				...history.state,
				url
			};
		},

		get history(): Route[] {
			const
				list = <Route[]>[];

			for (let i = 0; i < historyLog.length; i++) {
				list.push(historyLog[i].params);
			}

			return list;
		},

		id(route: string): string {
			try {
				return new URL(route).pathname;

			} catch {
				return route;
			}
		},

		push(route: string, params?: Route): Promise<void> {
			return load(route, params);
		},

		replace(route: string, params?: Route): Promise<void> {
			return load(route, params, 'replaceState');
		},

		go(pos: number): void {
			history.go(pos);
		},

		forward(): void {
			history.forward();
		},

		back(): void {
			history.back();
		},

		async clear(filter?: HistoryClearFilter): Promise<void> {
			$a.muteEventListener(popstateLabel);
			truncateHistoryLog();

			const
				cutIntervals: number[][] = [[]];

			let
				lastEnd = 0;

			for (let i = 0; i < historyLog.length; i++) {
				const
					interval = cutIntervals[cutIntervals.length - 1];

				if (i > 0 && (!filter || Object.isTruly(filter(historyLog[i].params)))) {
					if (interval.length === 0) {
						interval.push(i > 0 ? i : 1);
					}

				} else {
					if (lastEnd === 0) {
						lastEnd = i;
					}

					if (interval.length > 0) {
						interval.push(i);
						cutIntervals.push([]);
					}
				}
			}

			const
				last = cutIntervals[cutIntervals.length - 1];

			switch (last.length) {
				case 0:
					cutIntervals.pop();
					break;

				case 1:
					last.push(lastEnd);
					break;

				default:
					// Loopback
			}

			if (cutIntervals.length === 0) {
				return;
			}

			for (let i = cutIntervals.length; i-- > 0;) {
				const
					el = cutIntervals[i];

				const
					from = el[0],
					to = historyLog[el[1]];

				if (from <= historyLogPointer) {
					history.go(from - historyLogPointer - 1);
				}

				await $a.promisifyOnce(globalThis, 'popstate', modHistoryLabel);

				historyLog.splice(from);
				historyLog.push(to);

				history.pushState(
					to.params,
					to.params.name,
					to.route
				);

				saveHistoryLog();

				// eslint-disable-next-line require-atomic-updates
				historyLogPointer = historyLog.length - 1;
				saveHistoryPos();

				await $a.nextTick();
			}

			$a.unmuteEventListener(popstateLabel);
			truncateHistoryLog();

			const
				lastPos = historyLogPointer - cutIntervals[0][0];

			if (lastPos > 0) {
				history.go(lastPos);
				await $a.promisifyOnce(globalThis, 'popstate', modHistoryLabel);

				// eslint-disable-next-line require-atomic-updates
				historyLogPointer = lastPos;
				saveHistoryPos();
			}
		},

		clearTmp(): Promise<void> {
			return this.clear((el) => {
				if (!Object.isPlainObject(el)) {
					return false;
				}

				return Object.isTruly(el.params?.tmp) || Object.isTruly(el.query?.tmp) || Object.isTruly(el.meta?.tmp);
			});
		}
	});

	$a.on(globalThis, 'popstate', async () => {
		const prevLocation = currentLocation;
		saveLocation();

		if (browser.is.iOS !== false && isOpenedFromBFCache) {
			isOpenedFromBFCache = false;
			return;
		}

		if (onlyHashChange(prevLocation, currentLocation)) {
			return;
		}

		truncateHistoryLog();

		const
			routeId = Object.get(history, 'state._id');

		if (routeId != null) {
			try {
				for (let i = 0; i < historyLog.length; i++) {
					if (Object.get(historyLog[i], 'params._id') === routeId) {
						historyLogPointer = i;
						saveHistoryPos();
						break;
					}
				}

			} catch (err) {
				stderr(err);
			}
		}

		await routerCtx.emitTransition(location.href, history.state, 'event');
	}, popstateLabel);

	$a.on(globalThis, 'pageshow', (event: PageTransitionEvent) => {
		if (event.persisted) {
			isOpenedFromBFCache = true;
		}
	}, pageshowLabel);

	return router;

	function saveLocation() {
		currentLocation = new URL(location.href);
	}

	function onlyHashChange(location1: URL, location2: URL) {
		if (location1.hash !== '' || location2.hash !== '') {
			const
				hashRgxp = /#.*/;

			if (location1.href.replace(hashRgxp, '') === location2.href.replace(hashRgxp, '')) {
				return true;
			}
		}

		return false;
	}

	function load(route: string, params?: Route, method: string = 'pushState'): Promise<void> {
		params = Object.fastClone(params, {freezable: false});

		if (!Object.isTruly(route)) {
			throw new ReferenceError('The page to load is not specified');
		}

		const qsRgxp = /\?.*?(?=#|$)/;
		route = route.replace(/[#?]\s*$/, '');

		return new Promise((resolve) => {
			let
				syncMethod = method;

			if (params == null) {
				location.href = route;
				return;
			}

			// The route ID is needed to support the history clearing feature
			if (params._id == null) {
				params._id = Object.fastHash(Math.random());
			}

			if (method !== 'replaceState') {
				isHistoryInit = true;

			} else if (!isHistoryInit) {
				isHistoryInit = true;

				// Prevent the same route from being sent more than once:
				// this situation occurs when we reload the browser page
				if (historyLog.length > 0 && !Object.fastCompare(
					Object.reject(historyLog[historyLog.length - 1]?.params, '_id'),
					Object.reject(params, '_id')
				)) {
					syncMethod = 'pushState';
				}
			}

			if (historyLog.length === 0 || syncMethod === 'pushState') {
				historyLog.push({route, params});
				historyLogPointer = historyLog.length - 1;
				saveHistoryPos();

			} else {
				historyLog[historyLog.length - 1] = {route, params};
			}

			saveHistoryLog();
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

			if (location.href !== route) {
				params.url = route;

				// `params` can contain proxy objects,
				// to avoid DataCloneError we have to clone it with `Object.mixin({deep: true})`
				const filteredParams = Object.mixin({deep: true, filter: (el) => !Object.isFunction(el)}, {}, params);
				history[method](filteredParams, params.name, route);
				saveLocation();
			}

			const
				// eslint-disable-next-line @v4fire/unbound-method
				{load} = params.meta;

			if (load == null) {
				resolve();
				return;
			}

			Promise.resolve(load(routerCtx)).then(() => resolve()).catch(stderr);

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
