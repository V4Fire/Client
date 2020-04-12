/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/flyweight/README.md]]
 * @packageDocumentation
 */

import { defProp } from 'core/const/props';
import { components, NULL } from 'core/component/const';

import { initProps } from 'core/component/prop';
import { initFields } from 'core/component/field';

import { getNormalParent } from 'core/component/traverse';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta } from 'core/component/method';
import { implementEventAPI } from 'core/component/event';

import { supports, CreateElement, VNode } from 'core/component/engines';
import { getComponentDataFromVNode } from 'core/component/vnode';
import { execRenderObject } from 'core/component/render';

import { ComponentInterface } from 'core/component/interface';
import { FlyweightVNode } from 'core/component/flyweight/interface';

export * from 'core/component/flyweight/interface';

/**
 * Takes a vnode and, if it has the composite attribute, returns a new vnode that contains a flyweight component,
 * otherwise returns the original vnode
 *
 * @param vnode
 * @param createElement - function to create VNode element
 * @param parentComponent - parent component instance
 */
export function parseVNode(
	vnode: VNode,
	createElement: CreateElement,
	parentComponent: ComponentInterface
): VNode | FlyweightVNode {
	const
		compositeAttr = vnode?.data?.attrs?.['v4-composite'];

	if (!supports.composite || !compositeAttr) {
		return vnode;
	}

	vnode.tag = 'span';

	const
		meta = components.get(compositeAttr);

	if (!meta) {
		return vnode;
	}

	const
		componentData = getComponentDataFromVNode(compositeAttr, vnode),
		componentProto = meta.constructor.prototype,
		componentTpl = TPLS[compositeAttr] || componentProto.render;

	// To create a flyweight component we need to create a "fake" context for a component.
	// The context is based on the specified parent context by using Object.create.
	// Also, we need to shim some component hooks.

	const fakeCtx = Object.assign(Object.create(parentComponent), {
		meta,
		hook: 'beforeDataCreate',
		instance: meta.instance,
		componentName: meta.componentName,
		$isFlyweight: true
	});

	fakeCtx.$createElement = createElement.bind(fakeCtx);

	attachMethodsFromMeta(fakeCtx);
	implementEventAPI(fakeCtx);
	attachAccessorsFromMeta(fakeCtx, true);

	Object.defineProperty(fakeCtx, '$refs', {
		configurable: true,
		enumerable: true,
		value: {}
	});

	Object.defineProperty(fakeCtx, '$props', {
		configurable: true,
		enumerable: true,
		value: {}
	});

	Object.defineProperty(fakeCtx, '$attrs', {
		configurable: true,
		enumerable: true,
		value: componentData.attrs
	});

	Object.defineProperty(fakeCtx, '$data', {
		configurable: true,
		enumerable: true,
		value: {}
	});

	Object.defineProperty(fakeCtx, '$fields', {
		configurable: true,
		enumerable: true,
		writable: true,
		value: fakeCtx.$data
	});

	Object.defineProperty(fakeCtx, '$slots', {
		configurable: true,
		enumerable: true,
		value: componentData.slots
	});

	Object.defineProperty(fakeCtx, '$scopedSlots', {
		configurable: true,
		enumerable: true,
		value: componentData.scopedSlots
	});

	Object.defineProperty(fakeCtx, '$parent', {value: parentComponent});
	Object.defineProperty(fakeCtx, '$normalParent', {value: getNormalParent(fakeCtx)});
	Object.defineProperty(fakeCtx, '$children', {value: vnode.children});

	// Shim component input properties
	for (let o = componentData.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			value = o[key];

		Object.defineProperty(fakeCtx, key, value !== undefined ? {
			configurable: true,
			enumerable: true,
			writable: true,
			value
		} : defProp);

		fakeCtx.$props[key] = value;
	}

	const defField = {
		...defProp,
		value: NULL
	};

	const
		{systemFields, fields} = meta;

	// Shim component fields and system fields
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

	// Initialize values
	initProps(fakeCtx, {store: fakeCtx, saveToStore: true});
	initFields(systemFields, fakeCtx, fakeCtx);
	initFields(fields, fakeCtx, fakeCtx);

	fakeCtx.$fields = fakeCtx;
	fakeCtx.$systemFields = fakeCtx;
	fakeCtx.hook = 'created';

	const newVNode = <FlyweightVNode>execRenderObject(componentTpl.index(), fakeCtx);
	newVNode.fakeContext = fakeCtx;

	const
		newVData = newVNode.data = newVNode.data || {};

	// Attach component event listeners
	for (let o = componentData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		fakeCtx.$on(key, o[key]);
	}

	newVData.ref = componentData.ref;
	newVData.refInFor = componentData.refInFor;

	// Attach component native event listeners

	const
		on = newVData.on = newVData.on || {};

	if (componentData.nativeOn) {
		for (let o = componentData.nativeOn, keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const key = keys[i];
			on[key] = (<Function[]>[]).concat(on[key] || [], o[key] || []);
		}
	}

	newVData.staticClass = (<string[]>[]).concat(newVData.staticClass || [], componentData.staticClass).join(' ');
	newVData.class = (<string[]>[]).concat(newVData.class || [], componentData.class);
	newVData.directives = componentData.directives;

	return newVNode;
}
