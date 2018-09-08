/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, tiny: true})
export default class bIcon extends iBlock {
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
}
