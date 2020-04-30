/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModVal } from 'super/i-block/modules/mods';

export type Classes = Dictionary<
	string |
	Array<string | true> |
	true
>;

export type Styles = Dictionary<
	string |
	Array<string> |
	Dictionary<string>
>;

export type ClassesCacheNms =
	'base' |
	'components' |
	'els';

export type ClassesCacheValue =
	ReadonlyArray<string> |
	Readonly<Dictionary<string>>;

export type ProvideMods = Dictionary<ModVal | Dictionary<ModVal>>;
