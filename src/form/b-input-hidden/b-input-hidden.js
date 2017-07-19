'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iInput from 'super/i-input/i-input';
import { component } from 'core/component';

@component()
export default class bInputHidden extends iInput {
	/** @override */
	get $refs(): {input: HTMLInputElement} {}
}
