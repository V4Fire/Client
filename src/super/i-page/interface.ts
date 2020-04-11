/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iPage from 'super/i-page/i-page';

export type TitleValue<CTX extends iPage = iPage['unsafe']> =
	string |
	((ctx: CTX) => string);

export interface StageTitles<CTX extends iPage = iPage['unsafe']> extends Dictionary<TitleValue<CTX>> {
	'[[DEFAULT]]': TitleValue<CTX>;
}

export interface ScrollOptions {
	x?: number;
	y?: number;
	behavior?: ScrollBehavior;
}
