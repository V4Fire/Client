/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PropertyInfo } from 'core/component/reflection';
import { ComponentInterface } from 'core/component/interface';
import { dynamicHandlers } from 'core/component/watch/const';
import { DynamicHandlers } from 'core/component/watch/interface';

/**
 * Attaches a dynamic watcher to the specified property.
 * This function is used to manage the situation when we are watching some accessor.
 *
 * @param component - component that watches
 * @param prop - property to watch
 * @param handler
 * @param [store] - store with dynamic handlers
 */
export function attachDynamicWatcher(
	component: ComponentInterface,
	prop: PropertyInfo,
	handler: Function,
	store: DynamicHandlers = dynamicHandlers
): Function {
	let
		handlersStore = store.get(prop.ctx);

	if (!handlersStore) {
		handlersStore = Object.createDict();
		store.set(prop.ctx, handlersStore);
	}

	const
		nm = prop.accessor || prop.name;

	let
		handlersSet = handlersStore[nm];

	if (!handlersSet) {
		handlersSet = handlersStore[nm] = new Set<Function>();
	}

	handlersSet.add(handler);

	// @ts-ignore (access)
	return component.$async.worker(() => {
		handlersSet?.delete(handler);
	});
}
