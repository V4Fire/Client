/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iIcon from 'traits/i-icon/i-icon';
import iHint from 'traits/i-hint/i-hint';

import iBlock, { component, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, flyweight: true})
export default class bProgressIcon extends iBlock implements iIcon, iHint {
	/** @see iHint.setHint */
	setHint(pos: string): ReadonlyArray<string> {
		return iHint.setHint(this, pos);
	}

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
