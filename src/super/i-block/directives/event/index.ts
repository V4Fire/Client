/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/directives/event/README.md]]
 * @packageDocumentation
 */

import Component, { VNode, VNodeDirective, ComponentElement } from 'core/component';

import type iBlock from 'super/i-block/i-block';
import { cache, commaRgxp, keyValRgxp } from 'super/i-block/directives/event/const';

function bind(
	node: ComponentElement<iBlock>,
	p: VNodeDirective,
	vNode: VNode & {context?: iBlock},
	oldVNode?: VNode
): void {
	if (!vNode.context) {
		return;
	}

	if (p.arg == null || p.arg === '') {
		throw new Error('The event type is not defined');
	}

	const
		m = p.modifiers ?? {},
		obj = vNode.context.unsafe.async,
		raw = <string>(<any>p).rawName;

	const
		isObj = Object.isPlainObject(p.value),
		group = isObj && p.value.group || `v-e:${p.arg}`,
		handler = isObj ? p.value.fn : p.value,
		cacheList = oldVNode && cache.get(oldVNode);

	if (oldVNode != null && cacheList != null) {
		for (let i = 0; i < cacheList.length; i++) {
			cacheList[i].off({group});
		}
	}

	cache.set(
		vNode,
		Array.concat([], cache.get(vNode), group)
	);

	if (p.arg === 'dnd') {
		obj.dnd(node, {group, ...p.value});

	} else {
		obj.on(node, p.arg.replace(commaRgxp, ' '), fn, {group, ...isObj && p.value}, Boolean(m.capture));
	}

	const
		keys = {};

	if (m.key) {
		const
			res = keyValRgxp.exec(raw);

		if (res?.[1] != null) {
			const
				list = res[1].split(commaRgxp);

			for (let i = 0; i < list.length; i++) {
				keys[list[i].toLowerCase()] = true;
			}
		}
	}

	function fn(this: unknown, e: KeyboardEvent, ...args: unknown[]): void {
		const
			key = m.key && e.key;

		if (
			m.alt && !e.altKey ||
			m.shift && !e.shiftKey ||
			m.ctrl && !e.ctrlKey ||
			m.meta && !e.metaKey ||
			Object.isTruly(key) && keys[String(key).toLowerCase()] == null

		) {
			return;
		}

		if (m.prevent) {
			e.preventDefault();
		}

		if (m.stop) {
			e.stopPropagation();
		}

		if (m.stopImmediate) {
			e.stopImmediatePropagation();
		}

		const
			handlers = Array.concat([], handler);

		for (let i = 0; i < handlers.length; i++) {
			const
				fn = handlers[i];

			if (Object.isFunction(fn)) {
				fn.apply(this, args);
			}
		}
	}
}

Component.directive('e', {bind: <any>bind});
