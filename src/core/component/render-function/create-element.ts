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

import { parseVNode } from 'core/component/flyweight';
import { createFakeCtx, initComponentVNode } from 'core/component/functional';

import { applyDynamicAttrs } from 'core/component/render-function/v-attrs';
import { registerComponent } from 'core/component/create/register';

import {

	supports,
	cloneVNode,
	minimalCtx,

	CreateElement,

	VNode,
	VNodeData

} from 'core/component/engines';

import { ComponentInterface } from 'core/component/interface';

export const
	$$ = symbolGenerator();

/**
 * Wraps the specified createElement function and returns a pair:
 * the wrapped function and a list of registered render tasks.
 *
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

	const wrappedCreateElement = <CreateElement>function (tag: string, opts?: VNodeData, children?: VNode[]): VNode {
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
				renderCtx = getComponentRenderCtxFromVNode(component, node, ctx);

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

			vnode = initComponentVNode(
				execRenderObject(renderObject, fakeCtx),
				fakeCtx,
				renderCtx
			);
		}

		if (!vnode) {
			vnode = parseVNode(
				createElement.apply(ctx, arguments),
				wrappedCreateElement,
				ctx
			);
		}

		const
			vData = vnode.data,
			ref = vData && (vData[$$.ref] || vData.ref);

		if (renderKey) {
			ctx.renderTmp[renderKey] = cloneVNode(vnode);
		}

		// Add $refs link if it doesn't exist
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

		// Add $el link if it doesn't exist
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

	return [wrappedCreateElement, tasks];
}
