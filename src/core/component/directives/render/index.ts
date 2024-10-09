/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/render/README.md]]
 * @packageDocumentation
 */

import { setVNodePatchFlags } from 'core/component/render';
import { ComponentEngine, VNode } from 'core/component/engines';

import { getDirectiveContext } from 'core/component/directives/helpers';
import type { DirectiveParams } from 'core/component/directives/render/interface';

export * from 'core/component/directives/render/interface';

ComponentEngine.directive('render', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
		const
			ctx = getDirectiveContext(params, vnode);

		const
			newVNode = params.value,
			originalChildren = vnode.children;

		if (newVNode == null) {
			return;
		}

		const
			isTemplate = vnode.type === 'template' && Object.size(vnode.props) === 0,
			canReplaceOriginalVNode = isTemplate && !Object.isArray(newVNode);

		if (canReplaceOriginalVNode) {
			return SSR ? renderSSRFragment(newVNode) : newVNode;
		}

		if (Object.isString(vnode.type)) {
			const children = Array.toArray(newVNode);

			if (SSR) {
				if (isTemplate) {
					vnode.type = 'ssr-fragment';
				}

				vnode.props = {
					...vnode.props,
					innerHTML: getSSRInnerHTML(children)
				};

			} else {
				vnode.children = children;
				vnode.dynamicChildren = Object.cast(children.slice());
				setVNodePatchFlags(vnode, 'children');
			}

		} else {
			const slots = Object.isPlainObject(originalChildren) ?
				Object.reject(originalChildren, /^_/) :
				{};

			vnode.children = slots;
			setVNodePatchFlags(vnode, 'slots');

			if (SSR) {
				slots.default = () => renderSSRFragment(newVNode);

			} else {
				if (Object.isArray(newVNode)) {
					if (isSlot(newVNode[0])) {
						for (const vnode of newVNode) {
							const slot = vnode.props?.slot;

							if (slot != null) {
								slots[slot] = () => vnode.children ?? getDefaultSlotFromChildren(slot);
							}
						}

						return;
					}

				} else if (isSlot(newVNode)) {
					const {slot} = newVNode.props!;
					slots[slot] = () => newVNode.children ?? getDefaultSlotFromChildren(slot);
					return;
				}

				slots.default = () => newVNode;
			}
		}

		async function getSSRInnerHTML(content: CanArray<CanPromise<VNode>>) {
			let normalizedContent = Array.toArray(content);

			while (normalizedContent.some(Object.isPromise)) {
				normalizedContent = (await Promise.all(normalizedContent)).flat();
			}

			return normalizedContent.join('');
		}

		function renderSSRFragment(content: CanArray<CanPromise<VNode>>) {
			if (ctx == null) {
				return;
			}

			const
				{r} = ctx.$renderEngine;

			return r.createVNode.call(ctx, 'ssr-fragment', {
				innerHTML: getSSRInnerHTML(content)
			});
		}

		function isSlot(vnode: CanUndef<VNode>): boolean {
			return vnode?.type === 'template' && vnode.props?.slot != null;
		}

		function getDefaultSlotFromChildren(slotName: string): unknown {
			if (Object.isPlainObject(originalChildren)) {
				const
					slot = originalChildren[slotName];

				if (Object.isFunction(slot)) {
					return slot();
				}

				return slot;
			}

			return originalChildren;
		}
	}
});
