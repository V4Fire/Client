/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { beforeHooks } from 'core/component/const';
import type { ComponentInterface } from 'core/component/interface';

/**
 * Returns a reference to the storage object for the fields of the passed component
 * @param [component]
 */
export function getFieldsStore(component: ComponentInterface['unsafe']): object {
	if (SSR || component.meta.params.functional === true || beforeHooks[component.hook] != null) {
		return component.$fields;
	}

	return component;
}
