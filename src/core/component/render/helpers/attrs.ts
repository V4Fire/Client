/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';
import { isHandler, mergeProps } from 'core/component/render/helpers/props';

import type { ComponentInterface } from 'core/component/interface';

const
	staticAttrsCache: Dictionary<Function> = Object.createDict();

/**
 * Resolves values from some attributes of the passed VNode
 *
 * @param vnode
 *
 * @example
 * ```js
 * // `.componentId = 'id-1'`
 * // `.componentName = 'b-example'`
 * // `.classes = {'elem-name': 'alias'}`
 * const ctx = this;
 *
 * // {props: {class: 'id-1 b-example alias'}}
 * resolveAttrs.call(ctx, {
 *   props: {
 *     'data-cached-class-component-id': ''
 *     'data-cached-class-provided-classes-styles': 'elem-name'
 *     'data-cached-dynamic-class': '[self.componentName]'
 *   }
 * })
 * ```
 */
export function resolveAttrs<T extends VNode>(this: ComponentInterface, vnode: T): T {
	const
		{props} = vnode;

	if (vnode.ref != null) {
		vnode.ref['i'] ??= this.$renderEngine.r.getCurrentInstance();
	}

	if (props == null) {
		return vnode;
	}

	{
		const
			key = 'data-has-v-on-directives';

		if (props[key] != null) {
			// eslint-disable-next-line no-bitwise
			if ((vnode.patchFlag & 8) === 0) {
				vnode.patchFlag += 8;
			}

			const dynamicProps = vnode.dynamicProps ?? [];
			vnode.dynamicProps = dynamicProps;

			Object.keys(props).forEach((prop) => {
				if (isHandler.test(prop)) {
					dynamicProps.push(prop);
				}
			});

			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-class-component-id';

		if (props[key] != null) {
			if (this.meta.params.functional !== true) {
				Object.assign(props, mergeProps({class: props.class}, {class: this.componentId}));
			}

			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-class-provided-classes-styles',
			name = props[key];

		if (name != null) {
			if ('classes' in this && this.classes?.[name] != null) {
				Object.assign(props, mergeProps({class: props.class}, {class: this.classes[name]}));
			}

			if ('styles' in this && this.styles?.[name] != null) {
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
		children.forEach((child) => resolveAttrs.call(this, Object.cast(child)));
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
