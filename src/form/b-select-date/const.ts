/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Cache } from 'super/i-block/i-block';
import type { Item } from 'form/b-select/b-select';

export const months = [
	t('b-select-date')('January'),
	t('b-select-date')('February'),
	t('b-select-date')('March'),
	t('b-select-date')('April'),
	t('b-select-date')('May'),
	t('b-select-date')('June'),
	t('b-select-date')('July'),
	t('b-select-date')('August'),
	t('b-select-date')('September'),
	t('b-select-date')('October'),
	t('b-select-date')('November'),
	t('b-select-date')('December')
];

export const selectCache = new Cache<'months' | 'days' | 'years', readonly Item[]>([
	t('b-select-date')('months'),
	t('b-select-date')('days'),
	t('b-select-date')('years')
]);
