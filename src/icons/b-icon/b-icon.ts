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

import iIcon from 'traits/i-icon/i-icon';
import iSize from 'traits/i-size/i-size';
import iBlock, { component, prop, ModsDecl } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

/**
 * Component to use an SVG icon from the global SVG sprite
 */
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

	/** @override */
	static readonly mods: ModsDecl = {
		...iSize.mods,

		size: [
			['auto'],
			'full'
		]
	};

	/** @see [[iIcon.getIconLink]] */
	getIconLink(iconId: string): Promise<string> {
		return iIcon.getIconLink(iconId);
	}

	/** @see [[iIcon.updateIconHref]] */
	updateIconHref(el: SVGUseElement, href: string): void {
		iIcon.updateIconHref(el, href);
	}
}
