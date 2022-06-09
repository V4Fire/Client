/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isComponent } from 'core/component';

import type { VNode, ObjectDirective } from 'core/component/engines';
import type { ComponentInterface } from 'super/i-block';

import type VDOM from 'friends/vdom/class';
import type { VNodeOptions, VNodeDescriptor } from 'friends/vdom/interface';

/**
 * Creates a VNode with the specified parameters
 *
 * @param type - a simple tag name or component name
 * @param [opts] - additional options
 *
 * @example
 * ```js
 * const vnode = this.vdom.create('b-button', {
 *   attrs: {
 *     exterior: 'warning',
 *     'v-show': true,
 *     '@click': console.log
 *   },
 *
 *   children: {default: () => 'Press on me!'}
 * });
 * ```
 */
export function create(this: VDOM, type: string, opts?: VNodeOptions): VNode;

/**
 * Creates a VNodes by the specified descriptors
 *
 * @param descriptors
 * @example
 * ```js
 * const vnode = this.vdom.create(
 *   {
 *     type: 'b-button',
 *
 *     attrs: {
 *       exterior: 'warning',
 *       'v-show': true,
 *       '@click': console.log
 *     },
 *
 *     children: {default: () => 'Press on me!'}
 *   },
 *
 *   {
 *     type: 'div',
 *     children: ['Hello div']
 *   }
 * );
 * ```
 */
export function create(this: VDOM, ...descriptors: VNodeDescriptor[]): VNode[];

/**
 * Creates a VNodes by the specified descriptors
 *
 * @param descriptors
 * @example
 * ```js
 * const vnode = this.vdom.create([
 *   {
 *     type: 'b-button',
 *
 *     attrs: {
 *       exterior: 'warning',
 *       'v-show': true,
 *       '@click': console.log
 *     },
 *
 *     children: {default: () => 'Press on me!'}
 *   },
 *
 *   {
 *     type: 'div',
 *     children: ['Hello div']
 *   }
 * ]);
 * ```
 */
export function create(this: VDOM, descriptors: VNodeDescriptor[]): VNode[];

export function create(
	this: VDOM,
	typeOrDesc?: string | CanArray<VNodeDescriptor>,
	...descriptors: [VNodeOptions?] | VNodeDescriptor[]
): CanArray<VNode> {
	if (Object.isString(typeOrDesc)) {
		return createVNode.call(this, typeOrDesc, descriptors[0]);
	}

	const
		resolvedDescriptors = Array.concat([], typeOrDesc, Object.cast(descriptors)),
		vnodes = new Array(resolvedDescriptors.length);

	for (let i = 0; i < resolvedDescriptors.length; i++) {
		const el = resolvedDescriptors[i];
		vnodes[i] = createVNode.call(this, el.type, el);
	}

	return vnodes;
}

/**
 * Creates a VNode by the specified descriptor
 *
 * @param type
 * @param [attrs]
 * @param [children]
 */
function createVNode(
	this: VDOM,
	type: string,
	{attrs, children}: VNodeOptions = {}
): VNode {
	this.setInstance?.();

	const {
		ctx,
		ctx: {$renderEngine: {r}}
	} = this;

	const
		resolvedType = isComponent.test(type) ? r.resolveComponent.call(ctx, type) : type;

	let
		resolvedChildren;

	if (children != null) {
		if (Object.isArray(children)) {
			resolvedChildren = new Array(children.length);

			for (let i = 0; i < children.length; i++) {
				const
					el = children[i];

				resolvedChildren[i] = Object.isString(el) ?
					r.createTextVNode.call(ctx, el) :
					createVNode.call(this, el.type, el);
			}

		} else {
			resolvedChildren = children;
		}
	}

	const vnode = Object.isString(resolvedType) ?
		r.createVNode.call(ctx, resolvedType, {}, resolvedChildren) :
		r.createBlock.call(ctx, resolvedType, {}, resolvedChildren);

	if (attrs != null) {
		const vAttrs: {beforeCreate: NonNullable<ObjectDirective['beforeCreate']>} = Object.cast(
			r.resolveDirective.call(ctx, 'attrs')
		);

		vAttrs.beforeCreate.call(Object.cast(vAttrs), {
			arg: '',
			modifiers: {},

			value: attrs,
			oldValue: undefined,

			dir: Object.cast<ObjectDirective>(vAttrs),
			instance: Object.cast<ComponentInterface>(ctx)
		}, vnode);
	}

	return vnode;
}
