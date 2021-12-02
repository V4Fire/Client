/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/listeners/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from '~/core/symbol';
import { customWatcherRgxp } from '~/core/component';
import iBlock from '~/super/i-block/i-block';

export const
	$$ = symbolGenerator();

let
	baseInitLoad;

/**
 * Initializes global event listeners for the specified component
 *
 * @param component
 * @param [resetListener]
 */
export function initGlobalListeners(component: iBlock, resetListener?: boolean): void {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	baseInitLoad ??= iBlock.prototype.initLoad;

	const
		ctx = component.unsafe;

	const {
		globalName,
		globalEmitter: $e,
		state: $s,
		state: {needRouterSync}
	} = ctx;

	resetListener = Boolean(
		(resetListener != null ? resetListener : baseInitLoad !== ctx.instance.initLoad) ||
		(globalName ?? needRouterSync)
	);

	if (!resetListener) {
		return;
	}

	const waitNextTick = (fn) => async () => {
		try {
			await ctx.nextTick({label: $$.reset});
			await fn();

		} catch (err) {
			stderr(err);
		}
	};

	$e.on('reset.load', waitNextTick(ctx.initLoad.bind(ctx)));
	$e.on('reset.load.silence', waitNextTick(ctx.reload.bind(ctx)));

	if (needRouterSync) {
		$e.on('reset.router', $s.resetRouter.bind($s));
	}

	if (globalName != null) {
		$e.on('reset.storage', $s.resetStorage.bind($s));
	}

	$e.on('reset', waitNextTick(async () => {
		ctx.componentStatus = 'loading';

		if (needRouterSync || globalName != null) {
			const tasks = Array.concat(
				[],
				needRouterSync ? $s.resetRouter() : null,
				globalName != null ? $s.resetStorage() : null
			);

			await Promise.allSettled(tasks);
		}

		await ctx.initLoad();
	}));

	$e.on('reset.silence', waitNextTick(async () => {
		if (needRouterSync || globalName != null) {
			const tasks = Array.concat(
				[],
				needRouterSync ? $s.resetRouter() : null,
				globalName != null ? $s.resetStorage() : null
			);

			await Promise.allSettled(tasks);
		}

		await ctx.reload();
	}));
}

/**
 * Initializes watchers from `watchProp` for the specified component
 * @param component
 */
export function initRemoteWatchers(component: iBlock): void {
	const {
		watchProp,
		meta: {watchers: watchMap}
	} = component.unsafe;

	if (watchProp == null) {
		return;
	}

	for (let keys = Object.keys(watchProp), i = 0; i < keys.length; i++) {
		const
			method = keys[i],
			watchers = Array.concat([], watchProp[method]);

		for (let i = 0; i < watchers.length; i++) {
			const
				watcher = watchers[i];

			if (Object.isString(watcher)) {
				const
					path = normalizePath(watcher),
					wList = watchMap[path] ?? [];

				watchMap[path] = wList;
				wList.push({method, handler: method});

			} else {
				const
					path = normalizePath(watcher.path ?? watcher.field),
					wList = watchMap[path] ?? [];

				watchMap[path] = wList;

				wList.push({
					...watcher,
					args: Array.concat([], watcher.args),
					method,
					handler: method
				});
			}
		}
	}

	function normalizePath(field?: string): string {
		if (field == null) {
			return '';
		}

		if (RegExp.test(customWatcherRgxp, field)) {
			const replacer = (str, prfx: string, emitter: string, event: string) =>
				`${prfx + ['$parent'].concat(Object.isTruly(emitter) ? emitter : []).join('.')}:${event}`;

			return field.replace(customWatcherRgxp, replacer);
		}

		return `$parent.${field}`;
	}
}
