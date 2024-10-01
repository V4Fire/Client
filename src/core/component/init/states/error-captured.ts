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
 * Initializes the "errorCaptured" state to the specified component instance
 *
 * @param component
 * @param args - additional arguments
 */
export function errorCapturedState(component: ComponentInterface, ...args: unknown[]): void {
	runHook('errorCaptured', component, ...args).then(() => {
		callMethodFromComponent(component, 'errorCaptured', ...args);
	}).catch(stderr);
}
