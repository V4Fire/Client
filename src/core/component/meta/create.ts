/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defaultWrapper } from 'core/component/const';

import { getComponentMods, isAbstractComponent } from 'core/component/reflection';
import { isTypeCanBeFunc } from 'core/component/prop';
import { wrapRender } from 'core/component/render-function';

import { inherit } from 'core/component/meta/inherit';
import { addMethodsToMeta } from 'core/component/meta/methods';

import {

	ComponentMeta,
	ComponentConstructor,
	ComponentConstructorInfo,

	ComponentProp,
	ComponentField,
	WatchObject,

	RenderFunction

} from 'core/component/interface';

/**
 * Creates a meta object for the specified component and returns it
 * @param component - component constructor info
 */
export function createMeta(component: ComponentConstructorInfo): ComponentMeta {
	const meta = {
		name: component.name,
		componentName: component.componentName,

		parentMeta: component.parentMeta,
		constructor: component.constructor,
		instance: {},
		params: component.params,

		props: {},
		mods: getComponentMods(component),

		fields: {},
		computedFields: {},
		systemFields: {},

		accessors: {},
		methods: {},
		watchers: {},
		watchDependencies: new Map(),

		hooks: {
			beforeRuntime: [],
			beforeCreate: [],
			beforeDataCreate: [],
			created: [],
			beforeMount: [],
			beforeMounted: [],
			mounted: [],
			beforeUpdate: [],
			beforeUpdated: [],
			updated: [],
			beforeActivated: [],
			activated: [],
			deactivated: [],
			beforeDestroy: [],
			destroyed: [],
			errorCaptured: []
		},

		component: {
			name: component.name,
			mods: {},
			props: {},
			methods: {},
			staticRenderFns: [],
			render: <RenderFunction>(() => {
				throw new ReferenceError(`A render function for the component "${component.componentName}" is not specified`);
			})
		}
	};

	meta.component.render = wrapRender(meta);

	if (component.parentMeta) {
		inherit(meta, component.parentMeta);
	}

	return meta;
}

/**
 * Fills a meta object with methods and properties from the specified component class
 *
 * @param meta
 * @param [constructor] - component constructor
 */
export function fillMeta(
	meta: ComponentMeta,
	constructor: ComponentConstructor<any> = meta.constructor
): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	const
		{component, methods, watchers, hooks} = meta;

	const
		instance = meta.instance = new constructor();

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	const
		isFunctional = meta.params.functional === true;

	// Methods

	for (let o = methods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			nm = keys[i],
			method = o[nm];

		if (!method) {
			continue;
		}

		component.methods[nm] = method.fn;

		if (method.watchers) {
			for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = <NonNullable<WatchObject>>o[key],
					watcherListeners = watchers[key] = watchers[key] || [];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				watcherListeners.push({
					method: nm,
					group: watcher.group,
					single: watcher.single,
					options: watcher.options,
					args: (<unknown[]>[]).concat(watcher.args || []),
					provideArgs: watcher.provideArgs,
					deep: watcher.deep,
					immediate: watcher.immediate,
					wrapper: watcher.wrapper,
					handler: <any>method.fn
				});
			}
		}

		// Hooks

		if (method.hooks) {
			for (let o = method.hooks, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = o[key];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				hooks[key].push({
					name: watcher.name,
					fn: method.fn,
					after: watcher.after
				});
			}
		}
	}

	// Props

	const
		defaultProps = meta.params.defaultProps !== false;

	for (let o = meta.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			prop = <NonNullable<ComponentProp>>o[key];

		let
			def,
			defWrapper,
			skipDefault = true;

		if (defaultProps || prop.forceDefault) {
			skipDefault = false;
			def = defWrapper = instance[key];

			if (def && typeof def === 'object' && (!isTypeCanBeFunc(prop.type) || !Object.isFunction(def))) {
				defWrapper = () => Object.fastClone(def);
				defWrapper[defaultWrapper] = true;
			}
		}

		const
			defValue = !skipDefault ? prop.default !== undefined ? prop.default : defWrapper : undefined;

		component.props[key] = {
			type: prop.type,
			required: prop.required !== false && defaultProps && defValue === undefined,
			validator: prop.validator,
			functional: prop.functional,
			default: defValue
		};

		if (prop.watchers && prop.watchers.size) {
			const
				watcherListeners = watchers[key] = watchers[key] || [];

			for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value;

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				watcherListeners.push({
					deep: watcher.deep,
					immediate: watcher.immediate,
					provideArgs: watcher.provideArgs,
					handler: watcher.fn
				});
			}
		}
	}

	// Fields

	for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			field = <NonNullable<ComponentField>>o[key];

		if (field.watchers) {
			for (let w = field.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value,
					watcherListeners = watchers[key] = watchers[key] || [];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				watcherListeners.push({
					deep: watcher.deep,
					immediate: watcher.immediate,
					provideArgs: watcher.provideArgs,
					handler: watcher.fn
				});
			}
		}
	}

	// Modifiers

	const
		mods = component.mods;

	for (let o = meta.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mod = o[key];

		let
			def;

		if (mod) {
			for (let i = 0; i < mod.length; i++) {
				const
					el = mod[i];

				if (Object.isArray(el)) {
					def = el;
					break;
				}
			}

			mods[key] = def ? String(def[0]) : undefined;
		}
	}

	return meta;
}
