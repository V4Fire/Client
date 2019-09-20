/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModsDecl } from 'super/i-block/i-block';

export type Size =
	'xxs' |
	'xs' |
	's' |
	'm' |
	'l' |
	'xl' |
	'xxl';

export type SizeDictionary = Dictionary<
	Size
>;

export default abstract class iSize {
	/**
	 * Size modifiers
	 */
	static readonly mods: ModsDecl = {
		size: [
			's',
			['m'],
			'l'
		]
	};
}
