/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import ModuleDependencies from 'core/dependencies';
import bRouter from 'base/b-router/b-router';
import { session } from 'core/kv-storage';

import { fromQueryString, toQueryString } from 'core/url';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { Router, CurrentPage, PageInfo, HistoryCleanFilter } from 'core/router/interface';

export const
	$$ = symbolGenerator();

let
	historyPos = 0,
	historyInit = false;

type HistoryLog = Array<{
	page: string;
	info: PageInfo;
}>;

const
	historyLog = <HistoryLog>[],
	historyStorage = session.namespace('[[BROWSER_HISTORY]]');

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

function saveHistoryLog(): void {
	try {
		historyStorage.set('log', historyLog);
	} catch {}
}

function saveHistoryPos(): void {
	try {
		historyStorage.set('pos', historyPos);
	} catch {}
}

// Try to load history log from the session storage
try {
	historyPos = historyStorage.get('pos') || 0;

	for (let o = <HistoryLog>historyStorage.get('log'), i = 0; i < o.length; i++) {
		historyLog.push(o[i]);
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

	function load(page: string, info?: PageInfo, method: string = 'pushState'): Promise<void> {
		if (!page) {
			throw new Error('Page to load is not defined');
		}

		// Normalizing
		page = page.replace(/[#?]\s*$/, '');

		return new Promise((resolve) => {
			let
				syncMethod = method;

			if (!info) {
				location.href = page;
				return;
			}

			if (!info.id) {
				info.id = Math.random().toString().slice(2);
			}

			if (method !== 'replaceState') {
				historyInit = true;

			} else if (!historyInit) {
				historyInit = true;

				if (historyLog.length && !Object.fastCompare(
					Object.reject(historyLog[historyLog.length - 1].info, 'id'),
					Object.reject(info, 'id')
				)) {
					syncMethod = 'pushState';
				}
			}

			if (!historyLog.length || syncMethod === 'pushState') {
				historyLog.push({page, info});
				historyPos = historyLog.length - 1;
				saveHistoryPos();

			} else {
				historyLog[historyLog.length - 1] = {page, info};
			}

			saveHistoryLog();

			const
				qsRgxp = /\?.*?(?=#|$)/;

			const parseQuery = (s, test?) => {
				if (test && !qsRgxp.test(s)) {
					return {};
				}

				return fromQueryString(s);
			};

			info.query = Object.assign(parseQuery(page, true), info.query);

			let
				qs = toQueryString(info.query);

			if (qs) {
				qs = `?${qs}`;

				if (qsRgxp.test(page)) {
					page = page.replace(qsRgxp, qs);

				} else {
					page += qs;
				}
			}

			if (location.href !== page) {
				info.url = page;
				history[method](info, info.page, page);
			}

			if (!info.page) {
				return;
			}

			if (Object.isArray(ModuleDependencies.get(info.page))) {
				resolve();
				return;
			}

			let
				i = 0;

			ModuleDependencies.event.on(`component.${info.page}.loading`, $a.proxy(
				({packages}) => {
					component.field.set('status', (++i * 100) / packages);
					(i === packages) && resolve();
				},

				{
					label: $$.component,
					single: false
				}
			));
		});
	}

	const
		popstate = {label: $$.popstate},
		modHistory = {label: $$.modHistory};

	const router = Object.mixin<Router>({withAccessors: true}, Object.create(new EventEmitter()), {
		get page(): CanUndef<CurrentPage> {
			const
				url = this.id(location.href);

			return {
				page: url,
				query: fromQueryString(location.search),
				...history.state,
				url
			};
		},

		get history(): PageInfo[] {
			const
				list = <PageInfo[]>[];

			for (let i = 0; i < historyLog.length; i++) {
				list.push(historyLog[i].info);
			}

			return list;
		},

		id(page: string): string {
			try {
				return new URL(page).pathname;

			} catch {
				return page;
			}
		},

		push(page: string, info?: PageInfo): Promise<void> {
			return load(page, info);
		},

		replace(page: string, info?: PageInfo): Promise<void> {
			return load(page, info, 'replaceState');
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

		async clean(fn?: HistoryCleanFilter): Promise<void> {
			$a.muteEventListeners(popstate);
			truncateHistoryLog();

			const
				cutIntervals = <number[][]>[[]];

			let
				lastEnd = 0;

			for (let i = 0; i < historyLog.length; i++) {
				const
					interval = cutIntervals[cutIntervals.length - 1];

				if (i && (!fn || fn(historyLog[i].info))) {
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

				await $a.promisifyOnce(window, 'popstate', modHistory);

				historyLog.splice(from);
				historyLog.push(to);
				history.pushState(to.info, <string>to.info.page, to.page);
				saveHistoryLog();

				historyPos = historyLog.length - 1;
				saveHistoryPos();

				await $a.nextTick();
			}

			$a.unmuteEventListeners(popstate);
			truncateHistoryLog();

			const
				lastPos = historyPos - cutIntervals[0][0];

			if (lastPos > 0) {
				history.go(lastPos);
				await $a.promisifyOnce(window, 'popstate', modHistory);
				historyPos = lastPos;
				saveHistoryPos();
			}
		},

		cleanTmp(): Promise<void> {
			return this.clean((el) =>
				el.params && el.params.tmp || el.query && el.query.tmp || el.meta && el.meta.tmp);
		}
	});

	$a.on(window, 'popstate', async () => {
		truncateHistoryLog();

		const
			{id} = history.state || {id: undefined};

		if (id) {
			for (let i = 0; i < historyLog.length; i++) {
				if (historyLog[i].info.id === id) {
					historyPos = i;
					saveHistoryPos();
					break;
				}
			}
		}

		await component.setPage(location.href, history.state, 'event');
	}, popstate);

	return router;
}
