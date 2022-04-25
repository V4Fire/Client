/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

import { components } from 'core/component/render/const';
import { mergeProps } from 'core/component/render/helpers';

import type { CreateVNode } from 'core/component/render/interface';
import type { ComponentInterface } from 'core/component/interface';

/**
 * Creates a new VNode by the specified parameters with applying internal component directives, like `v-render`.
 * The function takes an original function to create VNodes and list of arguments and returns a new VNode.
 *
 * @param createVNode - original function to create a VNode
 * @param type - VNode type
 * @param args - operation arguments
 */
export function createVNodeWithDirectives(createVNode: CreateVNode, type: string, ...args: any[]): VNode {
	return components[type]?.(createVNode, type, ...args) ?? createVNode(...args);
}

export function resolveStaticalAttrs<T extends VNode | Dictionary>(this: ComponentInterface, vnode: T): T {
	const
		props = <CanUndef<Dictionary<string>>>(Object.isString(vnode.type) ? vnode.props : vnode);

	if (props == null) {
		return vnode;
	}

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		switch (key) {
			case 'data-cached-dynamic-class': {
				// eslint-disable-next-line no-new-func
				const classes = Function('self', `return ${props[key]}`)(this);

				Object.assign(props, mergeProps({class: props.class}, {class: classes}));
				delete props[key];

				break;
			}

			case 'data-cached-dynamic-style': {
				// eslint-disable-next-line no-new-func
				const style = Function('self', `return ${props[key]}`)(this);

				Object.assign(props, mergeProps({style: props.style}, {style}));
				delete props[key];

				break;
			}

			default:
				// Do nothing
		}
	}

	const
		{children} = vnode;

	if (Object.isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			resolveStaticalAttrs.call(this, children[i]);
		}
	}

	return vnode;
}
