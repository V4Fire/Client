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

import { derive } from 'core/functools/trait';

import iIcon from 'traits/i-icon/i-icon';
import iBlock, { component, prop, ModsDecl } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

interface bIcon extends Trait<typeof iIcon> {}

/**
 * Component to use an SVG icon from the global SVG sprite
 */
@component({
	functional: true,
	flyweight: true
})

@derive(iIcon)
class bIcon extends iBlock implements iIcon {
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
		size: [
			['auto'],
			'full'
		]
	};
}

export default bIcon;
