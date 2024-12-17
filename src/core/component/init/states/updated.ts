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
 * Initializes the "updated" state to the specified component instance
 * @param component
 */
export function updatedState(component: ComponentInterface): void {
	runHook('updated', component).then(() => {
		callMethodFromComponent(component, 'updated');
	}).catch(stderr);
}
