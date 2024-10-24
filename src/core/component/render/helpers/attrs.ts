/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { evalWith } from 'core/json';

import { beforeMountHooks } from 'core/component/const';
import type { VNode } from 'core/component/engines';

import { isHandler, mergeProps } from 'core/component/render/helpers/props';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Resolves values from special attributes of the given VNode.
 * Note: for the value of the `data-cached-dynamic-class` attribute,
 * you should use the JSON `core/json#evalWith` reviver format.
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
 *     'data-cached-class-component-id': '',
 *     'data-cached-class-provided-classes-styles': 'elem-name',
 *     'data-cached-dynamic-class': '["get", "componentName"]'
 *   }
 * })
 * ```
 */
export function resolveAttrs<T extends VNode>(this: ComponentInterface, vnode: T): T {
	let {
		ref,
		props,
		children,
		dynamicChildren
	} = vnode;

	const {
		meta,
		meta: {params: {functional}},
		$renderEngine: {r}
	} = this;

	// Setting the ref instance for the case of async rendering (does not work with SSR)
	if (!SSR && ref != null) {
		ref.i ??= r.getCurrentInstance();
	}

	if (Object.isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			resolveAttrs.call(this, Object.cast(children[i]));
		}
	}

	if (Object.isArray(dynamicChildren) && dynamicChildren.length > 0) {
		vnode.dynamicChildren = dynamicChildren.filter((el) => !el.ignore);
	}

	if (props == null) {
		return vnode;
	}

	{
		const key = 'v-attrs';

		if (props[key] != null) {
			const dir = r.resolveDirective.call(this, 'attrs');

			dir.beforeCreate({
				dir,

				modifiers: {},
				arg: undefined,

				value: props[key],
				oldValue: undefined,

				instance: this
			}, vnode);

			props = vnode.props!;
			delete props[key];
		}
	}

	{
		const key = 'v-ref';

		if (props[key] != null) {
			const
				value = props[key],
				dir = r.resolveDirective.call(this, 'ref');

			const descriptor = {
				once: true,
				fn: () => {
					dir.mounted(vnode.el, {
						dir,

						modifiers: {},
						arg: undefined,

						value,
						oldValue: undefined,

						instance: this
					}, vnode);
				}
			};

			const beforeMount = beforeMountHooks[this.hook] != null;

			if (beforeMount || functional === true) {
				meta.hooks['before:mounted'].push(descriptor);

			} else {
				this.$nextTick(descriptor.fn);
			}
		}

		delete props[key];
	}

	{
		const key = 'data-has-v-on-directives';

		if (props[key] != null) {
			if (SSR || this.meta.params.functional === true) {
				const dynamicProps = vnode.dynamicProps ?? [];
				vnode.dynamicProps = dynamicProps;

				const propNames = Object.keys(props);

				for (let i = 0; i < propNames.length; i++) {
					const propName = propNames[i];

					if (isHandler.test(propName)) {
						if (SSR) {
							delete props[propName];

						} else {
							dynamicProps.push(propName);
						}
					}
				}
			}

			delete props[key];
		}
	}

	{
		const key = 'data-cached-class-component-id';

		if (props[key] != null) {
			if (props[key] === 'true' && functional !== true) {
				Object.assign(props, mergeProps({class: props.class}, {class: this.componentId}));
			}

			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-class-provided-classes-styles',
			names = props[key];

		if (names != null) {
			const nameChunks = names.split(' ');

			for (let i = 0; i < nameChunks.length; i++) {
				const name = nameChunks[i];

				if ('classes' in this && this.classes?.[name] != null) {
					Object.assign(props, mergeProps({class: props.class}, {class: this.classes[name]}));
				}

				if ('styles' in this && this.styles?.[name] != null) {
					Object.assign(props, mergeProps({style: props.style}, {style: this.styles[name]}));
				}
			}

			delete props[key];
		}
	}

	{
		const
			key = 'data-cached-dynamic-class',
			rawValue = props[key];

		if (Object.isString(rawValue)) {
			const classValue = Object.parse(rawValue, evalWith(this));

			Object.assign(props, mergeProps({class: props.class}, {class: classValue}));
			delete props[key];
		}
	}

	return vnode;
}
