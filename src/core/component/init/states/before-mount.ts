/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { runHook } from 'core/component/hook';

import { callMethodFromComponent } from 'core/component/method';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "beforeMount" state to the specified component instance
 * @param component
 */
export function beforeMountState(component: ComponentInterface): void {
	const {$el} = component;

	if ($el != null) {
		$el.component = component;
	}

	runHook('beforeMount', component).catch(stderr);
	callMethodFromComponent(component, 'beforeMount');
}
