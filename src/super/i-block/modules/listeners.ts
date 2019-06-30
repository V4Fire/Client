/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';
import { customWatcherRgxp, MethodWatcher } from 'core/component';

const
	$$ = symbolGenerator();

let
	baseInitLoad;

/**
 * Initializes global event listeners for the specified component
 *
 * @param component
 * @param [resetListener]
 */
export function initGlobalEvents(component: iBlock, resetListener?: boolean): void {
	// @ts-ignore (access)
	baseInitLoad = baseInitLoad || iBlock.prototype.initLoad;

	const
		c = component;

	const
		// @ts-ignore
		{globalName, globalEvent: $e, state: $s, state: {isNeedRouterSync}} = c;

	resetListener = Boolean(
		(resetListener != null ? resetListener : baseInitLoad !== c.instance.initLoad) ||
		globalName ||
		isNeedRouterSync
	);

	if (!resetListener) {
		return;
	}

	const waitNextTick = (fn) => async () => {
		try {
			await c.nextTick({label: $$.reset});
			await fn();

		} catch (err) {
			stderr(err);
		}
	};

	$e.on('reset.load', waitNextTick(c.initLoad));
	$e.on('reset.load.silence', waitNextTick(c.reload));

	if (isNeedRouterSync) {
		$e.on('reset.router', $s.resetRouter);
	}

	if (globalName) {
		$e.on('reset.storage', $s.resetStorage);
	}

	$e.on('reset', waitNextTick(async () => {
		c.componentStatus = 'loading';

		if (isNeedRouterSync || globalName) {
			await Promise.all(
				(<Promise<unknown>[]>[]).concat(
					isNeedRouterSync ? $s.resetRouter() : [],
					globalName ? $s.resetStorage() : []
				)
			);
		}

		await c.initLoad();
	}));

	$e.on('reset.silence', waitNextTick(async () => {
		if (isNeedRouterSync || globalName) {
			await Promise.all(
				(<Promise<unknown>[]>[]).concat(
					isNeedRouterSync ? $s.resetRouter() : [],
					globalName ? $s.resetStorage() : []
				)
			);
		}

		await c.reload();
	}));
}

/**
 * Initializes watchers from .watchProp for the specified component
 * @param component
 */
export function initRemoteWatchers(component: iBlock): void {
	const
		c = component,
		// @ts-ignore
		w = c.meta.watchers,
		o = c.watchProp;

	if (!o) {
		return;
	}

	const normalizeField = (field) => {
		if (customWatcherRgxp.test(field)) {
			return field.replace(customWatcherRgxp, (str, prfx, emitter, event) =>
				`${prfx + ['$parent'].concat(emitter || []).join('.')}:${event}`);
		}

		return `$parent.${field}`;
	};

	for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			method = keys[i],
			watchers = (<Array<string | MethodWatcher>>[]).concat(<CanArray<string | MethodWatcher>>o[method] || []);

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i];

			if (Object.isString(el)) {
				const
					field = normalizeField(el),
					wList = w[field] = w[field] || [];

				wList.push({
					method,
					handler: method
				});

			} else {
				const
					field = normalizeField(el.field),
					wList = w[field] = w[field] || [];

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
