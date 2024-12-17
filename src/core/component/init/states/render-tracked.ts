/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { runHook } from 'core/component/hook';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "renderCaptured" state to the specified component instance
 *
 * @param component
 * @param args - additional arguments
 */
export function renderTrackedState(component: ComponentInterface, ...args: unknown[]): void {
	runHook('renderTracked', component, ...args).catch(stderr);
}
