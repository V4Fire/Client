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

import { deprecate } from 'core/functools/deprecation';

import { defProp } from 'core/const/props';
import { components } from 'core/component/const';
import { supports, CreateElement, VNode } from 'core/component/engines';

import * as init from 'core/component/construct';

import { initProps } from 'core/component/prop';
import { initFields } from 'core/component/field';
import { destroyComponent, FlyweightVNode } from 'core/component/functional';

import { attachMethodsFromMeta } from 'core/component/method';
import { implementEventAPI } from 'core/component/event';
import { attachAccessorsFromMeta } from 'core/component/accessor';

import { getNormalParent } from 'core/component/traverse';
import { getComponentDataFromVNode, patchComponentVData } from 'core/component/vnode';
import { execRenderObject } from 'core/component/render';

import { ComponentInterface } from 'core/component/interface';

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

	delete vnode.data!.attrs!['v4-flyweight-component'];

	if (parentComponent.isFlyweight) {
		parentComponent = parentComponent.$normalParent!;
	}

	const
		componentData = getComponentDataFromVNode(compositeAttr, vnode),
		componentProto = meta.constructor.prototype,
		componentTpl = TPLS[compositeAttr] ?? componentProto.render;

	// To create a flyweight component we need to create the "fake" context for a component.
	// The context is based on the specified parent context by using `Object.create`.
	// Also, we need to shim some component hooks.

	const fakeCtx = Object.assign(Object.create(parentComponent), {
		isFlyweight: true,

		componentName: meta.componentName,
		meta,

		hook: 'beforeDataCreate',
		instance: meta.instance,

		$destroy(): void {
			destroyComponent(this);
		}
	});

	fakeCtx.unsafe = fakeCtx;
	fakeCtx.$createElement = createElement.bind(fakeCtx);

	fakeCtx._self = fakeCtx;
	fakeCtx._renderProxy = fakeCtx;
	fakeCtx._c = fakeCtx.$createElement;
	fakeCtx._staticTrees = [];

	Object.defineProperty(fakeCtx, '$refs', {
		configurable: true,
		enumerable: true,
		value: {}
	});

	Object.defineProperty(fakeCtx, '$refHandlers', {
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

	initProps(fakeCtx, {
		store: fakeCtx,
		saveToStore: true
	});

	attachMethodsFromMeta(fakeCtx);
	implementEventAPI(fakeCtx);
	attachAccessorsFromMeta(fakeCtx, true);

	initFields(meta.systemFields, fakeCtx, fakeCtx);
	fakeCtx.$systemFields = fakeCtx;

	initFields(meta.fields, fakeCtx, fakeCtx);
	fakeCtx.$fields = fakeCtx;

	Object.defineProperty(fakeCtx, '$$data', {
		get(): typeof fakeCtx {
			deprecate({name: '$$data', type: 'property', renamedTo: '$fields'});
			return fakeCtx;
		}
	});

	init.createdState(fakeCtx);

	const newVNode = <FlyweightVNode>execRenderObject(
		componentTpl.index(),
		fakeCtx
	);

	newVNode.fakeInstance = fakeCtx;
	newVNode.data = newVNode.data ?? {};

	patchComponentVData(newVNode.data, componentData, {
		patchAttrs: Boolean(meta.params.inheritAttrs)
	});

	// Attach component event listeners
	for (let o = componentData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		fakeCtx.$on(key, o[key]);
	}

	return newVNode;
}
