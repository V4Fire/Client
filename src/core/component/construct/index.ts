/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/construct/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from '@src/core/symbol';

import { deprecate } from '@src/core/functools/deprecation';
import { unmute } from '@src/core/object/watch';

import Async from '@src/core/async';

import { asyncLabel } from '@src/core/component/const';
import { getPropertyInfo, PropertyInfo } from '@src/core/component/reflection';

import { initFields } from '@src/core/component/field';
import { attachAccessorsFromMeta } from '@src/core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from '@src/core/component/method';

import { implementEventAPI } from '@src/core/component/event';
import { bindRemoteWatchers, implementComponentWatchAPI } from '@src/core/component/watch';

import { runHook } from '@src/core/component/hook';
import { resolveRefs } from '@src/core/component/ref';

import { getNormalParent } from '@src/core/component/traverse';
import { forkMeta } from '@src/core/component/meta';

import type { ComponentInterface, ComponentMeta, Hook } from '@src/core/component/interface';
import type { InitBeforeCreateStateOptions, InitBeforeDataCreateStateOptions } from '@src/core/component/construct/interface';

export * from '@src/core/component/construct/interface';

export const
	$$ = symbolGenerator();

/**
 * Initializes "beforeCreate" state to the specified component instance
 *
 * @param component
 * @param meta - component meta object
 * @param [opts] - additional options
 */
export function beforeCreateState(
	component: ComponentInterface,
	meta: ComponentMeta,
	opts?: InitBeforeCreateStateOptions
): void {
	meta = forkMeta(meta);

	// @ts-ignore (access)
	component.unsafe = component;

	// @ts-ignore (access)
	component.meta = meta;

	// @ts-ignore (access)
	component['componentName'] = meta.componentName;

	// @ts-ignore (access)
	component['instance'] = meta.instance;

	// @ts-ignore (access)
	component.$fields = {};

	// @ts-ignore (access)
	component.$systemFields = {};

	// @ts-ignore (access)
	component.$refHandlers = {};

	// @ts-ignore (access)
	component.$modifiedFields = {};

	// @ts-ignore (access)
	component.$async = new Async(component);

	// @ts-ignore (access)
	component.$asyncLabel = asyncLabel;

	const
		{unsafe, unsafe: {$parent: parent}} = component;

	const
		isFunctional = meta.params.functional === true;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (parent != null && parent.componentName == null) {
		// @ts-ignore (access)
		unsafe['$parent'] = unsafe.$root.unsafe.$remoteParent;
	}

	// @ts-ignore (access)
	unsafe['$normalParent'] = getNormalParent(component);

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventAPI(component);
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
			watchSet = new Set<PropertyInfo>();

		for (let o = watchDependencies.values(), el = o.next(); !el.done; el = o.next()) {
			const
				deps = el.value;

			for (let i = 0; i < deps.length; i++) {
				const
					dep = deps[i],
					info = getPropertyInfo(Object.isArray(dep) ? dep.join('.') : String(dep), component);

				if (info.type === 'system' || isFunctional && info.type === 'field') {
					watchSet.add(info);
				}
			}
		}

		// If a computed property a field or system field as a dependency,
		// and the host component does not have any watchers to this field,
		// we need to register the "fake" watcher to force watching
		if (watchSet.size > 0) {
			for (let o = watchSet.values(), el = o.next(); !el.done; el = o.next()) {
				const
					info = el.value;

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
			}
		}
	}

	// If a computed property is tied with a field or system field
	// and the host component does not have any watchers to this field,
	// we need to register the "fake" watcher to force watching
	for (let keys = Object.keys(tiedFields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			normalizedKey = tiedFields[key];

		if (normalizedKey == null) {
			continue;
		}

		const needToForceWatching = watchers[key] == null && (
			accessors[normalizedKey] != null ||
			computedFields[normalizedKey] != null
		);

		if (needToForceWatching) {
			watchers[key] = [
				{
					deep: true,
					immediate: true,
					provideArgs: false,
					handler: fakeHandler
				}
			];
		}
	}

	runHook('beforeCreate', component).catch(stderr);
	callMethodFromComponent(component, 'beforeCreate');
}

/**
 * Initializes "beforeDataCreate" state to the specified component instance
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

	Object.defineProperty(component, '$$data', {
		get(): typeof $fields {
			deprecate({name: '$$data', type: 'property', renamedTo: '$fields'});
			return $fields;
		}
	});

	runHook('beforeDataCreate', component)
		.catch(stderr);

	if (!component.isFlyweight && !component.$renderEngine.supports.ssr) {
		implementComponentWatchAPI(component, {tieFields: opts?.tieFields});
		bindRemoteWatchers(component);
	}
}

/**
 * Initializes "created" state to the specified component instance
 * @param component
 */
