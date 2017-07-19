'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bCheckbox from 'form/b-checkbox/b-checkbox';
import { component } from 'core/component';

@component()
export default class bIconCheckbox extends bCheckbox {
	/**
	 * Icon component
	 */
	icon: ?string;
}
