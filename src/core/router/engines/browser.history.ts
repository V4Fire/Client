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
import ModuleDependencies from 'core/dependencies';
import { deprecate } from 'core/functools/deprecation';

import { session } from 'core/kv-storage';
import { fromQueryString, toQueryString } from 'core/url';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import bRouter from 'base/b-router/b-router';
import { Router, Route, HistoryClearFilter } from 'core/router/interface';

export const
	$$ = symbolGenerator();

// The code below is a shim of "clear" logic of the route history:
// it's used the session storage API to clone native history ans some hacks to clear th history.
// The way to clear the history is base on the mechanics when we rewind to the previous route of the route we want
// to clear and after the router emit a new transition to erase the all the all upcoming routes.
// After this, we need to restore some routes, that were unnecessary dropped from the history,
// that why we need the history clone.

let
	historyPos = 0,
	historyInit = false;

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

	if (historyPos >= history.length) {
		historyPos = history.length - 1;
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
		historyStorage.set('pos', historyPos);
	} catch {}
}

// Try to load history log from the session storage
try {
	historyPos = historyStorage.get('pos') || 0;

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
 * Creates an engine (browser history api) for bRouter component
 * @param component
 */
export default function createRouter(component: bRouter): Router {
	const
		{async: $a} = component;

	const
		engineGroup = {group: 'routerEngine'},
		popstateLabel = {...engineGroup, label: $$.popstate},
		modHistoryLabel = {...engineGroup, label: $$.modHistory};

	$a
		.clearAll(engineGroup);

	function load(route: string, params?: Route, method: string = 'pushState'): Promise<void> {
		if (!route) {
			throw new Error('Page to load is not defined');
		}

		// Remove some redundant characters
		route = route.replace(/[#?]\s*$/, '');

		return new Promise((resolve) => {
			let
				syncMethod = method;

			if (!params) {
				location.href = route;
				return;
			}

			// The route identifier is needed to support the feature of the history clearing
			if (!params._id) {
				params._id = Math.random().toString().slice(2);
			}

			if (method !== 'replaceState') {
				historyInit = true;

			} else if (!historyInit) {
				historyInit = true;

				// Prevent pushing of one route more than one times:
				// this situation take a place when we reload the browser page
				if (historyLog.length && !Object.fastCompare(
					Object.reject(historyLog[historyLog.length - 1].params, '_id'),
					Object.reject(params, '_id')
				)) {
					syncMethod = 'pushState';
				}
			}

			if (!historyLog.length || syncMethod === 'pushState') {
				historyLog.push({route, params});
				historyPos = historyLog.length - 1;
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
			const parseQuery = (qs, test?) => {
				if (test && !qsRgxp.test(qs)) {
					return {};
				}

				return fromQueryString(qs);
			};

			params.query = Object.assign(parseQuery(route, true), params.query);

			let
				qs = toQueryString(params.query);

			if (qs) {
				qs = `?${qs}`;

				if (qsRgxp.test(route)) {
					route = route.replace(qsRgxp, qs);

				} else {
					route += qs;
				}
			}

			if (location.href !== route) {
				params.url = route;
				// params can contain proxy objects,
				// to avoid DataCloneError we should clone it by using Object.fastClone
				history[method](Object.fastClone(params), params.name, route);
			}

			const
				entryPoint = params.meta.entryPoint,
				depsAlreadyLoaded = entryPoint != null ? Object.isArray(ModuleDependencies.get(entryPoint)) : false,
				dontLoadDependencies = !entryPoint || depsAlreadyLoaded || params.meta.dynamicDependencies === false;

			if (dontLoadDependencies) {
				resolve();
				return;
			}

			let
				i = 0;

			ModuleDependencies.emitter.on(`component.${entryPoint}.loading`, $a.proxy(
				({packages}) => {
					component.field.set('status', (++i * 100) / packages);
					(i === packages) && resolve();
				},

				{
					...engineGroup,
					label: $$.loadEntryPoint,
					single: false
				}
			));
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

				if (i && (!filter || filter(historyLog[i].params))) {
					if (!interval.length) {
						interval.push(i || 1);
					}

				} else {
					if (!lastEnd) {
						lastEnd = i;
					}

					if (interval.length) {
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
			}

			if (!cutIntervals.length) {
				return;
			}

			for (let i = cutIntervals.length; i--;) {
				const
					el = cutIntervals[i];

				const
					from = el[0],
					to = historyLog[el[1]];

				if (from <= historyPos) {
					history.go(from - historyPos - 1);
				}

				await $a.promisifyOnce(window, 'popstate', modHistoryLabel);

				historyLog.splice(from);
				historyLog.push(to);

				history.pushState(
					to.params,
					to.params.name,
					to.route
				);

				saveHistoryLog();

				historyPos = historyLog.length - 1;
				saveHistoryPos();

				await $a.nextTick();
			}

			$a.unmuteEventListener(popstateLabel);
			truncateHistoryLog();

			const
				lastPos = historyPos - cutIntervals[0][0];

			if (lastPos > 0) {
				history.go(lastPos);
				await $a.promisifyOnce(window, 'popstate', modHistoryLabel);
				historyPos = lastPos;
				saveHistoryPos();
			}
		},

		clearTmp(): Promise<void> {
			return this.clear((el) => el.params?.tmp || el.query?.tmp || el.meta?.tmp);
		}
	});

	$a.on(window, 'popstate', async () => {
		truncateHistoryLog();

		const
			{_id} = history.state || {_id: undefined};

		if (_id) {
			for (let i = 0; i < historyLog.length; i++) {
				if (historyLog[i].params._id === _id) {
					historyPos = i;
					saveHistoryPos();
					break;
				}
			}
		}

		await component.emitTransition(location.href, history.state, 'event');
	}, popstateLabel);

	return router;
}
