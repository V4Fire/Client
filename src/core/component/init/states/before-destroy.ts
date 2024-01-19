/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { dropRawComponentContext } from 'core/component/context';
import { callMethodFromComponent } from 'core/component/method';
import { runHook } from 'core/component/hook';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "beforeDestroy" state to the specified component instance
 * @param component
 */
export function beforeDestroyState(component: ComponentInterface): void {
	if (component.hook === 'beforeDestroy' || component.hook === 'destroyed') {
		return;
	}

	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');

	const {
		unsafe,
		unsafe: {$el}
	} = component;

	unsafe.async.clearAll().locked = true;
	unsafe.$async.clearAll().locked = true;

	if ($el != null) {
		delete $el.component;
	}

	setTimeout(() => {
		if ($el != null && !$el.isConnected && unsafe.meta.params.functional === true) {
			unsafe.$renderEngine.r.destroy($el);
		}

		const destroyedComponent = {
			componentId: unsafe.componentId,
			componentName: unsafe.componentName,
			hook: unsafe.hook
		};

		Object.getOwnPropertyNames(unsafe).forEach((key) => {
			delete unsafe[key];
		});

		Object.assign(unsafe, destroyedComponent);
		Object.setPrototypeOf(unsafe, destroyedComponent);

		dropRawComponentContext(unsafe);
	}, Math.floor(Math.random() * 100));
}
