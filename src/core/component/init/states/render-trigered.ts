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
 * Initializes the "renderTriggered" state to the specified component instance
 *
 * @param component
 * @param args - additional arguments
 */
export function renderTriggeredState(component: ComponentInterface, ...args: unknown[]): void {
	runHook('renderTriggered', component, ...args).then(() => {
		callMethodFromComponent(component, 'renderTriggered', ...args);
	}).catch(stderr);
}
