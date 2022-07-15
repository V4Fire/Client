/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModVal } from 'super/i-block/i-block';

export type Classes = Dictionary<
	string |
	Array<string | boolean> |
	true
>;

export type Mods = Dictionary<
	ModVal |
	Dictionary<ModVal>
>;
