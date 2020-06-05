/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:icons/b-icon/README.md]]
 * @packageDocumentation
 */

import iSize from 'traits/i-size/i-size';

import iBlock, { component, prop, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

/**
 * Component to use an SVG icon from the global SVG sprite
 */
@component({functional: true, flyweight: true})
export default class bIcon extends iBlock implements iSize {
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
}
