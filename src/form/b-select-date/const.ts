/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Cache } from 'super/i-block/i-block';
import type { Item } from 'form/b-select/b-select';

const i18nMonth = i18n('b-select-date');

export const months = [
	i18nMonth`January`,
	i18nMonth`February`,
	i18nMonth`March`,
	i18nMonth`April`,
	i18nMonth`May`,
	i18nMonth`June`,
	i18nMonth`July`,
	i18nMonth`August`,
	i18nMonth`September`,
	i18nMonth`October`,
	i18nMonth`November`,
	i18nMonth`December`
];

export const selectCache = new Cache<'months' | 'days' | 'years', readonly Item[]>([
	'months',
	'days',
	'years'
]);
