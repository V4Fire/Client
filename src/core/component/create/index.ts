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

	ComponentDriver,
	ComponentOptions,
	FunctionalComponentOptions

} from 'core/component/engines';

import {

	ComponentElement,
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
			ctx.$async = new Async(this);
			ctx.$normalParent = getNormalParent(ctx);

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
			runHook('created', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'created');
		},

		beforeMount(): void {
			runHook('beforeMount', this.meta, this).catch(stderr);
			callMethodFromMeta(this, 'beforeMount');
		},

		mounted(): void {
			this.$el.component = this;
			runHook('beforeMounted', this.meta, this).catch(stderr);
			patchRefs(this);

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
			runHook('beforeUpdated', this.meta, this).catch(stderr);
			patchRefs(this);
			runHook('updated', this.meta, this).then(() => {
				if (methods.updated) {
					return methods.updated.fn.call(this);
				}
			}, stderr);
		},

		activated(): void {
			runHook('beforeActivated', this.meta, this).catch(stderr);
			patchRefs(this);
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

			if (res instanceof Promise) {
				res.catch(stderr);
			}

		} catch (err) {
			stderr(err);
		}
	}
}

function patchRefs(ctx: ComponentInterface): void {
	const
		// @ts-ignore
		{$refs} = ctx;

	if ($refs) {
		for (let keys = Object.keys($refs), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = $refs[key];

			if (!el) {
				continue;
			}

			if (Object.isArray(el)) {
				const
					arr = <unknown[]>[];

				let
					needRewrite;

				for (let i = 0; i < el.length; i++) {
					const
						val = el[i],
						component = (<ComponentElement>val).component;

					if (component && (<ComponentInterface>component).$el === val) {
						needRewrite = true;
						arr.push(component);

					} else {
						arr.push(val);
					}
				}

				if (needRewrite) {
					Object.defineProperty($refs, key, {
						writable: true,
						configurable: true,
						enumerable: true,
						value: arr
					});
				}

			} else {
				const
					component = (<ComponentElement>el).component;

				if (component && (<ComponentInterface>component).$el === el) {
					Object.defineProperty($refs, key, {
						writable: true,
						configurable: true,
						enumerable: true,
						value: component
					});
				}
			}
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

		for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				watcher = <NonNullable<WatchOptionsWithHandler>>o[key],
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

		// Hooks

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
			functional: prop.functional,
			default: !skipDefault ? prop.default !== undefined ? prop.default : defWrapper : undefined
		};

		if (!isFunctional && prop.watchers.size) {
			const
				wList = watchers[key] = watchers[key] || [];

			for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
				const
					watcher = el.value;

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
