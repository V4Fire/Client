/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import * as c from 'core/component/const';

import { getComponentRenderCtxFromVNode } from 'core/component/vnode';
import { execRenderObject } from 'core/component/render';

import { parseVNodeAsFlyweight } from 'core/component/flyweight';
import { createFakeCtx, initComponentVNode, FlyweightVNode } from 'core/component/functional';

import { applyDynamicAttrs } from 'core/component/render-function/v-attrs';
import { registerComponent } from 'core/component/register';

import type { CreateElement, VNode, VNodeData } from 'core/component/engines';
import type { FunctionalCtx, ComponentInterface, UnsafeComponentInterface } from 'core/component/interface';

export const
	$$ = symbolGenerator();

/**
 * Wraps the specified createElement function and returns a pair:
 * the wrapped function, and a list of registered render tasks.
 *
 * This method adds V4Fire specific logic (v-attrs, composites, etc.) to a simple createElement function.
 *
 * @param nativeCreateElement - original createElement function
 * @param baseCtx - base component context
 */
export function wrapCreateElement(
	nativeCreateElement: CreateElement,
	baseCtx: ComponentInterface
): [CreateElement, Function[]] {
	const
		tasks = <Function[]>[],
		engine = baseCtx.$renderEngine;

	const
		{supports} = engine;

	const wrappedCreateElement = <CreateElement>function wrappedCreateElement(
		this: Nullable<ComponentInterface>,
		tag: CanUndef<string>,
		opts?: VNodeData,
		children?: VNode[]
	): CanPromise<VNode> {
		// eslint-disable-next-line
		'use strict';

		const
			ctx = this ?? baseCtx,
			unsafe = <UnsafeComponentInterface><any>(ctx),
			attrOpts = Object.isPlainObject(opts) ? opts.attrs : undefined;

		const createElement = (() => {
			const dontBind =
				nativeCreateElement[$$.wrappedCreateElement] === true &&
				unsafe.meta.params.functional !== true;

			if (dontBind) {
				return nativeCreateElement;
			}

			return nativeCreateElement.bind(ctx);
		})();

		let
			tagName = tag,
			flyweightComponent;

		if (attrOpts == null) {
			if (tag === 'v-render') {
				return createElement();
			}

		} else {
			if (tag === 'v-render') {
				return attrOpts.from ?? createElement();
			}

			if (tagName?.[0] === '@') {
				flyweightComponent = tagName.slice(1);
				tagName = 'span';

			} else {
				flyweightComponent = attrOpts['v4-flyweight-component'];
			}

			if (tagName != null && flyweightComponent != null) {
				tagName = tagName === 'span' ? flyweightComponent : tagName.dasherize();
				attrOpts['v4-flyweight-component'] = tagName;
			}
		}

		const
			component = registerComponent(tagName);

		if (Object.isPlainObject(opts)) {
			applyDynamicAttrs(opts, component);
		}

		let
			renderKey = '';

		if (attrOpts != null) {
			if (attrOpts['render-key'] != null) {
				renderKey = `${tagName}:${attrOpts['global-name']}:${attrOpts['render-key']}`;
			}

			if (renderKey !== '' && component == null) {
				attrOpts['data-render-key'] = renderKey;
				delete attrOpts['render-key'];
			}
		}

		let
			vnode = <CanUndef<VNode | FlyweightVNode>>unsafe.renderTmp[renderKey],
			needLinkToEl = Boolean(flyweightComponent);

		const needCreateFunctionalComponent =
			!supports.regular ||

			vnode == null &&
			flyweightComponent == null &&
			supports.functional &&
			component?.params.functional === true;

		if (component && needCreateFunctionalComponent) {
			needLinkToEl = true;

			const
				{componentName} = component;

			const
				renderObject = c.componentTemplates[componentName];

			if (renderObject == null) {
				return createElement();
			}

			const
				node = createElement('span', {...opts, tag: undefined}, children),
				renderCtx = getComponentRenderCtxFromVNode(component, node, ctx);

			let
				baseCtx = <CanUndef<FunctionalCtx>>c.renderCtxCache[componentName];

			if (baseCtx == null) {
				baseCtx = Object.create(engine.minimalCtx);

				// @ts-ignore (access)
				baseCtx.componentName = componentName;

				// @ts-ignore (access)
				baseCtx.meta = component;

				// @ts-ignore (access)
				component.params.functional = true;

				// @ts-ignore (access)
				baseCtx.instance = component.instance;

				// @ts-ignore (access)
				baseCtx.$options = {};
			}

			c.renderCtxCache[componentName] = baseCtx;

			// @ts-ignore (access)
			baseCtx._l = ctx._l;

			// @ts-ignore (access)
			baseCtx._u = ctx._u;

			const fakeCtx = createFakeCtx<ComponentInterface>(
				<CreateElement>wrappedCreateElement,
				renderCtx,
				baseCtx!,
				{initProps: true}
			);

			const createComponentVNode = () => initComponentVNode(
				execRenderObject(renderObject, fakeCtx),
				fakeCtx,
				renderCtx
			);

			if (supports.ssr && Object.isPromise(fakeCtx.unsafe.$initializer)) {
				return fakeCtx.unsafe.$initializer.then(() => patchVNode(createComponentVNode()));
			}

			vnode = createComponentVNode();
		}

		if (vnode == null) {
			vnode = createElement.apply(null, arguments);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (vnode == null) {
				return createElement();
			}

			if (flyweightComponent != null) {
				vnode = parseVNodeAsFlyweight(vnode, <CreateElement>wrappedCreateElement, ctx);
			}
		}

		return patchVNode(vnode);

		function patchVNode<T extends VNode | FlyweightVNode>(vnode: T): T {
			const
				vData = vnode.data,
				ref = vData != null && (vData[$$.ref] ?? vData.ref);

			if (renderKey !== '') {
				unsafe.renderTmp[renderKey] = engine.cloneVNode(vnode);
			}

			// Add $refs link if it doesn't exist
			if (vData != null && ref != null && ctx !== baseCtx) {
				vData[$$.ref] = ref;
				vData.ref = `${ref}:${ctx.componentId}`;

				Object.defineProperty(unsafe.$refs, ref, {
					configurable: true,
					enumerable: true,
					get: () => {
						const
							r = baseCtx.unsafe.$refs,
							l = r[`${ref}:${unsafe.$componentId}`] ?? r[`${ref}:${ctx.componentId}`];

						if (l != null) {
							return l;
						}

						return 'fakeInstance' in vnode ? (<FlyweightVNode>vnode).fakeInstance : vnode.elm;
					}
				});
			}

			// Add $el link if it doesn't exist
			if (needLinkToEl && 'fakeInstance' in vnode) {
				Object.defineProperty((<FlyweightVNode>vnode).fakeInstance, '$el', {
					enumerable: true,
					configurable: true,

					set(): void {
						// Loopback
					},

					get(): CanUndef<Node> {
						return vnode.elm;
					}
				});
			}

			if (tasks.length > 0) {
				for (let i = 0; i < tasks.length; i++) {
					tasks[i](vnode);
				}

				tasks.splice(0);
			}

			vnode.fakeContext = ctx;
			return vnode;
		}
	};

	wrappedCreateElement[$$.wrappedCreateElement] = true;

	if (supports.ssr) {
		const wrappedAsyncCreateElement = <CreateElement>function wrappedAsyncCreateElement(
			this: Nullable<ComponentInterface>,
			tag: CanUndef<string>,
			opts?: VNodeData,
			children?: VNode[]
		): CanPromise<VNode> {
			if (children != null && children.length > 0) {
				children = children.flat();

				// eslint-disable-next-line @typescript-eslint/unbound-method
				if (children.some(Object.isPromise)) {
					return Promise.all(children).then((children) => wrappedCreateElement.call(this, tag, opts, children));
				}
			}

			// eslint-disable-next-line prefer-rest-params
			return wrappedCreateElement.apply(this, arguments);
		};

		return [wrappedAsyncCreateElement, tasks];
	}

	return [wrappedCreateElement, tasks];
}
