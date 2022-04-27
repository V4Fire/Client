/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, {

	set,
	unset,
	mute,

	watchHandlers,
	MultipleWatchHandler,

	Watcher

} from 'core/object/watch';

import { getPropertyInfo } from 'core/component/reflect';

import {

	dynamicHandlers,
	immediateDynamicHandlers,

	cacheStatus,
	tiedWatchers,

	watcherInitializer,
	toComponentObject

} from 'core/component/watch/const';

import { createWatchFn } from 'core/component/watch/create';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

import type { ComponentInterface, RawWatchHandler } from 'core/component/interface';
import type { ImplementComponentWatchAPIOptions } from 'core/component/watch/interface';

/**
 * Implements watch API to the passed component instance
 *
 * @param component
 * @param [opts] - additional options
 */
export function implementComponentWatchAPI(
	component: ComponentInterface,
	opts?: ImplementComponentWatchAPIOptions
): void {
	const {
		unsafe,
		unsafe: {$async: $a, meta: {computedFields, watchDependencies, watchPropDependencies, params}},
		$renderEngine: {proxyGetters}
	} = component;

	const
		isFunctional = params.functional === true,
		usedHandlers = new Set<Function>();

	let
		timerId;

	const
		fieldsInfo = proxyGetters.field(component),
		systemFieldsInfo = proxyGetters.system(component);

	const watchOpts = {
		deep: true,
		withProto: true,
		collapse: true,
		postfixes: ['Store'],
		dependencies: watchDependencies
	};

	// We need to manage situations when we have accessors with dependencies from external components,
	// that's why we iterate over the all dependencies list,
	// find external dependencies and attach watchers that directly update state
	if (watchDependencies.size > 0) {
		const
			immediateHandler = invalidateComputedCache(),
			handler = emitAccessorEvents();

		handler[tiedWatchers] = [];
		immediateHandler[tiedWatchers] = handler[tiedWatchers];

		const watchOpts = {
			deep: true,
			withProto: true
		};

		for (let o = watchDependencies.entries(), el = o.next(); !el.done; el = o.next()) {
			const
				[key, deps] = el.value;

			const
				newDeps: typeof deps = [];

			let
				needForkDeps = false;

			for (let j = 0; j < deps.length; j++) {
				const
					dep = deps[j],
					depPath = Object.isString(dep) ? dep : dep.join('.'),
					watchInfo = getPropertyInfo(depPath, component);

				newDeps[j] = dep;

				if (watchInfo.ctx === component && !watchDependencies.has(dep)) {
					needForkDeps = true;
					newDeps[j] = watchInfo.path;
					continue;
				}

				const invalidateCache = (value, oldValue, info) => {
					info = Object.assign(Object.create(info), {
						path: [key],
						parent: {value, oldValue, info}
					});

					immediateHandler(value, oldValue, info);
				};

				attachDynamicWatcher(
					component,
					watchInfo,

					{
						...watchOpts,
						immediate: true
					},

					invalidateCache,
					immediateDynamicHandlers
				);

				const broadcastEvents = (mutations, ...args) => {
					if (args.length > 0) {
						mutations = [Object.cast([mutations, ...args])];
					}

					const
						modifiedMutations: any[] = [];

					for (let i = 0; i < mutations.length; i++) {
						const
							[value, oldValue, info] = mutations[i];

						modifiedMutations.push([
							value,
							oldValue,

							Object.assign(Object.create(info), {
								path: [key],

								originalPath: watchInfo.type === 'mounted' ?
									[watchInfo.name, ...info.originalPath] :
									info.originalPath,

								parent: {value, oldValue, info}
							})
						]);
					}

					handler(modifiedMutations);
				};

				attachDynamicWatcher(component, watchInfo, watchOpts, broadcastEvents, dynamicHandlers);
			}

			if (needForkDeps) {
				watchDependencies.set(key, newDeps);
			}
		}
	}

	let
		fieldWatchOpts;

	if (!isFunctional && opts?.tieFields) {
		fieldWatchOpts = {...watchOpts, tiedWith: component};

	} else {
		fieldWatchOpts = watchOpts;
	}

	// Watcher of fields

	let
		fieldsWatcher;

	if (isFunctional) {
		// Don't force watching of fields until it becomes necessary
		fieldsInfo.value[watcherInitializer] = () => {
			delete fieldsInfo.value[watcherInitializer];
			initFieldsWatcher();
		};

	} else {
		initFieldsWatcher();
	}

	// Don't force watching of system fields until it becomes necessary
	systemFieldsInfo.value[watcherInitializer] = () => {
		delete systemFieldsInfo.value[watcherInitializer];

		const immediateSystemWatchOpts = {
			...watchOpts,
			immediate: true
		};

		const systemFieldsWatcher = watch(systemFieldsInfo.value, immediateSystemWatchOpts, invalidateComputedCache());
		$a.worker(() => systemFieldsWatcher.unwatch());

		{
			const w = watch(systemFieldsWatcher.proxy, watchOpts, emitAccessorEvents());
			$a.worker(() => w.unwatch());
		}

		initWatcher(systemFieldsInfo.key, systemFieldsWatcher);
	};

	// Register the base watch API methods

	Object.defineProperty(component, '$watch', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: createWatchFn(component)
	});

	Object.defineProperty(component, '$set', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path, val) => {
			set(obj, path, val, obj[watchHandlers] ?? fieldsWatcher?.proxy[watchHandlers]);
			return val;
		}
	});

	Object.defineProperty(component, '$delete', {
		enumerable: true,
		configurable: true,
		writable: true,
		value: (obj, path) => {
			unset(obj, path, obj[watchHandlers] ?? fieldsWatcher?.proxy[watchHandlers]);
		}
	});

	// Watching of component props.
	// The root component and functional components can't watch their props.
	if (!isFunctional && !params.root) {
		const
			props = proxyGetters.prop(component),
			propsStore = props.value;

		// We need to attach a watcher for a prop object
		// and watchers for each non-primitive value of that object, like arrays or maps.
		if (Object.isTruly(propsStore)) {
			const propWatchOpts = {
				...watchOpts,
				postfixes: ['Prop']
			};

			// If a component engine does not have the own mechanism of watching,
			// we need to wrap a prop object by myself
			if (!('watch' in props)) {
				const propsWatcher = watch(propsStore, propWatchOpts);
				$a.worker(() => propsWatcher.unwatch());
				initWatcher(props.key, propsWatcher);
			}

			// We need to attach default watchers for all props that can affect component computed fields
			if (watchPropDependencies.size > 0) {
				for (let o = watchPropDependencies.entries(), el = o.next(); !el.done; el = o.next()) {
					const
						[computed, props] = el.value,
						tiedLinks = [computed];

					const
						immediateHandler = invalidateComputedCache(),
						handler = emitAccessorEvents();

					// Provide a list of connections to the handlers
					immediateHandler[tiedWatchers] = tiedLinks;
					handler[tiedWatchers] = tiedLinks;

					for (let o = props.values(), el = o.next(); !el.done; el = o.next()) {
						const prop = el.value;
						unsafe.$watch(prop, {...propWatchOpts, immediate: true}, immediateHandler);
						unsafe.$watch(prop, propWatchOpts, handler);
					}
				}
			}
		}
	}

	// Initializes the specified watcher on a component instance
	function initWatcher(name: Nullable<string>, watcher: Watcher) {
		if (name == null) {
			return;
		}

		mute(watcher.proxy);

		watcher.proxy[toComponentObject] = component;
		Object.defineProperty(component, name, {
			enumerable: true,
			configurable: true,
			value: watcher.proxy
		});

		if (isFunctional) {
			// We need to track all modified fields of a function instance
			// to restore state if a parent has re-created the component
			const w = watch(watcher.proxy, {deep: true, collapse: true, immediate: true}, (v, o, i) => {
				unsafe.$modifiedFields[String(i.path[0])] = true;
			});

			$a.worker(() => w.unwatch());
		}
	}

	// Initializes the field watcher on a component instance
	function initFieldsWatcher() {
		const immediateFieldWatchOpts = {
			...fieldWatchOpts,
			immediate: true
		};

		fieldsWatcher = watch(fieldsInfo.value, immediateFieldWatchOpts, invalidateComputedCache());
		$a.worker(() => fieldsWatcher.unwatch());

		{
			const w = watch(fieldsWatcher.proxy, fieldWatchOpts, emitAccessorEvents());
			$a.worker(() => w.unwatch());
		}

		initWatcher(fieldsInfo.key, fieldsWatcher);
	}

	// The handler to invalidate cache of computed fields
	function invalidateComputedCache(): RawWatchHandler {
		// eslint-disable-next-line @typescript-eslint/typedef
		return function invalidateComputedCache(val, oldVal, info) {
			if (info == null) {
				return;
			}

			const
				{path} = info,
				rootKey = String(path[0]);

			// If there has been changed properties that can affect memoized computed fields,
			// then we need to invalidate these caches
			if (computedFields[rootKey]?.get != null) {
				delete Object.getOwnPropertyDescriptor(component, rootKey)?.get?.[cacheStatus];
			}

			// We need to provide this mutation to other listeners.
			// This behavior fixes a bug when we have some accessor that depends on a property from another component.

			const
				ctx = invalidateComputedCache[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
				currentDynamicHandlers = immediateDynamicHandlers.get(ctx)?.[rootKey];

			if (currentDynamicHandlers) {
				for (let o = currentDynamicHandlers.values(), el = o.next(); !el.done; el = o.next()) {
					el.value(val, oldVal, info);
				}
			}
		};
	}

	// The handler to broadcast events of accessors
	function emitAccessorEvents(): MultipleWatchHandler {
		// eslint-disable-next-line @typescript-eslint/typedef
		return function emitAccessorEvents(mutations, ...args) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (args.length > 0) {
				mutations = [Object.cast([mutations, ...args])];
			}

			for (let i = 0; i < mutations.length; i++) {
				const
					eventArgs = mutations[i],
					info = eventArgs[2];

				const
					{path} = info;

				if (path[path.length - 1] === '__proto__') {
					continue;
				}

				if (info.parent != null) {
					const
						{path: parentPath} = info.parent.info;

					if (parentPath[parentPath.length - 1] === '__proto__') {
						continue;
					}
				}

				const
					rootKey = String(path[0]),
					ctx = emitAccessorEvents[tiedWatchers] != null ? component : info.root[toComponentObject] ?? component,
					currentDynamicHandlers = dynamicHandlers.get(ctx)?.[rootKey];

				if (currentDynamicHandlers) {
					for (let o = currentDynamicHandlers.values(), el = o.next(); !el.done; el = o.next()) {
						const
							handler = el.value;

						// Because we register several watchers (props, fields, etc.) at the same time,
						// we need to control that every dynamic handler must be invoked no more than one time per tick
						if (usedHandlers.has(handler)) {
							continue;
						}

						handler(...eventArgs);
						usedHandlers.add(handler);

						if (timerId == null) {
							timerId = setImmediate(() => {
								timerId = undefined;
								usedHandlers.clear();
							});
						}
					}
				}
			}
		};
	}
}
