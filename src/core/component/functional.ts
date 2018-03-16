/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { CreateElement, RenderContext, VNode, FunctionalComponentOptions } from 'vue';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { FunctionalCtx } from 'core/component';
import { runHook, defaultWrapper } from 'core/component/component';

const
	cache = new WeakMap();

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
	baseCtx: FunctionalCtx
): Dictionary & FunctionalCtx {
	const
		fakeCtx: Dictionary & FunctionalCtx = Object.create(baseCtx),
		{meta, meta: {methods}, instance} = fakeCtx;

	const
		p = <Dictionary>renderCtx.parent,
		event = new EventEmitter();

	// Add base methods and properties
	Object.assign(fakeCtx, renderCtx, renderCtx.props, {
		_self: fakeCtx,
		_staticTrees: [],
		children: [],

		$root: p.$root,
		$parent: p,
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

	{
		const list = [
			meta.accessors,
			meta.computed,
			methods
		];

		for (let i = 0; i < list.length; i++) {
			const
				o = list[i];

			for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if ('fn' in el) {
					fakeCtx[key] = el.fn.bind(fakeCtx);

				} else {
					Object.defineProperty(fakeCtx, key, el);
				}
			}
		}
	}

	runHook('beforeRuntime', meta, fakeCtx).catch(stderr);

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
					val = el.init(<any>fakeCtx);
				}

				// tslint:disable-next-line
				if (val === undefined) {
					val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
					fakeCtx[key] = val === undefined ? fakeCtx[key] : val;

				} else {
					fakeCtx[key] = val;
				}
			}
		}
	}

	for (let o = meta.component.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = fakeCtx.$activeField = keys[i],
			el = o[key];

		if (Object.isFunction(el.default) && !el.default[defaultWrapper]) {
			fakeCtx[key] = el.type === Function ? el.default.bind(fakeCtx) : el.default.call(fakeCtx);
		}
	}

	runHook('beforeRender', meta, fakeCtx).catch(stderr);
	methods.beforeRender && methods.beforeRender.fn.call(fakeCtx);

	return fakeCtx;
}

/**
 * Patches the specified virtual node: add classes, event handlers, etc.
 *
 * @param vNode
 * @param ctx - component fake context
 * @param renderCtx - Vue.RenderContext
 */
export function patchVNode(vNode: VNode, ctx: Dictionary, renderCtx: RenderContext): VNode {
	const
		{data: vData} = vNode,
		{data} = renderCtx,
		{meta, meta: {component: {mods}}} = ctx;

	if (vData) {
		vData.staticClass = vData.staticClass || '';

		// Support for modifiers
		for (const key in mods) {
			if (!mods.hasOwnProperty(key)) {
				break;
			}

			if (key in ctx) {
				const
					mod = mods[key],
					val = ctx[key];

				vData.staticClass += ` ${ctx.blockName}_${key}_${mod.coerce ? mod.coerce(val) : val}`;
			}
		}

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.class) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (data.attrs) {
			// tslint:disable-next-line
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		// Reference to element

		if (data.ref) {
			vData.ref = data.ref;
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

	runHook('afterRender', meta, ctx);
	meta.methods.afterRender && meta.methods.afterRender.fn.call(ctx);
	return vNode;
}

/**
 * Executes a render object with the specified fake component context
 *
 * @param renderObject
 * @param fakeCtx
 */
export function execRenderObject(renderObject: Dictionary, fakeCtx: Dictionary): VNode {
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
export function convertRender(
	renderObject: Dictionary,
	baseCtx: FunctionalCtx
): FunctionalComponentOptions['render'] {
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
