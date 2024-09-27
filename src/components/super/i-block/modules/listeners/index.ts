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

import { isCustomWatcher, customWatcherRgxp } from 'core/component';
import iBlock from 'components/super/i-block/i-block';

const $$ = symbolGenerator();

let baseInitLoad: CanNull<typeof iBlock.prototype.initLoad> = null;

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
		async: $a,
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
			const tasks = Array.toArray(
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

	function waitNextTickForReset(rawFn: () => CanPromise<void>) {
		const fn = $a.proxy(rawFn);

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
	const {watchProp, meta: {watchers}} = component.unsafe;

	if (watchProp == null) {
		return;
	}

	for (const method of Object.keys(watchProp)) {
		for (const watcher of Array.toArray(watchProp[method])) {
			if (Object.isString(watcher)) {
				const path = normalizePath(watcher);

				const watcherListeners = watchers.get(path) ?? [];
				watchers.set(path, watcherListeners);

				watcherListeners.push({method, handler: method});

			} else {
				const path = normalizePath(watcher.path);

				const watcherListeners = watchers.get(path) ?? [];
				watchers.set(path, watcherListeners);

				watcherListeners.push({
					...Object.cast(watcher),
					args: Array.toArray(watcher.args),
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

		if (isCustomWatcher.test(field)) {
			const replacer = (_: string, prefix: string, emitter: string, event: string) => {
				const path = Array.toArray('$parent', Object.isTruly(emitter) ? emitter : []).join('.');
				return `${prefix}${path}:${event}`;
			};

			return field.replace(customWatcherRgxp, replacer);
		}

		return `$parent.${field}`;
	}
}
