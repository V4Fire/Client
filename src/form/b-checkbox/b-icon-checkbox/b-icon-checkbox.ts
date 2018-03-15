/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bCheckbox, { component, prop } from 'form/b-checkbox/b-checkbox';
export * from 'form/b-checkbox/b-checkbox';

@component()
export default class bIconCheckbox extends bCheckbox {
	/**
	 * Icon component
	 */
	@prop({type: String, required: false})
	readonly icon?: string;
}
