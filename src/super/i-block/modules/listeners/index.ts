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

import symbolGenerator from 'core/symbol';
import { customWatcherRgxp, MethodWatcher } from 'core/component';
import iBlock from 'super/i-block/i-block';

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
	baseInitLoad = baseInitLoad || iBlock.prototype.initLoad;

	const
		ctx = component.unsafe;

	const {
		globalName,
		globalEvent: $e,
		state: $s,
		state: {needRouterSync}
	} = ctx;

	resetListener = Boolean(
		(resetListener != null ? resetListener : baseInitLoad !== ctx.instance.initLoad) ||
		globalName ||
		needRouterSync
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

	$e.on('reset.load', waitNextTick(ctx.initLoad));
	$e.on('reset.load.silence', waitNextTick(ctx.reload));

	if (needRouterSync) {
		$e.on('reset.router', $s.resetRouter);
	}

	if (globalName) {
		$e.on('reset.storage', $s.resetStorage);
	}

	$e.on('reset', waitNextTick(async () => {
		ctx.componentStatus = 'loading';

		if (needRouterSync || globalName) {
			await Promise.all(
				(<Promise<unknown>[]>[]).concat(
					needRouterSync ? $s.resetRouter() : [],
					globalName ? $s.resetStorage() : []
				)
			);
		}

		await ctx.initLoad();
	}));

	$e.on('reset.silence', waitNextTick(async () => {
		if (needRouterSync || globalName) {
			await Promise.all(
				(<Promise<unknown>[]>[]).concat(
					needRouterSync ? $s.resetRouter() : [],
					globalName ? $s.resetStorage() : []
				)
			);
		}

		await ctx.reload();
	}));
}

/**
 * Initializes watchers from .watchProp for the specified component
 * @param component
 */
export function initRemoteWatchers(component: iBlock): void {
	const
		ctx = component.unsafe;

	const
		watchMap = ctx.meta.watchers,
		watchProp = ctx.watchProp;

	if (!watchProp) {
		return;
	}

	const normalizeField = (field) => {
		if (customWatcherRgxp.test(field)) {
			return field.replace(customWatcherRgxp, (str, prfx, emitter, event) =>
				`${prfx + ['$parent'].concat(emitter || []).join('.')}:${event}`);
		}

		return `$parent.${field}`;
	};

	for (let keys = Object.keys(watchProp), i = 0; i < keys.length; i++) {
		const
			method = keys[i],
			watchers = (<Array<string | MethodWatcher>>[]).concat(<CanArray<string | MethodWatcher>>watchProp[method] || []);

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i];

			if (Object.isString(el)) {
				const
					field = normalizeField(el),
					wList = watchMap[field] = watchMap[field] || [];

				wList.push({
					method,
					handler: method
				});

			} else {
				const
					field = normalizeField(el.field),
					wList = watchMap[field] = watchMap[field] || [];

				wList.push({
					...el,
					args: (<unknown[]>[]).concat(el.args || []),
					method,
					handler: method
				});
			}
		}
	}
}
