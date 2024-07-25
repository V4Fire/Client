/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import { getComponentContext } from 'core/component/context';

import { forkMeta } from 'core/component/meta';
import { getPropertyInfo, PropertyInfo } from 'core/component/reflect';
import { getNormalParent } from 'core/component/traverse';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { runHook } from 'core/component/hook';
import { implementEventEmitterAPI } from 'core/component/event';

import { beforeDestroyState } from 'core/component/init/states/before-destroy';
import { destroyedState } from 'core/component/init/states/destroyed';

import type { ComponentInterface, ComponentMeta, ComponentElement, ComponentDestructorOptions } from 'core/component/interface';
import type { InitBeforeCreateStateOptions } from 'core/component/init/interface';

/**
 * Initializes the "beforeCreate" state to the specified component instance
 *
 * @param component
 * @param meta - the component metaobject
 * @param [opts] - additional options
 */
export function beforeCreateState(
	component: ComponentInterface,
	meta: ComponentMeta,
	opts?: InitBeforeCreateStateOptions
): void {
	meta = forkMeta(meta);

	// To avoid TS errors marks all properties as editable
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(component);

	unsafe.unsafe = unsafe;
	unsafe.componentName = meta.componentName;

	unsafe.meta = meta;
	unsafe.instance = Object.cast(meta.instance);

	unsafe.$fields = {};
	unsafe.$systemFields = {};
	unsafe.$modifiedFields = {};
	unsafe.$renderCounter = 0;

	// A stub for the correct functioning of $parent
	unsafe.$restArgs = undefined;

	unsafe.async = new Async(component);
	unsafe.$async = new Async(component);

	Object.defineProperty(unsafe, '$destroy', {
		configurable: true,
		enumerable: false,
		writable: true,
		value: (opts: ComponentDestructorOptions) => {
			beforeDestroyState(component, opts);
			destroyedState(component);
		}
	});

	Object.defineProperty(unsafe, '$resolveRef', {
		configurable: true,
		enumerable: false,
		writable: true,
		value(ref: unknown) {
			if (ref == null) {
				return undefined;
			}

			if (Object.isFunction(ref)) {
				return ref;
			}

			return `${String(ref)}:${unsafe.componentId}`;
		}
	});

	const $getRoot = Symbol('$getRoot');

	Object.defineProperty(unsafe, '$getRoot', {
		configurable: true,
		enumerable: false,
		writable: true,
		value: <ComponentInterface['$getRoot']>((ctx) => {
			if ($getRoot in ctx) {
				return ctx[$getRoot];
			}

			const fn = () => ('getRoot' in ctx ? ctx.getRoot?.() : null) ?? ctx.$root;

			Object.defineProperty(ctx, $getRoot, {
				configurable: true,
				enumerable: true,
				writable: false,
				value: fn
			});

			return fn;
		})
	});

	Object.defineProperty(unsafe, 'r', {
		configurable: true,
		enumerable: true,
		get: () => {
			const r = ('getRoot' in unsafe ? unsafe.getRoot?.() : null) ?? unsafe.$root;

			if ('$remoteParent' in r.unsafe) {
				return r.unsafe.$remoteParent!.$root;
			}

			return r;
		}
	});

	const $getParent = Symbol('$getParent');

	Object.defineProperty(unsafe, '$getParent', {
		configurable: true,
		enumerable: false,
		writable: true,
		value: <ComponentInterface['$getParent']>((ctx, restArgs) => {
			const targetCtx = restArgs != null && 'ctx' in restArgs ? restArgs.ctx ?? ctx : ctx;

			if ($getParent in targetCtx) {
				return targetCtx[$getParent];
			}

			let fn: CanUndef<Function>;

			if (restArgs != null) {
				// VNODE
				if ('type' in restArgs && 'children' in restArgs) {
					fn = () => restArgs.virtualParent?.value != null ? restArgs.virtualParent.value : ctx;

				} else if ('ctx' in restArgs) {
					fn = () => restArgs.ctx ?? ctx;
				}
			}

			if (fn == null) {
				fn = () => ctx;
			}

			Object.defineProperty(targetCtx, $getParent, {
				configurable: true,
				enumerable: true,
				writable: false,
				value: fn
			});

			return fn;
		})
	});

	const
		root = unsafe.$root,
		parent = unsafe.$parent;

	// We are handling a situation where the component's $root refers to an external App.
	// This occurs when the component is rendered asynchronously,
	// as the rendering is done by a separate App instance.
	// In such cases, we need to correct the reference to the parent and $root.
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (parent != null && parent.componentName == null) {
		Object.defineProperty(unsafe, '$root', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: root.unsafe
		});

		Object.defineProperty(unsafe, '$parent', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: root.unsafe.$remoteParent ?? null
		});
	}

	unsafe.$normalParent = getNormalParent(component);

	['$root', '$parent', '$normalParent'].forEach((key) => {
		const
			val = unsafe[key];

		if (val != null) {
			Object.defineProperty(unsafe, key, {
				configurable: true,
				enumerable: true,
				writable: false,
				value: getComponentContext(Object.cast(val))
			});
		}
	});

	Object.defineProperty(unsafe, '$children', {
		configurable: true,
		enumerable: true,
		get() {
			const
				{$el} = unsafe;

			// If the component node is null or a node that cannot have children (such as a text or comment node)
			if ($el?.querySelectorAll == null) {
				return [];
			}

			return Array.from($el.querySelectorAll<ComponentElement>('.i-block-helper'))
				.filter((el) => el.component != null)
				.map((el) => el.component);
		}
	});

	unsafe.$async.worker(() => {
		// We are cleaning memory in a deferred way, because this API may be needed when processing the destroyed hook
		setTimeout(() => {
			['$root', '$parent', '$normalParent', '$children'].forEach((key) => {
				Object.defineProperty(unsafe, key, {
					configurable: true,
					enumerable: true,
					writable: false,
					value: null
				});
			});
		}, 1000);
	});

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventEmitterAPI(component);
	}

	attachAccessorsFromMeta(component);
	runHook('beforeRuntime', component).catch(stderr);

	const {
		systemFields,
		tiedFields,

		computedFields,
		accessors,

		watchDependencies,
		watchers
	} = meta;

	initFields(systemFields, component, unsafe);

	const
		fakeHandler = () => undefined;

	if (watchDependencies.size > 0) {
		const
			isFunctional = meta.params.functional === true;

		const
			watchSet = new Set<PropertyInfo>();

		watchDependencies.forEach((deps) => {
			deps.forEach((dep) => {
				const
					info = getPropertyInfo(Object.isArray(dep) ? dep.join('.') : String(dep), component);

				if (info.type === 'system' || isFunctional && info.type === 'field') {
					watchSet.add(info);
				}
			});
		});

		// If a computed property has a field or system field as a dependency
		// and the host component does not have any watchers to this field,
		// we need to register a "fake" watcher to enforce watching
		watchSet.forEach((info) => {
			const needToForceWatching =
				watchers[info.name] == null &&
				watchers[info.originalPath] == null &&
				watchers[info.path] == null;

			if (needToForceWatching) {
				watchers[info.name] = [
					{
						deep: true,
						immediate: true,
						provideArgs: false,
						handler: fakeHandler
					}
				];
			}
		});
	}

	// If a computed property is tied with a field or system field
	// and the host component does not have any watchers to this field,
	// we need to register a "fake" watcher to enforce watching
	Object.entries(tiedFields).forEach(([name, normalizedName]) => {
		if (normalizedName == null) {
			return;
		}

		const needToForceWatching = watchers[name] == null && (
			accessors[normalizedName] != null ||
			computedFields[normalizedName] != null
		);

		if (needToForceWatching) {
			watchers[name] = [
				{
					deep: true,
					immediate: true,
					provideArgs: false,
					handler: fakeHandler
				}
			];
		}
	});

	runHook('beforeCreate', component).catch(stderr);
	callMethodFromComponent(component, 'beforeCreate');
}
