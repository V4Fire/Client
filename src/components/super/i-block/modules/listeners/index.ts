/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/listeners/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { customWatcherRgxp } from 'core/component';
import iBlock from 'components/super/i-block/i-block';

const
	$$ = symbolGenerator();

let
	baseInitLoad;

/**
 * Initializes the listening of global application events for the component
 *
 * @param component
 * @param [resetListener]
 */
export function initGlobalListeners(component: iBlock, resetListener?: boolean): void {
	// eslint-disable-next-line @v4fire/unbound-method
	baseInitLoad ??= iBlock.prototype.initLoad;

	const
		ctx = component.unsafe;

	const {
		globalName,
		globalEmitter: $e,
		state: $s,
		state: {needRouterSync}
	} = ctx;

	$e.once(`destroy.${ctx.remoteState.appProcessId}`, ctx.$destroy.bind(ctx));

	resetListener = Boolean(
		(resetListener ?? baseInitLoad !== ctx.instance.initLoad) ||
		(globalName ?? needRouterSync)
	);

	if (!resetListener) {
		return;
	}

	$e.on('reset.load', waitNextTickForReset(ctx.initLoad.bind(ctx)));
	$e.on('reset.load.silence', waitNextTickForReset(ctx.reload.bind(ctx)));

	if (needRouterSync) {
		$e.on('reset.router', $s.resetRouter.bind($s));
	}

	if (globalName != null) {
		$e.on('reset.storage', $s.resetStorage.bind($s));
	}

	$e.on('reset', waitNextTickForReset(async () => {
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

	$e.on('reset.silence', waitNextTickForReset(async () => {
		if (needRouterSync || globalName != null) {
			const tasks = Array.toArray(
				needRouterSync ? $s.resetRouter() : null,
				globalName != null ? $s.resetStorage() : null
			);

			await Promise.allSettled(tasks);
		}

		await ctx.reload();
	}));

	function waitNextTickForReset(fn: Function) {
		return async () => {
			try {
				await ctx.nextTick({label: $$.reset});
				await fn();

			} catch (err) {
				stderr(err);
			}
		};
	}
}

/**
 * Initializes watchers from the `watchProp` prop for the component
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

	Object.entries(watchProp).forEach(([method, watchers]) => {
		Array.toArray( watchers).forEach((watcher) => {
			if (Object.isString(watcher)) {
				const
					path = normalizePath(watcher),
					wList = watchMap[path] ?? [];

				watchMap[path] = wList;
				wList.push({method, handler: method});

			} else {
				const
					path = normalizePath(watcher.path),
					wList = watchMap[path] ?? [];

				watchMap[path] = wList;

				wList.push({
					...watcher,
					args: Array.toArray(watcher.args),
					method,
					handler: method
				});
			}
		});
	});

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
