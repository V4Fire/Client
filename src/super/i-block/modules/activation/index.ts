/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/activation/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { runHook } from 'core/component';

import iBlock from 'super/i-block/i-block';

import {

	suspendRgxp,

	readyStatuses,
	inactiveStatuses,

	asyncNames,
	nonMuteAsyncLinkNames

} from 'super/i-block/modules/activation/const';

export * from 'super/i-block/modules/activation/const';

export const
	$$ = symbolGenerator();

/**
 * Activates the specified component
 *
 * @param component
 * @param [force] - if true, then the component will be activated forced, even if it is already activated
 */
export function activate(component: iBlock, force?: boolean): void {
	const
		ctx = component.unsafe,
		beforeCreate = ctx.lfc.isBeforeCreate();

	const
		{state: $s, rootEvent: $e} = ctx;

	if (!ctx.isActivated || force) {
		if (beforeCreate) {
			$s.initFromRouter();
		}

		if ($s.needRouterSync) {
			ctx.lfc.execCbAfterComponentCreated(() => $e.on('onTransition', async (route, type) => {
				try {
					if (type === 'hard') {
						if (route !== ctx.r.route) {
							await ctx.promisifyOnce('setRoute', {
								label: $$.activateAfterTransition
							});

						} else {
							await ctx.nextTick({
								label: $$.activateAfterHardChange
							});
						}
					}

					if (!inactiveStatuses[ctx.componentStatus]) {
						$s.initFromRouter();
					}

				} catch (err) {
					stderr(err);
				}

			}, {
				label: $$.activate
			}));
		}
	}

	if (beforeCreate) {
		return;
	}

	if (!ctx.isActivated) {
		runHook('activated', ctx).then(() => ctx.activated(true), stderr);
	}

	const
		children = ctx.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const
				ctx = children[i].unsafe;

			if (!ctx.isActivated) {
				runHook('activated', ctx).then(() => ctx.activated(true), stderr);
			}
		}
	}
}

/**
 * Deactivates the specified component
 * @param component
 */
export function deactivate(component: iBlock): void {
	const
		ctx = component.unsafe;

	if (ctx.lfc.isBeforeCreate()) {
		return;
	}

	if (ctx.isActivated) {
		runHook('deactivated', ctx).then(() => ctx.deactivated(), stderr);
	}

	const
		children = ctx.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const
				ctx = children[i].unsafe;

			if (ctx.isActivated) {
				runHook('deactivated', ctx).then(() => ctx.deactivated(), stderr);
			}
		}
	}
}

/**
 * Handler: component activated hook
 *
 * @param component
 * @param [force] - if true, then the component will be activated forced, even if it is already activated
 */
export function onActivated(component: iBlock, force?: boolean): void {
	const
		ctx = component.unsafe,
		{async: $a} = ctx;

	if (ctx.isActivated || !force && !ctx.activatedProp && !ctx.isReadyOnce) {
		return;
	}

	$a
		.unmuteAll()
		.unsuspendAll();

	if (ctx.isReadyOnce && !readyStatuses[ctx.componentStatus]) {
		ctx.componentStatus = 'beforeReady';
	}

	if (!ctx.isReadyOnce && force || ctx.reloadOnActivation) {
		const
			group = {group: 'requestSync:get'};

		$a
			.clearAll(group)
			.setImmediate(() => {
				const
					res = ctx.isReadyOnce ? ctx.reload() : ctx.initLoad();

				if (Object.isPromise(res)) {
					res.catch(stderr);
				}
			}, group);
	}

	if (ctx.isReadyOnce) {
		ctx.componentStatus = 'ready';
	}

	ctx.state.initFromRouter();
	ctx.isActivated = true;
}

/**
 * Handler: component deactivated hook
 * @param component
 */
export function onDeactivated(component: iBlock): void {
	const
		{async: $a} = component.unsafe;

	for (let keys = Object.keys(asyncNames), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (nonMuteAsyncLinkNames[key]) {
			continue;
		}

		const
			fn = $a[`mute-${asyncNames[key]}`.camelize(false)];

		if (Object.isFunction(fn)) {
			fn.call($a);
		}
	}

	$a
		.unmuteAll({group: suspendRgxp})
		.suspendAll();

	component.componentStatus = 'inactive';
	component.isActivated = false;
}
