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
 *
 * @param component
 * @param [recursive] - if set to false, the destructor will be executed for the component itself,
 *   but not for its descendants
 */
export function beforeDestroyState(component: ComponentInterface, recursive: boolean = true): void {
	if (component.hook === 'beforeDestroy' || component.hook === 'destroyed') {
		return;
	}

	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');

	const {
		unsafe,
		unsafe: {$el}
	} = component;

	unsafe.$emit('[[BEFORE_DESTROY]]', recursive);

	unsafe.async.clearAll().locked = true;
	unsafe.$async.clearAll().locked = true;

	if ($el != null) {
		delete $el.component;
	}

	setTimeout(() => {
		if ($el != null && !$el.isConnected && $el.component == null) {
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

	// To avoid freezing during cleaning of a larger number of components at once,
	// a little randomness is added to the process
	}, Math.floor(Math.random() * 1000));
}
