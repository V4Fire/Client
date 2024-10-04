/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/init';
import type { ComponentInterface, ComponentElement } from 'core/component/interface';

import { inheritContext } from 'core/component/functional/context/inherit';

/**
 * Initializes the default dynamic lifecycle handlers for the given functional component.
 * It also enables the component to emit lifecycle events such as mount and destroy hooks.
 *
 * @param component
 */
export function initDynamicComponentLifeCycle(component: ComponentInterface): ComponentInterface {
	const {unsafe} = component;
	unsafe.$on('[[COMPONENT_HOOK]]', hookHandler);
	return component;

	function hookHandler(hook: string, node: ComponentElement<typeof unsafe>) {
		switch (hook) {
			case 'mounted':
				mount();
				break;

			case 'beforeUpdate':
				break;

			case 'updated': {
				inheritContext(unsafe, node.component);
				init.createdState(component);
				mount();
				break;
			}

			case 'beforeDestroy': {
				unsafe.$destroy();
				break;
			}

			default:
				init[`${hook}State`](unsafe);
		}

		function mount() {
			// @ts-ignore (unsafe)
			unsafe.$el = node;
			node.component = unsafe;

			// Performs a mount on the next tick to ensure that the component is rendered
			// and all adjacent re-renders have collapsed
			unsafe.$async.nextTick().then(() => init.mountedState(component)).catch(stderr);
		}
	}
}
