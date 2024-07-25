/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/activation/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { unwrap } from 'core/object/watch';
import { runHook, callMethodFromComponent } from 'core/component';

import type iBlock from 'components/super/i-block/i-block';
import { statuses } from 'components/super/i-block/const';

import {

	suspendRgxp,

	readyStatuses,
	inactiveStatuses,

	asyncNames,
	nonMuteAsyncLinkNames

} from 'components/super/i-block/modules/activation/const';

export * from 'components/super/i-block/modules/activation/const';

const
	$$ = symbolGenerator();

/**
 * Activates the component.
 * A deactivated component won't load data from providers on initializing.
 *
 * Essentially, you don't need to worry about component activation,
 * as it automatically synchronizes with the `keep-alive` mode or a specific component prop.
 *
 * @param component
 * @param [force] - if true, then the component will be forced to be activated, even if it is already activated
 */
export function activate(component: iBlock, force?: boolean): void {
	const {
		unsafe,
		unsafe: {r, lfc, state, rootEmitter}
	} = component;

	const
		isBeforeCreate = lfc.isBeforeCreate(),
		canActivate = !unsafe.isActivated || force;

	if (canActivate && state.needRouterSync) {
		if (isBeforeCreate) {
			state.initFromRouter();
		}

		void lfc.execCbAfterComponentCreated(() => {
			rootEmitter.on('onTransition', handler, {
				label: $$.activate
			});

			async function handler(route: typeof r.route, type: string): Promise<void> {
				try {
					if (type === 'hard') {
						const
							actualRoute = unwrap(r.route) ?? r.route;

						if (route !== actualRoute) {
							await unsafe.promisifyOnce('setRoute', {
								label: $$.activateAfterTransition
							});

						} else {
							await unsafe.nextTick({
								label: $$.activateAfterHardChange
							});
						}
					}

					if (!inactiveStatuses[unsafe.componentStatus]) {
						state.initFromRouter();
					}

				} catch (err) {
					stderr(err);
				}
			}
		});
	}

	if (isBeforeCreate) {
		return;
	}

	if (canActivate) {
		onActivated(component, true);
		runHook('activated', component).then(() => {
			callMethodFromComponent(component, 'activated');
		}).catch(stderr);
	}

	unsafe.$children.forEach((component) => {
		if (!component.isFunctional) {
			component.unsafe.activate(true);
		}
	});
}

/**
 * Deactivates the component.
 * A deactivated component won't load data from providers on initializing.
 *
 * Essentially, you don't need to worry about component activation,
 * as it automatically synchronizes with the `keep-alive` mode or a specific component prop.
 *
 * @param component
 */
export function deactivate(component: iBlock): void {
	const {unsafe} = component;

	if (unsafe.lfc.isBeforeCreate()) {
		return;
	}

	unsafe.$children.forEach((component) => {
		if (!component.isFunctional) {
			component.unsafe.deactivate();
		}
	});

	if (unsafe.isActivated) {
		runHook('deactivated', component).then(() => {
			callMethodFromComponent(component, 'deactivated');
		}).catch(stderr);

		// It's important to deactivate the component ASAP to prevent any unexpected re-renders.
		// The state of the component might change during the deactivation process,
		// but it is crucial to call runHook before deactivation.
		// This ensures that the onHookChange event listeners are not muted
		// and that child dynamic components receive the deactivation signal.
		onDeactivated(component);
	}
}

/**
 * Hook handler: the component has been activated
 *
 * @param component
 * @param [force] - if true, then the component will be forced to be activated, even if it is already activated
 */
export function onActivated(component: iBlock, force: boolean = false): void {
	const {unsafe} = component;

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

	async.forEach(($a) => $a.unmuteAll().unsuspendAll());

	if (unsafe.isReadyOnce && !readyStatuses[unsafe.componentStatus]) {
		unsafe.componentStatus = 'beforeReady';
	}

	const needInitLoadOrReload =
		!unsafe.isReadyOnce &&
		force || unsafe.reloadOnActivation;

	if (needInitLoadOrReload) {
		const group = {group: 'requestSync:get'};
		async.forEach(($a) => $a.clearAll(group).setImmediate(load, group));
	}

	if (unsafe.isReadyOnce) {
		unsafe.componentStatus = 'ready';
	}

	if (unsafe.state.needRouterSync) {
		unsafe.state.initFromRouter();
	}

	unsafe.isActivated = true;

	function load(): void {
		const res = unsafe.isReadyOnce ?
			unsafe.reload() :
			unsafe.initLoad();

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
	const {unsafe} = component;

	const async = [
		unsafe.$async,
		unsafe.async
	];

	async.forEach(($a) => {
		Object.keys(asyncNames).forEach((key) => {
			if (nonMuteAsyncLinkNames[key]) {
				return;
			}

			const fn = $a[`mute-${asyncNames[key]}`.camelize(false)];

			if (Object.isFunction(fn)) {
				fn.call($a);
			}
		});

		$a.unmuteAll({group: suspendRgxp}).suspendAll();
	});

	if (statuses[component.componentStatus] >= 2) {
		component.componentStatus = 'inactive';
	}

	component.isActivated = false;
}
