/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$ } from 'core/component/functional/const';

import * as init from 'core/component/construct';
import { ComponentInterface } from 'core/component/interface';

/**
 * Emits destroying of the specified component
 * @param component
 */
export function destroyComponent(component: ComponentInterface): void {
	if (component[$$.destroyed] === true) {
		return;
	}

	component[$$.destroyed] = true;
	init.beforeDestroyState(component);

	if (!component.isFlyweight) {
		init.destroyedState(component);
	}
}
