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

import { components } from '/core/component/const';

import type { RenderContext, VNode, VNodeData, NormalizedScopedSlot } from '/core/component/engines';
import type { ComponentInterface, ComponentMeta } from '/core/component/interface';

import type {

	ComponentVNodeData,
	ComponentModelVNodeData,
	PatchComponentVDataOptions

} from '/core/component/vnode/interface';

export * from '/core/component/vnode/interface';

/**
 * Returns a component render context object from the specified vnode
 *
 * @param component - component name or meta object
 * @param vnode
 * @param [parent] - parent component instance
 */
export function getComponentRenderCtxFromVNode(
	component: string | ComponentMeta,
	vnode: VNode,
	parent?: ComponentInterface
): RenderContext {
	const
		data = getComponentDataFromVNode(component, vnode);

	return {
		parent: Object.cast(parent),
		children: vnode.children ?? [],
		props: data.props,
		listeners: <Record<string, CanArray<Function>>>data.on,

		slots: () => data.slots,
		scopedSlots: <Record<string, NormalizedScopedSlot>>data.scopedSlots,
		injections: undefined,

		data: {
			ref: data.ref,
			refInFor: data.refInFor,
			on: <Record<string, CanArray<Function>>>data.on,
			nativeOn: <Record<string, CanArray<Function>>>data.nativeOn,
			attrs: data.attrs,
			class: data.class,
			staticClass: data.staticClass,
			style: data.style,
			directives: data.directives
		}
	};
}

/**
 * Returns a component data object from the specified vnode
 *
 * @param component - component name or a meta object
 * @param vnode
 */
export function getComponentDataFromVNode(component: string | ComponentMeta, vnode: VNode): ComponentVNodeData {
	const
		vData = vnode.data ?? {},
		{slots, model} = (<Dictionary>vData);

	const res = <ComponentVNodeData>{
		ref: vData.ref,
		refInFor: vData.refInFor,

		attrs: {},
		props: {},

		model: (<Dictionary>vData).model,
		directives: Array.concat([], vData.directives),

		slots: {...<Dictionary>slots},
		scopedSlots: {...vData.scopedSlots},

		on: {...vData.on},
		nativeOn: {...vData.nativeOn},

		class: [].concat(vData.class ?? []),
		staticClass: vData.staticClass,
		style: vData.style
	};

	const
		meta = Object.isString(component) ? components.get(component) : component;

	if (!meta) {
		res.attrs = vData.attrs ?? res.attrs;
		return res;
	}

	const
		componentModel = meta.params.model;

	if (model != null && componentModel) {
		const
			// eslint-disable-next-line @typescript-eslint/unbound-method
			{value, callback} = <ComponentModelVNodeData>model,
			{prop, event} = componentModel;

		if (prop != null && event != null) {
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

	if (slots == null && vnode.children) {
		const
			{children} = vnode;

		let
			hasSlots = false;

		for (let i = 0; i < children.length; i++) {
			const
				node = children[i],
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				data = node?.data ?? {};

			const
				{attrs} = data;

			if (attrs?.slot != null) {
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

/**
 * Patches the specified component VNode data object by using another VNode data object
 *
 * @param data - VNode data object
 * @param anotherData - another VNode data object
 * @param [opts] - additional options
 */
export function patchComponentVData(
	data: CanUndef<VNodeData | ComponentVNodeData>,
	anotherData: CanUndef<VNodeData | ComponentVNodeData>,
	opts?: PatchComponentVDataOptions
): CanUndef<VNodeData | ComponentVNodeData> {
	if (anotherData == null || data == null) {
		return data;
	}

	data.staticClass = data.staticClass ?? '';

	if (Object.isTruly(anotherData.staticClass)) {
		data.staticClass += ` ${anotherData.staticClass}`;
	}

	if (Object.isTruly(anotherData.class)) {
		data.class = Array.concat([], data.class, anotherData.class);
	}

	if (Object.isTruly(anotherData.style)) {
		data.style = parseStyle(data.style, parseStyle(anotherData.style));
	}

	if (Object.isTruly(anotherData.attrs) && opts?.patchAttrs) {
		data.attrs = Object.assign(data.attrs ?? {}, anotherData.attrs);
	}

	data.ref = anotherData.ref;
	data.refInFor = anotherData.refInFor;

	data.directives = Array.concat([], data.directives, anotherData.directives);
	data.on = data.on ?? {};

	if (anotherData.nativeOn) {
		const
			{on} = data;

		for (let o = anotherData.nativeOn, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const key = keys[i];
			on[key] = Array.concat([], on[key], o[key]);
		}
	}

	return data;
}

/**
 * Parses the specified style value and returns a dictionary with styles
 *
 * @param style - original style
 * @param [acc] - accumulator
 *
 * @example
 * ```js
 * // {color: 'red', background: 'blue'}
 * parseStyle(['color: red', {background: 'blue'}])
 * ```
 */
export function parseStyle(
	style: CanUndef<CanArray<string | object>>,
	acc: Dictionary<string> = {}
): Dictionary<string> {
	if (!Object.isTruly(style)) {
		return acc;
	}

	if (Object.isDictionary(style)) {
		Object.assign(acc, style);
		return acc;
	}

	if (Object.isString(style)) {
		const
			styles = style.split(';');

		for (let i = 0; i < styles.length; i++) {
			const
				rule = styles[i];

			if (rule.trim().length === 0) {
				continue;
			}

			const chunks = rule.split(':');
			acc[chunks[0].trim()] = chunks[1].trim();
		}

		return acc;
	}

	if (Object.isArray(style)) {
		for (let i = 0; i < style.length; i++) {
			const
				el = style[i];

			if (Object.isDictionary(el)) {
				Object.assign(acc, el);

			} else {
				parseStyle(<CanArray<string>>el, acc);
			}
		}
	}

	return acc;
}
