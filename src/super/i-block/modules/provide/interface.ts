/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModVal } from '~/super/i-block/modules/mods';

export type Classes = Dictionary<
	string |
	Array<string | boolean> |
	true
>;

export type Styles = Dictionary<
	CanArray<string> |
	Dictionary<string>
>;

export type ClassesCacheNms =
	'base' |
	'components' |
	'els';

export type ClassesCacheValue =
	readonly string[] |
	Readonly<Dictionary<string>>;

export type ProvideMods = Dictionary<ModVal | Dictionary<ModVal>>;
