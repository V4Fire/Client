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
 * Initializes the "mounted" state to the specified component instance
 * @param component
 */
export function mountedState(component: ComponentInterface): void {
	const {$el} = component;

	if ($el != null && $el.component !== component) {
		$el.component = component;
	}

	runHook('mounted', component).then(() => {
		callMethodFromComponent(component, 'mounted');
	}).catch(stderr);
}
