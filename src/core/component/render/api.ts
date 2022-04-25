/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';

/**
 * Implements the base component force update API to a component instance
 *
 * @param component
 * @param forceUpdate - native function to update a component
 */
export function implementComponentForceUpdateAPI(component: ComponentInterface, forceUpdate: Function): void {
	component.$forceUpdate = () => {
		if (!('renderCounter' in component)) {
			return;
		}

		forceUpdate.call(component);
	};
}
