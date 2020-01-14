/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';
import { runHook } from 'core/component';

export const
	$$ = symbolGenerator();

const inactiveStatuses = Object.createDict({
	destroyed: true,
	inactive: true
});

/**
 * Activates the specified component
 *
 * @param component
 * @param [force]
 */
export function activate<T extends iBlock>(component: T, force?: boolean): void {
	const
		c = component.unsafe,
		beforeCreate = c.lfc.isBeforeCreate();

	const
		{state: $s, rootEvent: $e} = c;

	if (!c.isActivated || force) {
		if (beforeCreate) {
			$s.initFromRouter();
		}

		if ($s.needRouterSync) {
			c.lfc.execCbAfterComponentCreated(() => $e.on('onTransition', async (route, type) => {
				try {
					if (type === 'hard') {
						if (route !== c.r.route) {
							await c.promisifyOnce('setRoute', {
								label: $$.activateAfterTransition
							});

						} else {
							await c.nextTick({
								label: $$.activateAfterHardChange
							});
						}
					}

					if (!inactiveStatuses[c.componentStatus]) {
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

	if (!c.isActivated) {
		runHook('activated', c.meta, c).then(() => c.activated(true), stderr);
	}

	const
		children = c.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const
				ctx = children[i].unsafe;

			if (!ctx.isActivated) {
				runHook('activated', ctx.meta, ctx).then(() => ctx.activated(true), stderr);
			}
		}
	}
}

/**
 * Deactivates the specified component
 * @param component
 */
export function deactivate<T extends iBlock>(component: T): void {
	const
		c = component.unsafe;

	if (c.lfc.isBeforeCreate()) {
		return;
	}

	if (c.isActivated) {
		runHook('deactivated', c.meta, c).then(() => c.deactivated(), stderr);
	}

	const
		children = c.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			const
				ctx = children[i].unsafe;

			if (ctx.isActivated) {
				runHook('deactivated', ctx.meta, ctx).then(() => ctx.deactivated(), stderr);
			}
		}
	}
}

const readyStatuses = Object.createDict({
	beforeReady: true,
	ready: true
});

/**
 * Handler: component activated hook
 *
 * @param component
 * @param [force] - if true, then the component will be activated forcely
 */
export function onActivated<T extends iBlock>(component: T, force?: boolean): void {
	const
		c = component.unsafe,
		{async: $a} = c;

	if (c.isActivated || !force && !c.activatedProp && !c.isReadyOnce) {
		return;
	}

	$a
		.unmuteAll()
		.unsuspendAll();

	if (c.isReadyOnce && !readyStatuses[c.componentStatus]) {
		c.componentStatus = 'beforeReady';
	}

	if (!c.isReadyOnce && force || c.reloadOnActivation) {
		const
			group = {group: 'requestSync:get'};

		$a
			.clearAll(group)
			.setImmediate(() => {
				const
					v = c.isReadyOnce ? c.reload() : c.initLoad();

				if (Object.isPromise(v)) {
					v.catch(stderr);
				}
			}, group);
	}

	if (c.isReadyOnce) {
		c.componentStatus = 'ready';
	}

	c.state.initFromRouter();
	c.isActivated = true;
}

const
	suspendRgxp = /:suspend(?:\b|$)/,
	asyncNames = Async.linkNames;

const nonMuteAsyncLinkNames = Object.createDict({
	[asyncNames.promise]: true,
	[asyncNames.request]: true
});

/**
 * Handler: component deactivated hook
 * @param component
 */
export function onDeactivated<T extends iBlock>(component: T): void {
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
