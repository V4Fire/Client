/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

import {

	defaultWrapper,
	runHook,
	createMeta,
	initDataObject,
	bindWatchers,
	addMethodsToMeta,
	getNormalParent

} from 'core/component/create/helpers';

import {

	supports,
	minimalCtx,
	ComponentDriver,
	PropOptions,
	ComponentOptions,
	FunctionalComponentOptions

} from 'core/component/engines';

import {

	ComponentInterface,
	ComponentField,
	ComponentProp,
	ComponentMeta,
	WatchOptionsWithHandler

} from 'core/component/interface';

export interface ComponentConstructor<T = unknown> {
	new(): T;
}

export const
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

	if (p.functional === true && supports.functional) {
		return getFunctionalComponent(constructor, meta);
	}

	const
		{component, instance} = getBaseComponent(constructor, meta),
		{methods} = meta;

	if (isAbstractComponent.test(meta.componentName)) {
		return {};
	}

	return {
		...<any>component,

		parent: p.parent,
		inheritAttrs: p.inheritAttrs,
		provide: p.provide,
		inject: p.inject,

		model: m && {
			prop: m.prop,
			model: m.event && m.event.dasherize()
		},

		data(): Dictionary {
			const
				ctx = <any>this,
				data = ctx.$$data;

			initDataObject(meta.fields, ctx, instance, data);
			runHook('beforeDataCreate', ctx.meta, ctx).catch(stderr);

			ctx.$$data = this;
			return data;
		},

		beforeCreate(): void {
			const
				ctx = <any>this;

			ctx.$$data = {};
			ctx.$normalParent = getNormalParent(ctx);
			ctx.$async = new Async(this);
			ctx.instance = instance;
			ctx.componentName = meta.name;
			ctx.meta = createMeta(meta);

			runHook('beforeRuntime', ctx.meta, ctx)
				.catch(stderr);

			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el) {
					Object.defineProperty(ctx, keys[i], {
						get: el.get,
						set: el.set
					});
				}
			}

			initDataObject(
				meta.systemFields,
				ctx,
				instance,
				ctx
			);

			runHook('beforeCreate', meta, ctx).catch(stderr);
			callMethodFromMeta(ctx, 'beforeCreate');
			bindWatchers(ctx);
		},

		created(): void {
			this.hook = 'created';
			bindWatchers(this);
			runHook('created', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'created');
		},

		beforeMount(): void {
			runHook('beforeMount', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'beforeMount');
		},

		mounted(): void {
			this.$el.component = this;
			this.hook = 'mounted';
			bindWatchers(this);

			runHook('mounted', this.meta, this).then(() => {
				if (methods.mounted) {
					return methods.mounted.fn.call(this);
				}
			}, stderr);
		},

		beforeUpdate(): void {
			runHook('beforeUpdate', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'beforeUpdate');
		},

		updated(): void {
			runHook('updated', this.meta, this).then(() => {
				if (methods.updated) {
					return methods.updated.fn.call(this);
				}
			}, stderr);
		},

		activated(): void {
			runHook('activated', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'activated');
		},

		deactivated(): void {
			runHook('deactivated', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'deactivated');
		},

		beforeDestroy(): void {
			runHook('beforeDestroy', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'beforeDestroy');
			this.$async.clearAll().locked = true;
		},

		destroyed(): void {
			runHook('destroyed', this.meta, this).then(() => {
				if (methods.destroyed) {
					return methods.destroyed.fn.call(this);
				}
			}, stderr);
		},

		errorCaptured(): void {
			const
				args = arguments;

			runHook('errorCaptured', this.meta, this, ...args).then(() => {
				if (methods.errorCaptured) {
					return methods.errorCaptured.fn.apply(this, args);
				}
			}, stderr);
		}
	};
}

function callMethodFromMeta(ctx: ComponentInterface, method: string): void {
	const
		// @ts-ignore
		obj = ctx.meta.methods[method];

	if (obj) {
		try {
			const
				res = obj.fn.call(ctx);

			if (Object.isPromise(res)) {
				res.catch(stderr);
			}

		} catch (err) {
			stderr(err);
		}
	}
}

/**
 * Returns a meta object for the specified functional component
 *
 * @param constructor
 * @param meta
 */
export function getFunctionalComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): FunctionalComponentOptions<ComponentDriver> {
	const
		{component, instance} = getBaseComponent(constructor, meta),
		{params: p} = meta;

	const
		props = {};

	if (!isAbstractComponent.test(meta.componentName)) {
		component.ctx = Object.assign(Object.create(minimalCtx), {
			meta,
			instance,
			componentName: meta.componentName,
			$options: {}
		});

		for (let o = component.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key],
				prop: PropOptions = props[key] = {...el};

			if (el && Object.isFunction(el.default) && !el.default[defaultWrapper]) {
				prop.default = undefined;
			}
		}
	}

	return <ReturnType<typeof getFunctionalComponent>>{
		props,
		name: meta.name,
		functional: true,
		inject: p.inject,
		render: component.render
	};
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

	for (let o = methods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			nm = keys[i],
			method = o[nm];

		if (!method) {
			continue;
		}

		component.methods[nm] =
			method.fn;

		for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = <NonNullable<WatchOptionsWithHandler>>o[key],
				wList = watchers[key] = watchers[key] || [];

			wList.push({
				method: nm,
				group: el.group,
				single: el.single,
				options: el.options,
				args: (<unknown[]>[]).concat(el.args || []),
				provideArgs: el.provideArgs,
				deep: el.deep,
				immediate: el.immediate,
				wrapper: el.wrapper,
				handler: <any>method.fn
			});
		}

		for (let o = method.hooks, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			hooks[key].push({
				name: el.name,
				fn: method.fn,
				after: el.after
			});
		}
	}

	for (let o = meta.computed, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		component.computed[key] = o[key];
	}

	const
		defaultProps = meta.params.defaultProps !== false;

	for (let o = meta.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			prop = <NonNullable<ComponentProp>>o[key];

		let
			def,
			defWrapper,
			isFunc,
			skipDefault = true;

		if (defaultProps || prop.forceDefault) {
			skipDefault = false;
			def = defWrapper = instance[key];
			isFunc = hasPropCanFunc(prop.type);

			if (def && typeof def === 'object' && (!isFunc || !Object.isFunction(def))) {
				defWrapper = () => Object.fastClone(def);
				defWrapper[defaultWrapper] = true;
			}
		}

		component.props[key] = {
			type: prop.type,
			required: prop.required,
			validator: prop.validator,
			default: !skipDefault ? prop.default !== undefined ? prop.default : defWrapper : undefined
		};

		if (prop.watchers.size) {
			const
				wList = watchers[key] = watchers[key] || [];

			for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					val = el.value;

				wList.push({
					deep: val.deep,
					immediate: val.immediate,
					provideArgs: val.provideArgs,
					handler: val.fn
				});
			}
		}
	}

	for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			field = <NonNullable<ComponentField>>o[key];

		for (let w = field.watchers.values(), el = w.next(); !el.done; el = w.next()) {
			const
				val = el.value,
				wList = watchers[key] = watchers[key] || [];

			wList.push({
				deep: val.deep,
				immediate: val.immediate,
				provideArgs: val.provideArgs,
				handler: val.fn
			});
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

function hasPropCanFunc(type: CanUndef<CanArray<Function>>): boolean {
	if (!type) {
		return false;
	}

	if (Object.isArray(type)) {
		for (let i = 0; i < type.length; i++) {
			if (type[i] === Function) {
				return true;
			}
		}

		return false;
	}

	return type === Function;
}
