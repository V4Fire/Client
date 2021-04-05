/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInputText from 'super/i-input-text/i-input-text';

/**
 * Initializes the component mask
 * @param component
 */
export function init<C extends iInputText>(component: C): CanPromise<void> {
	const {
		unsafe,
		unsafe: {async: $a, $refs: {input}}
	} = component;

	const group = {
		group: 'mask'
	};

	$a.off(group);

	if (unsafe.mask == null) {
		unsafe.compiledMask = undefined;
		return;
	}

	const
		h = (key) => (<Function>unsafe[key]).bind(unsafe);

	$a.on(input, 'mousedown keydown', h('onMaskNavigate'), group);
	$a.on(input, 'mousedown keydown', h('onMaskValueReady'), group);
	$a.on(input, 'mouseup keyup', h('onMaskValueReady'), {
		options: {
			capture: true
		},

		...group
	});

	$a.on(input, 'keydown', h('onMaskDelete'), group);
	$a.on(input, 'keydown', h('onMaskKeyPress'), group);

	$a.on(input, 'input', h('onMaskInput'), group);
	$a.on(input, 'blur', h('onMaskBlur'), group);

	unsafe.compileMask();
	return unsafe.syncMaskWithText();
}
