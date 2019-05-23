/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

// @ts-ignore
import * as defTpls from 'core/block.ss';
import log from 'core/log';

import 'core/component/filters';
import 'core/component/directives';

import inheritMeta from 'core/component/create/inherit';

import { runHook, patchRefs } from 'core/component/create/helpers';
import { ComponentInterface, ComponentParams, ComponentMeta, ComponentMethod } from 'core/component/interface';
import {

	supports,
	minimalCtx,
	renderData,
	cloneVNode,

	ComponentDriver,
	RenderContext,
	CreateElement,
	VNode,
	VNodeData,
	NormalizedScopedSlot

} from 'core/component/engines';

import { isAbstractComponent, getComponent, getBaseComponent } from 'core/component/create';
import { createFakeCtx, execRenderObject, patchVNode } from 'core/component/create/functional';
import { getComponentDataFromVnode, createCompositeElement } from 'core/component/create/composite';
import { components, rootComponents, initEvent } from 'core/component/const';

export * from 'core/component/interface';
export * from 'core/component/const';
export * from 'core/component/create/functional';
export * from 'core/component/create/composite';

export { PARENT } from 'core/component/create/inherit';
export { customWatcherRgxp, runHook } from 'core/component/create/helpers';
export { default as globalEvent, reset, ResetType } from 'core/component/event';
export { prop, field, system, p, hook, watch, paramsFactory } from 'core/component/decorators';
export {

	renderData,
	ComponentDriver as default,
	WatchOptions,

	VNode,
	VNodeDirective,
	CreateElement

} from 'core/component/engines';

export const
	$$ = symbolGenerator(),
	isSmartComponent = /-functional$/;

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

const
	minimalCtxCache = Object.createDict(),
	tplCache = Object.createDict();

