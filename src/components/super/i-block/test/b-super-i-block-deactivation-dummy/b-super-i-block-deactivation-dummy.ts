/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component } from 'components/super/i-block/i-block';

import type bButton from 'components/form/b-button/b-button';

@component()
export default class bSuperIBlockDeactivationDummy extends iBlock {
	protected override $refs!: iBlock['$refs'] & {
		button1: bButton;
		button2: bButton;
	};
}
