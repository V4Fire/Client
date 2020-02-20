/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/render-function/README.md]]
 * @packageDocumentation
 */

import { runHook } from 'core/component/hook';
import { beforeMountHooks, mountedHooks } from 'core/component/const';

import { patchRefs } from 'core/component/create/refs';
import { renderData, CreateElement, RenderContext, VNode } from 'core/component/engines';
import { wrapCreateElement } from 'core/component/render-function/create-element';

import { ComponentInterface, ComponentMeta, RenderFunction } from 'core/component/interface';

/**
 * Wraps the specified render function and returns a new function.
 * This method adds V4Fire specific logic (v-attrs, composites, etc.) to a simple render function.
 *
 * @param meta - component meta object
 */
export function wrapRender(meta: ComponentMeta): RenderFunction {
	return function render(
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
				// tslint:disable-next-line:prefer-const
				[createElement, tasks] = wrapCreateElement(nativeCreate, rootCtx);

			if (rootCtx) {
				// @ts-ignore (access)
				rootCtx.$createElement = rootCtx._c = createElement;

				const
					// @ts-ignore (access)
					forEach = rootCtx._l;

				// Wrap slot directive to support async rendering
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

				// Wrap v-for directive to support async loop rendering
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

							// Function that render a chunk of VNodes
							const fn = () => ctx.$async.setTimeout(() => {
								obj[asyncLabel]((obj, p?: ComponentInterface) => {
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
									ctx.renderGroup = p?.renderGroup;

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
									runHook('beforeUpdated', ctx, p)
										.catch(stderr);

									patchRefs(ctx);
									ctx.hook = baseHook;

									return els;
								});
							}, 0, {group: 'asyncComponents'});

							if (mountedHooks[ctx.hook]) {
								ctx.nextTick(fn);

							} else {
								const hooks = ctx.meta.hooks[beforeMountHooks[ctx.hook] ? 'mounted' : 'beforeUpdated'];
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
}
