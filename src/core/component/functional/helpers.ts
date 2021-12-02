/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$ } from '@src/core/component/functional/const';

import * as init from '@src/core/component/construct';
import type { ComponentInterface } from '@src/core/component/interface';

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
