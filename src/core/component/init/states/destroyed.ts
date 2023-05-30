/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { callMethodFromComponent } from 'core/component/method';
import { runHook } from 'core/component/hook';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "destroyed" state to the specified component instance
 * @param component
 */
export function destroyedState(component: ComponentInterface): void {
	runHook('destroyed', component).then(() => {
		callMethodFromComponent(component, 'destroyed');
	}).catch(stderr);
}
