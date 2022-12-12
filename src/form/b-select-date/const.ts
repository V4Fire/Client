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
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'Augus',
	'September',
	'October',
	'November',
	'December'
];

export const selectCache = new Cache<'months' | 'days' | 'years', readonly Item[]>([
	'months',
	'days',
	'years'
]);
