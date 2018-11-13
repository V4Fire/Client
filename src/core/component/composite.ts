/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { constructors, VNode, ComponentInterface } from 'core/component';

export function applyComposites(vnode: VNode, ctx: ComponentInterface): void {
	// @ts-ignore
	if (!ctx.$compositeI) {
		return;
	}

	const search = (vnode, parent?, pos?) => {
		const
			attrs = vnode.data && vnode.data.attrs || {},
			composite = attrs['v4-composite'];

		if (parent && composite) {
			const
				constr = constructors[composite];

			if (constr) {
				const
					proto = constr.prototype,
					tpl = TPLS[composite] || proto.render;

				/*parent.children[pos] = ctx.execRenderObject(
					tpl.index(),
					[Object.assign(Object.create(ctx), {componentName: composite})]
				);*/
			}

			// @ts-ignore
			if (!--ctx.$compositeI) {
				return;
			}
		}

		const
			{children} = vnode;

		if (children) {
			for (let i = 0; i < children.length; i++) {
				search(children[i], vnode, i);

				// @ts-ignore
				if (!ctx.$compositeI) {
					return;
				}
			}
		}
	};

	search(vnode);
}
