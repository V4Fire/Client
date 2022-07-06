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

import { ComponentEngine, VNode } from 'core/component/engines';
import type { DirectiveParams } from 'core/component/directives/render/interface';

export * from 'core/component/directives/render/interface';

ComponentEngine.directive('render', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
		const
			newVNode = params.value,
			originalChildren = vnode.children;

		if (newVNode != null) {
			const canReplaceVNode =
				vnode.type === 'template' &&
				!Object.isArray(newVNode) &&
				Object.size(vnode.props) === 0;

			if (canReplaceVNode) {
				return newVNode;
			}

			if (Object.isString(vnode.type)) {
				vnode.children = Array.concat([], newVNode);

			} else {
				const slots = Object.isPlainObject(originalChildren) ? Object.reject(originalChildren, /^_/) : {};
				vnode.children = slots;

				if (Object.isArray(newVNode)) {
					if (isSlot(newVNode[0])) {
						for (let i = 0; i < newVNode.length; i++) {
							const
								el = newVNode[i],
								slot = el.props?.slot;

							if (slot != null) {
								slots[slot] = () => el.children ?? getDefSlotFromChildren(slot);
							}
						}

						return;
					}

				} else if (isSlot(newVNode)) {
					const {slot} = newVNode.props!;
					slots[slot] = () => newVNode.children ?? getDefSlotFromChildren(slot);
					return;
				}

				slots.default = () => newVNode;
			}
		}

		function isSlot(vnode: CanUndef<VNode>): boolean {
			return vnode?.type === 'template' && vnode.props?.slot != null;
		}

		function getDefSlotFromChildren(slotName: string): unknown {
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
