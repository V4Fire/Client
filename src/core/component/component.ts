/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { ComponentOptions, FunctionalComponentOptions } from 'vue';
import { ComponentMeta } from 'core/component';

export interface ComponentConstructor<T = any> {
	new(): T;
}

export const
	vueProto = {};

{
	const
		obj = Vue.prototype;

	for (const key in obj) {
		if (key.length === 2) {
			vueProto[key] = obj[key];
		}
	}
}

/**
 * Returns an object for the Vue component
 *
 * @param constructor
 * @param meta
 */
export function getComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): ComponentOptions<Vue> | FunctionalComponentOptions<Vue> {
	const
		{component, instance} = getBaseComponent(constructor, meta),
		{methods} = meta;

	const
		p = meta.params;

	if (p.functional) {
		return getFunctionalComponent(constructor, meta);
	}

	return {
		...<any>p.mixins,
		...<any>component,

		model: p.model,
		parent: p.parent,
		inheritAttrs: p.inheritAttrs,
		provide: p.provide,
		inject: p.inject,
		data(): Dictionary {
			const
				ctx = this as any,
				data = {} as Dictionary;

			for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = ctx.$activeField = keys[i],
					el = o[key];

				let val;
				if (el.init) {
					val = el.init(ctx);
				}

				// tslint:disable-next-line
				if (val === undefined) {
					val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
					data[key] = val === undefined ? ctx[key] : val;

				} else {
					data[key] = val;
				}
			}

			return data;
		},

		beforeCreate(): void {
			const
				ctx = this as any;

			ctx.meta = meta;
			ctx.componentName = meta.name;
			ctx.instance = instance;
			runHook('beforeRuntime', meta, this);

			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				Object.defineProperty(this, keys[i], {
					get: el.get,
					set: el.set
				});
			}

			for (let o = meta.systemFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = ctx.$activeField = keys[i],
					el = o[key];

				let val;
				if (el.init) {
					val = el.init(ctx);
				}

				// tslint:disable-next-line
				if (val === undefined) {
					val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
					this[key] = val === undefined ? this[key] : val;

				} else {
					this[key] = val;
				}
			}

			runHook('beforeCreate', meta, this);
			methods.beforeCreate && methods.beforeCreate.fn.call(this);
		},

		created(): void {
			for (let o = meta.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					watchers = o[key];

				for (let i = 0; i < watchers.length; i++) {
					const el = watchers[i];
					this.$watch(key, {...el, handler: el.method ? el.handler : (a, b) => el.handler(this, a, b)});
				}
			}

			runHook('created', meta, this);
			methods.created && methods.created.fn.call(this);
		},

		beforeMount(): void {
			runHook('beforeMount', meta, this);
			methods.beforeMount && methods.beforeMount.fn.call(this);
		},

		mounted(): void {
			this.$el.vueComponent = this;
			runHook('mounted', meta, this);
			methods.mounted && methods.mounted.fn.call(this);
		},

		beforeUpdate(): void {
			runHook('beforeUpdate', meta, this);
			methods.beforeUpdate && methods.beforeUpdate.fn.call(this);
		},

		updated(): void {
			runHook('updated', meta, this);
			methods.updated && methods.updated.fn.call(this);
		},

		activated(): void {
			runHook('activated', meta, this);
			methods.activated && methods.activated.fn.call(this);
		},

		deactivated(): void {
			runHook('deactivated', meta, this);
			methods.deactivated && methods.deactivated.fn.call(this);
		},

		beforeDestroy(): void {
			runHook('beforeDestroy', meta, this);
			methods.beforeDestroy && methods.beforeDestroy.fn.call(this);
		},

		destroyed(): void {
			runHook('destroyed', meta, this);
			methods.destroyed && methods.destroyed.fn.call(this);
		}
	};
}

/**
 * Returns an object for the Vue functional component
 *
 * @param constructor
 * @param meta
 */
