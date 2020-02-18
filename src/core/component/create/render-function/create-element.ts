/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import applyDynamicAttrs from 'core/component/create/render-function/v-attrs';

import * as c from 'core/component/const';
import { registerComponent } from 'core/component/create/register';

import {

	patchVNode,
	getComponentDataFromVnode,
	createFlyweightComponent,
	createFakeCtx,
	execRenderObject,
	ComponentInterface

} from 'core/component';

import {

	supports,
	cloneVNode,
	minimalCtx,

	CreateElement,
	NormalizedScopedSlot,
	RenderContext,

	VNode,
	VNodeData

} from 'core/component/engines';

export const
	$$ = symbolGenerator();

/**
 * Wraps the specified createElement function and returns a new function.
 * This method adds V4Fire specific logic (v-attrs, composites, etc.) to a simple createElement function.
 *
 * @param createElement - original createElement function
 * @param baseCtx - base component context
 */
export function wrapCreateElement(
	createElement: CreateElement,
	baseCtx: ComponentInterface
): [CreateElement, Function[]] {
	const
		tasks = <Function[]>[];

	const wrappedCreateElement = function (tag: string, opts?: VNodeData, children?: VNode[]): VNode {
		'use strict';

		const
			ctx = this || baseCtx;

		const
			hasOpts = Object.isPlainObject(opts),
			attrOpts = hasOpts ? opts?.attrs : undefined,
			composite = attrOpts?.['v4-composite'];

		if (tag === 'v-render') {
			return attrOpts && attrOpts.from || createElement();
		}

		let
			tagName = tag;

		if (composite && attrOpts) {
			attrOpts['v4-composite'] = tagName = tagName === 'span' ? composite : tagName.dasherize();
		}

		const
			component = registerComponent(tagName);

		if (hasOpts) {
			applyDynamicAttrs(<Dictionary>opts, component);
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

		// Create functional component
		if (!vnode && component && supports.functional && component.params.functional === true) {
			needEl = true;

			const
				{componentName} = component,
				tpl = TPLS[componentName];

			if (!tpl) {
				return createElement();
			}

			const
				node = createElement('span', {...opts, tag: undefined}, children),
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
				<CreateElement>wrappedCreateElement,
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
				createElement.apply(ctx, arguments),
				<CreateElement>wrappedCreateElement,
				ctx
			);
		}

		const
			vData = vnode.data,
			ref = vData && (vData[$$.ref] || vData.ref);

		if (renderKey) {
			ctx.renderTmp[renderKey] = cloneVNode(vnode);
		}

		if (vData && ref && ctx !== baseCtx) {
			vData[$$.ref] = ref;
			vData.ref = `${ref}:${ctx.componentId}`;

			Object.defineProperty(ctx.$refs, ref, {
				configurable: true,
				enumerable: true,
				get: () => {
					const
						// @ts-ignore (access)
						r = baseCtx.$refs,
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

			tasks.splice(0);
		}

		return vnode;
	};

	return <any>wrappedCreateElement;
}
