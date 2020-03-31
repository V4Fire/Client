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

import Async from 'core/async';

import { unmute } from 'core/object/watch';
import { asyncLabel } from 'core/component/const';

import { initFields } from 'core/component/field';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta, callMethodFromComponent } from 'core/component/method';

import { implementEventAPI } from 'core/component/event';
import {bindRemoteWatchers, implementComponentWatchAPI, watcherInitializer} from 'core/component/watch';

import { runHook } from 'core/component/hook';
import { resolveRefs } from 'core/component/ref';

import { getNormalParent } from 'core/component/traverse';
import { forkMeta } from 'core/component/meta';

import { ComponentInterface, ComponentMeta } from 'core/component/interface';
import { InitBeforeCreateStateOptions, InitBeforeDataCreateStateOptions } from 'core/component/construct/interface';

export * from 'core/component/construct/interface';

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
	Object.assign(component, {
		meta: forkMeta(meta),
		componentName: meta.componentName,
		instance: meta.instance,

		$fields: {},
		$systemFields: {},
		$refHandlers: {},
		$modifiedFields: {},
		$async: new Async(component),
		$asyncLabel: asyncLabel
	});

	const
		parent = component.$parent;

	if (parent && !parent.componentName) {
		// @ts-ignore (access)
		// tslint:disable-next-line:no-string-literal
		component['$parent'] = component.$root.$remoteParent;
	}

	// @ts-ignore (access)
	// tslint:disable-next-line:no-string-literal
	component['$normalParent'] = getNormalParent(component);

	if (opts?.addMethods) {
		attachMethodsFromMeta(component);
	}

	if (opts?.implementEventAPI) {
		implementEventAPI(component);
	}

	attachAccessorsFromMeta(component, opts?.safe);
	runHook('beforeRuntime', component).catch(stderr);
	initFields(meta.systemFields, component, <any>component);

	const
		{watchDependencies} = meta;

	let
		watchMap;

	if (watchDependencies.size) {
		watchMap = Object.createDict();

		for (let o = watchDependencies.values(), el = o.next(); !el.done; el = o.next()) {
			const val = el.value;
			watchMap[<string>(Object.isArray(val) ? val[0] : val)] = true;
		}
	}

	// Tie system fields with a component
	for (let keys = Object.keys(meta.systemFields), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		// @ts-ignore (access)
		component.$systemFields[key] = component[key];

		if (watchMap?.[key]) {
			Object.defineProperty(component, key, {
				enumerable: true,
				configurable: true,

				// @ts-ignore (access)
				get: () => component.$systemFields[key],

				// @ts-ignore (access)
				set: (v) => component.$systemFields[key] = v
			});
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
	const
		// @ts-ignore (access)
		{meta, $fields} = component;

	initFields(meta.fields, component, $fields);
	runHook('beforeDataCreate', component).catch(stderr);
	implementComponentWatchAPI(component, {tieFields: opts?.tieFields});
	bindRemoteWatchers(component);
}

/**
 * Initializes "created" state to the specified component instance
 * @param component
 */
export function createdState(component: ComponentInterface): void {
	// @ts-ignore (access)
	unmute(component.$fields);

	// @ts-ignore (access)
	unmute(component.$systemFields);

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}, stderr);
}

/**
 * Initializes "beforeMount" state to the specified component instance
 * @param component
 */
export function beforeMountState(component: ComponentInterface): void {
	runHook('beforeMount', component).catch(stderr);
	callMethodFromComponent(component, 'beforeMount');
}

/**
 * Initializes "mounted" state to the specified component instance
 * @param component
 */
export function mountedState(component: ComponentInterface): void {
	component.$el.component = component;
	runHook('beforeMounted', component).catch(stderr);
	resolveRefs(component);

	runHook('mounted', component).then(() => {
		callMethodFromComponent(component, 'mounted');
	}, stderr);
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
	}, stderr);
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
	const
		// @ts-ignore (access)
		{$async} = component;

	runHook('beforeDestroy', component).catch(stderr);
	callMethodFromComponent(component, 'beforeDestroy');
	$async.clearAll().locked = true;
}

/**
 * Initializes "destroyed" state to the specified component instance
 * @param component
 */
export function destroyedState(component: ComponentInterface): void {
	runHook('destroyed', component).then(() => {
		callMethodFromComponent(component, 'destroyed');
	}, stderr);
}

/**
 * Initializes "errorCaptured" state to the specified component instance
 * @param component
 */
export function errorCapturedState(component: ComponentInterface): void {
	const
		args = arguments;

	runHook('errorCaptured', component, ...args).then(() => {
		callMethodFromComponent(component, 'errorCaptured', ...args);
	}, stderr);
}
