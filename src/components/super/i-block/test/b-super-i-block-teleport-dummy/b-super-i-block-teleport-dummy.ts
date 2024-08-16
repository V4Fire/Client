/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bButtonSlide from 'components/base/b-bottom-slide/b-bottom-slide';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bSuperIBlockTeleportDummy extends iBlock {
	/** @inheritDoc */
	declare protected readonly $refs: iBlock['$refs'] & {
		component: bButtonSlide;
	};
}
