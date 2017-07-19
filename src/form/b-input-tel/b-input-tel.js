'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bInput from 'form/b-input/b-input';
import { component } from 'core/component';

@component()
export default class bInputTel extends bInput {
	/**
	 * Handler: language change
	 */
	onChangeLang(el: bSelect, value: string) {
		switch (value) {
			case 'ru':
				this.mask = '+%d (%d%d%d) %d%d%d-%d%d-%d%d';
				break;
		}
	}
}
