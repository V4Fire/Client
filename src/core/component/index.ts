/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-ignore
import * as defTpls from 'core/block.ss';
import log from 'core/log';

import 'core/component/filters';
import 'core/component/directives';

import inheritMeta from 'core/component/create/inherit';
import { ComponentInterface, ComponentParams, ComponentMeta, ComponentMethod } from 'core/component/interface';
import { supports, ComponentDriver, RenderContext, CreateElement, VNode } from 'core/component/engines';

import { getComponent, getBaseComponent } from 'core/component/create';
import { convertRender, createFakeCtx, patchVNode, CTX } from 'core/component/create/functional';
import { constructors, components, localComponents, rootComponents, initEvent } from 'core/component/const';
import { applyComposites } from 'core/component/create/composite';

export * from 'core/component/interface';
export * from 'core/component/const';
export * from 'core/component/create/functional';
export * from 'core/component/create/composite';

export { PARENT } from 'core/component/create/inherit';
export { runHook, customWatcherRgxp } from 'core/component/create/helpers';
export { default as globalEvent, reset, ResetType } from 'core/component/event';
export { prop, field, system, p, hook, watch, paramsFactory } from 'core/component/decorators';
export {

	ComponentDriver as default,
	WatchOptions,

	VNode,
	VNodeDirective,
	CreateElement

} from 'core/component/engines';

export const
	isAbstractComponent = /^[iv]-/,
	isSmartComponent = /-functional$/;

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

/**
 * Creates a new component
 *
 * @decorator
 * @param [params] - additional parameters:
 *   *) [name] - component name
 *   *) [root] - if true, then the component will be registered as root
 *   *) [tpl] - if false, then will be used the default template
 *   *) [functional] - functional status:
 *        *) if true, then the component will be created as functional
 *        *) if a table with parameters, then the component will be created as smart component
 *
 *   *) [tiny] - if true, then the functional component will be created without advanced component shim
 *   *) [parent] - link to a parent component
 *
 *   // Component driver options (by default Vue):
 *
 *   *) [model] - parameters for a model option
 *   *) [provide] - parameters for a provide option
 *   *) [inject] - parameters for an inject option
 *   *) [inheritAttrs] - parameters for an inheritAttrs option
 */
export function component(params?: ComponentParams): Function {
	return (target) => {
		const
			name = params && params.name || getComponentName(target),
			parent = Object.getPrototypeOf(target),
			parentMeta = components.get(parent);

		let p: ComponentParams = parentMeta ? {...params} : {
			root: false,
			tpl: true,
			functional: false,
			inheritAttrs: true,
			...params
		};

		const
			mods = {};

		if (target.mods) {
			for (let o = target.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const key = keys[i];
				mods[key.camelize(false)] = o[key];
			}
		}

		const meta: ComponentMeta = {
			name,
			componentName: name.replace(isSmartComponent, ''),

			parentMeta,
			constructor: target,
			instance: {},
			params: p,

			props: {},
			fields: {},
			systemFields: {},
			mods,

			computed: {},
			accessors: {},
			methods: {},
			watchers: {},

			hooks: {
				beforeRuntime: [],
				beforeCreate: [],
				beforeDataCreate: [],
				created: [],
				beforeMount: [],
				mounted: [],
				beforeUpdate: [],
				updated: [],
				activated: [],
				deactivated: [],
				beforeDestroy: [],
				destroyed: [],
				errorCaptured: []
			},

			component: {
				name,
				mods: {},
				props: {},
				methods: {},
				computed: {},
				staticRenderFns: [],
				render(this: ComponentInterface, el: CreateElement, baseCtx: RenderContext): VNode {
					const
						{methods: {render: r}, component: {ctx}} = meta;

					if (r) {
						let
							vnode,
							that = this;

						if (!r.wrapper && p.functional === true && supports.functional && ctx) {
							that = createFakeCtx<typeof this>(el, baseCtx, ctx);
							vnode = patchVNode(r.fn.call(that, el, baseCtx), that, baseCtx);

						} else {
							vnode = r.fn.call(this, el, baseCtx);
							that = r.fn[CTX] || this;
						}

						// @ts-ignore
						if (that.$compositeI) {
							applyComposites(vnode, that);
							// @ts-ignore
							that.$compositeI = 0;
						}

						return vnode;
					}

					return el('span');
				}
			}
		};

		if (parentMeta) {
			p = inheritMeta(meta, parentMeta);
		}

		if (!p.name || !isSmartComponent.test(p.name)) {
			components.set(target, meta);
		}

		constructors[name] = target;
		initEvent.emit('constructor', {meta, parentMeta});

		if (isAbstractComponent.test(name)) {
			getBaseComponent(target, meta);
			return;
		}

		const loadTemplate = (component) => (resolve) => {
			const success = () => {
				if (localComponents.has(target)) {
					// tslint:disable-next-line:prefer-object-spread
					component.components = Object.assign(component.components || {}, localComponents.get(target));
				}

				log(`component:load:${name}`, component);
				resolve(component);
			};

			const
				{methods, methods: {render: r}} = meta;

			const addRenderAndResolve = (tpls) => {
				const
					fns = tpls.index(),
					renderObj = <ComponentMethod>{wrapper: true, watchers: {}, hooks: {}};

				if (p.functional === true && supports.functional) {
					const
						{ctx} = meta.component;

					if (ctx) {
						renderObj.fn = <Function>convertRender(fns, ctx);
					}

				} else {
					renderObj.fn = fns.render;
					component.staticRenderFns = meta.component.staticRenderFns = fns.staticRenderFns || [];
				}

				methods.render = renderObj;
				success();
			};

			if (p.tpl === false) {
				if (r && !r.wrapper) {
					success();

				} else {
					addRenderAndResolve(defTpls.block);
				}

			} else {
				let
					i = 0;

				const f = () => {
					const
						fns = TPLS[meta.componentName];

					if (fns) {
						if (r && !r.wrapper) {
							success();

						} else {
							addRenderAndResolve(fns);
						}

					} else {
						if (i < 15) {
							i++;
							setImmediate(f);

						} else {
							setTimeout(f, 100);
						}
					}
				};

				f();
			}
		};

		const
			obj = loadTemplate(getComponent(target, meta));

		if (p.root) {
			rootComponents[name] = new Promise(obj);

		} else {
			ComponentDriver.component(name, obj);
		}

		if (!Object.isBoolean(p.functional)) {
			component({
				...params,
				name: `${name}-functional`,
				functional: true
			})(target);
		}
	};
}
