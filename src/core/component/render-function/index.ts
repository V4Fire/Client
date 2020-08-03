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

import { resolveRefs } from 'core/component/ref';
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
			{unsafe} = this;

		const
			renderCounter = ++unsafe.renderCounter,
			now = Date.now();

		if (!IS_PROD) {
			const
				{lastSelfReasonToRender, lastTimeOfRender} = unsafe;

			let
				diff;

			if (lastTimeOfRender != null && (diff = now - lastTimeOfRender) < 100) {
				const printableReason = lastSelfReasonToRender != null ?
					{
						...lastSelfReasonToRender,
						path: lastSelfReasonToRender.path.join('.')
					} :

					'forceUpdate';

				console.warn(
					`There is too frequent redrawing of the component "${this.componentName}" (# ${renderCounter}; ${diff}ms).`,
					printableReason
				);
			}
		}

		unsafe.lastTimeOfRender = now;

		const
			{methods: {render: r}} = meta;

		if (r) {
			const
				asyncLabel = unsafe.$asyncLabel;

			let
				[createElement, tasks] = wrapCreateElement(nativeCreate, this);

			unsafe.$createElement = createElement;
			unsafe._c = createElement;

			const
				forEach = unsafe._l;

			// Wrap slot directive to support async rendering
			unsafe._u = (fns, res) => {
				res = res ?? {};

				for (let i = 0; i < fns.length; i++) {
					const
						el = fns[i];

					if (el == null) {
						continue;
					}

					if (Array.isArray(el)) {
						unsafe._u(el, res);

					} else {
						res[el.key] = function execAsyncTasks(this: unknown, ...args: unknown[]): VNode[] {
							const
								children = fns[i].fn.apply(this, args);

							if (tasks.length > 0) {
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
			unsafe._l = (obj, cb) => {
				const
					res = forEach(obj, cb);

				if (obj?.[asyncLabel] != null) {
					tasks.push((vnodes?: CanArray<VNode>) => {
						if (vnodes == null) {
							return;
						}

						const
							isTemplateParent = Object.isArray(vnodes);

						let
							vnode: VNode;

						if (isTemplateParent) {
							while (Object.isArray(vnodes)) {
								let
									newVNode = vnodes[0];

								for (let i = 0; i < vnodes.length; i++) {
									const
										el = vnodes[i];

									if (!Object.isArray(el) && el.context) {
										newVNode = el;
									}
								}

								vnodes = newVNode;
							}

							if (vnodes == null) {
								return;
							}

							vnode = vnodes;

						} else {
							vnode = <Exclude<typeof vnodes, any[]>>vnodes;
						}

						if (vnode.context == null || !('$async' in vnode.context)) {
							return;
						}

						const
							ctx = <ComponentInterface['unsafe']>vnode.context;

						if (!isTemplateParent) {
							Object.set(vnode, 'fakeInstance', ctx);
						}

						// Function that render a chunk of VNodes
						const fn = () => ctx.$async.setTimeout(() => {
							obj[asyncLabel]((obj, p?: ComponentInterface) => {
								const
									els = <Node[]>[],
									renderNodes = <Array<Nullable<Node>>>[],
									nodes = <VNode[]>[];

								const
									parent = isTemplateParent ? vnode.elm?.parentNode : vnode.elm,
									baseHook = ctx.hook;

								if (parent == null) {
									return [];
								}

								Object.set(ctx, 'hook', 'beforeUpdate');
								Object.set(ctx, 'renderGroup', p?.renderGroup);

								for (let o = forEach(obj, cb), i = 0; i < o.length; i++) {
									const
										el = o[i];

									if (el == null) {
										continue;
									}

									if (Object.isArray(el)) {
										for (let o = el, i = 0; i < o.length; i++) {
											const
												el = <CanUndef<VNode>>o[i];

											if (el == null) {
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

									} else if (el.elm != null) {
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
										el = <CanArray<CanUndef<Node>>>(renderNodes[i] ?? renderVNodes[j++]);

									if (Object.isArray(el)) {
										for (let i = 0; i < el.length; i++) {
											const
												node = el[i];

											if (node != null) {
												els.push(parent.appendChild(node));
											}
										}

									} else if (el != null) {
										els.push(parent.appendChild(el));
									}
								}

								Object.set(ctx, 'renderGroup', undefined);
								runHook('beforeUpdated', ctx, p).catch(stderr);

								resolveRefs(ctx);
								Object.set(ctx, 'hook', baseHook);

								return els;

							});

						}, 0, {group: 'asyncComponents'});

						if (mountedHooks[ctx.hook] != null) {
							ctx.$nextTick(fn);

						} else {
							const hooks = ctx.meta.hooks[beforeMountHooks[ctx.hook] != null ? 'mounted' : 'beforeUpdated'];
							hooks.push({fn, once: true});
						}
					});
				}

				return res;
			};

			return r.fn.call(this, createElement, baseCtx);
		}

		return nativeCreate();
	};
}
