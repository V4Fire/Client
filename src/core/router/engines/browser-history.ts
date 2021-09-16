/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This package provides a router engined based on the HTML history API with support of dynamic loading of entry points
 * @packageDescription
 */

import symbolGenerator from 'core/symbol';
import { deprecate } from 'core/functools/deprecation';

import { session } from 'core/kv-storage';
import { fromQueryString, toQueryString } from 'core/url';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import * as browser from 'core/browser';

import type bRouter from 'base/b-router/b-router';
import type { Router, Route, HistoryClearFilter } from 'core/router/interface';

export const
	$$ = symbolGenerator();

/**
 * This flag is needed to get rid of a redundant router transition when restoring the page from bfcache in safari
 * @see https://github.com/V4Fire/Client/issues/552
 */
let isOpenedFromBfcache = false;

// The code below is a shim of "clear" logic of the route history:
// it's used the session storage API to clone native history ans some hacks to clear th history.
// The way to clear the history is base on the mechanics when we rewind to the previous route of the route we want
// to clear and after the router emit a new transition to erase the all the all upcoming routes.
// After this, we need to restore some routes, that were unnecessary dropped from the history,
// that why we need the history clone.

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
 * Truncates the the history clone log to the real history size
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
 * Saves the history log to the session storage
 */
function saveHistoryLog(): void {
	try {
		historyStorage.set('log', historyLog);
	} catch {}
}

/**
 * Saves the active position of a history to the session storage
 */
function saveHistoryPos(): void {
	try {
		historyStorage.set('pos', historyLogPointer);
	} catch {}
}

// Try to load history log from the session storage
try {
	historyLogPointer = historyStorage.get('pos') ?? 0;

	for (let o = <HistoryLog>historyStorage.get('log'), i = 0; i < o.length; i++) {
		const
			el = o[i];

		if (Object.isPlainObject(el)) {
			historyLog.push(el);
		}
	}

	truncateHistoryLog();
} catch {}

/**
 * Creates an engine (browser history api) for `bRouter` component
 * @param component
 */
export default function createRouter(component: bRouter): Router {
	const
		{async: $a} = component;

	const
		engineGroup = {group: 'routerEngine'},
		popstateLabel = {...engineGroup, label: $$.popstate},
		pageshowLabel = {...engineGroup, label: $$.pageshow},
		modHistoryLabel = {...engineGroup, label: $$.modHistory};

	$a
		.clearAll(engineGroup);

	function load(route: string, params?: Route, method: string = 'pushState'): Promise<void> {
		if (!Object.isTruly(route)) {
			throw new ReferenceError('A page to load is not specified');
		}

		// Remove some redundant characters
		route = route.replace(/[#?]\s*$/, '');

		return new Promise((resolve) => {
			let
				syncMethod = method;

			if (params == null) {
				location.href = route;
				return;
			}

			// The route identifier is needed to support the feature of the history clearing
			if (params._id == null) {
				params._id = Math.random().toString().slice(2);
			}

			if (method !== 'replaceState') {
				isHistoryInit = true;

			} else if (!isHistoryInit) {
				isHistoryInit = true;

				// Prevent pushing of one route more than one times:
				// this situation take a place when we reload the browser page
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

			const
				qsRgxp = /\?.*?(?=#|$)/;

			/**
			 * Parses parameters from the query string
			 *
			 * @param qs
			 * @param test
			 */
			const parseQuery = (qs: string, test?: boolean) => {
				if (test && !RegExp.test(qsRgxp, qs)) {
					return {};
				}

				return fromQueryString(qs);
			};

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

				// "params" can contain proxy objects,
				// to avoid DataCloneError we should clone it by using Object.mixin({deep: true})
				const filteredParams = Object.mixin({deep: true, filter: (el) => !Object.isFunction(el)}, {}, params);
				history[method](filteredParams, params.name, route);
			}

			const
				// eslint-disable-next-line @typescript-eslint/unbound-method
				{load} = params.meta;

			if (load == null) {
				resolve();
				return;
			}

			load().then(() => resolve()).catch(stderr);
		});
	}

	const emitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false
	});

	const router = Object.mixin({withAccessors: true}, Object.create(emitter), <Router>{
		get route(): CanUndef<Route> {
			const
				url = this.id(location.href);

			return {
				name: url,
				/** @deprecated */
				page: url,
				query: fromQueryString(location.search),
				...history.state,
				url
			};
		},

		get page(): CanUndef<Route> {
			deprecate({name: 'page', type: 'accessor', renamedTo: 'route'});
			return this.route;
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
				cutIntervals = <number[][]>[[]];

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
		if (browser.is.iOS !== false && isOpenedFromBfcache) {
			isOpenedFromBfcache = false;
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

		await component.emitTransition(location.href, history.state, 'event');
	}, popstateLabel);

	$a.on(globalThis, 'pageshow', (event: PageTransitionEvent) => {
		if (event.persisted) {
			isOpenedFromBfcache = true;
		}
	}, pageshowLabel);

	return router;
}
