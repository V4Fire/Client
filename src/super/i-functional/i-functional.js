'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { abstract, BlockConstructor } from 'super/i-block/i-block';
import { component, components } from 'core/component';

const
	Vue = require('vue'),
	uuid = require('uuid');

const
	proto = {};

{
	const
		obj = Vue.prototype;

	for (const key in obj) {
		if (key.length === 2) {
			proto[key] = obj[key];
		}
	}
}

const descriptorFlags = {
	writable: true,
	enumerable: true
};

const methodsBlacklist = {
	enable: true,
	disable: true,
	open: true,
	close: true,
	toggle: true,
	focus: true,
	emit: true,
	dispatch: true
};

const
	cache = new WeakMap(),
	parentCache = {true: new WeakMap(), false: new WeakMap()},
	eventHandlerRgxp = /^on[A-Z]/;

@component({functional: true})
export default class iFunctional extends BlockConstructor {
	/**
	 * Public component name
	 */
	@abstract
	componentName: string;

	/**
	 * Name of the component template
	 */
	@abstract
	tplComponentName: string;

	/**
	 * Component constructor that will be shimming
	 */
	shim: ?Function = iBlock;

	/**
	 * Block unique id
	 */
	blockId: string = () => `b-${uuid()}`;

	/**
	 * Default root tag
	 */
	rootTag: string = 'div';

	/**
	 * If true, then will be provided context to block methods
	 * (for template compilation)
	 */
	provideContext: boolean = false;

	/**
	 * Initial block modifiers
	 */
	mods: Object = {};

	/**
	 * Additional classes for block elements
	 */
	classes: Object = {};

	/**
	 * Advanced block parameters
	 */
	p: Object = {};

	/**
	 * List of classes for the root node
	 */
	rootClasses: ?Array;

	/**
	 * Converts the specified compiled render object to a functional component render function
	 * @param renderObject
	 */
	static convertRender(renderObject: Object): (el: Function, ctx: ?Object) => Object {
		if (cache.has(renderObject)) {
			return cache.get(renderObject);
		}

		function render(el, ctx) {
			ctx.children = ctx.children || [];

			const
				p = ctx.props,
				provide = Boolean(ctx.props.provideContext),
				constr = p.shim;

			if (!parentCache[provide].has(constr)) {
				const
					map = {},
					data = constr.prototype;

				for (const key in data) {
					if (key[0] === '$' || key === 'render') {
						continue;
					}

					if (eventHandlerRgxp.test(key) || methodsBlacklist[key]) {
						if (provide) {
							map[key] = {
								...descriptorFlags,
								key: 'value',
								value: () => () => {}
							};

						} else {
							map[key] = {...descriptorFlags, value: () => {}};
						}

					} else {
						map[key] = getDescriptor(data, key, provide);
					}
				}

				parentCache[provide].set(constr, map);
			}

			const
				fakeCtx = {...proto},
				api = parentCache[provide].get(constr),
				map = {};

			if (provide) {
				const
					keys = Object.keys(api);

				for (let i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						el = api[key];

					map[key] = {
						...el,
						[el.key]: el[el.key](fakeCtx)
					};
				}
			}

			Object.defineProperties(
				fakeCtx,
				provide ? map : api
			);

			const parent = {
				h: ctx.parent.h,
				b: ctx.parent.b
			};

			Object.assign(fakeCtx, parent, ctx, p, {
				_self: fakeCtx,
				blockId: p.uuid,
				$createElement: el
			});

			Object.defineProperty(fakeCtx, '$slots', {
				get() {
					return ctx.slots();
				}
			});

			fakeCtx.$slots.default = ctx.children;

			const
				statics = [];

			if (renderObject.staticRenderFns) {
				const
					fns = renderObject.staticRenderFns;

				for (let i = 0; i < fns.length; i++) {
					statics.push(fns[i].call(fakeCtx));
				}
			}

			fakeCtx._staticTrees = statics;
			return renderObject.render.call(fakeCtx);
		}

		cache.set(renderObject, render);
		return render;
	}

	/** @override */
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {
		attrs = attrs || {};

		const
			p = ctx.props,
			b = p.componentName,
			tpl = p.tplComponentName || b,
			defMods = {};

		if (p.shim) {
			Object.assign(defMods, components.get(p.shim).mods);
		}

		Object.assign(defMods, p.mods);

		const
			mods = [],
			keys = Object.keys(defMods);

		for (let i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = defMods[key];

			if (el !== undefined) {
				mods.push(`${b}_${key.dasherize()}_${el.dasherize()}`);
			}
		}

		const
			classes = ctx.props.rootClasses = ['i-block-helper'].concat([b, ...mods], attrs.class || []);

		if (TPLS[tpl]) {
			return iFunctional.convertRender(TPLS[tpl].index())(el, ctx);
		}

		attrs.class = classes;
		return el(p.rootTag, attrs, children);
	}
}

/**
 * Returns an object with property descriptors
 *
 * @param obj - source object
 * @param key - property name
 * @param ctx - if true, then the method context will be provided
 */
function getDescriptor(obj: Object, key: string, ctx: boolean): Object {
	if (obj.hasOwnProperty(key)) {
		const
			d = Object.getOwnPropertyDescriptor(obj, key);

		if (!ctx) {
			return {...d, ...descriptorFlags};
		}

		if (d.get) {
			return {
				...descriptorFlags,
				key: 'get',
				get: (obj) => d.get.bind(obj)
			};
		}

		return {
			...descriptorFlags,
			key: 'value',
			value: (obj) => Object.isFunction(d.value) ? d.value.bind(obj) : d.value
		};
	}

	return getDescriptor(Object.getPrototypeOf(obj), key, ctx);
}
