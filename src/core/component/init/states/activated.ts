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
 * Initializes the "activated" state to the specified component instance
 * @param component
 */
export function activatedState(component: ComponentInterface): void {
	if (component.hook === 'activated') {
		return;
	}

	runHook('activated', component).catch(stderr);
	callMethodFromComponent(component, 'activated');
}
