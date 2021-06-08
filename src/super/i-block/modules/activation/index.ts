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

import type iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/const';

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
 * Activates the component.
 * The deactivated component won't load data from providers on initializing.
 *
 * Basically, you don't need to think about a component activation,
 * because it's automatically synchronized with `keep-alive` or the special input property.
 *
 * @param component
 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
 */
export function activate(component: iBlock, force?: boolean): void {
	const {
		unsafe,
		unsafe: {r, lfc, state, rootEmitter}
	} = component;

	const
		isBeforeCreate = lfc.isBeforeCreate(),
		canActivate = !unsafe.isActivated || force;

	if (canActivate) {
		if (isBeforeCreate) {
			state.initFromRouter();
		}

		if (state.needRouterSync) {
			void lfc.execCbAfterComponentCreated(() => {
				rootEmitter.on('onTransition', handler, {
					label: $$.activate
				});

				async function handler(route: typeof r.route, type: string): Promise<void> {
					try {
						if (type === 'hard') {
							if (route !== r.route) {
								await unsafe.promisifyOnce('setRoute', {
									label: $$.activateAfterTransition
								});

							} else {
								await unsafe.nextTick({
									label: $$.activateAfterHardChange
								});
							}
						}

						if (inactiveStatuses[unsafe.componentStatus] == null) {
							state.initFromRouter();
						}

					} catch (err) {
						stderr(err);
					}
				}
			});
		}
	}

	if (isBeforeCreate) {
		return;
	}

	if (canActivate) {
		runHook('activated', unsafe).then(() => unsafe.activated(true), stderr);
	}

	const
		children = unsafe.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			children[i].unsafe.activate(true);
		}
	}
}

/**
 * Deactivates the component.
 * The deactivated component won't load data from providers on initializing.
 *
 * Basically, you don't need to think about a component activation,
 * because it's automatically synchronized with keep-alive or the special input property.
 *
 * @param component
 */
export function deactivate(component: iBlock): void {
	const
		{unsafe} = component;

	if (unsafe.lfc.isBeforeCreate()) {
		return;
	}

	if (unsafe.isActivated) {
		runHook('deactivated', unsafe).then(() => unsafe.deactivated(), stderr);
	}

	const
		children = unsafe.$children;

	if (children) {
		for (let i = 0; i < children.length; i++) {
			children[i].unsafe.deactivate();
		}
	}
}

/**
 * Hook handler: the component has been activated
 *
 * @param component
 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
 */
export function onActivated(component: iBlock, force?: boolean): void {
	const
		{unsafe} = component;

	const cantActivate =
		unsafe.isActivated ||
		!force && !unsafe.activatedProp && !unsafe.isReadyOnce;

	if (cantActivate) {
		return;
	}

	const async = [
		unsafe.$async,
		unsafe.async
	];

	for (let i = 0; i < async.length; i++) {
		const $a = async[i];
		$a.unmuteAll().unsuspendAll();
	}

	if (unsafe.isReadyOnce && readyStatuses[unsafe.componentStatus] == null) {
		unsafe.componentStatus = 'beforeReady';
	}

	const needInitLoadOrReload =
		!unsafe.isReadyOnce &&
		force || unsafe.reloadOnActivation;

	if (needInitLoadOrReload) {
		const
			group = {group: 'requestSync:get'};

		for (let i = 0; i < async.length; i++) {
			const $a = async[i];
			$a.clearAll(group).setImmediate(load, group);
		}
	}

	if (unsafe.isReadyOnce) {
		unsafe.componentStatus = 'ready';
	}

	unsafe.state.initFromRouter();
	unsafe.isActivated = true;

	function load(): void {
		const
			res = unsafe.isReadyOnce ? unsafe.reload() : unsafe.initLoad();

		if (Object.isPromise(res)) {
			res.catch(stderr);
		}
	}
}

/**
 * Hook handler: the component has been deactivated
 * @param component
 */
export function onDeactivated(component: iBlock): void {
	const
		{unsafe} = component;

	const async = [
		unsafe.$async,
		unsafe.async
	];

	for (let i = 0; i < async.length; i++) {
		const
			$a = async[i];

		for (let keys = Object.keys(asyncNames), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (nonMuteAsyncLinkNames[key] != null) {
				continue;
			}

			const
				fn = $a[`mute-${asyncNames[key]}`.camelize(false)];

			if (Object.isFunction(fn)) {
				fn.call($a);
			}
		}

		$a.unmuteAll({group: suspendRgxp}).suspendAll();
	}

	if (statuses[component.componentStatus] >= 2) {
		component.componentStatus = 'inactive';
	}

	component.isActivated = false;
}
