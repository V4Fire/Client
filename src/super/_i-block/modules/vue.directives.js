'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import keyCodes from 'core/keyCodes';

const
	$C = require('collection.js'),
	Vue = require('vue');

const
	cache = new WeakMap();

function bind(node, p, vNode, oldVNode) {
	const
		m = p.modifiers || {},
		obj = vNode.context.async;

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
		obj.on(
			node,
			p.arg.replace(/,/g, ' '),
			{group, ...isObj ? p.value : undefined, ...{fn}},
			Boolean(m.capture)
		);
	}

	function fn(e) {
		if (
			p.alt && !e.altKey ||
			p.shift && !e.shiftKey ||
			p.ctrl && !e.ctrlKey ||
			p.meta && !e.metaKey ||
			p.key && keyCodes.getKeyNameFromKeyCode(e.keyCode).toLowerCase() !== p.key.split(':')[1]

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

		$C([].concat(handler)).forEach((fn) => fn && fn.apply(this, arguments));
	}
}

Vue.directive('e', {bind});
