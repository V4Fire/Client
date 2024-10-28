/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bButton from 'components/form/b-button/b-button';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bSuperIBlockDeactivationDummy extends iBlock {
	/** @inheritDoc */
	declare protected readonly $refs: iBlock['$refs'] & {
		button1: bButton;
		button2: bButton;
	};
}
