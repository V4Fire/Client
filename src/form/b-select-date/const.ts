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
	i18n('b-select-date')('January'),
	i18n('b-select-date')('February'),
	i18n('b-select-date')('March'),
	i18n('b-select-date')('April'),
	i18n('b-select-date')('May'),
	i18n('b-select-date')('June'),
	i18n('b-select-date')('July'),
	i18n('b-select-date')('August'),
	i18n('b-select-date')('September'),
	i18n('b-select-date')('October'),
	i18n('b-select-date')('November'),
	i18n('b-select-date')('December')
];

export const selectCache = new Cache<'months' | 'days' | 'years', readonly Item[]>([
	'months',
	'days',
	'years'
]);
