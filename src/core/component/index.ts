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

import { GLOBAL } from 'core/env';
import { runHook, patchRefs, parseVAttrs } from 'core/component/create/helpers';
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
import { components, rootComponents, componentParams, initEvent } from 'core/component/const';

export * from 'core/component/interface';
export * from 'core/component/const';
export * from 'core/component/create/functional';
export * from 'core/component/create/composite';

export { PARENT } from 'core/component/create/inherit';
export { default as globalEvent, reset, ResetType } from 'core/component/event';
export { prop, field, system, p, hook, watch, paramsFactory } from 'core/component/decorators';
export {

	customWatcherRgxp,
	runHook,
	getFieldInfo,
	cloneWatchValue,
	bindWatchers

} from 'core/component/create/helpers';

export {

	renderData,
	ComponentDriver as default,
	WatchOptions,

	VNode,
	VNodeDirective,
	CreateElement,
	ScopedSlot

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
	regCache = Object.createDict<Function[]>(),
	minimalCtxCache = Object.createDict(),
	tplCache = Object.createDict();

const beforeMountHooks = {
	beforeCreate: true,
	beforeDataCreate: true,
	created: true,
	beforeMount: true
};

const mountedHooks = {
	mounted: true,
	updated: true,
	activated: true
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
			isAbstract = isAbstractComponent.test(name);

		const
			parent = Object.getPrototypeOf(target),
			parentParams = parent && componentParams.get(parent);

		let p: ComponentParams = parentParams ? {root: parentParams.root, ...params, name} : {
			root: false,
			tpl: true,
			inheritAttrs: true,
			functional: false,
			...params,
			name
		};

		if (parentParams) {
			let
				functional;

			// tslint:disable-next-line:prefer-conditional-expression
			if (Object.isObject(p.functional) && Object.isObject(parentParams.functional)) {
				functional = {...parentParams.functional, ...p.functional};

			} else {
				functional = p.functional !== undefined ? p.functional : parentParams.functional || false;
			}

			p.functional = functional;
		}

		if (!componentParams.has(target)) {
			componentParams.set(target, p);
			componentParams.set(name, p);
		}

		initEvent.emit('bindConstructor', name);

		if (!name || p.root || isAbstract) {
			regComponent();

		} else {
			const a = regCache[name] = regCache[name] || [];
			a.push(regComponent);
		}

		if (Object.isObject(p.functional)) {
			component({
				...params,
				name: `${name}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
			const
				componentName = name.replace(isSmartComponent, '');

			// Initialize parent component if needed

			let
				parentName = parentParams && parentParams.name;

			if (parentName && regCache[parentName]) {
				let
					parentComponent = parent;

				while (parentName === name) {
					parentComponent = Object.getPrototypeOf(parentComponent);

					if (parentComponent) {
						const p = componentParams.get(parentComponent);
						parentName = p && p.name;
					}
				}

				if (parentName) {
					const
						regParentComponent = regCache[parentName];

					if (regParentComponent) {
						for (let i = 0; i < regParentComponent.length; i++) {
							regParentComponent[i]();
						}

						delete regCache[parentName];
					}
				}
			}

			const
				parentMeta = components.get(parent),
				mods = {};

			if (target.mods) {
				for (let o = target.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						modVal = o[key],
						res = <unknown[]>[];

					if (modVal) {
						let
							cache,
							active;

						for (let i = 0; i < modVal.length; i++) {
							const
								val = modVal[i];

							if (Object.isArray(val)) {
								cache = cache || new Map();

								if (active !== undefined) {
									cache.set(active, active);
								}

								active = String(val[0]);
								cache.set(active, [active]);

							} else {
								cache = cache || new Map();
								const v = String(val);
								cache.set(v, v);
							}
						}

						if (cache) {
							for (let o = cache.values(), el = o.next(); !el.done; el = o.next()) {
								res.push(el.value);
							}
						}
					}

					mods[key.camelize(false)] = res;
				}
			}

			const meta: ComponentMeta = {
				name,
				componentName,

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
									hasOpts = Object.isSimpleObject(opts),
									attrOpts = <Dictionary>(hasOpts ? (<Dictionary>opts).attrs = (<Dictionary>opts).attrs || {} : {}),
									composite = attrOpts['v4-composite'];

								if (tag === 'v-render') {
									return attrOpts && <VNode>attrOpts.from || nativeCreate('span');
								}

								let
									tagName = tag;

								if (composite) {
									attrOpts['v4-composite'] = tagName = tagName === 'span' ? <string>composite : tagName.dasherize();
								}

								const
									regComponent = regCache[tagName];

								let
									component;

								if (regComponent) {
									for (let i = 0; i < regComponent.length; i++) {
										regComponent[i]();
									}

									delete regCache[tagName];
									component = components.get(tag);

								} else {
									component = components.get(tag);
								}

								// tslint:disable-next-line:prefer-conditional-expression
								if (hasOpts) {
									parseVAttrs(<Dictionary>opts, Boolean(component));
								}

								const renderKey =
									attrOpts['render-key'] != null ? `${tagName}:${attrOpts['global-name']}:${attrOpts['render-key']}` : '';

								let
									vnode = ctx.renderTmp[renderKey],
									needEl = Boolean(composite);

								if (!vnode && component && supports.functional && component.params.functional === true) {
									needEl = true;

									const
										{componentName} = component,
										tpl = TPLS[componentName];

									if (!tpl) {
										return nativeCreate('span');
									}

									const
										node = nativeCreate('span', {...opts, tag: undefined}, children),
										data = getComponentDataFromVnode(component, node);

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
											style: data.style,
											directives: data.directives
										}
									};

									const fakeCtx = createFakeCtx<ComponentInterface>(
										<CreateElement>createElement,
										renderCtx,

										minimalCtxCache[componentName] = minimalCtxCache[componentName] || Object.assign(Object.create(minimalCtx), {
											componentName,
											meta: component,
											instance: component.instance,
											$options: {}
										}),

										{initProps: true}
									);

									const renderObject = tplCache[componentName] =
										tplCache[componentName] ||
										tpl.index && tpl.index();

									vnode = patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, renderCtx);
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
											const
												// @ts-ignore (access)
												r = rootCtx.$refs,
												l = r[`${ref}:${ctx._componentId}`] || r[`${ref}:${ctx.componentId}`];

											if (l) {
												return l;
											}

											return vnode && (vnode.fakeContext || vnode.elm);
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

								const
									// @ts-ignore (access)
									forEach = rootCtx._l;

								// @ts-ignore (access)
								rootCtx._u = (fns, res) => {
									res = res || {};

									for (let i = 0; i < fns.length; i++) {
										const
											el = fns[i];

										if (!el) {
											continue;
										}

										if (Array.isArray(el)) {
											// @ts-ignore (access)
											rootCtx._u(el, res);

										} else {
											res[el.key] = function (): VNode[] {
												const
													children = fns[i].fn.apply(this, arguments);

												if (tasks.length) {
													for (let i = 0; i < tasks.length; i++) {
														tasks[i](children);
													}

													tasks = [];
												}

												return children;
											};
										}
									}

									return res;
								};

								// @ts-ignore (access)
								rootCtx._l = (obj, cb) => {
									const
										res = forEach(obj, cb);

									if (obj && obj[asyncLabel]) {
										tasks.push((vnode) => {
											const
												isTemplateParent = Object.isArray(vnode);

											if (isTemplateParent && !vnode.length) {
												return;
											}

											const
												ctx = (isTemplateParent ? vnode[0] : vnode).context;

											if (!isTemplateParent) {
												vnode.fakeContext = ctx;
											}

											const fn = () => ctx.$async.setTimeout(() => {
												obj[asyncLabel]((obj, p = {}) => {
													const
														els = <Node[]>[],
														renderNodes = <Nullable<Node>[]>[],
														nodes = <VNode[]>[];

													const
														parent = isTemplateParent ? vnode[0].elm.parentNode : vnode.elm,
														baseHook = ctx.hook;

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
													ctx.hook = baseHook;

													return els;
												});
											}, 0, {group: 'asyncComponents'});

											if (mountedHooks[ctx.hook]) {
												ctx.nextTick(fn);

											} else {
												const hooks = ctx.meta.hooks[beforeMountHooks[ctx.hook] ? 'mounted' : 'updated'];
												hooks.push({fn, once: true});
											}
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
			initEvent.emit(`constructor.${name}`, {meta, parentMeta});

			if (isAbstract) {
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

								// tslint:disable-next-line:no-string-literal
								GLOBAL['setImmediate'](f);

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
				const
					c = ComponentDriver.component(name, obj);

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}
		}
	};
}
