/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { ModsDict } from 'components/super/i-block/i-block';

import type { Mods } from 'components/friends/provide/interface';

/**
 * Returns a dictionary containing the base component modifiers.
 * These base modifiers are retrieved from the `sharedMods` getter and
 * can be combined with any additional modifiers specified.
 * {@link iBlock.sharedMods}
 *
 * @param [mods] - the additional modifiers
 *
 * @example
 * ```js
 * this.provide.sharedMods === {theme: 'foo'};
 *
 * // {theme: 'foo'}
 * console.log(this.provide.mods());
 *
 * // {theme: 'foo', size: 'x'}
 * console.log(this.provide.mods({size: 'x'}));
 * ```
 */
export function mods(this: Friend, mods?: Mods): CanNull<ModsDict> {
	const {sharedMods} = this.ctx;

	if (sharedMods == null && mods == null) {
		return null;
	}

	const resolvedMods = {...sharedMods};

	if (mods != null) {
		const modNames = Object.keys(mods);

		for (let i = 0; i < modNames.length; i++) {
			const
				modName = modNames[i],
				modVal = mods[modName];

			resolvedMods[modName.dasherize()] = modVal != null ? String(modVal) : undefined;
		}
	}

	return resolvedMods;
}
