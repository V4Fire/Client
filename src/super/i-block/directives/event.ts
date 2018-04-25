/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import KeyCodes from 'core/keyCodes';
import Vue, { VNode, VNodeDirective } from 'vue';
import iBlock, { VueElement } from 'super/i-block/i-block';

const
	cache = new WeakMap(),
	commaRgxp = /\s*,\s*/g,
	keyValRgxp = /\.key\.([^.]*)/;

function bind(
	node: VueElement<iBlock>,
	p: VNodeDirective,
	vNode: VNode & {context?: iBlock},
	oldVNode: VNode
): void {
	if (!vNode.context) {
		return;
	}

	if (!p.arg) {
		throw new Error('Event type is not defined');
	}

	const
		m = <VNodeDirective['modifiers']>(p.modifiers || {}),
		// @ts-ignore
		obj = vNode.context.async,
		raw = <string>(<any>p).rawName;

	const
		isObj = Object.isObject(p.value),
		group = isObj && p.value.group || `v-e:${p.arg}`,
		handler = isObj ? p.value.fn : p.value;

	if (oldVNode && cache.has(oldVNode)) {
		$C(cache.get(oldVNode)).forEach((group) => obj.off({group}));
	}

	cache.set(
		vNode,
		[].concat(cache.get(vNode) || [], group)
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

		if (res && res[1]) {
			$C(res[1].split(commaRgxp)).forEach((key) => {
				keys[key] = true;
			});
		}
	}

	function fn(e: KeyboardEvent): void {
		const
			key = m.key && KeyCodes.getKeyNameFromKeyCode(e.keyCode);

		if (
			m.alt && !e.altKey ||
			m.shift && !e.shiftKey ||
			m.ctrl && !e.ctrlKey ||
			m.meta && !e.metaKey ||
			key && !keys[key.toUpperCase()]

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

		const args = arguments;
		$C([].concat(handler) as Function[]).forEach((fn) => fn && fn.apply(this, args));
	}
}

Vue.directive('e', {bind: <any>bind});
