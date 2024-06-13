/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initFields } from 'core/component/field';
import { bindRemoteWatchers, implementComponentWatchAPI } from 'core/component/watch';
import { runHook } from 'core/component/hook';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes the "beforeDataCreate" state to the specified component instance
 *
 * @param component
 */
export function beforeDataCreateState(component: ComponentInterface): void {
	const {meta, $fields} = component.unsafe;
	initFields(meta.fields, component, $fields);

	// In functional components, the watching of fields can be initialized in lazy mode
	if (meta.params.functional === true) {
		Object.assign(component, $fields);
	}

	runHook('beforeDataCreate', component).catch(stderr);

	if (!SSR) {
		implementComponentWatchAPI(component);
		bindRemoteWatchers(component);
	}
}
