/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { CreateElement, RenderContext, VNode, FunctionalComponentOptions } from 'vue';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { getBaseComponent, runHook, ComponentConstructor } from 'core/component/component';
import { ComponentMeta } from 'core/component';

const
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

const
	cache = new WeakMap();

export interface RenderObject {
	render: Function;
	staticRenderFns?: Function[];
}

interface RenderFunction {
	(createElement: CreateElement, ctx: RenderContext): VNode;
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
		{component, instance} = getBaseComponent(constructor, meta);

	const
		p = meta.params,
		c = {props: {}};

	console.log(meta, component);

	{
		const list = [
			meta.accessors,
			component.computed,
			component.methods
		];

		for (let i = 0; i < list.length; i++) {
			const
				o = list[i];

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (Object.isFunction(el)) {
					c.props[key] = {
						method: true,
						wrap: (obj) => el.bind(obj)
					};

				} else if (el.get) {
					c.props[key] = {
						getter: true,
						wrap: (obj) => ({get: (<Function>el.get).bind(obj)})
					};
				}
			}
		}
	}

	/*return {
		inject: p.inject,
		render(): any {
			if (methods.render) {
				return methods.render.fn.call(this, ...arguments);
			}
		}
	};*/

	/*const $options = {
		mods: blockMeta.mods,
		props: blockMeta.props,
		hooks: blockMeta.hooks,
		watchers: blockMeta.watchers,
		eventListeners: blockMeta.eventListeners,
		class: constructor
	};

	functionalCtx = Object.assign(Object.create(vueProto), {
		$options,
		blockName: name,
		instance: new constructor()
	});*/
}

/**
 * Generates a fake context for a function component
 *
 * @param createElement - Vue.createElement
 * @param renderCtx - Vue.RenderContext
 * @param baseCtx - base component context (methods, accessors, etc.)
 */
export function createFakeCtx(
	createElement: CreateElement,
	renderCtx: RenderContext,
	baseCtx: Dictionary
): Dictionary {
	const
		fakeCtx: Dictionary = Object.create(baseCtx),
		{meta, instance} = fakeCtx;

	{
		const list = [
			meta.accessors,
			meta.computed,
			meta.methods
		];

		for (let i = 0; i < list.length; i++) {
			const
				o = list[i];

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el.fn) {
					fakeCtx[el] = el.fn.bind(fakeCtx);

				} else {
					Object.defineProperty(fakeCtx, key, el);
				}
			}
		}
	}

	{
		const list = [
			meta.fields,
			meta.systemFields
		];

		for (let i = 0; i < list.length; i++) {
			const
				o = list[i];

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = fakeCtx.$activeField = keys[i],
					el = o[key];

				let val;
				if (el.init) {
					val = el.init(fakeCtx);
				}

				// tslint:disable-next-line
				if (val === undefined) {
					fakeCtx[key] = el.default !== undefined ? el.default : Object.fastClone(instance[key]);

				} else {
					fakeCtx[key] = val;
				}
			}
		}
	}

	const
		p = <Dictionary>renderCtx.parent,
		event = new EventEmitter();

	// Add base methods and properties
	Object.assign(fakeCtx, renderCtx, renderCtx.props, {
		_self: fakeCtx,
		_staticTrees: [],

		$root: p.$root,
		$parent: p,
		$children: [],
		$options: Object.assign(Object.create(p.$options), fakeCtx.$options),
		$createElement: createElement,

		$slots: Object.assign(renderCtx.slots(), {default: renderCtx.children}),
		$scopedSlots: {},

		$emit(e: string, ...args: any[]): void {
			event.emit(e, ...args);
		},

		$once(e: string, cb: any): void {
			event.once(e, cb);
		},

		$on(e: string | string[], cb: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				event.on(events[i], cb);
			}
		},

		$off(e: string | string[], cb?: any): void {
			const
				events = (<string[]>[]).concat(e);

			for (let i = 0; i < events.length; i++) {
				event.off(events[i], cb);
			}
		}
	});

	runHook('beforeRender', meta, fakeCtx);
	meta.methods.beforeRender && meta.methods.beforeRender.fn.call(fakeCtx);

	return fakeCtx;
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vnode
 * @param ctx - фейковый контекст
 * @param renderCtx - контекст функционального компонента
 */
export function patchVNode(vnode: VNode, ctx: Dictionary, renderCtx: RenderContext): VNode {
	const
		m = ctx.$options.mods,
		vData = vnode.data,
		{data, meta} = renderCtx;

	if (vData) {
		// Support for modifiers
		for (const key in m) {
			if (!m.hasOwnProperty(key)) {
				break;
			}

			if (key in ctx) {
				const
					mod = m[key],
					val = ctx[key];

				vData.staticClass += ` ${ctx.blockName}_${key}_${mod.coerce ? mod.coerce(val) : val}`;
			}
		}

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.attrs) {
			// tslint:disable-next-line
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		// Vue directives

		const
			d = data.directives;

		if (d) {
			for (let i = 0; i < d.length; i++) {
				const
					el = d[i];

				if (el.name === 'show' && !el.value) {
					vData.attrs = vData.attrs || {};
					vData.attrs.style = (vData.attrs.style || '') + ';display: none;';
				}
			}
		}
	}

	// Event handlers

	const
		h = data.on;

	if (h) {
		for (const key in h) {
			if (!h.hasOwnProperty(key)) {
				break;
			}

			const
				fn = h[key];

			if (fn) {
				ctx.$on(key, fn);
			}
		}
	}

	runHook('afterRender', meta, renderCtx);
	meta.methods.afterRender && meta.methods.afterRender.fn.call(renderCtx);
	return vnode;
}

/**
 * Executes a render object with the specified fake component context
 *
 * @param renderObject
 * @param fakeCtx
 */
export function execRenderObject(renderObject: RenderObject, fakeCtx: Dictionary): VNode {
	if (renderObject.staticRenderFns) {
		const
			fns = renderObject.staticRenderFns;

		for (let i = 0; i < fns.length; i++) {
			fakeCtx._staticTrees.push(fns[i].call(fakeCtx));
		}
	}

	return renderObject.render.call(fakeCtx);
}

/**
 * Takes an object with compiled Vue templates and returns a new render function
 *
 * @param renderObject
 * @param baseCtx - base component context
 */
export function convertRender(renderObject: RenderObject, baseCtx: Dictionary): RenderFunction {
	if (cache.has(renderObject)) {
		return cache.get(renderObject);
	}

	const render = (el, ctx) => {
		const fakeCtx = createFakeCtx(el, ctx, baseCtx);
		return patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, ctx);
	};

	cache.set(renderObject, render);
	return render;
}
