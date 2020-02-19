/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { asyncLabel, defaultWrapper } from 'core/component/const';

import { runHook } from 'core/component/hook';
import { isTypeCanBeFunc } from 'core/component/prop';
import { initFields } from 'core/component/field';
import { initWatchers } from 'core/component/watch';
import { patchRefs } from 'core/component/create/refs';

import { getNormalParent } from 'core/component/traverse';
import { forkMeta, addMethodsToMeta } from 'core/component/meta';

import {

	ComponentDriver,
	ComponentOptions,
	FunctionalComponentOptions

} from 'core/component/engines';

import {

	ComponentInterface,
	ComponentProp,
	ComponentField,
	ComponentMeta,
	WatchObject

} from 'core/component/interface';

export interface ComponentConstructor<T = unknown> {
	new(): T;
}

export const
	isSmartComponent = /-functional$/,
	isAbstractComponent = /^[iv]-/;

/**
 * Returns a meta object for the specified component
 *
 * @param constructor
 * @param meta
 */
export function getComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): ComponentOptions<ComponentDriver> | FunctionalComponentOptions<ComponentDriver> {
	const
		p = meta.params,
		m = p.model;

	const
		{component, instance} = getBaseComponent(constructor, meta),
		{methods} = meta;

	if (p.functional === true || isAbstractComponent.test(meta.componentName)) {
		return Object.create(component);
	}

	return {
		...<any>component,

		parent: p.parent,
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			model: m.event && m.event.dasherize()
		},

		data(): Dictionary {
			const
				ctx = <any>this,
				data = ctx.$$data;

			initFields(meta.fields, ctx, data);
			runHook('beforeDataCreate', ctx).catch(stderr);
			initWatchers(ctx);

			ctx.$$data = this;
			return data;
		},

		beforeCreate(): void {
			const
				ctx = <any>this;

			ctx.$$data = {};
			ctx.$$refs = {};

			ctx.$async = new Async(this);
			ctx.$asyncLabel = asyncLabel;

			const
				parent = ctx.$parent;

			if (parent && !parent.componentName) {
				ctx.$parent = ctx.$root.$$parent;
			}

			ctx.$normalParent = getNormalParent(ctx);
			ctx.instance = instance;
			ctx.componentName = meta.name;
			ctx.meta = forkMeta(meta);

			runHook('beforeRuntime', ctx)
				.catch(stderr);

			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el) {
					Object.defineProperty(ctx, keys[i], {
						configurable: true,
						enumerable: true,
						get: el.get,
						set: el.set
					});
				}
			}

			initFields(
				meta.systemFields,
				ctx,
				ctx
			);

			runHook('beforeCreate', ctx).catch(stderr);
			callMethodFromMeta(ctx, 'beforeCreate');
		},

		created(): void {
			runHook('created', this).catch(stderr);
			callMethodFromMeta(this, 'created');
		},

		beforeMount(): void {
			runHook('beforeMount', this).catch(stderr);
			callMethodFromMeta(this, 'beforeMount');
		},

		mounted(): void {
			this.$el.component = this;
			runHook('beforeMounted', this).catch(stderr);
			patchRefs(this);

			runHook('mounted', this).then(() => {
				if (methods.mounted) {
					return methods.mounted.fn.call(this);
				}
			}, stderr);
		},

		beforeUpdate(): void {
			runHook('beforeUpdate', this).catch(stderr);
			callMethodFromMeta(this, 'beforeUpdate');
		},

		updated(): void {
			runHook('beforeUpdated', this).catch(stderr);
			patchRefs(this);
			runHook('updated', this).then(() => {
				if (methods.updated) {
					return methods.updated.fn.call(this);
				}
			}, stderr);
		},

		activated(): void {
			runHook('beforeActivated', this).catch(stderr);
			patchRefs(this);
			runHook('activated', this).catch(stderr);
			callMethodFromMeta(this, 'activated');
		},

		deactivated(): void {
			runHook('deactivated', this).catch(stderr);
			callMethodFromMeta(this, 'deactivated');
		},

		beforeDestroy(): void {
			runHook('beforeDestroy', this).catch(stderr);
			callMethodFromMeta(this, 'beforeDestroy');
			this.$async.clearAll().locked = true;
		},

		destroyed(): void {
			runHook('destroyed', this).then(() => {
				if (methods.destroyed) {
					return methods.destroyed.fn.call(this);
				}
			}, stderr);
		},

		errorCaptured(): void {
			const
				args = arguments;

			runHook('errorCaptured', this, ...args).then(() => {
				if (methods.errorCaptured) {
					return methods.errorCaptured.fn.apply(this, args);
				}
			}, stderr);
		}
	};
}

function callMethodFromMeta(ctx: ComponentInterface, method: string): void {
	const
		// @ts-ignore (access)
		obj = ctx.meta.methods[method];

	if (obj) {
		try {
			const
				res = obj.fn.call(ctx);

			if (res instanceof Promise) {
				res.catch(stderr);
			}

		} catch (err) {
			stderr(err);
		}
	}
}

/**
 * Returns a base component object from the specified constructor
 *
 * @param constructor
 * @param meta
 */
export function getBaseComponent(
	constructor: ComponentConstructor<any>,
	meta: ComponentMeta
): {
	mods: Dictionary<string>;
	component: ComponentMeta['component'];
	instance: Dictionary;
} {
	addMethodsToMeta(constructor, meta);

	const
		{component, methods, watchers, hooks} = meta,
		instance = meta.instance = new constructor();

	if (isAbstractComponent.test(meta.componentName)) {
		return {mods: component.mods, component, instance};
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

		component.methods[nm] =
			method.fn;

		if (method.watchers) {
			for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watcher = <NonNullable<WatchObject>>o[key],
					wList = watchers[key] = watchers[key] || [];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				wList.push({
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

	// Computed properties

	for (let o = meta.computed, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		component.computed[key] = o[key];
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
				wList = watchers[key] = watchers[key] || [];

			for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value;

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				wList.push({
					deep: watcher.deep,
					immediate: watcher.immediate,
					provideArgs: watcher.provideArgs,
					handler: watcher.fn
				});
			}
		}
	}

	for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			field = <NonNullable<ComponentField>>o[key];

		if (field.watchers) {
			for (let w = field.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value,
					wList = watchers[key] = watchers[key] || [];

				if (isFunctional && watcher.functional === false) {
					continue;
				}

				wList.push({
					deep: watcher.deep,
					immediate: watcher.immediate,
					provideArgs: watcher.provideArgs,
					handler: watcher.fn
				});
			}
		}
	}

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

	return {mods, component, instance};
}
