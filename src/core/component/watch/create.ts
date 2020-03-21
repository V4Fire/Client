/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch from 'core/object/watch';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { ComponentInterface, WatchOptions, RawWatchHandler } from 'core/component/interface';

import { proxyGetters } from 'core/component/watch/const';
import { DynamicHandlers } from 'core/component/watch/interface';
import { cloneWatchValue } from 'core/component';

/**
 * Creates a function to watch changes from the specified component instance and returns it
 *
 * @param component - component instance
 * @param dynamicHandlers - map of handlers to watch dynamic fields, like accessors and computedFields
 */
export function createWatchFn(
	component: ComponentInterface,
	dynamicHandlers: DynamicHandlers
): ComponentInterface['$watch'] {
	const
		watchCache = Object.createDict();

	return (path, optsOrHandler, rawHandler?) => {
		let
			handler: RawWatchHandler,
			opts: CanUndef<WatchOptions>;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = {};

		} else {
			handler = rawHandler;
			opts = optsOrHandler;
		}

		const
			info: PropertyInfo = Object.isString(path) ? getPropertyInfo(path, component) : path,
			getData = proxyGetters[info.type];

		const
			needCache = handler.length > 1,
			ref = info.originalPath;

		let
			oldVal;

		const
			isAccessor = info.type === 'accessor' || info.type === 'computed' || info.accessor,
			getVal = () => Object.get(info.type === 'field' ? getData(info.ctx) : component, info.originalPath);

		if (needCache) {
			oldVal = watchCache[ref] = ref in watchCache ?
				watchCache[ref] :
				opts?.immediate || !isAccessor ? cloneWatchValue(getVal(), opts) : undefined;
			const
				original = handler;

			handler = (val, _, ...args) => {
				if (isAccessor) {
					val = Object.get(component, info.originalPath);
				}

				const res = original.call(this, val, oldVal, ...args);
				oldVal = watchCache[ref] = cloneWatchValue(val, opts);
				return res;
			};

			if (opts?.immediate) {
				handler.call(component, oldVal);
			}

		} else if (opts?.immediate) {
			handler.call(component, getVal());
		}

		if (getData) {
			const
				proxy = getData(info.ctx);

			if (info.type === 'system' && !Object.getOwnPropertyDescriptor(info.ctx, info.name)?.get) {
				Object.defineProperty(info.ctx, info.name, {
					enumerable: true,
					configurable: true,
					get: () => proxy[info.name],
					set: (v) => proxy[info.name] = v
				});
			}

			const {unwatch} = watch(getData(info.ctx), info.path, {collapse: true, ...opts, immediate: false}, handler);
			return unwatch;
		}

		let
			handlersStore = dynamicHandlers.get(component);

		if (!handlersStore) {
			handlersStore = Object.createDict();
			dynamicHandlers.set(component, handlersStore);
		}

		const
			nm = info.accessor || info.name;

		let
			handlersSet = handlersStore[nm];

		if (!handlersSet) {
			handlersSet = handlersStore[nm] = new Set<Function>();
		}

		handlersSet.add(handler);

		return () => {
			handlersSet?.delete(handler);
		};
	};
}
