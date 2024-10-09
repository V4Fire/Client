/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as gc from 'core/component/gc';

import { runHook } from 'core/component/hook';

import { dropRawComponentContext } from 'core/component/context';
import { callMethodFromComponent } from 'core/component/method';

import { destroyedHooks } from 'core/component/const';

import type { ComponentInterface, ComponentDestructorOptions } from 'core/component/interface';

/**
 * Initializes the "beforeDestroy" state to the specified component instance
 *
 * @param component
 * @param [opts]
 */
export function beforeDestroyState(component: ComponentInterface, opts: ComponentDestructorOptions = {}): void {
	if (destroyedHooks[component.hook] != null) {
		return;
	}

	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');

	const {unsafe, unsafe: {$el}} = component;

	unsafe.$emit('[[BEFORE_DESTROY]]', <Required<ComponentDestructorOptions>>{
		recursive: opts.recursive ?? true,
		shouldUnmountVNodes: opts.shouldUnmountVNodes ?? true
	});

	unsafe.async.clearAll().locked = true;
	unsafe.$async.clearAll().locked = true;

	for (const destructor of unsafe.$destructors) {
		destructor();
	}

	if ($el != null && $el.component === component) {
		delete $el.component;
	}

	gc.add(function* destructor() {
		if ($el != null && !$el.isConnected && $el.component == null) {
			unsafe.$renderEngine.r.destroy($el);
		}

		const {componentName, componentId, hook} = unsafe;

		const destroyedDescriptors = {
			componentId: {
				writable: false,
				enumerable: true,
				configurable: false,
				value: componentId
			},

			componentName: {
				writable: false,
				enumerable: true,
				configurable: false,
				value: componentName
			},

			hook: {
				writable: false,
				enumerable: true,
				configurable: false,
				value: hook
			}
		};

		for (const [i, key] of Object.getOwnPropertyNames(unsafe).entries()) {
			delete unsafe[key];

			if (i % 10 === 0) {
				yield;
			}
		}

		Object.assign(unsafe, {componentId, componentName, hook});
		Object.setPrototypeOf(unsafe, Object.create({}, destroyedDescriptors));

		dropRawComponentContext(unsafe);
	}());
}
