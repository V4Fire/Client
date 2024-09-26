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

import type { ComponentInterface, ComponentField } from 'core/component/interface';
import type { DynamicHandlers } from 'core/component/watch/interface';

/**
 * Returns true if initialization of observation for the given property can be skipped.
 * For example, if it is a prop of a functional component or a prop that was not passed in the template, etc.
 *
 * @param propInfo - the property information object
 * @param [opts] - additional observation options
 */
export function canSkipWatching(
	propInfo: Nullable<PropertyInfo>,
	opts?: Nullable<WatchOptions>
): boolean {
	if (propInfo == null || !('type' in propInfo) || propInfo.type === 'mounted') {
		return false;
	}

	let skipWatching = opts?.immediate !== true;

	if (skipWatching) {
		const {ctx, ctx: {unsafe: {meta, meta: {params}}}} = propInfo;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (meta == null || params == null) {
			return false;
		}

		const isFunctional = params.functional === true;

		if (propInfo.type === 'prop' || propInfo.type === 'attr') {
			skipWatching = SSR || params.root === true || isFunctional;

			if (!skipWatching) {
				const
					prop = meta.props[propInfo.name],
					propName = prop?.forceUpdate !== false ? propInfo.name : `on:${propInfo.name}`;

				skipWatching = ctx.getPassedProps?.().has(propName) === false;
			}

		} else {
			skipWatching = false;
		}

		if (!skipWatching && isFunctional) {
			let field: Nullable<ComponentField>;

			switch (propInfo.type) {
				case 'system':
					field = meta.systemFields[propInfo.name];
					break;

				case 'field':
					field = meta.fields[propInfo.name];
					break;

				default:
					// Do nothing
			}

			if (field != null) {
				skipWatching = field.functional === false || field.functionalWatching === false;
			}
		}
	}

	return skipWatching;
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