export function createdState(component: ComponentInterface): void {
	const {
		unsafe,
		unsafe: {$root: r, $async: $a, $normalParent: parent}
	} = component;

	unmute(unsafe.$fields);
	unmute(unsafe.$systemFields);

	const
		isRegular = unsafe.meta.params.functional !== true && !unsafe.isFlyweight;

	if (parent != null && '$remoteParent' in r) {
		const
			p = parent.unsafe,
			onBeforeDestroy = unsafe.$destroy.bind(unsafe);

		p.$on('on-component-hook:before-destroy', onBeforeDestroy);
		$a.worker(() => p.$off('on-component-hook:before-destroy', onBeforeDestroy));

		if (isRegular) {
			const activationHooks: Dictionary<boolean> = Object.createDict({
				activated: true,
				deactivated: true
			});

			const onActivation = (status: Hook) => {
				if (!activationHooks[status]) {
					return;
				}

				if (status === 'deactivated') {
					component.deactivate();
					return;
				}

				$a.requestIdleCallback(component.activate.bind(component), {
					label: $$.remoteActivation,
					timeout: 50
				});
			};

			if (activationHooks[p.hook]) {
				onActivation(p.hook);
			}

			p.$on('on-component-hook-change', onActivation);
			$a.worker(() => p.$off('on-component-hook-change', onActivation));
		}
	}

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}).catch(stderr);
}

/**
 * Initializes "beforeMount" state to the specified component instance
 * @param component
 */
export function beforeMountState(component: ComponentInterface): void {
	const
		{$el} = component;

	if ($el != null) {
		$el.component = component;
	}

	if (!component.isFlyweight) {
		runHook('beforeMount', component).catch(stderr);
		callMethodFromComponent(component, 'beforeMount');
	}
}

/**
 * Initializes "mounted" state to the specified component instance
 * @param component
 */
export function mountedState(component: ComponentInterface): void {
	const
		{$el} = component;

	if ($el != null && $el.component !== component) {
		$el.component = component;
	}

	resolveRefs(component);

	runHook('mounted', component).then(() => {
		callMethodFromComponent(component, 'mounted');
	}).catch(stderr);
}

/**
 * Initializes "beforeUpdate" state to the specified component instance
 * @param component
 */
export function beforeUpdateState(component: ComponentInterface): void {
	runHook('beforeUpdate', component).catch(stderr);
	callMethodFromComponent(component, 'beforeUpdate');
}

/**
 * Initializes "updated" state to the specified component instance
 * @param component
 */
export function updatedState(component: ComponentInterface): void {
	runHook('beforeUpdated', component).catch(stderr);
	resolveRefs(component);

	runHook('updated', component).then(() => {
		callMethodFromComponent(component, 'updated');
	}).catch(stderr);
}

/**
 * Initializes "activated" state to the specified component instance
 * @param component
 */
export function activatedState(component: ComponentInterface): void {
	runHook('beforeActivated', component).catch(stderr);
	resolveRefs(component);

	runHook('activated', component).catch(stderr);
	callMethodFromComponent(component, 'activated');
}

/**
 * Initializes "deactivated" state to the specified component instance
 * @param component
 */
export function deactivatedState(component: ComponentInterface): void {
	runHook('deactivated', component).catch(stderr);
	callMethodFromComponent(component, 'deactivated');
}

/**
 * Initializes "beforeDestroy" state to the specified component instance
 * @param component
 */
export function beforeDestroyState(component: ComponentInterface): void {
	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');
	component.unsafe.$async.clearAll().locked = true;
}

/**
 * Initializes "destroyed" state to the specified component instance
 * @param component
 */
export function destroyedState(component: ComponentInterface): void {
	runHook('destroyed', component).then(() => {
		callMethodFromComponent(component, 'destroyed');
	}).catch(stderr);
}

/**
 * Initializes "errorCaptured" state to the specified component instance
 *
 * @param component
 * @param args - additional arguments
 */
export function errorCapturedState(component: ComponentInterface, ...args: unknown[]): void {
	runHook('errorCaptured', component, ...args).then(() => {
		callMethodFromComponent(component, 'errorCaptured', ...args);
	}).catch(stderr);
}
