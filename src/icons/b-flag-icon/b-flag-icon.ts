/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iHint from 'traits/i-hint/i-hint';
import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, flyweight: true})
export default class bFlagIcon extends iBlock implements iHint {
	/**
	 * Component value
	 */
	@prop(String)
	readonly value!: string;

	/** @see iHint.setHint */
	setHint(pos: string): ReadonlyArray<string> {
		return iHint.setHint(this, pos);
	}
}