export function getFunctionalComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): FunctionalComponentOptions<Vue> {
	const
		{component, instance} = getBaseComponent(constructor, meta),
		{name, params: p} = meta;

	const
		props = {};

	const ctx = component.ctx = Object.assign(Object.create(vueProto), {
		meta,
		instance,
		componentName: name,
		$options: {...p.mixins}
	});

	for (let o = component.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key],
			prop = props[key] = {...el};

		if (Object.isFunction(el.default)) {
			prop.default = el.default.bind(ctx);
		}
	}

	return <any>{
		name,
		props,
		functional: true,
		inject: p.inject,
		render: component.render
	};
}

/**
 * Runs a hook from the specified meta object
 *
 * @param hook
 * @param meta
 * @param ctx - link to context
 */
export function runHook(hook: string, meta: ComponentMeta, ctx: Object): void {
	if (!meta.hooks[hook].length) {
		return;
	}

	const event = {
		queue: [] as Function[],
		events: {} as Dictionary<{event: Set<string>; cb: Function}[]>,

		on(event: Set<string> | undefined, cb: Function): void {
			if (event && event.size) {
				for (let v = event.values(), el = v.next(); !el.done; el = v.next()) {
					this.events[el.value] = this.events[el.value] || [];
					this.events[el.value].push({event, cb});
				}

				return;
			}

			this.queue.push(cb);
		},

		emit(event: string): void {
			if (!this.events[event]) {
				return;
			}

			for (let o = this.events[event], i = 0; i < o.length; i++) {
				const el = o[i];
				el.event.delete(event);
				!el.event.size && el.cb();
			}
		},

		fire(): void {
			for (let i = 0; i < this.queue.length; i++) {
				this.queue[i]();
			}
		}
	};

	for (let hooks = meta.hooks[hook], i = 0; i < hooks.length; i++) {
		const
			el = hooks[i];

		event.on(el.after, () => {
			el.fn.call(ctx);
			event.emit(el.name || Math.random().toString());
		});
	}

	event.fire();
}

/**
 * Returns a base component object from the specified constructor
 *
 * @param constructor
 * @param meta
 */
export function getBaseComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): {
	mods: Dictionary<string | undefined>;
	component: ComponentMeta['component'];
	instance: Dictionary;
} {
	addMethodsToMeta(constructor, meta);

	const
		{component, methods, watchers, hooks} = meta,
		instance = new constructor();

	for (let o = methods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			method = o[key];

		component.methods[key] =
			method.fn;

		for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			watchers[key] = watchers[key] || [];
			watchers[key].push({
				deep: el.deep,
				immediate: el.immediate,
				handler: <any>method.fn,
				method: true
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

	for (let o = meta.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			prop = o[key],
			def = instance[key];

		component.props[key] = {
			type: prop.type,
			required: prop.required,
			validator: prop.validator,
			default: prop.default !== undefined ?
				prop.default : prop.type === Function ? def : () => Object.fastClone(def)
		};

		watchers[key] = watchers[key] || [];
		for (let w = prop.watchers.values(), el = w.next(); !el.done; el = w.next()) {
			const
				val = el.value;

			watchers[key].push({
				deep: val.deep,
				immediate: val.immediate,
				handler: val.fn
			});
		}
	}

	for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			field = o[key];

		for (let w = field.watchers.values(), el = w.next(); !el.done; el = w.next()) {
			const
				val = el.value;

			watchers[key] = watchers[key] || [];
			watchers[key].push({
				deep: val.deep,
				immediate: val.immediate,
				handler: val.fn
			});
		}
	}

	const
		mods = {};

	for (let o = meta.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mod = o[key];

		let def;
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

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
export function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		if ('value' in desc) {
			// tslint:disable-next-line
			meta.methods[key] = Object.assign(meta.methods[key] || {watchers: {}, hooks: {}}, {
				fn: desc.value
			});

		} else {
			const
				metaKey = key in meta.accessors ? 'accessors' : 'computed',
				obj = meta[metaKey];

			const
				old = obj[key],
				set = desc.set || old && old.set;

			if (set) {
				meta.methods[`${key}Setter`] = {
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			Object.assign(obj, {
				[key]: {
					get: desc.get || old && old.get,
					set
				}
			});
		}
	}
}