const mountHooks = {
	beforeCreate: true,
	beforeDataCreate: true,
	created: true,
	beforeMount: true
};

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
				beforeMounted: [],
				mounted: [],
				beforeUpdate: [],
				beforeUpdated: [],
				updated: [],
				beforeActivated: [],
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
							// tslint:disable-next-line:no-this-assignment
							rootCtx = this,

							// @ts-ignore (access)
							asyncLabel = rootCtx.$asyncLabel;

						let
							tasks = <Function[]>[];

						const createElement = function (tag: string, opts?: VNodeData, children?: VNode[]): VNode {
							'use strict';

							const
								ctx = this || rootCtx;

							const
								attrOpts = Object.isObject(opts) && opts.attrs || {},
								tagName = attrOpts['v4-composite'] || tag,
								renderKey = attrOpts['render-key'] != null ?
									`${tagName}:${attrOpts['global-name']}:${attrOpts['render-key']}` : '';

							let
								vnode = ctx.renderTmp[renderKey],
								needEl = Boolean(attrOpts['v4-composite']);

							if (!vnode) {
								const
									component = components.get(tag);

								if (supports.functional && component && component.params.functional === true) {
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
										listeners: <Record<string, CanArray<Function>>>data.on,

										slots: () => data.slots,
										scopedSlots: <Record<string, NormalizedScopedSlot>>data.scopedSlots,
										injections: undefined,

										data: {
											ref: data.ref,
											refInFor: data.refInFor,
											on: <Record<string, CanArray<Function>>>data.on,
											attrs: data.attrs,
											class: data.class,
											staticClass: data.staticClass,
											style: data.style
										}
									};

									const fakeCtx = createFakeCtx<ComponentInterface>(
										<CreateElement>createElement,
										renderCtx,

										minimalCtxCache[nm] = minimalCtxCache[nm] || Object.assign(Object.create(minimalCtx), {
											meta: component,
											instance: component.instance,
											componentName: component.componentName,
											$options: {}
										}),

										{initProps: true}
									);

									const renderObject = tplCache[nm] = tplCache[nm] || tpl.index && tpl.index();
									vnode = patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, renderCtx);
								}
							}

							if (!vnode) {
								vnode = createCompositeElement(
									nativeCreate.apply(ctx, arguments),
									ctx
								);
							}

							const
								vData = vnode.data || {},
								ref = vData[$$.ref] || vData.ref;

							if (renderKey) {
								ctx.renderTmp[renderKey] = cloneVNode(vnode);
							}

							if (ref && ctx !== rootCtx) {
								vData[$$.ref] = ref;
								vData.ref = `${ref}:${ctx.componentId}`;

								Object.defineProperty(ctx.$refs, ref, {
									configurable: true,
									enumerable: true,
									get: () => {
										// @ts-ignore (access)
										const r = rootCtx.$refs;
										return r[`${ref}:${ctx._componentId}`] || r[`${ref}:${ctx.componentId}`];
									}
								});
							}

							if (needEl && vnode.fakeContext) {
								Object.defineProperty(vnode.fakeContext, '$el', {
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

							if (tasks.length) {
								for (let i = 0; i < tasks.length; i++) {
									tasks[i](vnode);
								}

								tasks = [];
							}

							return vnode;
						};

						if (rootCtx) {
							// @ts-ignore (access)
							rootCtx.$createElement = rootCtx._c = createElement;

							// @ts-ignore (access)
							const forEach = rootCtx._l;

							// @ts-ignore (access)
							rootCtx._l = (obj, cb) => {
								const
									res = forEach(obj, cb);

								if (obj[asyncLabel]) {
									tasks.push((vnode) => {
										const
											ctx = vnode.fakeContext = vnode.context,
											hook = mountHooks[ctx.hook] ? 'mounted' : 'updated',
											hooks = ctx.meta.hooks[hook];

										const fn = () => {
											obj[asyncLabel]((obj, p = {}) => {
												const
													els = <Node[]>[],
													renderNodes = <Nullable<Node>[]>[],
													nodes = <VNode[]>[];

												const
													ctx = vnode.context,
													parent = vnode.elm,
													hook = ctx.hook;

												ctx.hook = 'beforeUpdate';
												ctx.renderGroup = p.renderGroup;

												for (let o = forEach(obj, cb), i = 0; i < o.length; i++) {
													const
														el = o[i];

													if (!el) {
														continue;
													}

													if (Object.isArray(el)) {
														for (let o = el, i = 0; i < o.length; i++) {
															const
																el = <VNode>o[i];

															if (!el) {
																continue;
															}

															if (el.elm) {
																el.elm[asyncLabel] = true;
																renderNodes.push(el.elm);

															} else {
																nodes.push(el);
																renderNodes.push(null);
															}
														}

													} else if (el.elm) {
														el.elm[asyncLabel] = true;
														renderNodes.push(el.elm);

													} else {
														nodes.push(el);
														renderNodes.push(null);
													}
												}

												const
													renderVNodes = renderData(nodes, ctx);

												for (let i = 0, j = 0; i < renderNodes.length; i++) {
													const
														el = <Node>(renderNodes[i] || renderVNodes[j++]);

													if (Object.isArray(el)) {
														for (let i = 0; i < el.length; i++) {
															if (el[i]) {
																els.push(parent.appendChild(el[i]));
															}
														}

													} else if (el) {
														els.push(parent.appendChild(el));
													}
												}

												ctx.renderGroup = undefined;
												runHook('beforeUpdated', ctx.meta, ctx, p)
													.catch(stderr);

												patchRefs(ctx);
												ctx.hook = hook;

												return els;
											});
										};

										hooks.push({fn, once: true});
									});
								}

								return res;
							};
						}

						return r.fn.call(rootCtx, createElement, baseCtx);
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

		components.set(name, meta);
		initEvent.emit('constructor', {meta, parentMeta});

		if (isAbstractComponent.test(name)) {
			getBaseComponent(target, meta);
			return;
		}

		const loadTemplate = (component) => (resolve) => {
			const success = () => {
				log(`component:load:${name}`, component);
				resolve(component);
			};

			const
				{methods, methods: {render: r}} = meta;

			const addRenderAndResolve = (tpls) => {
				const
					fns = tplCache[name] = tplCache[name] || tpls.index(),
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
