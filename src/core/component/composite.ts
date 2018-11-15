/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';
import { minimalCtx, ComponentDriver, ComponentOptions, VNode } from 'core/component/engines';
import { createFakeCtx } from 'core/component/functional';
import { constructors, components } from 'core/component/const';

export function getCompositeCtx<T>(component: ComponentOptions<ComponentDriver> | string, ctx): [T | undefined, ComponentInterface] {
	const
		constr = constructors[Object.isString(component) ? component : String(component.name)];

	if (!constr) {
		return [];
	}

	const
		meta = components.get(constr);

	if (!meta) {
		return [];
	}

	const renderCtx = Object.assign(Object.create(ctx), {
		data: {
			attrs: {}
		},

		slots: () => ({}),
		children: [],

		parent: {
			$options: {},
			$root: {}
		}
	});

	const baseCtx = Object.assign(Object.create(constr.prototype), minimalCtx, {
		instance: new constr(),
		meta,
		componentName: meta.componentName,
		$el: Object.isString(component) ? undefined : component.el
	});

	const
		createElement = ctx.$createElement.bind(ctx);

	const o = createFakeCtx(createElement, renderCtx, baseCtx, true);
	return [
		meta.component.render.call(o, createElement),
		o
	];
}

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
