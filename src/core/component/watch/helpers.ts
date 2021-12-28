/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { WatchOptions, MultipleWatchHandler } from 'core/object/watch';

import type { PropertyInfo } from 'core/component/reflection';
import type { ComponentInterface } from 'core/component/interface';

import { dynamicHandlers } from 'core/component/watch/const';
import type { DynamicHandlers } from 'core/component/watch/interface';

/**
 * Attaches a dynamic watcher to the specified property.
 * This function is used to manage the situation when we are watching some accessor.
 *
 * @param component - component that is watched
 * @param prop - property to watch
 * @param opts - options for watching
 * @param handler
 * @param [store] - store with dynamic handlers
 */
export function attachDynamicWatcher(
	component: ComponentInterface,
	prop: PropertyInfo,
	opts: WatchOptions,
	handler: Function,
	store: DynamicHandlers = dynamicHandlers
): Function {
	// eslint-disable-next-line @typescript-eslint/typedef
	const wrapper = <MultipleWatchHandler>function wrapper(this: unknown, mutations, ...args) {
		const
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			isPacked = args.length === 0;

		if (!isPacked) {
			mutations = [Object.cast([mutations, ...args])];
		}

		const
			filteredMutations = <unknown[]>[];

		for (let i = 0; i < mutations.length; i++) {
			const
				[value, oldValue, info] = mutations[i];

			if (
				// We don't watch deep mutations
				!opts.deep && info.path.length > (Object.isDictionary(info.obj) ? 1 : 2) ||

				// We don't watch prototype mutations
				!opts.withProto && info.fromProto ||

				// The mutation was already fired
				opts.eventFilter && !Object.isTruly(opts.eventFilter(value, oldValue, info))
			) {
				continue;
			}

			filteredMutations.push(mutations[i]);
		}

		if (filteredMutations.length > 0) {
			if (isPacked) {
				handler.call(this, filteredMutations);

			} else {
				handler.apply(this, filteredMutations[0]);
			}
		}
	};

	let
		destructor;

	if (prop.type === 'mounted') {
		let
			watcher;

		if (Object.size(prop.path) > 0) {
			watcher = watch(prop.ctx, prop.path, opts, wrapper);

		} else {
			watcher = watch(prop.ctx, opts, wrapper);
		}

		destructor = () => {
			watcher.unwatch();
		};

	} else {
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
			handlersSet = new Set<Function>();
			handlersStore[nm] = handlersSet;
		}

		handlersSet.add(wrapper);

		destructor = () => {
			handlersSet?.delete(wrapper);
		};
	}

	// Every worker that passed to async have a counter with number of consumers of this worker,
	// but in this case this behaviour is redundant and can produce an error,
	// that why we wrap original destructor with a new function
	component.unsafe.$async.worker(() => destructor());

	return destructor;
}
