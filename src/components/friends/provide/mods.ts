/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/provide/README.md]]
 * @packageDocumentation
 */

import type Friend from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { ModsDict } from 'components/super/i-block/i-block';

import { modsCache } from 'components/friends/provide/const';
import type { Mods } from 'components/friends/provide/interface';

/**
 * Returns a dictionary with the base component modifiers.
 * The base modifiers are taken from the `sharedMods` getter and can be mix in with the specified additional modifiers.
 * {@link iBlock.sharedMods}
 *
 * @param [mods] - additional modifiers to returns
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
export function mods(this: Friend, mods?: Mods): CanUndef<Readonly<ModsDict>> {
	const
		{sharedMods} = this.ctx;

	if (!sharedMods && !mods) {
		return;
	}

	const
		key = JSON.stringify(sharedMods) + JSON.stringify(mods),
		cacheVal = modsCache[key];

	if (cacheVal != null) {
		return cacheVal;
	}

	const
		res = {...sharedMods};

	if (mods) {
		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			res[key.dasherize()] = val != null ? String(val) : undefined;
		}
	}

	modsCache[key] = Object.freeze(res);
	return res;
}
