/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/image/README.md]]
 * @packageDocumentation
 */

import { ComponentEngine, VNode } from 'core/component/engines';

import { setVNodePatchFlags, mergeProps } from 'core/component/render';
import { getDirectiveContext } from 'core/component/directives/helpers';

import { createImageElement, getCurrentSrc } from 'core/component/directives/image/helpers';
import type { DirectiveParams } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

const
	dirParams = Symbol('The `v-image` directive params');

ComponentEngine.directive('image', {
	beforeCreate(params: DirectiveParams, vnode: VNode): CanUndef<VNode> {
		if (!Object.isString(vnode.type)) {
			throw new TypeError('The `v-image` directive cannot be applied to a component');
		}

		const
			p = params.value,
			ctx = getDirectiveContext(params, vnode);

		if (ctx == null) {
			return;
		}

		const
			{r} = ctx.$renderEngine;

		vnode[dirParams] = p;
		vnode.type = 'span';

		let
			preview;

		if (Object.isString(p.preview)) {
			preview = `url(${p.preview})`;

		} else if (Object.isDictionary(p.preview)) {
			preview = `url(${getCurrentSrc(createImageElement(p.preview, p).toElement())})`;
		}

		const style = {
			'background-image': preview
		};

		vnode.props = vnode.props != null ? mergeProps(vnode.props, {style}) : {style};
		vnode.children = [createImageElement(p).toVNode(r.createVNode.bind(ctx))];

		setVNodePatchFlags(vnode, 'styles', 'children');
	},

	beforeUpdate(el: Element, params: DirectiveParams, vnode: VNode, oldVNode: VNode) {
		const p = params.value;
		vnode[dirParams] = p;

		if (Object.fastCompare(params.value, oldVNode[dirParams])) {
			return;
		}

		vnode.el?.children[0].replaceWith(createImageElement(p).toElement());
	},

	unmounted(el: Element) {
		el.removeAttribute('style');
	}
});
