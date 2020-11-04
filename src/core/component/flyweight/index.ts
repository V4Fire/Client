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
import { deprecate } from 'core/functools/deprecation';
import { components, NULL } from 'core/component/const';

import { initProps } from 'core/component/prop';
import { initFields } from 'core/component/field';

import { getNormalParent } from 'core/component/traverse';
import { attachAccessorsFromMeta } from 'core/component/accessor';
import { attachMethodsFromMeta } from 'core/component/method';
import { implementEventAPI } from 'core/component/event';

import { supports, CreateElement, VNode } from 'core/component/engines';
import { getComponentDataFromVNode, patchComponentVData } from 'core/component/vnode';
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
export function parseVNodeAsFlyweight(
	vnode: VNode,
	createElement: CreateElement,
	parentComponent: ComponentInterface
): VNode | FlyweightVNode {
	const
		compositeAttr = vnode.data?.attrs?.['v4-flyweight-component'];

	if (!supports.composite || compositeAttr == null) {
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
		componentTpl = TPLS[compositeAttr] ?? componentProto.render;

	// To create a flyweight component we need to create a "fake" context for a component.
	// The context is based on the specified parent context by using Object.create.
	// Also, we need to shim some component hooks.

	const fakeCtx = Object.assign(Object.create(parentComponent), {
		meta,
		hook: 'beforeDataCreate',
		instance: meta.instance,
		componentName: meta.componentName,
		isFlyweight: true
	});

	fakeCtx.unsafe = fakeCtx;

	fakeCtx._self = fakeCtx;
	fakeCtx._renderProxy = fakeCtx;

	fakeCtx.$createElement = createElement.bind(fakeCtx);
	fakeCtx._c = fakeCtx.$createElement;
	fakeCtx._staticTrees = [];

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

	Object.defineProperty(fakeCtx, '$parent', {
		configurable: true,
		enumerable: true,
		value: parentComponent
	});

	Object.defineProperty(fakeCtx, '$normalParent', {
		configurable: true,
		enumerable: true,
		value: getNormalParent(fakeCtx)
	});

	Object.defineProperty(fakeCtx, '$children', {
		configurable: true,
		enumerable: true,
		value: vnode.children
	});

	// Shim component input properties
	for (let o = componentData.props, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			value = o[key];

		Object.defineProperty(
			fakeCtx,
			key,
			value !== undefined ?
				{
					configurable: true,
					enumerable: true,
					writable: true,
					value
				} :

				defProp
		);

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

			if (
				val && (
					val.replace !== true && (Object.isTruly(val.unique) || val.src === meta.componentName) ||
					val.replace === false
				)
			) {
				Object.defineProperty(fakeCtx, key, defField);
			}
		}
	}

	// Initialize values
	initProps(fakeCtx, {store: fakeCtx, saveToStore: true});
	initFields(systemFields, fakeCtx, fakeCtx);
	initFields(fields, fakeCtx, fakeCtx);

	fakeCtx.$fields = fakeCtx;

	Object.defineProperty(fakeCtx, '$$data', {
		get(): typeof fakeCtx {
			deprecate({name: '$$data', type: 'property', renamedTo: '$fields'});
			return fakeCtx;
		}
	});

	fakeCtx.$systemFields = fakeCtx;
	fakeCtx.hook = 'created';

	const newVNode = <FlyweightVNode>execRenderObject(componentTpl.index(), fakeCtx);

	newVNode.fakeInstance = fakeCtx;
	newVNode.data = newVNode.data ?? {};

	patchComponentVData(newVNode.data, componentData);

	// Attach component event listeners
	for (let o = componentData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		fakeCtx.$on(key, o[key]);
	}

	return newVNode;
}
