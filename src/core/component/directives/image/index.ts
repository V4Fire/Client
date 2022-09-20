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
import { getDirectiveContext } from 'core/component/directives/helpers';

import { createImg, createPictureElement } from 'core/component/directives/image/helpers';
import type { DirectiveParams } from 'core/component/directives/image/interface';

export * from 'core/component/directives/image/interface';

ComponentEngine.directive('image', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		const
			DYNAMIC_CHILDREN = 16;

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

		const
			el = p.sources != null ? createPictureElement(p, p) : createImg(p, p),
			img = el.toVNode(r.createVNode.bind(ctx));

		img.props = {
			...img.props,

			style: {
				'object-fit': p.objectFit
			}
		};

		vnode.children = Object.cast(Array.concat([], Object.cast(vnode.children), img));

		// eslint-disable-next-line no-bitwise
		if ((vnode.shapeFlag & DYNAMIC_CHILDREN) === 0) {
			vnode.shapeFlag += DYNAMIC_CHILDREN;
		}
	}
});
