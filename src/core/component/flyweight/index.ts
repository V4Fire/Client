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

import { deprecate } from '~/core/functools/deprecation';
import Async from '~/core/async';

import { components } from '~/core/component/const';
import type { CreateElement, VNode } from '~/core/component/engines';

import { forkMeta } from '~/core/component/meta';
import { initProps } from '~/core/component/prop';
import { initFields } from '~/core/component/field';
import { destroyComponent, FlyweightVNode } from '~/core/component/functional';

import { attachMethodsFromMeta } from '~/core/component/method';
import { implementEventAPI } from '~/core/component/event';
import { attachAccessorsFromMeta } from '~/core/component/accessor';

import { getNormalParent } from '~/core/component/traverse';
import { getComponentDataFromVNode } from '~/core/component/vnode';
import { execRenderObject } from '~/core/component/render';

import type { ComponentInterface } from '~/core/component/interface';

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
		renderEngine = parentComponent.$renderEngine,
		compositeAttr = vnode.data?.attrs?.['v4-flyweight-component'];

	if (!renderEngine.supports.composite || compositeAttr == null) {
		return vnode;
	}

	vnode.tag = 'span';

	let
		meta = components.get(compositeAttr);

	if (!meta) {
		return vnode;
	}

	meta = forkMeta(meta);
	delete vnode.data!.attrs!['v4-flyweight-component'];

	if (parentComponent.isFlyweight) {
		parentComponent = parentComponent.$normalParent!;
	}

	const
		componentData = getComponentDataFromVNode(compositeAttr, vnode),
		componentProto = meta.constructor.prototype,
		componentTpl = TPLS[compositeAttr] ?? componentProto.render;

	// To create a flyweight component we need to create the "fake" context.
	// The context is based on the specified parent context by using `Object.create`.
	// Also, we need to shim some component hooks.

	const
		fakeCtx = Object.create(parentComponent);

	fakeCtx.isFlyweight = true;
	fakeCtx.hook = 'beforeDataCreate';

	fakeCtx.meta = meta;
	fakeCtx.componentName = meta.componentName;
	fakeCtx.instance = meta.instance;

	fakeCtx.unsafe = fakeCtx;
	fakeCtx.$async = new Async(fakeCtx);
	fakeCtx.$renderEngine = renderEngine;

	fakeCtx.$createElement = createElement.bind(fakeCtx);
	fakeCtx.$destroy = () => destroyComponent(fakeCtx);

	fakeCtx._self = fakeCtx;
	fakeCtx._renderProxy = fakeCtx;
	fakeCtx._c = fakeCtx.$createElement;
	fakeCtx._staticTrees = [];

	Object.defineProperty(fakeCtx, '$el', {
		configurable: true,
		enumerable: true,
		value: undefined
	});

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

	Object.defineProperty(fakeCtx, '$systemFields', {
		configurable: true,
		enumerable: true,
		writable: true,
		value: fakeCtx
	});

	Object.defineProperty(fakeCtx, '$data', {
		configurable: true,
		enumerable: true,
		get(): typeof fakeCtx {
			deprecate({name: '$$data', type: 'property', renamedTo: '$fields'});
			return fakeCtx;
		}
	});

	Object.defineProperty(fakeCtx, '$fields', {
		configurable: true,
		enumerable: true,
		writable: true,
		value: fakeCtx
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

	initProps(fakeCtx, {
		from: componentData.props,
		store: fakeCtx,
		saveToStore: true
	});

	attachMethodsFromMeta(fakeCtx);
	implementEventAPI(fakeCtx);
	attachAccessorsFromMeta(fakeCtx);

	initFields(meta.systemFields, fakeCtx, fakeCtx);
	initFields(meta.fields, fakeCtx, fakeCtx);

	fakeCtx.onCreatedHook();

	const newVNode = <FlyweightVNode>execRenderObject(
		componentTpl.index(),
		fakeCtx
	);

	newVNode.fakeInstance = fakeCtx;
	newVNode.data = newVNode.data ?? {};

	renderEngine.patchVNode(newVNode, fakeCtx, {
		// @ts-ignore (unsafe cast)
		data: componentData
	});

	// Attach component event listeners
	for (let o = componentData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const key = keys[i];
		fakeCtx.$on(key, o[key]);
	}

	return newVNode;
}
