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
import type { InitBeforeDataCreateStateOptions } from 'core/component/construct/interface';

/**
 * Initializes the "beforeDataCreate" state to the specified component instance
 *
 * @param component
 * @param [opts] - additional options
 */
export function beforeDataCreateState(
	component: ComponentInterface,
	opts?: InitBeforeDataCreateStateOptions
): void {
	const {meta, $fields} = component.unsafe;
	initFields(meta.fields, component, $fields);

	// Because in functional components,
	// the watching of fields can be initialized in a lazy mode
	if (meta.params.functional === true) {
		Object.assign(component, $fields);
	}

	runHook('beforeDataCreate', component)
		.catch(stderr);

	const hasWatchAPI =
		!component.$renderEngine.supports.ssr;

	if (hasWatchAPI) {
		implementComponentWatchAPI(component, {tieFields: opts?.tieFields});
		bindRemoteWatchers(component);
	}
}
