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

const
	staticAttrsCache: Dictionary<Function> = Object.createDict();

/**
 * Interpolates values from some static attributes of the passed VNode
 *
 * @param vnode
 * @example
 * ```js
 * // `.componentId = 'id-1'`
 * // `.componentName = 'b-example'`
 * // `.classes = {'elem-name': 'alias'}`
 * const ctx = this;
 *
 * // {class: 'id-1 b-example alias'}
 * interpolateStaticAttrs.call(ctx, {
 *   'data-cached-class-component-id': ''
 *   'data-cached-class-provided-classes-styles': 'elem-name'
 *   'data-cached-dynamic-class': '[self.componentName]'
 * })
 * ```
 */
export function interpolateStaticAttrs<T extends VNode | Dictionary>(this: ComponentInterface, vnode: T): T {
	const
		props = <CanUndef<Dictionary<string>>>(Object.isString(vnode.type) ? vnode.props : vnode);

	if (props == null) {
		return vnode;
	}

	{
		const
			key = 'data-cached-class-component-id',
			val = props[key];

		if (val != null) {
			Object.assign(props, mergeProps({class: props.class}, {class: this.componentId}));
			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-class-provided-classes-styles',
			name = props[key];

		if (name != null) {
			if (this.classes?.[name] != null) {
				Object.assign(props, mergeProps({class: props.class}, {class: this.classes[name]}));
			}

			if (this.styles?.[name] != null) {
				Object.assign(props, mergeProps({style: props.style}, {style: this.styles[name]}));
			}

			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-dynamic-class',
			fnBody = props[key];

		if (fnBody != null) {
			// eslint-disable-next-line no-new-func
			const classVal = compileFn(fnBody)(this);

			Object.assign(props, mergeProps({class: props.class}, {class: classVal}));
			delete props[key];
		}
	}

	const
		{children} = vnode;

	if (Object.isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			interpolateStaticAttrs.call(this, children[i]);
		}
	}

	return vnode;
}

function compileFn(fnBody: string): Function {
	let
		fn = staticAttrsCache[fnBody];

	if (fn == null) {
		// eslint-disable-next-line no-new-func
		fn = Function('self', `return ${fnBody}`);
		staticAttrsCache[fnBody] = fn;
	}

	return fn;
}
