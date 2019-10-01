/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iIcon from 'traits/i-icon/i-icon';
import iSize from 'traits/i-size/i-size';

import iBlock, { component, prop, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, flyweight: true})
export default class bIcon extends iBlock implements iIcon, iSize {
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

	/** @override */
	static readonly mods: ModsDecl = {
		...iSize.mods,

		size: [
			['auto'],
			'full'
		]
	};

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}
}
