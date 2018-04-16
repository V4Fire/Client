/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import {

	CreateElement,
	RenderContext,
	VNode,
	FunctionalComponentOptions,
	WatchOptions,
	WatchOptionsWithHandler

} from 'vue';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { VueElement, FunctionalCtx } from 'core/component';
import { runHook, createMeta, initDataObject, bindWatchers, defaultWrapper } from 'core/component/component';

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
		meta = createMeta(fakeCtx.meta);

	const
		{instance} = fakeCtx,
		{methods} = meta;

	const
		p = <Dictionary>renderCtx.parent,
		watchers = new EventEmitter({maxListeners: 1e3}),
		event = new EventEmitter({maxListeners: 1e3});

	// Add base methods and properties
	Object.assign(fakeCtx, renderCtx, renderCtx.props, {
		_self: fakeCtx,
		_staticTrees: [],

		meta,
		children: [],

		$root: p.$root,
		$parent: p,
		$options: Object.assign(Object.create(p.$options), fakeCtx.$options),

		$data: {},
		$props: renderCtx.props,
		$attrs: renderCtx.data.attrs,
		$refs: {},

		$slots: {default: renderCtx.children, ...renderCtx.slots()},
		$scopedSlots: {},
		$createElement: createElement,

		$destroy(): void {
			$C(['beforeDestroy', 'destroyed']).forEach((key) => {
				runHook(key, meta, fakeCtx).then(async () => {
					if (methods[key]) {
						await methods[key].fn.call(fakeCtx);
					}
				}, stderr);
			});
		},

		$nextTick(cb?: () => void): Promise<void> | void {
			if (cb) {
				cb();
				return;
			}

			return Promise.resolve();
		},

		$forceUpdate(): void {
			p.forceUpdate().catch(stderr);
		},

		$watch(
			exprOrFn: string | (() => string),
			cbOrOpts: (n: any, o: any) => void | WatchOptionsWithHandler<any>,
			opts?: WatchOptions
		): (() => void) {
			let
				cb = cbOrOpts;

			if (Object.isObject(cbOrOpts)) {
				cb = (<any>cbOrOpts).handler;
				opts = <any>cbOrOpts;
			}

			const
				expr = Object.isFunction(exprOrFn) ? exprOrFn.call(this) : exprOrFn;

			cb = cb.bind(this);
			watchers.on(expr, cb);

			if (opts && opts.immediate) {
				watchers.emit(expr, this.getField(expr));
			}

			return () => watchers.off(expr, cb);
		},

		$set(obj: object, key: string, value: any): any {
			obj[key] = value;
			return value;
		},

		$delete(obj: object, key: string): void {
			delete obj[key];
		},

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

	let $el;
	Object.defineProperty(fakeCtx, '$el', {
		get(): VueElement<any> | undefined {
			if ($el) {
				return $el;
			}

			return $el = p.$root.$el.querySelector(`.${fakeCtx.blockId}`);
		}
	});

	runHook('beforeRuntime', meta, fakeCtx).catch(stderr);

	for (let o = meta.component.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = fakeCtx.$activeField = keys[i],
			el = o[key];

		if (Object.isFunction(el.default) && !el.default[defaultWrapper]) {
			fakeCtx[key] = el.type === Function ? el.default.bind(fakeCtx) : el.default.call(fakeCtx);
		}
	}

	{
		const list = [
			meta.systemFields,
			meta.fields
		];

		for (let i = 0; i < list.length; i++) {
			const data = i ? fakeCtx.$data : fakeCtx;
			initDataObject(list[i], fakeCtx, instance, data);

			if (i) {
				runHook('beforeDataCreate', meta, fakeCtx, data).catch(stderr);

				if (meta.params.tiny) {
					Object.assign(fakeCtx, data);
					continue;
				}

				for (let keys = Object.keys(data), i = 0; i < keys.length; i++) {
					const
						key = keys[i];

					Object.defineProperty(fakeCtx, key, {
						get(): any {
							return data[key];
						},

						set(val: any): void {
							const
								old = data[key];

							if (old !== val) {
								data[key] = val;
								watchers.emit(key, val, old);
							}
						}
					});
				}

			} else {
				runHook('beforeCreate', meta, fakeCtx).then(async () => {
					if (methods.beforeCreate) {
						await methods.beforeCreate.fn.call(fakeCtx);
					}
				}, stderr);
			}
		}
	}

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
		{meta, meta: {methods}} = ctx;

	if (vData) {
		vData.staticClass = vData.staticClass || '';

		// Custom classes and attributes

		if (data.staticClass) {
			vData.staticClass += ` ${data.staticClass}`;
		}

		if (data.class) {
			vData.class = [].concat(vData.class, data.class);
		}

		if (data.attrs && meta.params.inheritAttrs) {
			// tslint:disable-next-line
			vData.attrs = Object.assign(vData.attrs || {}, data.attrs);
		}

		// Reference to the element

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

	if (meta.params.tiny) {
		return vNode;
	}

	bindWatchers(<any>ctx);
	runHook('created', meta, ctx).then(async () => {
		if (methods.created) {
			await methods.created.fn.call(ctx);
		}
	}, stderr);

	(async () => {
		const
			{async: $a} = ctx;

		let
			destroyed,
			mounted;

		const destroy = () => {
			destroyed = true;
			ctx.$destroy();
		};

		$a.setTimeout(() => {
			if (!mounted) {
				destroy();
			}
		}, (1).second());

		try {
			await $a.nextTick();
			await $a.wait(() => ctx.$el);

			if (destroyed) {
				return;
			}

			const
				el = ctx.$el,
				oldCtx = el.vueComponent;

			if (oldCtx) {
				const
					props = ctx.$props,
					oldProps = oldCtx.$props,
					linkedFields = <Dictionary>{};

				for (let keys = Object.keys(oldProps), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						linked = oldCtx.syncLinkCache[key];

					if (linked) {
						linkedFields[linked.path] = key;
					}
				}

				{
					const list = [
						oldCtx.meta.systemFields,
						oldCtx.meta.fields
					];

					for (let i = 0; i < list.length; i++) {
						const
							obj = list[i],
							keys = Object.keys(obj);

						for (let j = 0; j < keys.length; j++) {
							const
								key = keys[j],
								el = obj[key],
								link = linkedFields[key];

							if (
								!el.unique &&

								(
									!link ||
									link && Object.fastCompare(props[link], oldProps[link])
								)
							) {
								if (el.merge) {
									el.merge(ctx, oldCtx, link);

								} else {
									ctx[key] = oldCtx[key];
								}
							}
						}
					}
				}

				oldCtx.$destroy();
			}

			const
				refs = ctx.$refs,
				refNodes = el.querySelectorAll(`.${ctx.blockId}[data-vue-ref]`);

			mounted = true;
			el.vueComponent = ctx;

			for (let i = 0; i < refNodes.length; i++) {
				const
					el = refNodes[i],
					link = el.vueComponent ? el.vueComponent : el,
					ref = el.dataset.vueRef;

				refs[ref] = refs[ref] ? [].concat(refs[ref], link) : link;
			}

			runHook('mounted', meta, ctx).then(async () => {
				if (methods.mounted) {
					await methods.mounted.fn.call(ctx);
				}
			}, stderr);

			await $a.wait(() => !ctx.$el);
			destroy();

		} catch (err) {
			if (err.type !== 'clearAsync') {
				throw err;
			}
		}
	})();

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
