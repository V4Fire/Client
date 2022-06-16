/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveRefs } from 'core/component/ref';
import { callMethodFromComponent } from 'core/component/method';
import { runHook } from 'core/component/hook';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "updated" state to the specified component instance
 * @param component
 */
export function updatedState(component: ComponentInterface): void {
	runHook('beforeUpdated', component).catch(stderr);
	resolveRefs(component);

	runHook('updated', component).then(() => {
		callMethodFromComponent(component, 'updated');
	}).catch(stderr);
}
