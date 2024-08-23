/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isComponent } from 'core/component';
import { getDirectiveComponent } from 'core/component/directives';
import type { VNode, VNodeVirtualParent } from 'core/component/engines';

import type VDOM from 'components/friends/vdom/class';
import type { VNodeOptions, VNodeDescriptor } from 'components/friends/vdom/interface';

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
 * Creates VNodes by the specified descriptors
 *
 * @param descriptors
 *
 * @example
 * ```js
 * const vnodes = this.vdom.create(
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
 * Creates VNodes by the specified descriptors
 *
 * @param descriptors
 *
 * @example
 * ```js
 * const vnodes = this.vdom.create([
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
		resolvedDescriptors = Array.toArray(typeOrDesc, Object.cast(descriptors)),
		vnodes = new Array(resolvedDescriptors.length);

	resolvedDescriptors.forEach((descriptor, i) => {
		vnodes[i] = createVNode.call(this, descriptor.type, descriptor);
	});

	return vnodes;
}

/**
 * Creates a VNode by the specified descriptor
 *
 * @param type
 * @param [opts]
 * @param [opts.attrs]
 * @param [opts.children]
 * @param [virtualParent]
 */
function createVNode(
	this: VDOM,
	type: string,

	{
		attrs,
		children
	}: VNodeOptions = {},

	virtualParent?: VNodeVirtualParent
): VNode {
	return this.withRenderContext(() => {
		const {
			ctx,
			ctx: {$renderEngine: {r}}
		} = this;

		let resolvedChildren: CanUndef<
			VNode[] |
			Dictionary<() => VNode>
		>;

		const current: VNodeVirtualParent = {
			value: null
		};

		const factory = (vnode: Nullable<string | VNode | VNodeDescriptor>) => {
			if (Object.isDictionary(vnode) && !('patchFlag' in vnode)) {
				return createVNode.call(this, (Object.cast<VNode>(vnode)).type, vnode, current);
			}

			return vnode;
		};

		if (isComponent.test(type) && children != null && !Object.isDictionary(children)) {
			const slot = children;
			children = {default: () => slot};
		}

		if (children != null) {
			if (Object.isArray(children)) {
				resolvedChildren = new Array(children.length);

				children.forEach((child, i) => {
					(<VNode[]>resolvedChildren)[i] = factory(child);
				});

			} else {
				const
					slots = {};

				Object.entries(children).forEach(([key, slot]) => {
					slots[key] = Object.isFunction(slot) ?
						function slotWrapper(this: unknown) {
							// eslint-disable-next-line prefer-rest-params
							return Array.toArray(slot.apply(this, arguments)).map(Object.cast(factory));
						} :

						() => Array.toArray(slot).map(factory);
				});

				resolvedChildren = slots;
			}
		}

		let
			vnode: VNode;

		if (isComponent.test(type)) {
			const resolvedType = r.resolveDynamicComponent.call(ctx, type);
			vnode = r.createBlock.call(ctx, resolvedType, {'v-attrs': attrs}, resolvedChildren);

		} else {
			vnode = r.createVNode.call(ctx, type, {'v-attrs': attrs}, resolvedChildren);
		}

		Object.defineProperty(current, 'value', {
			enumerable: true,
			configurable: true,

			get() {
				let
					ctxFromVNode = getDirectiveComponent(vnode);

				if (ctxFromVNode?.$parent != null && !('componentName' in ctxFromVNode.$parent)) {
					ctxFromVNode = Object.create(ctxFromVNode, {
						$parent: {
							enumerable: true,
							configurable: true,
							writable: false,
							value: ctx.r
						}
					});
				}

				return ctxFromVNode;
			}
		});

		vnode.virtualParent = virtualParent;
		return vnode;
	});
}
