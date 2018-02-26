/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component } from 'super/i-data/i-data';

@component()
export default class iPage<T extends Dictionary = Dictionary> extends iData<T> {}
