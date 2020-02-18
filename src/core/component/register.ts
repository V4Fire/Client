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

import inheritMeta from 'core/component/create/inherit';

import { getInfoFromConstructor } from 'core/component/reflection';

import { getBlankMetaForComponent } from 'core/component/meta';
import { runHook, patchRefs, parseVAttrs } from 'core/component/helpers';
import { ComponentInterface, ComponentParams, ComponentMethod } from 'core/component/interface';

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

import {

	getComponent,
	getBaseComponent

} from 'core/component/create';

import { registerComponent, registerParentComponents } from 'core/component/create/register';
import { createFakeCtx, execRenderObject, patchVNode } from 'core/component/create/functional';
import { getComponentDataFromVnode, createFlyweightComponent } from 'core/component/create/composite';
import * as c from 'core/component/const';

export const
	$$ = symbolGenerator(),
	dsComponentsMods = DS_COMPONENTS_MODS;

/**
 * Creates a new component
 *
 * @decorator
 * @param [declParams] - additional parameters:
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
 *   *) [inheritAttrs] - parameters for an inheritAttrs option
 */
export function component(declParams?: ComponentParams): Function {
	return (target) => {
		const i = getInfoFromConstructor(target, declParams);
		c.initEmitter.emit('bindConstructor', i.name);

		if (!i.name || i.params.root || i.isAbstract) {
			regComponent();

		} else {
			const initList = c.componentInitializers[i.name] = c.componentInitializers[i.name] || [];
			initList.push(regComponent);
		}

		// If we have a smart component,
		// then we compile 2 components in the runtime
		if (Object.isPlainObject(i.params.functional)) {
			component({
				...declParams,
				name: `${i.name}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
			// Lazy initializing of parent components
			registerParentComponents(i);

			const
				parentMeta = i.parentMeta,
				meta = getBlankMetaForComponent(i);

			meta.component.render = function render(
				this: ComponentInterface,
				nativeCreate: CreateElement,
				baseCtx: RenderContext
			): VNode {
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
							hasOpts = Object.isPlainObject(opts),
							attrOpts = <CanUndef<Dictionary>>(hasOpts ? (<Dictionary>opts).attrs : undefined),
							composite = attrOpts && attrOpts['v4-composite'];

						if (tag === 'v-render') {
							return attrOpts && <VNode>attrOpts.from || nativeCreate();
						}

						let
							tagName = tag;

						if (composite && attrOpts) {
							attrOpts['v4-composite'] = tagName = tagName === 'span' ? <string>composite : tagName.dasherize();
						}

						const
							component = registerComponent(tagName);

						// tslint:disable-next-line:prefer-conditional-expression
						if (hasOpts) {
							parseVAttrs(<Dictionary>opts, component);
						}

						const renderKey = attrOpts && attrOpts['render-key'] != null ?
							`${tagName}:${attrOpts['global-name']}:${attrOpts['render-key']}` : '';

						if (renderKey && !component) {
							const a = <Dictionary>attrOpts;
							a['data-render-key'] = renderKey;
							delete a['render-key'];
						}

						let
							vnode = ctx.renderTmp[renderKey],
							needEl = Boolean(composite);

						if (!vnode && component && supports.functional && component.params.functional === true) {
							needEl = true;

							const
								{componentName} = component,
								tpl = TPLS[componentName];

							if (!tpl) {
								return nativeCreate();
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
									nativeOn: <Record<string, CanArray<Function>>>data.nativeOn,
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

								c.renderCtxCache[componentName] = c.renderCtxCache[componentName] ||
									Object.assign(Object.create(minimalCtx), {
										componentName,
										meta: component,
										instance: component.instance,
										$options: {}
									}),

								{initProps: true}
							);

							const renderObject = c.componentTemplates[componentName] =
								c.componentTemplates[componentName] ||
								tpl.index && tpl.index();

							vnode = patchVNode(execRenderObject(renderObject, fakeCtx), fakeCtx, renderCtx);
						}

						if (!vnode) {
							vnode = createFlyweightComponent(
								nativeCreate.apply(ctx, arguments),
								<CreateElement>createElement,
								ctx
							);
						}

						const
							vData = vnode.data,
							ref = vData && (vData[$$.ref] || vData.ref);

						if (renderKey) {
							ctx.renderTmp[renderKey] = cloneVNode(vnode);
						}

						if (vData && ref && ctx !== rootCtx) {
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

									if (isTemplateParent) {
										while (Object.isArray(vnode)) {
											let
												newVNode = vnode[0];

											for (let i = 0; i < vnode.length; i++) {
												const
													el = vnode[i];

												if (!Object.isArray(el) && (<VNode>el).context) {
													newVNode = el;
												}
											}

											vnode = newVNode;
										}

										if (!vnode) {
											return;
										}
									}

									const
										ctx = vnode.context;

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
												parent = isTemplateParent ? vnode.elm.parentNode : vnode.elm,
												baseHook = ctx.hook;

											if (!parent) {
												return [];
											}

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

									if (c.mountedHooks[ctx.hook]) {
										ctx.nextTick(fn);

									} else {
										const hooks = ctx.meta.hooks[c.beforeMountHooks[ctx.hook] ? 'mounted' : 'beforeUpdated'];
										hooks.push({fn, once: true});
									}
								});
							}

							return res;
						};
					}

					return r.fn.call(rootCtx, createElement, baseCtx);
				}

				return nativeCreate();
			};

			if (parentMeta) {
				i.params = inheritMeta(meta, parentMeta);
			}

			if (!i.params.name || !i.isSmart) {
				c.components.set(target, meta);
			}

			c.components.set(i.name, meta);
			c.initEmitter.emit(`constructor.${i.name}`, {meta, parentMeta});

			if (i.isAbstract) {
				getBaseComponent(target, meta);
				return;
			}

			const loadTemplate = (component) => (resolve) => {
				const success = () => {
					log(`component:load:${i.name}`, component);
					resolve(component);
				};

				const
					{methods, methods: {render: r}} = meta;

				const addRenderAndResolve = (tpls) => {
					const
						fns = c.componentTemplates[i.name] = c.componentTemplates[i.name] || tpls.index(),
						renderObj = <ComponentMethod>{wrapper: true, watchers: {}, hooks: {}};

					renderObj.fn = fns.render;
					component.staticRenderFns = meta.component.staticRenderFns = fns.staticRenderFns || [];

					methods.render = renderObj;
					success();
				};

				if (i.params.tpl === false) {
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
								globalThis['setImmediate'](f);

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

			if (i.params.root) {
				c.rootComponents[i.name] = new Promise(obj);

			} else {
				const
					c = ComponentDriver.component(i.name, obj);

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}
		}
	};
}
