/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Options } from '@src/core/component/engines/zero/interface';

export const options: Options = {
	filters: {},
	directives: {}
};

export const
	SVG_NMS = 'http://www.w3.org/2000/svg',
	XLINK_NMS = 'http://www.w3.org/1999/xlink';

export const eventModifiers = Object.createDict({
	'!': 'capture',
	'&': 'passive',
	'~': 'once'
});

export const
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);
