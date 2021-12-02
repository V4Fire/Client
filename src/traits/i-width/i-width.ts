/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-width/README.md]]
 * @packageDocumentation
 */

import type { ModsDecl } from '@src/super/i-block/i-block';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class iWidth {
	/**
	 * Trait modifiers
	 */
	static readonly mods: ModsDecl = {
		width: [
			'full',
			'auto',
			'inherit'
		]
	};
}
