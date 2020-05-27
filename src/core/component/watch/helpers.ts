/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchOptions, MultipleWatchHandler } from 'core/object/watch';

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
 * @param opts - options for watching
 * @param [store] - store with dynamic handlers
 */
export function attachDynamicWatcher(
	component: ComponentInterface,
	prop: PropertyInfo,
	opts: WatchOptions,
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
		nm = prop.accessor ?? prop.name;

	let
		handlersSet = handlersStore[nm];

	if (!handlersSet) {
		handlersSet = handlersStore[nm] = new Set<Function>();
	}

	// tslint:disable-next-line:typedef
	const wrapper = <MultipleWatchHandler>function (mutations, ...args) {
		const
			needPack = !args.length;

		if (!needPack) {
			mutations = [<any>[mutations, ...args]];
		}

		const
			filteredMutations = <any[]>[];

		for (let i = 0; i < mutations.length; i++) {
			const
				[value, oldValue, info] = mutations[i];

			if (
				// We don't watch deep mutations
				!opts.deep && info.path.length > (Object.isDictionary(info.obj) ? 1 : 2) ||

				// We don't watch prototype mutations
				!opts.withProto && info.fromProto ||

				// The mutation was already fired
				opts.eventFilter && !opts.eventFilter(value, oldValue, info)
			) {
				continue;
			}

			filteredMutations.push(mutations[i]);
		}

		if (filteredMutations.length) {
			handler[needPack ? 'call' : 'apply'](this, filteredMutations);
		}
	};

	handlersSet.add(wrapper);

	return component.unsafe.$async.worker(() => {
		handlersSet?.delete(wrapper);
	});
}
