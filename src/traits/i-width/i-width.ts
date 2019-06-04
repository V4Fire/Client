/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModsDecl } from 'super/i-block/i-block';

export default abstract class iWidth {
	/**
	 * Width modifiers
	 */
	static readonly mods: ModsDecl = {
		width: [
			'normal',
			'full',
			'auto'
		]
	};
}
