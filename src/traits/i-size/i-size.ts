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

export interface SizeTo {
	gt: Dictionary<Size>;
	lt: Dictionary<Size>;
}

const sizeTo = <SizeTo>{
	gt: {
		xxl: 'xxl',
		xl: 'xxl',
		l: 'xl',
		m: 'l',
		undefined: 'l',
		s: 'm',
		xs: 's',
		xxs: 'xs'
	},

	lt: {
		xxl: 'xl',
		xl: 'l',
		l: 'm',
		m: 's',
		undefined: 's',
		s: 'xs',
		xs: 'xxs',
		xxs: 'xxs'
	}
};

export default abstract class iSize {
	/**
	 * Link to sizeTo.gt
	 */
	static get gt(): SizeDictionary {
		return sizeTo.gt;
	}

	/**
	 * Link to sizeTo.lt
	 */
	static get lt(): SizeDictionary {
		return sizeTo.lt;
	}

	/**
	 * Alias for sizeTo.gt
	 */
	abstract gt: SizeDictionary;

	/**
	 * Alias for sizeTo.lt
	 */
	abstract lt: SizeDictionary;

	/**
	 * Size modifiers
	 */
	static readonly mods: ModsDecl = {
		size: [
			'xxs',
			'xs',
			's',
			['m'],
			'xl',
			'xxl'
		]
	};
}
