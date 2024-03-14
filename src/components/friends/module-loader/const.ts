/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Module } from 'components/friends/module-loader/interface';

export const
	cache = new Map<unknown, Module>();

if (SSR) {
	Object.defineProperty(cache, 'set', {value: () => {
		// Do nothing
	}});
}
