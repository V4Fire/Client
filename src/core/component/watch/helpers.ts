/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { Watcher, WatchOptions, MultipleWatchHandler } from 'core/object/watch';

import type { PropertyInfo } from 'core/component/reflect';
import { dynamicHandlers } from 'core/component/watch/const';

import type { ComponentInterface } from 'core/component/interface';
import type { DynamicHandlers } from 'core/component/watch/interface';

/**
 * Returns true if initialization of observation for the given property can be skipped.
 * For example, if it is a prop of a functional component or a prop that was not passed in the template, etc.
 *
 * @param property - the property information object
 * @param [opts] - additional observation options
 */
export function canSkipWatching(
	property: Nullable<PropertyInfo>,
	opts?: Nullable<WatchOptions>
): boolean {
	if (property == null) {
		return false;
	}

	let canSkipWatching = opts?.immediate !== true;

	// We cannot observe props and attributes on a component if it is a root component, a functional component,
	// or if it does not accept such parameters in the template.
	// Also, prop watching does not work during SSR.
	if (canSkipWatching && (property.type === 'prop' || property.type === 'attr')) {
		const {ctx, ctx: {unsafe: {meta, meta: {params}}}} = property;

		canSkipWatching = SSR || params.root === true || params.functional === true;

		if (!canSkipWatching) {
			const
				prop = meta.props[property.name],
				propName = prop?.forceUpdate !== false ? property.name : `on:${property.name}`;

			canSkipWatching = ctx.getPassedProps?.().has(propName) === false;
		}

	} else {
		canSkipWatching = false;
	}

	return canSkipWatching;
}

/**
 * Attaches a dynamic watcher to the specified property.
 * This function is used to manage a situation when we are watching some accessor.
 *
 * @param component - the component that is watched
 * @param prop - the property to watch
 * @param watchOpts - options of watching
 * @param handler - a function to handle mutations
 * @param [store] - store for dynamic handlers
 */
export function attachDynamicWatcher(
	component: ComponentInterface,
	prop: PropertyInfo,
	watchOpts: WatchOptions,
	handler: Function,
	store: DynamicHandlers = dynamicHandlers
): Function {
	// eslint-disable-next-line @typescript-eslint/typedef
	const wrapper = <MultipleWatchHandler>function wrapper(this: unknown, mutations, ...args) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const isPacked = args.length === 0;

		if (!isPacked) {
			mutations = [Object.cast([mutations, ...args])];
		}

		const filteredMutations: unknown[] = [];

		mutations.forEach((mutation) => {
			const
				[value, oldValue, info] = mutation;

			if (
				// We don't watch deep mutations
				!watchOpts.deep && info.path.length > (Object.isDictionary(info.obj) ? 1 : 2) ||

				// We don't watch prototype mutations
				!watchOpts.withProto && info.fromProto ||

				// The mutation has been already fired
				watchOpts.eventFilter && !Object.isTruly(watchOpts.eventFilter(value, oldValue, info))
			) {
				return;
			}

			filteredMutations.push(mutation);
		});

		if (filteredMutations.length > 0) {
			if (isPacked) {
				handler.call(this, filteredMutations);

			} else {
				handler.apply(this, filteredMutations[0]);
			}
		}
	};

	let destructor: Function;

	if (prop.type === 'mounted') {
		let
			watcher: Watcher;

		if (Object.size(prop.path) > 0) {
			watcher = watch(prop.ctx, prop.path, watchOpts, wrapper);

		} else {
			watcher = watch(prop.ctx, watchOpts, wrapper);
		}

		destructor = () => {
			watcher.unwatch();
		};

	} else {
		let handlersStore = store.get(prop.ctx);

		if (!handlersStore) {
			handlersStore = Object.createDict();
			store.set(prop.ctx, handlersStore);
		}

		const name = prop.accessor ?? prop.name;

		let handlersSet = handlersStore[name];

		if (handlersSet == null) {
			handlersSet = new Set<Function>();
			handlersStore[name] = handlersSet;
		}

		handlersSet.add(wrapper);

		destructor = () => {
			handlersSet?.delete(wrapper);
		};
	}

	component.unsafe.$destructors.push(destructor);

	return destructor;
}
