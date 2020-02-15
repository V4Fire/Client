/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PARENT } from 'core/component/const';

export type ModVal = string | boolean | number;
export type StrictModDeclVal = CanArray<ModVal>;
export type ModDeclVal = StrictModDeclVal | typeof PARENT;

export interface ModsDecl {
	[name: string]: Nullable<Array<ModDeclVal>>;
}
