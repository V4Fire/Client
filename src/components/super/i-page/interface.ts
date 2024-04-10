/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iPage from 'components/super/i-page/i-page';

export type TitleValue<CTX extends iPage = iPage['unsafe']> =
	string |
	((ctx: CTX) => string);

export type DescriptionValue<CTX extends iPage = iPage['unsafe']> = TitleValue<CTX>;

export type TitleValueProp<CTX extends iPage = iPage['unsafe']> = TitleValue<CTX> | (() => TitleValue<CTX>);
export type DescriptionValueProp <CTX extends iPage = iPage['unsafe']> = TitleValueProp<CTX>;

export interface StageTitles<CTX extends iPage = iPage['unsafe']> extends Dictionary<TitleValue<CTX>> {
	'[[DEFAULT]]': TitleValue<CTX>;
}

export interface ScrollOptions {
	x?: number;
	y?: number;
	behavior?: ScrollBehavior;
}
