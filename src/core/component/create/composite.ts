/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp, defReadonlyProp } from 'core/const/props';
import { supports, VNode, VNodeDirective, NormalizedScopedSlot } from 'core/component/engines';
import { ComponentInterface } from 'core/component/interface';
import { components } from 'core/component/const';

import {

	NULL,
	initDataObject,
	initPropsObject,
	addEventAPI,
	addMethodsFromMeta,
	getNormalParent

} from 'core/component/create/helpers';

interface ComponentOpts {
	ref?: string;
	refInFor?: boolean;

	attrs: Dictionary;
	props: Dictionary;
	directives: VNodeDirective[];

	slots: Dictionary<CanArray<VNode>>;
	scopedSlots: Dictionary<NormalizedScopedSlot>;

	on: Dictionary<CanArray<Function>>;
	nativeOn: Dictionary<Function>;

	class: string[];
	staticClass: string;
	style: CanArray<string | Dictionary>;
}

interface ComponentModel {
	value: unknown;
	expression: string;
	callback(value: unknown): unknown;
}

const defField = {
	...defProp,
	value: NULL
};

/**
 * Returns a component virtual data object from the specified vnode
 *
 * @param component - component name
 * @param vnode
 */
export function getComponentDataFromVnode(component: string, vnode: VNode): ComponentOpts {
	const
		vData = vnode.data || {},
		slots = (<Dictionary>vData).slots;

	const res = <ComponentOpts>{
		ref: vData.ref,
		refInFor: vData.refInFor,

		attrs: {},
		props: {},

		model: (<Dictionary>vData).model,
		directives: (<VNodeDirective[]>[]).concat(vData.directives || []),

		slots: {...slots},
		scopedSlots: {...vData.scopedSlots},

		on: {...vData.on},
		nativeOn: {...vData.nativeOn},

		class: [].concat(vData.class || []),
		staticClass: vData.staticClass,
		style: vData.style
	};

	const
		meta = components.get(component);

	if (!meta) {
		res.attrs = vData.attrs || res.attrs;
		return res;
	}

	const
		model = (<Dictionary>vData).model,
		componentModel = meta.params.model;

	if (model && componentModel) {
		const
			{value, callback} = <ComponentModel>model,
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

/**
 * Builds a composite virtual tree
 *
 * @param vnode
 * @param ctx - component context
 */
export function createCompositeElement(vnode: VNode, ctx: ComponentInterface): VNode {
	const
		composite = vnode.data && vnode.data.attrs && vnode.data.attrs['v4-composite'];

	if (!supports.composite || !composite) {
		return vnode;
	}

	const
		meta = components.get(composite);

	if (!meta) {
		return vnode;
	}

	const
		vData = getComponentDataFromVnode(composite, vnode),
		proto = meta.constructor.prototype,
		tpl = TPLS[composite] || proto.render;

	const fakeCtx = Object.assign(Object.create(ctx), {
		meta,
		hook: 'beforeDataCreate',
		instance: meta.instance,
		componentName: meta.componentName,
		$isFlyweight: true
	});

	Object.defineProperty(fakeCtx, 'componentStatusStore', {
		...defProp,
		value: 'unloaded'
	});

	addEventAPI(fakeCtx);

	Object.defineProperty(fakeCtx, '$refs', {...defReadonlyProp, value: {}});
	Object.defineProperty(fakeCtx, '$props', {...defReadonlyProp, value: {}});
	Object.defineProperty(fakeCtx, '$attrs', {...defReadonlyProp, value: vData.attrs});

	Object.defineProperty(fakeCtx, '$data', {...defReadonlyProp, value: {}});
	Object.defineProperty(fakeCtx, '$$data', {...defProp, value: fakeCtx.$data});

	Object.defineProperty(fakeCtx, '$slots', {...defReadonlyProp, value: vData.slots});
	Object.defineProperty(fakeCtx, '$scopedSlots', {...defReadonlyProp, value: vData.scopedSlots});

	Object.defineProperty(fakeCtx, '$parent', {value: ctx});
	Object.defineProperty(fakeCtx, '$normalParent', {value: getNormalParent(fakeCtx)});
	Object.defineProperty(fakeCtx, '$children', {value: vnode.children});

	for (let o = vData.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			value = o[key];

		Object.defineProperty(fakeCtx, key, value !== undefined ? {...defProp, value} : defProp);
		fakeCtx.$props[key] = value;
	}

	const
		{systemFields, fields} = meta;

	for (let list = [systemFields, fields], i = 0; i < list.length; i++) {
		const
			fields = list[i];

		for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = fields[key];

			if (val && (val.replace !== true && (val.unique || val.src === meta.componentName) || val.replace === false)) {
				Object.defineProperty(fakeCtx, key, defField);
			}
		}
	}

	addMethodsFromMeta(meta, fakeCtx, true);
	initPropsObject(meta.component.props, fakeCtx, meta.instance, fakeCtx, true);
	initDataObject(systemFields, fakeCtx, meta.instance, fakeCtx);
	initDataObject(fields, fakeCtx, meta.instance, fakeCtx);

	fakeCtx.$$data = fakeCtx;
	fakeCtx.hook = 'created';
	fakeCtx.componentStatus = 'ready';

	const
		newVNode = fakeCtx.vdom.execRenderObject(tpl.index(), [fakeCtx]),
		newVData = newVNode.data = newVNode.data || {};

	for (let o = vData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		fakeCtx.on(key, o[key]);
	}

	newVData.ref = vData.ref;
	newVData.refInFor = vData.refInFor;

	newVData.on = vData.nativeOn;
	newVData.staticClass = (<string[]>[]).concat(newVData.staticClass || [], vData.staticClass).join(' ');
	newVData.class = (<string[]>[]).concat(newVData.class || [], vData.class);

	newVData.directives = vData.directives;
	newVNode.fakeContext = fakeCtx;

	return newVNode;
}
