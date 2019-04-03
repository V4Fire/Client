/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iIcon from 'traits/i-icon/i-icon';
import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, flyweight: true})
export default class bIcon extends iBlock implements iIcon {
	/**
	 * Component value
	 */
	@prop({type: String, required: false})
	readonly value?: string;

	/**
	 * Icon prefix
	 */
	@prop(String)
	readonly prfx: string = '';

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position
	 */
	@prop(String)
	readonly hintPos: string = 'bottom';

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
