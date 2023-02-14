/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Cache } from 'super/i-block/i-block';
import type { Item } from 'form/b-select/b-select';

const
	t = i18n('b-select-date');

export const months = [
	t`January`,
	t`February`,
	t`March`,
	t`April`,
	t`May`,
	t`June`,
	t`July`,
	t`August`,
	t`September`,
	t`October`,
	t`November`,
	t`December`
];

export const selectCache = new Cache<'months' | 'days' | 'years', readonly Item[]>([
	'months',
	'days',
	'years'
]);
