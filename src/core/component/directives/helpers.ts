/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getComponentContext } from 'core/component/context';

import type { DirectiveBinding, VNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

import { isPropGetter } from 'core/component/reflect';
import { setVNodePatchFlags } from 'core/component/render';

import { vOnKeyModifiers, vOnModifiers } from 'core/component/directives/const';

/**
 * Returns the unique directive identifier for the passed element
 *
 * @param el - the element to which the directive applies
 * @param idsCache - the store for the registered elements
 */
export function getElementId(el: Element, idsCache: WeakMap<Element, string>): string {
	let
		id = idsCache.get(el);

	if (id == null) {
		id = Object.fastHash(Math.random());
		idsCache.set(el, id);
	}

	return id;
}

/**
 * Returns the context of the component within which the directive is being used
 *
 * @param binding - the directive binding
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveContext(
	binding: Nullable<DirectiveBinding>,
	vnode: Nullable<VNode>
): CanNull<ComponentInterface['unsafe']> {
	return Object.cast(binding?.virtualContext ?? vnode?.virtualContext ?? binding?.instance ?? null);
}

/**
 * Returns the context of the component to which the directive is applied.
 * If the directive is applied to a regular node instead of a component, `null` will be returned.
 *
 * @param vnode - the VNode to which the directive is applied
 */
export function getDirectiveComponent(vnode: Nullable<VNode>): CanNull<ComponentInterface['unsafe']> {
	if (vnode == null) {
		return null;
	}

	if (vnode.el?.component != null) {
		return vnode.el.component;
	}

	if (vnode.virtualComponent != null) {
		return Object.cast(vnode.virtualComponent);
	}

	const component = vnode.component?.['ctx'];

	if (component != null) {
		return getComponentContext(component, true).unsafe;
	}

	return null;
}

/**
 * Patches a vnode listener with support for Vue modifiers
 *
 * @param ctx
 * @param vnode
 * @param props
 * @param attrName
 * @param attrVal
 */
export function patchVnodeEventListener(
	ctx: CanNull<ComponentInterface['unsafe']>,
	vnode: VNode,
	props: Dictionary,
	attrName: string,
	attrVal: unknown
): void {
	const render = ctx?.$renderEngine.r;
	let event = attrName.slice(1).camelize(false);

	const
		eventChunks = event.split('.'),
		flags = Object.createDict<boolean>();

	// The first element is the event name; we need to slice only the part containing the event modifiers
	eventChunks.slice(1).forEach((chunk) => flags[chunk] = true);
	event = eventChunks[0];

	if (flags.right && !event.startsWith('key')) {
		event = 'onContextmenu';
		delete flags.right;

	} else if (flags.middle && event !== 'mousedown') {
		event = 'onMouseup';

	} else {
		event = `on${event.capitalize()}`;
	}

	if (flags.capture) {
		event += 'Capture';
		delete flags.capture;
	}

	if (flags.once) {
		event += 'Once';
		delete flags.once;
	}

	if (flags.passive) {
		event += 'Passive';
		delete flags.passive;
	}

	if (Object.keys(flags).length > 0) {
		const
			registeredModifiers = Object.keys(Object.select(flags, vOnModifiers)),
			registeredKeyModifiers = Object.keys(Object.select(flags, vOnKeyModifiers));

		if (registeredModifiers.length > 0) {
			attrVal = render?.withModifiers.call(ctx, Object.cast(attrVal), registeredModifiers);
		}

		if (registeredKeyModifiers.length > 0) {
			attrVal = render?.withKeys.call(ctx, Object.cast(attrVal), registeredKeyModifiers);
		}
	}

	// For the transmission of accessors, `forceUpdate: false` props use events.
	// For example, `@:value = createPropAccessors(() => someValue)`.
	// A distinctive feature of such events is the prefix `@:` or `on:`.
	// Such events are processed in a special way.
	const isSystemGetter = isPropGetter.test(event);
	props[event] = attrVal;

	if (!isSystemGetter) {
		setVNodePatchFlags(vnode, 'events');

		const dynamicProps = vnode.dynamicProps ?? [];
		vnode.dynamicProps = dynamicProps;
		dynamicProps.push(event);
	}
}
