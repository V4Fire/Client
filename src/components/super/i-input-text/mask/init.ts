/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Mask from 'components/super/i-input-text/mask/class';

import { compile } from 'components/super/i-input-text/mask/compile';
import { syncWithText } from 'components/super/i-input-text/mask/sync';

/**
 * Initializes the component mask
 */
export function init(this: Mask): void {
	const {
		ctx,
		ctx: {
			async: $a,
			$refs: {input}
		}
	} = this;

	const group = {
		group: 'mask'
	};

	$a.off(group);

	if (ctx.mask == null) {
		this.compiledMask = null;
		return;
	}

	const
		h = (key: keyof typeof this) => (<Function>this[key]).bind(this);

	$a.on(input, 'mousedown keydown', h('onNavigate'), group);
	$a.on(input, 'mousedown keydown', h('saveSnapshot'), group);
	$a.on(input, 'mouseup keyup', h('saveSnapshot'), {
		options: {
			capture: true
		},

		...group
	});

	$a.on(input, 'keydown', h('onDelete'), group);
	$a.on(input, 'keydown', h('onKeyPress'), group);

	$a.on(input, 'input', h('syncFieldWithInput'), group);
	$a.on(input, 'blur', h('syncInputWithField'), group);

	compile.call(this);

	if (ctx.text !== '' || ctx.isFocused) {
		syncWithText.call(this, ctx.text);
	}
}
