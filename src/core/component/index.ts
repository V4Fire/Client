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
import { minimalCtx, ComponentDriver, RenderContext, CreateElement, VNode, VNodeData } from 'core/component/engines';

import { isAbstractComponent, getComponent, getBaseComponent } from 'core/component/create';
import { createFakeCtx, execRenderObject, patchVNode } from 'core/component/create/functional';
import { getComponentDataFromVnode, createCompositeElement } from 'core/component/create/composite';
import { constructors, components, localComponents, rootComponents, initEvent } from 'core/component/const';

export * from 'core/component/interface';
export * from 'core/component/const';
export * from 'core/component/create/functional';
export * from 'core/component/create/composite';

export { PARENT } from 'core/component/create/inherit';
export { customWatcherRgxp, runHook } from 'core/component/create/helpers';
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
	isSmartComponent = /-functional$/;

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

const
	minimalCtxCache = Object.create(null);

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
 *   *) [flyweight] - if true, then the component can be used as flyweight (within a composite virtual tree)
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
				render(this: ComponentInterface, nativeCreate: CreateElement, baseCtx: RenderContext): VNode {
					const
						{methods: {render: r}} = meta;

					if (r) {
						const
							that = this;

						const createElement = function (tag: string, opts?: VNodeData, children?: VNode[]): VNode {
							'use strict';

							let
								vnode,
								needEl = Boolean(Object.isObject(opts) && opts.attrs && opts.attrs['v4-composite']);

							const
								ctx = this || that;

							if (opts && opts.tag === 'component') {
								const
									constr = constructors[tag],
									component = constr && components.get(constr);

								if (component && (isSmartComponent.test(tag) || component.params.functional === true)) {
									needEl = true;

									const
										nm = component.componentName,
										tpl = TPLS[nm];

									if (!tpl) {
										return nativeCreate('span');
									}

									const
										node = nativeCreate('span', {...opts, tag: undefined}, children),
										data = getComponentDataFromVnode(nm, node);

									const renderCtx: RenderContext = {
										parent: ctx,
										children: node.children || [],
										props: data.props,

										// @ts-ignore
										listeners: data.on,

										slots: () => data.slots,
										// @ts-ignore
										scopedSlots: data.scopedSlots,

										data: {
											ref: data.ref,
											refInFor: data.refInFor,
											// @ts-ignore
											on: data.on,
											attrs: data.attrs,
											class: data.class,
											staticClass: data.staticClass
										}
									};

									const fakeCtx = createFakeCtx(
										// @ts-ignore
										createElement,
										renderCtx,

										minimalCtxCache[nm] = minimalCtxCache[nm] || Object.assign(Object.create(minimalCtx), {
											meta: component,
											instance: component.instance,
											componentName: component.componentName,
											$options: {}
										}),

										true
									);

									// @ts-ignore
									const renderObject = tpl.index();
									vnode = patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, renderCtx);
								}
							}

							if (!vnode) {
								vnode = createCompositeElement(
									nativeCreate.apply(ctx, arguments),
									ctx
								);
							}

							if (needEl) {
								Object.defineProperty(vnode.context, '$el', {
									enumerable: true,
									configurable: true,

									set(): void {
										return undefined;
									},

									get(): CanUndef<Node> {
										return vnode.elm;
									}
								});
							}

							return vnode;
						};

						if (that) {
							// @ts-ignore
							that.$createElement = that._c = createElement;
						}

						return r.fn.call(that, createElement, baseCtx);
					}

					return nativeCreate('span');
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

				renderObj.fn = fns.render;
				component.staticRenderFns = meta.component.staticRenderFns = fns.staticRenderFns || [];

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
