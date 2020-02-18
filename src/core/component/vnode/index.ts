/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/vnode/README.md]]
 * @packageDocumentation
 */

import { components } from 'core/component/const';
import { VNode, VNodeDirective } from 'core/component/engines';
import { ComponentMeta } from 'core/component/interface';
import { ComponentVNodeData, ComponentModelVNodeData } from 'core/component/vnode/interface';
export * from 'core/component/vnode/interface';

/**
 * Returns a component data object from the specified vnode
 *
 * @param component - component name or a meta object
 * @param vnode
 */
export function getComponentDataFromVnode(component: string | ComponentMeta, vnode: VNode): ComponentVNodeData {
	const
		vData = vnode.data || {},
		slots = (<Dictionary>vData).slots;

	const res = <ComponentVNodeData>{
		ref: vData.ref,
		refInFor: vData.refInFor,

		attrs: {},
		props: {},

		model: (<Dictionary>vData).model,
		directives: (<VNodeDirective[]>[]).concat(vData.directives || []),

		slots: {...<Dictionary>slots},
		scopedSlots: {...vData.scopedSlots},

		on: {...vData.on},
		nativeOn: {...vData.nativeOn},

		class: [].concat(vData.class || []),
		staticClass: vData.staticClass,
		style: vData.style
	};

	const
		meta = Object.isString(component) ? components.get(component) : component;

	if (!meta) {
		res.attrs = vData.attrs || res.attrs;
		return res;
	}

	const
		model = (<Dictionary>vData).model,
		componentModel = meta.params.model;

	if (model && componentModel) {
		const
			{value, callback} = <ComponentModelVNodeData>model,
			{prop, event} = componentModel;

		if (prop && event) {
			res.props[prop] = value;
			res.on[event] = callback;
		}
	}

	const
		vAttrs = vData.attrs,
		propsObj = meta.component.props;

	for (let keys = Object.keys(propsObj), i = 0; i < keys.length; i++) {
		res.props[keys[i]] = undefined;
	}

	if (vAttrs) {
		for (let keys = Object.keys(vAttrs), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				prop = key.camelize(false),
				val = vAttrs[key];

			if (propsObj[prop]) {
				res.props[prop] = val;

			} else {
				res.attrs[key] = val;
			}
		}
	}

	if (!slots && vnode.children) {
		const
			{children} = vnode;

		let
			hasSlots = false;

		for (let i = 0; i < children.length; i++) {
			const
				node = children[i],
				data = node && node.data || {},
				attrs = data.attrs;

			if (attrs && attrs.slot) {
				hasSlots = true;
				res.slots[attrs.slot] = node;
			}
		}

		if (!hasSlots) {
			res.slots.default = children;
		}
	}

	return res;
}
